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
	Hands [][]Card // Multiple hands for split scenarios
	Bet   int      // Player's current bet amount
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
	g.Player.Hands = [][]Card{{}} // Start with one hand
	g.Player.Bet = 0
	g.Dealer.Hand = []Card{}

	// Deal two cards each
	for i := 0; i < 2; i++ {
		g.Player.Hands[0] = append(g.Player.Hands[0], g.drawCard())
		g.Dealer.Hand = append(g.Dealer.Hand, g.drawCard())
	}

	log.Printf("Deck size after dealing: %d", len(g.Deck))
}

func (g *Game) PlayerHit(handIndex int) {
	g.mu.Lock()
	defer g.mu.Unlock()

	if handIndex < len(g.Player.Hands) {
		g.Player.Hands[handIndex] = append(g.Player.Hands[handIndex], g.drawCard())
	}
}

func (g *Game) PlayerStand() {
	g.mu.Lock()
	defer g.mu.Unlock()

	// Get player hand value
	playerValue := g.calculateHandValue(g.Player.Hands[0])

	// Dealer draws until they have more points than the player or bust
	for {
		dealerValue := g.calculateHandValue(g.Dealer.Hand)

		// Dealer stands if value >= 17 and greater than player's hand
		if dealerValue >= 17 && dealerValue >= playerValue {
			break
		}

		// Dealer draws another card
		g.Dealer.Hand = append(g.Dealer.Hand, g.drawCard())

		// Check if dealer busts
		if dealerValue > 21 {
			break
		}
	}
}

func (g *Game) DoubleDown(handIndex int, bet int) {
	g.mu.Lock()
	defer g.mu.Unlock()

	if handIndex < len(g.Player.Hands) {
		// Draw a card for the player
		g.Player.Hands[handIndex] = append(g.Player.Hands[handIndex], g.drawCard())
		// Double the bet
		g.Player.Bet += bet
		// Player must stand after doubling down
	}
}

func (g *Game) Split(handIndex int) {
	g.mu.Lock()
	defer g.mu.Unlock()

	if handIndex < len(g.Player.Hands) && len(g.Player.Hands[handIndex]) == 2 && g.Player.Hands[handIndex][0].Value == g.Player.Hands[handIndex][1].Value {
		card1 := g.Player.Hands[handIndex][0]
		card2 := g.Player.Hands[handIndex][1]

		// Remove the two cards from the hand and create two new hands
		g.Player.Hands = append(g.Player.Hands, []Card{card1, g.drawCard()})
		g.Player.Hands[handIndex] = []Card{card2, g.drawCard()}
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
	// Need to handle multiple hands
	var result string
	var outcome string
	for _, hand := range g.Player.Hands {
		playerScore := g.calculateHandValue(hand)
		dealerScore := g.calculateHandValue(g.Dealer.Hand)

		if playerScore > 21 {
			result = "Player busts, dealer wins!"
			outcome = "loss"
		} else if dealerScore > 21 {
			result = "Dealer busts, player wins!"
			outcome = "win"
		} else if playerScore == 21 {
			result = "Blackjack! Player wins!"
			outcome = "win"
		} else if dealerScore == 21 {
			result = "Blackjack! Dealer wins!"
			outcome = "loss"
		} else if len(hand) >= 5 && playerScore <= 21 {
			result = "Player wins with 5 cards!"
			outcome = "win"
		} else if playerScore > dealerScore {
			result = "Player wins!"
			outcome = "win"
		} else if dealerScore > playerScore {
			result = "Dealer wins!"
			outcome = "loss"
		} else {
			result = "It's a draw!"
			outcome = "draw"
		}
	}
	return result, outcome
}
