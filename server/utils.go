package main

import (
	"net"
	"os"
	"path/filepath"

	log "github.com/sirupsen/logrus"
	"github.com/skip2/go-qrcode"
)

const nextExportDir = "/client/out"

// GetOutDir retrieves absolute path of the "out" directory based on where the binary is located
func GetOutDir() string {
	exePath, err := os.Executable()
	if err != nil {
		log.Fatal("error getting executable path: ", err)
	}
	return filepath.Join(filepath.Dir(exePath), nextExportDir)
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

// GenerateQRCode generates a qr code for ip address terminal output
func GenerateQRCode(text string) string {
	if len(os.Args) > 1 && os.Args[1] == "dev" {
		return ""
	}
	qr, err := qrcode.New(text, qrcode.Low)
	if err != nil {
		log.Errorf("unable to generate qr code: %+v", err)
		return ""
	}
	qr.DisableBorder = true
	return qr.ToSmallString(true)
}
