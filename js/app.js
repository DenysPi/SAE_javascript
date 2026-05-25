import {DOMManager} from './DOMManager.js';
import {Game} from './Game.js';
import {ApiService} from './ApiService.js';

import {Multiplayer} from './Multiplayer.js';


const domManager = new DOMManager();
const game = new Game();

const getName = () => document.querySelector("#name").value.trim();
const getDifficulty = () => document.querySelector("#difficulty").value;
const getCollection = () => document.querySelector("#collection").value;
const getRoomCode = () => document.querySelector("#room-code").value

const multiplayer = new Multiplayer(game, getName, getDifficulty, getCollection, getRoomCode);


document.querySelector("#btn-solo").addEventListener("click", async () => {
  const name = getName();
  
  if (!name) return ;
  try {
    const data = await ApiService.createGame(name, getDifficulty());
    
  } catch (e) {
    alert(e.message);
  }
});

document.querySelector("#btn-create").addEventListener("click", async () =>{
  const name = getName();
  
  multiplayer.createRoom();
  
})


document.querySelector('#btn-join').addEventListener('click', () => {
  const name = getName();
  
  multiplayer.joinRoom();
});