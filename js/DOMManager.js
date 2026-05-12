export class DOMManager {


  /**
   * Ajoute toutes les images d'une collection sur le gameBoard
   * @param {Image[]} images
   */
  createCards(images) {
    const gameBoard = document.querySelector('.game-board');

    gameBoard.innerHTML = ''; 
    // Todo À Compléter
    images.forEach(image => {
      const card = document.createElement('div');
      card.classList.add('card');

      card.dataset.imageId = image.id;
      
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
}