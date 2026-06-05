import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';
import {DOMManager} from './DOMManager.js';
import {Board} from './Board.js';
import {Timer} from './Timer.js';
import {QuizService} from './QuizService.js';

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

  #quizMode

  #gameEnded = false;
  constructor(dom = new DOMManager()) {
    this.#dom = dom;
  }

  async endGame() {
    this.#gameEnded = true;
    if(this.#timer) this.#timer.stop();

    
    if (this.#isMultiplayer) return;


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

    let reason;

    if(this.#board.isCompete()) {
      reason = "Bravo, tu as gagné !";
    }else{
      reason = "Temps écoulé. Paires restantes: " + pairsRemaining;
    }

    this.#dom.afficherResultat({title: "Partie terminée", reason, scores: null});
  }


  /**
   * Start a new game.
   * @param {number} id - The game ID.
   */
  startGame(id, difficulty, collection, cardOrder=null, multiplayer=null, monTour=true, quizMode=false) {
    this.#id = id;

    this.#difficulty = parseInt(difficulty);
    this.#collection = collection;

    this.#monTour = monTour

    this.#multiplayer = multiplayer;
    this.#isMultiplayer = this.#multiplayer != null;

    this.#quizMode = quizMode && !this.#isMultiplayer;

    this.#gameEnded = false;

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
      this.#dom.afficherScore(this.#board.pairsMatched(), this.#board.totalPairs());
      if (this.#quizMode) {
        QuizService.preloadQuestions(10);
      }
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


  async faireTournerCarte(index){
    if (this.#gameEnded) return;
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
      if (this.#quizMode) {
        const success = await this.poserQuestion();
        if (!success) {
          this.annulerMatch(resultat.indices);
          return;
        }
      }
      this.#dom.markMatched(resultat.indices);
      if (this.#isMultiplayer) {
        this.#multiplayer.sendMatch();
      }
      this.#dom.afficherScore(this.#board.pairsMatched(), this.#board.totalPairs());

      if(this.#board.isCompete()) {
        this.endGame();
      }
    }

  }

  async poserQuestion() {
    const question = await QuizService.getQuestion();
    if (!question) {
      alert("Aucune question disponible, vous continuez !");
      return true;
    }

    this.#timer.pause();
    const answerIndex = await this.#dom.afficherQuiz(question)
    this.#timer.resume();

    return answerIndex === question.correctIndex;
  }

  annulerMatch(indices) {
    this.#board.annulerMatch(indices);
    setTimeout(() => {
      this.#dom.retournerCartes(indices);
    }, 500);
    if (this.#timer) {
      this.#timer.diminuer(3);
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

    const reasonText = this.buildReasonText(raison, scores);

    this.#dom.afficherResultat({title: "Partie terminée", reason: reasonText, scores});


    
  }

  buildReasonText(raison, scores) {
    let base;
    switch (raison) {
      case "TIME_UP": base = "Temps écoulé"; break;
      case "COMPLETE": base = "Toutes les paires trouvées"; break;
      case "ABANDON": base = "Un joueur a abandonné"; break;
      case "DISCONNECT": base = "Un joueur s'est déconnecté"; break;
      default: base = "Partie terminée";
    }
    
    const entries = Object.entries(scores);
    
    const [name1, score1] = entries[0];
    const [name2, score2] = entries[1];
    if (score1 > score2) return `${base} — ${name1} gagne !`;
    if (score2 > score1) return `${base} — ${name2} gagne !`;
    return `${base} — égalité !`;
  }

  onTick(timeLeft){
    this.#dom.updateTimer(timeLeft);
  }
  onScoreUpdate(scores) {
    this.#dom.afficherScoresMultiplayer(scores);
  }

  onWaiting(roomCode){
    this.#dom.afficherWatingRoom(roomCode);
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
