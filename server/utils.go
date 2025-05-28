package main

import (
	"fmt"
	"net"
	"os"
	"os/exec"
	"path/filepath"

	log "github.com/sirupsen/logrus"
)

var (
	ServerURL      = ""
	LanAddress     = ""
	NextExportPath = ""
	exePath        = ""
)

func init() {
	LanAddress = fmt.Sprintf("%s:%s", getLANIP(), port)
	ServerURL = fmt.Sprintf("http://%s", LanAddress)

	// nextjs build file path
	var err error
	exePath, err = os.Executable()
	if err != nil {
		log.Fatal("Error getting executable path: ", err)
	}
	NextExportPath = filepath.Join(filepath.Dir(exePath), "client/out")

	_ = requestPrivacyPermissions()
}

// getLANIP is helper for retriveing local ip address of current device
func getLANIP() string {
	ifaces, err := net.Interfaces()
	if err != nil {
		log.Fatal(err)
	}
	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue // skip down or loopback interfaces
		}
		addrs, _ := iface.Addrs()
		for _, addr := range addrs {
			ipnet, ok := addr.(*net.IPNet)
			if ok && ipnet.IP.To4() != nil && ipnet.IP.IsPrivate() {
				return ipnet.IP.String()
			}
		}
	}
	log.Fatal("No LAN IP found")
	return ""
}

func requestPrivacyPermissions() error {
	script := `
	tell application "System Events"
		try
			get name of first process -- Accessibility trigger
			key code 49 -- simulate spacebar (Automation trigger)
		end try
	end tell
	`
	cmd := exec.Command("osascript", "-e", script)
	if err := cmd.Run(); err != nil {
		return err
	}
	return nil
}
