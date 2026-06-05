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

  afficherWatingRoom(roomCode) {
    const waitingRoom = document.querySelector('.waiting-area');
    waitingRoom.querySelector('.waiting-code').textContent = roomCode;
    waitingRoom.classList.remove('hidden');

    document.querySelector('.setup-form').classList.add('hidden');
  }

  afficherQuiz(q) {
    return new Promise((resolve) => {
      const overlay = document.querySelector('.quiz-overlay');
      const questionEl = overlay.querySelector('.quiz-question');
      const choicesEl = overlay.querySelector('.quiz-choices');
 
      questionEl.textContent = q.question;
      choicesEl.innerHTML = '';
 
      q.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.classList.add('quiz-choice');
        btn.textContent = choice;
        btn.onclick = () => {
          
          choicesEl.querySelectorAll('button').forEach(b => b.disabled = true);
         
          choicesEl.querySelectorAll('button').forEach((b, i) => {
            if (i === q.correctIndex) b.classList.add('correct');
            else if (i === idx) b.classList.add('wrong');
          });
          
          setTimeout(() => {
            overlay.classList.add('hidden');
            resolve(idx);
          }, 800);
        };
        choicesEl.appendChild(btn);
      });
 
      overlay.classList.remove('hidden');
    });
  }
  afficherResultat ({ title, reason, scores }) {
    const overlay = document.querySelector('.result-overlay');
    if (!overlay) {
      alert(`${title}\n${reason}`);
      this.afficherFormulaire();
      return;
    }
 
    overlay.querySelector('.result-title').textContent = title;
    overlay.querySelector('.result-reason').textContent = reason;
 
    const scoresDiv = overlay.querySelector('.result-scores');
    scoresDiv.innerHTML = '';
 
    if (scores) {
      for (const [name, score] of Object.entries(scores)) {
        const line = document.createElement('p');
        line.textContent = `${name} : ${score} paire(s)`;
        scoresDiv.appendChild(line);
      }
    }
 
    overlay.classList.remove('hidden');
 
    const closeBtn = overlay.querySelector('.result-close');
    closeBtn.onclick = () => {
      overlay.classList.add('hidden');
      this.afficherFormulaire();
    };
  }

  afficherScore(matched, total) {
    const scoreEl = document.querySelector('.game-scores');
    scoreEl.textContent = `Score: ${matched} / ${total}`;
  }

  afficherScoresMultiplayer(scores) {
    const scoreEl = document.querySelector('.game-scores');
  
    scoreEl.innerHTML = '';
    for (const [name, score] of Object.entries(scores)) {
      const line = document.createElement('span');
      
      line.textContent = `${name}: ${score}`;
      scoreEl.appendChild(line);
    }
  }
  
}