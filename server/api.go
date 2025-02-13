package main

import (
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	log "github.com/sirupsen/logrus"
)

const port = "5001"

type Server struct {
	router *mux.Router
}

func main() {
	s := &Server{router: mux.NewRouter()}
	s.router.HandleFunc("/ping", HandlePing()).Methods("GET")
	s.router.HandleFunc("/keystroke", HandleKeystroke()).Methods("GET")
	s.router.HandleFunc("/media_keystroke", HandleMediaKeyStroke()).Methods("GET")
	s.router.HandleFunc("/volume", HandleVolume()).Methods("GET")
	s.router.HandleFunc("/sleep", HandleSleep()).Methods("GET")
	s.router.HandleFunc("/verify_hammerspoon", VerifyHammerspoon()).Methods("GET")
	s.router.HandleFunc("/get_qr", GetQRCode()).Methods("GET")

	// file server for static nextjs build
	fileServer := http.FileServer(http.Dir(NextExportPath))
	s.router.PathPrefix("/").Handler(http.StripPrefix("/", fileServer))

	// omit electron via dev
	if len(os.Args) <= 1 || os.Args[1] == "prod" {
		go StartElectron(ServerURL)
	}

	handler := cors.Default().Handler(s.router)
	log.Infof("server running on: %s", LanAddress)
	http.ListenAndServe(LanAddress, handler)
}
