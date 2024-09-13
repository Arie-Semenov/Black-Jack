package main

import (
	"encoding/json"
	"log"
	"net/http"
)

var game *Game

func main() {
	// Initialize the game
	game = NewGame()

	http.HandleFunc("/start-game", withCORS(startGame))
	http.HandleFunc("/hit", withCORS(hit))
	http.HandleFunc("/stand", withCORS(stand))
	http.HandleFunc("/player-hand", withCORS(getPlayerHand))

	log.Println("Server is starting on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start: ", err)
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
	result := game.CheckOutcome()
	json.NewEncoder(w).Encode(map[string]interface{}{
		"player": handToString(game.Player.Hand),
		"result": result,
	})
}

func stand(w http.ResponseWriter, r *http.Request) {
	game.PlayerStand()
	result := game.CheckOutcome()
	json.NewEncoder(w).Encode(map[string]interface{}{
		"dealer": handToString(game.Dealer.Hand),
		"result": result,
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
