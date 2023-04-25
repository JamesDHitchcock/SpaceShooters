import { SpaceShooters } from "./SpaceShooters.js";
function setUpSpaceShooters() {
    globalThis.game = new SpaceShooters();
    globalThis.game.Begin();
}
window.onload = function () {
    setUpSpaceShooters();
};
document.getElementById("connectButton").addEventListener("click", ConnectAndPlay, false);
function ConnectAndPlay() {
    setUpSpaceShooters();
}
//# sourceMappingURL=main.js.map