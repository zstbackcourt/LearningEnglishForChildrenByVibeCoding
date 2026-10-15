package server

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type Server struct {
	handler http.Handler
}

type lesson struct {
	ID       string   `json:"id"`
	Unit     string   `json:"unit"`
	Title    string   `json:"title"`
	Focus    string   `json:"focus"`
	Words    []string `json:"words"`
	Duration int      `json:"durationMinutes"`
	Locked   bool     `json:"locked"`
}

type course struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Subtitle    string   `json:"subtitle"`
	AgeRange    string   `json:"ageRange"`
	Description string   `json:"description"`
	Lessons     []lesson `json:"lessons"`
}

func New(staticDir string, logger *slog.Logger) *Server {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/health", healthHandler)
	mux.HandleFunc("GET /api/v1/courses/3l", courseHandler)
	mux.Handle("/", spaHandler(staticDir))

	return &Server{
		handler: requestLogger(mux, logger),
	}
}

func (s *Server) Handler() http.Handler {
	return s.handler
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
	})
}

func courseHandler(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, course{
		ID:          "3l",
		Title:       "3L English",
		Subtitle:    "少儿英语启蒙",
		AgeRange:    "6-10 岁",
		Description: "从日常表达开始，建立听、说、读的英语基础。",
		Lessons: []lesson{
			{
				ID:       "hello",
				Unit:     "Unit 01",
				Title:    "Hello!",
				Focus:    "问候与自我介绍",
				Words:    []string{"hello", "hi", "I", "am"},
				Duration: 12,
			},
			{
				ID:       "school",
				Unit:     "Unit 02",
				Title:    "At school",
				Focus:    "认识教室里的物品",
				Words:    []string{"book", "pen", "desk", "bag"},
				Duration: 15,
			},
			{
				ID:       "family",
				Unit:     "Unit 03",
				Title:    "My family",
				Focus:    "介绍家人",
				Words:    []string{"family", "mother", "father", "sister"},
				Duration: 15,
				Locked:   true,
			},
		},
	})
}

func spaHandler(staticDir string) http.Handler {
	files := http.FileServer(http.Dir(staticDir))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
			return
		}

		cleanPath := strings.TrimPrefix(filepath.Clean("/"+r.URL.Path), string(filepath.Separator))
		path := filepath.Join(staticDir, cleanPath)
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			files.ServeHTTP(w, r)
			return
		}

		index := filepath.Join(staticDir, "index.html")
		if _, err := os.Stat(index); err != nil {
			if os.IsNotExist(err) {
				http.Error(w, "frontend build not found", http.StatusNotFound)
				return
			}
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		http.ServeFile(w, r, index)
	})
}

func requestLogger(next http.Handler, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		started := time.Now()
		next.ServeHTTP(w, r)
		logger.Info("request",
			"method", r.Method,
			"path", strings.TrimSpace(r.URL.Path),
			"duration", time.Since(started),
		)
	})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		slog.Error("encode response", "error", err)
	}
}
