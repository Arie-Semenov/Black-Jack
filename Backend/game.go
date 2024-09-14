package main

import (
	"log"
	"math/rand"
	"strconv"
	"sync"
	"time"
)

type Card struct {
	Value string
	Suit  string
}

type Player struct {
	Hand []Card
}

type Dealer struct {
	Hand []Card
}

type Game struct {
	Deck   []Card
	Player Player
	Dealer Dealer
	mu     sync.Mutex // Mutex for thread-safe operations
}

func NewGame() *Game {
	game := &Game{}
	game.initDeck()
	return game
}

func (g *Game) initDeck() {
	suits := []string{"Hearts", "Diamonds", "Clubs", "Spades"}
	values := []string{"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"}

	g.Deck = []Card{}
	for i := 0; i < 8; i++ { // Create 8 decks
		for _, suit := range suits {
			for _, value := range values {
				g.Deck = append(g.Deck, Card{Value: value, Suit: suit})
			}
		}
	}
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(g.Deck), func(i, j int) { g.Deck[i], g.Deck[j] = g.Deck[j], g.Deck[i] })
}

func (g *Game) StartGame() {
	g.mu.Lock()
	defer g.mu.Unlock()

	// Reset player and dealer hands
	g.Player.Hand = []Card{}
	g.Dealer.Hand = []Card{}

	// Deal two cards each
	g.Player.Hand = append(g.Player.Hand, g.drawCard(), g.drawCard())
	g.Dealer.Hand = append(g.Dealer.Hand, g.drawCard(), g.drawCard())

	log.Printf("Deck size after dealing: %d", len(g.Deck))
}

func (g *Game) PlayerHit() {
	g.mu.Lock()
	defer g.mu.Unlock()

	g.Player.Hand = append(g.Player.Hand, g.drawCard())
}

func (g *Game) PlayerStand() {
	g.mu.Lock()
	defer g.mu.Unlock()

	// Dealer draws cards based on simple blackjack rules
	for g.calculateHandValue(g.Dealer.Hand) < 17 {
		g.Dealer.Hand = append(g.Dealer.Hand, g.drawCard())
	}
}

func (g *Game) drawCard() Card {
	if len(g.Deck) == 0 {
		log.Println("Deck is empty, reshuffling...")
		g.initDeck() // Reshuffle the deck
	}
	card := g.Deck[0]
	g.Deck = g.Deck[1:]
	return card
}

func (g *Game) calculateHandValue(hand []Card) int {
	value := 0
	aces := 0
	for _, card := range hand {
		switch card.Value {
		case "J", "Q", "K":
			value += 10
		case "A":
			aces++
			value += 11
		default:
			val, _ := strconv.Atoi(card.Value)
			value += val
		}
	}

	// Adjust for aces
	for value > 21 && aces > 0 {
		value -= 10
		aces--
	}
	return value
}

func (g *Game) CheckOutcome() (string, string) {
	playerScore := g.calculateHandValue(g.Player.Hand)
	dealerScore := g.calculateHandValue(g.Dealer.Hand)

	if playerScore > 21 {
		return "Player busts, dealer wins!", "loss"
	} else if dealerScore > 21 {
		return "Dealer busts, player wins!", "win"
	} else if playerScore == 21 {
		return "Blackjack! Player wins!", "win"
	} else if dealerScore == 21 {
		return "Blackjack! Dealer wins!", "loss"
	} else if len(g.Player.Hand) >= 5 && playerScore <= 21 {
		return "Player wins with 5 cards!", "win"
	} else if playerScore > dealerScore {
		return "Player wins!", "win"
	} else if dealerScore > playerScore {
		return "Dealer wins!", "loss"
	}
	return "It's a draw!", "draw"
}
