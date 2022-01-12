const express = require("express");
const cookieParser = require("cookie-parser");
const http = require("http");
require("dotenv").config();
const socketio = require("socket.io");

const { PORT } = process.env;
const app = express();
const server = http.createServer(app);
const io = socketio(server);
require("./mysockets.js")(io);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => res.render("boards"));

server.listen(PORT, () => {
  console.log(`listening at ${PORT}`);
});
