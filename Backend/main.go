package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

var game *Game

func main() {
	// Initialize the game
	game = NewGame()

	// Create a new server with timeout settings
	srv := &http.Server{
		Addr:         ":8080",
		Handler:      http.HandlerFunc(handleRequests),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Println("Server is starting on port 8080...")
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal("Server failed to start: ", err)
	}
}

func handleRequests(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/start-game":
		withCORS(startGame).ServeHTTP(w, r)
	case "/hit":
		withCORS(hit).ServeHTTP(w, r)
	case "/stand":
		withCORS(stand).ServeHTTP(w, r)
	case "/player-hand":
		withCORS(getPlayerHand).ServeHTTP(w, r)
	default:
		http.NotFound(w, r)
	}
}

func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("Request received:", r.Method, r.URL.Path)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			return
		}
		next(w, r)
	}
}

func startGame(w http.ResponseWriter, r *http.Request) {
	game.StartGame()
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Game started. Cards dealt.",
		"player":  handToString(game.Player.Hand),
		"dealer":  handToString(game.Dealer.Hand[:1]), // Only show one dealer card
	})
}

func hit(w http.ResponseWriter, r *http.Request) {
	game.PlayerHit()
	result, outcome := game.CheckOutcome()
	json.NewEncoder(w).Encode(map[string]interface{}{
		"player":  handToString(game.Player.Hand),
		"result":  result,
		"outcome": outcome,
	})
}

func stand(w http.ResponseWriter, r *http.Request) {
	game.PlayerStand()
	result, outcome := game.CheckOutcome()
	json.NewEncoder(w).Encode(map[string]interface{}{
		"dealer":  handToString(game.Dealer.Hand),
		"result":  result,
		"outcome": outcome,
	})
}

func getPlayerHand(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string][]Card{
		"hand": game.Player.Hand,
	})
}

func handToString(hand []Card) string {
	var handStr string
	for _, card := range hand {
		handStr += card.Value + " of " + card.Suit + ", "
	}
	if len(handStr) > 0 {
		handStr = handStr[:len(handStr)-2] // Trim the last comma
	}
	return handStr
}
