export class DOMManager {

  #selectors = {
    gameArea: '.game-area',
    gameBoard: '.game-board',
    gameForm: '.setup-form',
    timer: '.game-timer',
    abandon: '#abandon'
  }
  /**
   * Ajoute toutes les images d'une collection sur le gameBoard
   * @param {Image[]} images
   */
  createCards(images) {
    const gameBoard = document.querySelector(this.#selectors.gameBoard);

    gameBoard.innerHTML = ''; 
    // Todo À Compléter
    images.forEach((image, index) => {
      const card = document.createElement('div');
      card.classList.add('card');

      card.dataset.imageId = image.id;
      card.dataset.index = index;
      
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <img src="./assets/images/mask2.jpg">
          </div>
          <div class="card-back">
            <img src="${image.url}">
          </div>
        </div>`;
      gameBoard.append(card);
    });
    
  }

  updateTimer(seconds) {
    const timerElement = document.querySelector(this.#selectors.timer);
    timerElement.textContent = `${seconds}s`;
  }

  markMatched(indices) {
    indices.forEach(index => {
      const card = document.querySelector(`.card[data-index="${index}"]`);
      if (card) {
        card.classList.add('matched');
      }
    });

  }
  tournerCarte(index) {
    const card = document.querySelector(`.card[data-index="${index}"]`);
    if (card) {
      card.classList.add('flip');
    }
  }

  retournerCartes(indices) {
    indices.forEach(index => {
      const card = document.querySelector(`.card[data-index="${index}"]`);
      if (card) {
        card.classList.remove('flip');
      }
    });
  }

  onCardClick(callback) {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        callback(index);
      });
    });
  }

  onAbandon(callback) {
    document.querySelector(this.#selectors.abandon).addEventListener('click', () => {
      callback();
      
    });
      
  }

  afficherGameArea() {
    document.querySelector(this.#selectors.gameForm).classList.add('hidden');
    document.querySelector(this.#selectors.gameArea).classList.remove('hidden');
  }

  afficherFormulaire() {
    document.querySelector(this.#selectors.gameForm).classList.remove('hidden');
    document.querySelector(this.#selectors.gameArea).classList.add('hidden');
  }
}