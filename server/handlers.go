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
)

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

var VolumeKeyMapping = map[string]bool{
	"volume_up":   true,
	"volume_down": true,
	"current":     true,
}

type Response struct {
	Status string `json:"status"`
}

type VolumeResponse struct {
	Response
	Volume string `json:"volume"`
}

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

func (s *Server) HandleKeystroke() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		action := r.FormValue("action")

		if keyCode, exists := KeyMapping[action]; exists {
			if err := handleKeystroke(keyCode); err != nil {
				apiResponse(w, 500, &Response{Status: err.Error()})
				return
			}
			apiResponse(w, 200, &Response{Status: "success"})
			return
		}
		apiResponse(w, 400, &Response{Status: "invalid_command"})
	}
}

func (s *Server) HandleVolume() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		action := r.FormValue("action")

		if VolumeKeyMapping[action] {
			resp, err := adjustVolume(action)
			if err != nil {
				apiResponse(w, 500, &VolumeResponse{Response: Response{Status: err.Error()}})
				return
			}
			apiResponse(w, 200, &VolumeResponse{Volume: resp, Response: Response{Status: "success"}})
			return
		}
		apiResponse(w, 400, &VolumeResponse{Response: Response{Status: "invalid_command"}})
	}
}

func (s *Server) HandleSleep() http.HandlerFunc {
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

func (s *Server) VerifyHammerspoon() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		isRunning, err := handleHammerspoon()
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

func handleKeystroke(keyCode int) error {
	script := fmt.Sprintf(`tell application "System Events" to key code %d`, keyCode)
	cmd := exec.Command("osascript", "-e", script)
	if err := cmd.Run(); err != nil {
		return err
	}
	return nil
}

func adjustVolume(command string) (string, error) {
	script := "output volume of (get volume settings)"
	cmd := exec.Command("osascript", "-e", script)
	var out bytes.Buffer
	cmd.Stdout = &out
	if err := cmd.Run(); err != nil {
		return "", err
	}

	output := strings.TrimSpace(out.String())
	currentVolume, err := strconv.Atoi(output)
	if err != nil {
		return "external_connection", err
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

func handleHammerspoon() (bool, error) {
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
