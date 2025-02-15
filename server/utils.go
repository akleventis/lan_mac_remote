package main

import (
	"fmt"
	"net"
	"os"
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

	// nextjs build file path
	var err error
	exePath, err = os.Executable()
	if err != nil {
		log.Fatal("Error getting executable path: ", err)
	}
	NextExportPath = filepath.Join(filepath.Dir(exePath), "client/out")
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
