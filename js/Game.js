import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';
import {DOMManager} from './DOMManager.js';
import {Board} from './Board.js';
import {Timer} from './Timer.js';

export class Game {
  /**
   * @type {number} id identifiant de la partie en cours
   */
  #id;
  #difficulty;
  #collection;

  #dom;
  #board;
  #timer;


  #monTour = false;

  #multiplayer = null;
  #isMultiplayer = false;

  constructor(dom = new DOMManager()) {
    this.#dom = dom;
  }

  async endGame() {
    if(this.#timer) this.#timer.stop();

    

    const pairsRemaining = this.#board.pairsRemaining();
    const pairsMatched = this.#board.pairsMatched();
    const totalPairs = this.#board.totalPairs();


    try {
      const result = await ApiService.updateGameResult(this.#id, pairsRemaining);
      console.log('Fin de partie:', result);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Erreur lors de la fin de la partie');
    }

  }


  /**
   * Start a new game.
   * @param {number} id - The game ID.
   */
  startGame(id, difficulty, collection, cardOrder=null, multiplayer=null, monTour=true) {
    this.#id = id;
    console.log("Starting game with id=", id, "difficulty=", difficulty, "collection=", collection, "cardOrder=", cardOrder);

    this.#difficulty = parseInt(difficulty);
    this.#collection = collection;

    this.#monTour = monTour

    this.#multiplayer = multiplayer;
    this.#isMultiplayer = this.#multiplayer != null;
    

    const cards = this.getCardsForCollection(cardOrder);
    

    this.#board = new Board(cards);

    if (this.#isMultiplayer) {
      this.#timer = null;
      this.#dom.updateTimer(this.getDuration());
    } else {
      this.#timer = new Timer(
        (seconds) => {
          this.#dom.updateTimer(seconds);
          },
        () => this.endGame()
        );
      this.#timer.start(this.getDuration());
    } 
    

    
    this.#dom.afficherGameArea();
    this.#dom.createCards(cards);
    this.bindListeners();

  }

  getCardsForCollection(cardOrder=null){
    const all = imageCollections[this.#collection];

    const cardsSelected = all.slice(0, this.#difficulty);

    
    if (cardOrder) {

      const result = []

      for (const id of cardOrder){
        
        const card = cardsSelected.find(c => c.id === id);
        if (card){
          result.push(card)
        }
        
      }
      
      return result;
    }
    const cards = [...cardsSelected, ...cardsSelected];
    return cards.sort(() => Math.random() -0.5);
  }


  faireTournerCarte(index){
    if (this.#isMultiplayer && !this.#monTour) return;

    const resultat = this.#board.tourner(index);

    if (resultat.etat === "ignore") {
      return;
    }
    
    this.#dom.tournerCarte(index);

    if (this.#isMultiplayer) {
      console.log("Envoi du flip de carte", index);
      this.#multiplayer.sendCardFlip(index);
    }

    if (resultat.etat === "mismatch") {
      setTimeout(() => {
        const cartes = this.#board.retornerMisMatch();
        if (this.#isMultiplayer) {
          this.#monTour = false;
          this.#multiplayer.sendFlipBack();
        }
        this.#dom.retournerCartes(cartes);
      }, 1000);
    }

    if (resultat.etat === "match") {
      this.#dom.markMatched(resultat.indices);

      if(this.#board.isCompete()) {
        this.endGame();
      }
    }

  }


  flipDistinct(index){
    const resultat = this.#board.tourner(index);

    if (resultat.etat === "ignore") {
      return;
    }
    this.#dom.tournerCarte(index);
    console.log("flipDistinct index=", index, "resultat=", resultat);
    if (resultat.etat === "match") {
      this.#dom.markMatched(resultat.indices);
    }
  }

  flipBackDistant() {
    const cartes = this.#board.retornerMisMatch();
    this.#dom.retournerCartes(cartes);
    this.#monTour = true;
  }

  onGameEnd(message){

    const pairsRemaining = message.pairsRemaining;
    const raison = message.raison;
    const scores = message.scores;

    console.log("Game ended. Raison:", raison, "Pairs remaining:", pairsRemaining, "Scores:", scores);


    
  }
  onTick(timeLeft){
    this.#dom.updateTimer(timeLeft);
  }

  bindListeners() {
    
    this.#dom.onCardClick((index) => this.faireTournerCarte(index));
  
    this.#dom.onAbandon(() => {
      this.endGame();
      this.#dom.afficherFormulaire();
    });
    
  }

  getDuration(){
    console.log("difficulty", this.#difficulty);
    switch(this.#difficulty) {
      case 4: return 20;
      case 6: return 30;
      case 8: return 60;
      default: return 30;
    }
  }

}
