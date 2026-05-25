export class DOMManager {

  #selectors = {
    gameArea: '.game-area',
    gameBoard: '.game-board',
    gameForm: '.game-form',
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

  afficherGameArea() {
    document.querySelector(this.#selectors.gameForm).classList.add('hidden');
    document.querySelector(this.#selectors.gameArea).classList.remove('hidden');
  }
}