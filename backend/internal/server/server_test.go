package server

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestHealth(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	response := httptest.NewRecorder()

	newTestServer(t, t.TempDir()).Handler().ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}

	var body map[string]string
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if body["status"] != "ok" {
		t.Fatalf("status body = %q, want %q", body["status"], "ok")
	}
}

func TestCourse(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/v1/courses/3l", nil)
	response := httptest.NewRecorder()

	newTestServer(t, t.TempDir()).Handler().ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}

	var body course
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if body.ID != "3l" || len(body.Lessons) != 3 {
		t.Fatalf("course = %#v, want 3l course with 3 lessons", body)
	}
}

func TestSPAFallback(t *testing.T) {
	staticDir := t.TempDir()
	const index = "<html><body>English learning app</body></html>"
	if err := os.WriteFile(filepath.Join(staticDir, "index.html"), []byte(index), 0o600); err != nil {
		t.Fatalf("write index: %v", err)
	}

	request := httptest.NewRequest(http.MethodGet, "/lessons/hello", nil)
	response := httptest.NewRecorder()

	newTestServer(t, staticDir).Handler().ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatalf("read response: %v", err)
	}
	if string(body) != index {
		t.Fatalf("body = %q, want %q", body, index)
	}
}

func newTestServer(t *testing.T, staticDir string) *Server {
	t.Helper()
	return New(staticDir, slog.New(slog.NewTextHandler(io.Discard, nil)))
}
