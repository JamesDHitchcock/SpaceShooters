# SpaceShooters

This is a project I've wanted to create since rollback netcode started becoming more popular in the fighting game genre. This game is designed to be reminiscient of two player Galaga and other shooters of that era, where each player faces a wave of incoming aliens. The twist is that each player has to dodge not just alien lasers, but also those of their partner as they miss. If either player takes too many hits, it's game over.

In multiplayer, connections and data transfer are performed using PeerJS (https://peerjs.com/) with the game using rollback to determine the current game state. Each player controls the bottom ship on the screen, with their partner playing the top.

In singleplayer, the player controls both the top and bottom ship at once.

The game is still a work in progress, as I work to update enemy behavior, connectivity issues, and create pixel art.
