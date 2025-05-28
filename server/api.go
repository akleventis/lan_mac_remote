package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
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
	s.router.HandleFunc("/get_qr", GetQRCode()).Methods("GET")

	// file server for static nextjs build
	fileServer := http.FileServer(http.Dir(NextExportPath))
	s.router.PathPrefix("/").Handler(http.StripPrefix("/", fileServer))

	fmt.Printf("Server running on: %s", LanAddress)
	handler := cors.Default().Handler(s.router)
	http.ListenAndServe(LanAddress, handler)
}
