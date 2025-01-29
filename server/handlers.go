package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"os/exec"
	"strconv"
	"strings"

	log "github.com/sirupsen/logrus"
)

// KeyMapping is a map of valid actions to their corresponding key codes
var KeyMapping = map[string]int{
	"play_pause":      100,
	"spacebar":        49,
	"previous_track":  98,
	"next_track":      101,
	"left_arrow":      123,
	"right_arrow":     124,
	"brightness_up":   144,
	"brightness_down": 145,
}

// VolumeKeyMapping defines valid volume control actions
var VolumeKeyMapping = map[string]bool{
	"volume_up":   true,
	"volume_down": true,
	"current":     true,
}

// Response represents the default api response structure
type Response struct {
	Status string `json:"status"`
}

// VolumeResponse represents the api response structure for volume-related actions
type VolumeResponse struct {
	Status string `json:"status"`
	Volume string `json:"volume,omitempty"`
}

// apiResponse is a helper which formats and sends an http json response back to the client
func apiResponse(w http.ResponseWriter, code int, resp interface{}) {
	r, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(r)
}

// HandlePing sends a success response upon /ping
func HandlePing() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		apiResponse(w, 200, &Response{Status: "success"})
	}
}

// HandleKeystroke triggers a keystroke via applescript based on the provided action query param
func HandleKeystroke() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		action := r.FormValue("action")

		if keyCode, exists := KeyMapping[action]; exists {
			if err := triggerKeystroke(keyCode); err != nil {
				apiResponse(w, 500, &Response{Status: err.Error()})
				return
			}
			apiResponse(w, 200, &Response{Status: "success"})
			return
		}
		apiResponse(w, 400, &Response{Status: "invalid_command"})
	}
}

// HandleVolume controls os volume actions (current, volume_up, or volume_down) based on the provided action query parameter
func HandleVolume() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		action := r.FormValue("action")

		if VolumeKeyMapping[action] {
			resp, err := adjustVolume(action)
			if err != nil {
				log.Error(err)
				apiResponse(w, 500, &VolumeResponse{Status: err.Error()})
				return
			}
			apiResponse(w, 200, &VolumeResponse{Volume: resp, Status: "success"})
			return
		}
		apiResponse(w, 400, &VolumeResponse{Status: "invalid_command"})
	}
}

// HandleSleep puts computer to sleep using applescript
func HandleSleep() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		script := "tell application \"System Events\" to sleep"
		cmd := exec.Command("osascript", "-e", script)
		if err := cmd.Run(); err != nil {
			apiResponse(w, 500, err.Error())
			return
		}
		apiResponse(w, 200, &Response{Status: "success"})
	}
}

// VerifyHammerspoon checks if Hammerspoon is running on current system
func VerifyHammerspoon() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		isRunning, err := verifyHammerspoon()
		if err != nil {
			apiResponse(w, 500, &Response{Status: err.Error()})
			return
		}
		if isRunning {
			apiResponse(w, 200, &Response{Status: "running"})
			return
		}
		apiResponse(w, 200, &Response{Status: "not_running"})
	}
}

// triggerKeystroke is a helper for triggering a keystroke using applescript using the specified key code
func triggerKeystroke(keyCode int) error {
	script := fmt.Sprintf(`tell application "System Events" to key code %d`, keyCode)
	cmd := exec.Command("osascript", "-e", script)
	if err := cmd.Run(); err != nil {
		return err
	}
	return nil
}

// adjustVolume is a helper for managing system volume: getting, increasing, or decreasing it
func adjustVolume(command string) (string, error) {
	script := "output volume of (get volume settings)"
	cmd := exec.Command("osascript", "-e", script)
	var out bytes.Buffer
	cmd.Stdout = &out
	if err := cmd.Run(); err != nil {
		return "", err
	}

	output := strings.TrimSpace(out.String())
	if output == "missing value" {
		return "external_media_source", nil
	}

	currentVolume, err := strconv.Atoi(output)
	if err != nil {
		return "", err
	}

	var newVolume int
	switch command {
	case "current":
		newVolume = currentVolume
	case "volume_up":
		newVolume = int(math.Min(float64(currentVolume+10), 100))
	case "volume_down":
		newVolume = int(math.Max(float64(currentVolume-10), 0))
	}

	script = fmt.Sprintf("set volume output volume %d", newVolume)
	cmd = exec.Command("osascript", "-e", script)
	if err = cmd.Run(); err != nil {
		return "", err
	}
	return strconv.Itoa(newVolume), nil
}

// verifyHammerspoon is a helper for checking if Hammerspoon application is running on system
func verifyHammerspoon() (bool, error) {
	script := `
    tell application "System Events"
        (name of processes) contains "Hammerspoon"
    end tell
    `
	cmd := exec.Command("osascript", "-e", script)
	var out bytes.Buffer
	cmd.Stdout = &out
	if err := cmd.Run(); err != nil {
		return false, err
	}

	output := strings.TrimSpace(out.String())
	if strings.Contains(strings.ToLower(output), "true") {
		return true, nil
	}
	return false, nil
}
