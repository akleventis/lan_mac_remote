package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	log "github.com/sirupsen/logrus"
)

type Server struct {
	router *mux.Router
}

func main() {
	localIP := GetOutboundIP()
	serverAddress := fmt.Sprintf("%s:%s", localIP, "5001")

	nextExport := GetOutDir()
	fileServer := http.FileServer(http.Dir(nextExport))

	s := &Server{
		router: mux.NewRouter(),
	}

	s.router.HandleFunc("/ping", HandlePing()).Methods("GET")
	s.router.HandleFunc("/keystroke", HandleKeystroke()).Methods("GET")
	s.router.HandleFunc("/volume", HandleVolume()).Methods("GET")
	s.router.HandleFunc("/sleep", HandleSleep()).Methods("GET")
	s.router.HandleFunc("/verify_hammerspoon", VerifyHammerspoon()).Methods("GET")

	// file server for static client build
	s.router.PathPrefix("/").Handler(http.StripPrefix("/", fileServer))

	handler := cors.Default().Handler(s.router)
	log.Infof("server running on http://%s\n", serverAddress)

	qrCode := GenerateQRCode("http://" + serverAddress)
	if qrCode != "" {
		log.Infof("\n%+s", qrCode)
	}

	http.ListenAndServe(serverAddress, handler)
}
