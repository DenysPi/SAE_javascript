import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';
import {DOMManager} from './DOMManager.js';
import {Board} from './Board.js';

export class Game {
  /**
   * @type {number} id identifiant de la partie en cours
   */
  #id;
  #difficulty;
  #collection;

  #dom;

  constructor(dom = new DOMManager()) {
    this.#dom = dom;
  }

  async endGame() {
    // Todo À compléter


    const idARemplacer = 1234;
    const nombreDePairesRestanteARemplacer = 5678;

    try {
      const result = await ApiService.updateGameResult(idARemplacer, nombreDePairesRestanteARemplacer);
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
    

    this.board = new Board(cards);


    this.#dom.afficherGameArea();
    this.#dom.createCards(cards);

  }

  getCardsForCollection() {
    const all = imageCollections[this.#collection];

    const cardsSelected = all.slice(0, this.#difficulty);

    const cards = [...cardsSelected, ...cardsSelected];

    return cards.sort(() => Math.random() -0.5);
  }

}
