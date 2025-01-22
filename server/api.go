package main

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/sirupsen/logrus"
)

const address = "0.0.0.0:5001"

type Server struct {
	router *mux.Router
}

func main() {
	s := &Server{
		router: mux.NewRouter(),
	}

	s.router.HandleFunc("/keystroke", s.HandleKeystroke()).Methods("GET")
	s.router.HandleFunc("/volume", s.HandleVolume()).Methods("GET")
	s.router.HandleFunc("/sleep", s.HandleSleep()).Methods("GET")
	s.router.HandleFunc("/verify_hammerspoon", s.VerifyHammerspoon()).Methods("GET")

	handler := cors.Default().Handler(s.router)
	logrus.Infof("Server running on http://%s", address)
	http.ListenAndServe(address, handler)
}
