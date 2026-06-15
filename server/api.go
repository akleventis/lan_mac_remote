package main

import (
	"embed"
	"fmt"
	"io/fs"
	"mime"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/rs/cors"
)

//go:embed all:static
var staticFiles embed.FS

const port = 5001

func staticHandler(fsys fs.FS) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p := strings.TrimPrefix(r.URL.Path, "/")
		if p == "" {
			p = "index.html"
		}
		data, err := fs.ReadFile(fsys, p)
		if err != nil {
			// unknown path — fall back to index.html for client-side routing
			p = "index.html"
			data, err = fs.ReadFile(fsys, p)
			if err != nil {
				http.NotFound(w, r)
				return
			}
		}
		ct := mime.TypeByExtension(filepath.Ext(p))
		if ct == "" {
			ct = http.DetectContentType(data)
		}
		w.Header().Set("Content-Type", ct)
		w.Write(data)
	})
}

func main() {
	subFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		panic(err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /ping", HandlePing())
	mux.HandleFunc("GET /keystroke", HandleKeystroke())
	mux.HandleFunc("GET /media_keystroke", HandleMediaKeyStroke())
	mux.HandleFunc("GET /volume", HandleVolume())
	mux.HandleFunc("GET /sleep", HandleSleep())
	mux.HandleFunc("GET /get_qr", GetQRCode())
	mux.Handle("/", staticHandler(subFS))

	fmt.Printf("Server running on: %s", LanAddress)
	http.ListenAndServe(LanAddress, cors.Default().Handler(mux))
}
