const express = require("express");
const cookieParser = require("cookie-parser");
const socketio = require("socket.io");
require("dotenv").config();

const { PORT } = process.env;
const app = express();
const server = require("http").createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => res.render("boards"));

// https://github.com/FoongL/in-class-express
server.listen(PORT, () => {
  console.log(`listening at ${PORT}`);
});

const connections = [null, null];
io.on("connection", (socket) => {
  console.log("new ws connection");
  let playerIndex = -1;
  for (const i in connections) {
    console.log(i);
    if (connections[i] === null) {
      playerIndex = i;
      break;
    }
  }

  if (playerIndex === -1) return;

  socket.emit("player-number", playerIndex);
  console.log(`player ${playerIndex} has connected`);

  connections[playerIndex] = false;

  socket.broadcast.emit("player-connection", playerIndex);

  socket.on("disconnect", () => {
    console.log(`Player ${playerIndex} disconnected`);
    connections[playerIndex] = null;
    socket.broadcast.emit("player-connection", playerIndex);
  });

  socket.on("player-ready", () => {
    socket.broadcast.emit("enemy-ready", playerIndex);
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

  socket.on("fire", (id) => {
    console.log(`shot fired from ${playerIndex}`, id);

    socket.broadcast.emit("fire", id);
  });

  socket.on("fire-reply", (square) => {
    console.log(square);

    socket.broadcast.emit("fire-reply", square);
  });
});
