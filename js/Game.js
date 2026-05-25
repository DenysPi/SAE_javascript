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


  constructor(dom = new DOMManager()) {
    this.#dom = dom;
  }

  async endGame() {
    this.#timer.stop();

    const pairsRemaining = this.#board.pairsRemaining();


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
  startGame(id, diffuculty, collection) {
    this.#id = id;


    this.#difficulty = diffuculty;
    this.#collection = collection;

    const cards = this.getCardsForCollection(collection);
    

    this.#board = new Board(cards);
    this.#timer = new Timer(
      (seconds) => {
        this.#dom.updateTimer(seconds);
        },
      () => this.endGame()
    );


    this.#dom.afficherGameArea();
    this.#dom.createCards(cards);
    this.bindListeners();

    this.#timer.start(this.getDuration());


  }

  getCardsForCollection() {
    const all = imageCollections[this.#collection];

    const cardsSelected = all.slice(0, this.#difficulty);

    const cards = [...cardsSelected, ...cardsSelected];

    return cards.sort(() => Math.random() -0.5);
  }


  faireTournerCarte(index){

    const resultat = this.#board.tourner(index);

    if (resultat.etat === "ignore") {
      return;
    }
    
    this.#dom.tournerCarte(index);

    if (resultat.etat === "mismatch") {
      setTimeout(() => {
        const cartes = this.#board.retornerMisMatch();
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
