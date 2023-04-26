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
    document.getElementById("canvas").focus();
    globalThis.game.Reset("mp");
}
document.getElementById("spButton").addEventListener("click", SinglePlayer, false);
function SinglePlayer() {
    document.getElementById("canvas").focus();
    globalThis.game.Reset("sp");
}
//# sourceMappingURL=main.js.map