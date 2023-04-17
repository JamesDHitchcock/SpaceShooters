import { SpaceShooters } from "./SpaceShooters.js";

declare global {
   var game:SpaceShooters;
}

function setUpSpaceShooters(){
   globalThis.game = new SpaceShooters();
   globalThis.game.Begin();
}

window.onload=function(){
   setUpSpaceShooters();
}

document.getElementById("connectButton").addEventListener("click", ConnectAndPlay, false);

function ConnectAndPlay(){
   globalThis.game.Begin();
   globalThis.game.GameLoop();
}