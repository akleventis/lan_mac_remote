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

// initialize variables
func init() {
	LanAddress = fmt.Sprintf("%s:%s", GetOutboundIP(), port)
	ServerURL = fmt.Sprintf("http://%s", LanAddress)

	// nextjs build file path: dev vs. application build
	var err error
	exePath, err = os.Executable()
	if err != nil {
		log.Fatal("error getting executable path: ", err)
	}

	baseDir := filepath.Dir(exePath)

	appPath := filepath.Join(baseDir, "../Resources")
	if _, err := os.Stat(appPath); err == nil {
		NextExportPath = filepath.Join(appPath, "client/out")
		return
	}

	NextExportPath = filepath.Join(baseDir, "client/out")
}

// GetOutboundIP is helper for retriveing local ip address of current device
func GetOutboundIP() net.IP {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()
	localAddr := conn.LocalAddr().(*net.UDPAddr)
	return localAddr.IP
}

// StartElectron launches the Electron UI
//
// prod: run the packaged electron app
// dev: run electron via npm start
func StartElectron(serverURL string) {
	appDir := filepath.Dir(filepath.Dir(exePath))
	electronPath := filepath.Join(appDir, "Resources", "electron_binary.app", "Contents", "MacOS", "electron_binary")

	var cmd *exec.Cmd
	if _, err := os.Stat(electronPath); err == nil {
		cmd = exec.Command(electronPath)
	} else {
		cmd = exec.Command("npm", "start")
		cmd.Dir = "./electron"
	}

	// pass server url to electron ui
	cmd.Env = append(os.Environ(), fmt.Sprintf("SERVER_URL=%s", serverURL))

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Start(); err != nil {
		log.Fatalf("Failed to start Electron: %v", err)
	}

	go func() {
		err := cmd.Wait()
		if err != nil {
			log.Printf("Electron exited with error: %v", err)
		}
		log.Println("Electron has exited. Stopping Go server...")
		os.Exit(0)
	}()
}
