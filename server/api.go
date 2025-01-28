package main

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/sirupsen/logrus"
)

// 0.0.0.0 esures service is available on the private network interface for other devices connected to the same local network
const address = "0.0.0.0:5001"

type Server struct {
	router *mux.Router
}

func main() {
	s := &Server{
		router: mux.NewRouter(),
	}

	s.router.HandleFunc("/ping", HandlePing()).Methods("GET")
	s.router.HandleFunc("/keystroke", HandleKeystroke()).Methods("GET")
	s.router.HandleFunc("/volume", HandleVolume()).Methods("GET")
	s.router.HandleFunc("/sleep", HandleSleep()).Methods("GET")
	s.router.HandleFunc("/verify_hammerspoon", VerifyHammerspoon()).Methods("GET")

	handler := cors.Default().Handler(s.router)
	logrus.Infof("Server running on http://%s\n", address)
	http.ListenAndServe(address, handler)
}
