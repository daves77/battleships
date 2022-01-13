module.exports = (io) => {
  //probably need state such that im recording game state? should i use a database here?
  const connections = [null, null];
  io.on("connection", (socket) => {
    console.log("new ws connection");
    let playerIndex = -1;

    //limits the connections to the room to 2
    for (const i in connections) {
      if (connections[i] === null) {
        playerIndex = i;
        break;
      }
    }

    socket.emit("player-number", playerIndex);
    console.log(`player ${playerIndex} has connected`);

    connections[playerIndex] = false;

    //broadcast to all sockets other than the sender
    socket.broadcast.emit("player-connection", playerIndex);

    socket.on("disconnect", () => {
      console.log(`Player ${playerIndex} disconnected`);
      connections[playerIndex] = null;
      socket.broadcast.emit("player-connection", playerIndex);
    });

    socket.on("player-ready", (playerIndex, ships) => {
      console.log(`${playerIndex} is ready`);
      socket.broadcast.emit("opponent-ready", playerIndex, ships);
      connections[playerIndex] = true;
    });

    socket.on("check-players", () => {
      const players = [];
      for (const i in connections) {
        connections[i] === null
          ? players.push({ connected: false, ready: false })
          : players.push({ connected: true, ready: connections[i] });
      }
      socket.emit("check-players", players);
    });

    socket.on("get-ships", () => {
      console.log("getting ships");
      socket.broadcast.emit("send-ships");
    });

    socket.on("sending-ships", (ships) => {
      socket.broadcast.emit("receive-ships", ships);
    });

    socket.on("fire", (id) => {
      console.log(`shot fired from ${playerIndex}`, id);
      socket.broadcast.emit("fire", id);
    });

    socket.on("fire-reply", (classList) => {
      console.log(classList, "classList");
      socket.broadcast.emit("fire-reply", classList);
    });
  });
};
