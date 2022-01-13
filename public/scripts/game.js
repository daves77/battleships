const boardMetaData = {
  size: 10,
  width: 400,
  height: 400,
};

const players = ["player", "opponent"];
let currentPlayer;

const ships = [
  {
    name: "slowboat",
    length: 2,
    color: "magenta",
    rotated: false,
    placed: false,
    hitCount: 0,
    destroyed: false,
    el: null,
  },
  // {
  //   name: "bumboat",
  //   length: 2,
  //   color: "green",
  //   rotated: false,
  //   placed: false,
  //   hitCount: 0,
  //   destroyed: false,
  //   el: null,
  // },
  // {
  //   name: "speedboat",
  //   length: 3,
  //   color: "gold",
  //   rotated: false,
  //   placed: false,
  //   hitCount: 0,
  //   destroyed: false,
  //   el: null,
  // },
  // {
  //   name: "cruiser",
  //   length: 3,
  //   color: "blue",
  //   rotated: false,
  //   placed: false,
  //   hitCount: 0,
  //   destroyed: false,
  //   el: null,
  // },
  // {
  //   name: "submarine",
  //   length: 4,
  //   color: "purple",
  //   rotated: false,
  //   placed: false,
  //   hitCount: 0,
  //   destroyed: false,
  //   el: null,
  // },
];

let opponentShips = JSON.parse(JSON.stringify(ships));

const colors = {
  gridBackground: "#111827",
  gridBorders: "#39FF14",
};

const userBoard = [];
const opponentBoard = [];

let multiplayer = false;
let playerNum = 0;
let opponentReady = false;
let isPlayerReady = false;
let ready = false;

let socket;
const startMultiplayer = () => {
  generateShips(ships);
  initGameLogic();

  socket = io();

  multiplayer = true;

  socket.on("player-number", (num) => {
    console.log(typeof num);
    if (num === -1) {
      console.log("server is full");
    } else {
      playerNum = parseInt(num);
      if (playerNum === 1) currentPlayer = "opponent";
      console.log("checking players");
      socket.emit("check-players");
    }
  });

  socket.on("player-connection", (num) => {
    console.log(`Player ${num} has connected`);
    playerConnectedOrDisconnected(num);
  });

  const playerConnectedOrDisconnected = (num) => {
    let player = `.p${parseInt(num) + 1} `;
    document
      .querySelector(`${player} .connected span`)
      .classList.toggle("green");
    if (parseInt(num) === playerNum) {
      document.querySelector(`${player} .player-num`).style.fontWeight = "bold";
      document.querySelector(`${player} .player-num`).innerText = `Player ${
        playerNum + 1
      } (you)`;
    }
  };

  socket.on("opponent-ready", (num, ships) => {
    console.log("opponent ready", ships);
    opponentReady = true;
    opponentShips = ships;
    setPlayerReady(num);
    if (ready) {
      sendMessage(
        opponentReady
          ? "Both players ready, starting game now"
          : "Opponent is not yet ready! "
      );
      playGameMulti(socket);
    }
  });

  socket.on("send-ships", () => {
    console.log("sending ships");
    socket.emit("sending-ships", ships);
  });

  socket.on("receive-ships", (ships) => {
    console.log("received ships", ships);
    opponentShips = ships;
    sendMessage(
      "opponent is already ready, place your ships to start the game"
    );
  });

  socket.on("check-players", (players) => {
    players.forEach((p, i) => {
      if (p.connected) playerConnectedOrDisconnected(i);
      if (p.ready) {
        setPlayerReady(i);
        if (i !== playerNum) {
          opponentReady = true;
          console.log("i should be getting ships here");
          socket.emit("get-ships");
        }
      }
    });
  });

  // opponentBoard.forEach((grid) => {
  //   if (currentPlayer === "user" && ready && opponentReady) {
  //     shotFired = grid.el.id;
  //     socket.emit("fire", shotFired);
  //   }
  // });

  socket.on("fire", (id) => {
    revealGrid(grid.el.classList, ships);
    playGameMulti(socket);
    const grid = userBoard[id];
    socket.emit("fire-reply", grid.el.classList);
    playGameMulti(socket);
  });

  socket.on("fire-reply", (classList) => {
    revealGrid(grid.el.classList, opponentShips);
    playGameMulti(socket);
  });
};

document
  .getElementById("multiplayer-button")
  .addEventListener("click", startMultiplayer);

const playGameMulti = (socket) => {
  initGameLogic(); // why is this here?
  // if (!ready) {
  //   socket.emit("player-ready");
  //   ready = true;
  //   setPlayerReady(playerNum);
  // }

  if (opponentReady) {
    if (currentPlayer === "user") {
      sendMessage("your turn");
    }
    if (currentPlayer === "ememy") {
      sendMessage("opponent's turn");
    }
  }
};

const setPlayerReady = (num) => {
  let player = `.p${parseInt(num) + 1}`;
  document.querySelector(`${player} .ready span`).classList.toggle("green");
};

const userGrid = document.getElementById("user-grid");
const opponentGrid = document.getElementById("opponent-grid");
const messageOutput = document.getElementById("message-output");

const sendMessage = (message) => {
  messageOutput.innerText = message;
};

const createShip = (shipData, index) => {
  const shipOuterDiv = document.createElement("div");
  // shipOuterDiv.style.width = "100px";
  //create ship container
  const shipDiv = document.createElement("div");
  shipDiv.style.display = "inline-flex";
  shipDiv.draggable = "true";
  shipDiv.id = `${shipData.name}-${index}`;
  shipDiv.classList.add("ship");

  //create ship grid positioning components
  for (let i = 0; i < shipData.length; i++) {
    const shipGridDiv = document.createElement("div");
    shipGridDiv.id = `${shipData.name}-${i}`;
    shipGridDiv.style.height = `${boardMetaData.height / boardMetaData.size}px`;
    shipGridDiv.style.width = `${boardMetaData.width / boardMetaData.size}px`;
    shipGridDiv.style.backgroundColor = shipData.color;
    shipGridDiv.classList.add(shipData.name);
    shipDiv.appendChild(shipGridDiv);
  }

  shipOuterDiv.appendChild(shipDiv);
  return shipOuterDiv;
};

const generateShips = (ships) => {
  const shipsContainer = document.getElementById("ships-container");
  ships.forEach((ship, index) => {
    const createdShip = createShip(ship, index);

    // add ship to ships object
    ship.el = createdShip;
    shipsContainer.appendChild(createdShip);
  });
};

// generates the playing board for each battleship game
const generateBoard = (grid, board) => {
  idCounter = 0;
  for (let i = 0; i < boardMetaData.size; i++) {
    const gridRow = document.createElement("div");
    gridRow.style.width = `${boardMetaData.width}px`;
    gridRow.style.height = `${boardMetaData.height / boardMetaData.size}px`;
    gridRow.style.display = "flex";
    for (let j = 0; j < boardMetaData.size; j++) {
      const squareGrid = document.createElement("div");
      const squareGridMetaData = {
        id: idCounter++,
        row: i,
        column: j,
        el: squareGrid,
      };
      squareGrid.id = squareGridMetaData.id;
      squareGrid.style.backgroundColor = colors.gridBackground;
      squareGrid.style.minWidth = `${
        boardMetaData.width / boardMetaData.size
      }px`;
      squareGrid.style.minHeight = `${
        boardMetaData.height / boardMetaData.size
      }px`;
      squareGrid.style.border = `1px solid ${colors.gridBorders}`;
      squareGrid.classList.add("square-grid");
      gridRow.appendChild(squareGrid);
      board.push(squareGridMetaData);
    }
    grid.appendChild(gridRow);
  }
};

generateBoard(userGrid, userBoard);
generateBoard(opponentGrid, opponentBoard);

let selectedShip;
let draggedShip;
let draggedShipNameWithPositionIndex;
let isOverlapping;

const dragStart = (e) => {
  const draggedShipIndex = e.target.id.substr(-1);
  draggedShip = ships[draggedShipIndex];
};

//check if player ship placement is legal
const checkIfPositionValid = (gridId, start, end, isRotated, board) => {
  const gridMetaData = board[gridId];
  let lowerLimit;
  let upperLimit;

  if (!isRotated) {
    lowerLimit = gridMetaData.row * boardMetaData.size;
    upperLimit = (gridMetaData.row + 1) * boardMetaData.size - 1;
  } else {
    lowerLimit = 0;
    upperLimit = 100;
  }

  if (start < lowerLimit || end > upperLimit) {
    return false;
  }

  return true;
};

const getShipPositioning = (gridPlacementId, shipPositioningIndex, ship) => {
  const shipPositionIndex = parseInt(shipPositioningIndex.substr(-1)); //position index of ship

  let startingPositionOnGrid;
  let endingPositionOnGrid;
  let positionArray = [];
  if (!ship.rotated) {
    // board placement logic if ship is not rotated
    startingPositionOnGrid = gridPlacementId - shipPositionIndex;
    endingPositionOnGrid = startingPositionOnGrid + ship.length - 1;
  } else {
    // board placment logic if ship is rotated
    startingPositionOnGrid =
      gridPlacementId - shipPositionIndex * boardMetaData.size;
    endingPositionOnGrid =
      startingPositionOnGrid + (ship.length - 1) * boardMetaData.size;
  }
  return { startingPositionOnGrid, endingPositionOnGrid };
};

const getShipGridIndex = (
  gridPlacementId,
  shipPositioningIndex,
  ship,
  board
) => {
  const { startingPositionOnGrid, endingPositionOnGrid } = getShipPositioning(
    gridPlacementId,
    shipPositioningIndex,
    ship
  );
  const positionIsValid = checkIfPositionValid(
    gridPlacementId,
    startingPositionOnGrid,
    endingPositionOnGrid,
    ship.rotated,
    board
  );

  if (positionIsValid) {
    if (ship.rotated) {
      return _.range(startingPositionOnGrid, endingPositionOnGrid + 1, 10);
    }

    return _.range(startingPositionOnGrid, endingPositionOnGrid + 1);
  }

  return null;
};

const dragOver = (e) => {
  e.preventDefault();
  const positionArray = getShipGridIndex(
    e.target.id,
    draggedShipNameWithPositionIndex,
    draggedShip,
    userBoard
  );
  //highlight blocks that are being selected
  if (positionArray) {
    isOverlapping = positionArray.some((index) =>
      userBoard[index].el.classList.contains("target")
    );
    positionArray.forEach((index) => {
      const grid = userBoard[index].el;
      if (!isOverlapping) {
        grid.style.backgroundColor = "red";
      }
    });
  }
};

const dragDrop = (e) => {
  const positionArray = getShipGridIndex(
    e.target.id,
    draggedShipNameWithPositionIndex,
    draggedShip,
    userBoard
  );
  //place ship
  if (positionArray && !isOverlapping) {
    positionArray.forEach((index) => {
      const grid = userBoard[index].el;
      grid.classList.add(draggedShip.name);
      grid.style.backgroundColor = draggedShip.color;
      grid.classList.add("target");

      //remove ship from ship container once placed
    });
    draggedShip.el.style.visibility = "hidden";
    draggedShip.placed = true;

    //check if all shipped have been placed
    isPlayerReady = ships.every((ship) => ship.placed);

    if (isPlayerReady) {
      if (multiplayer) {
        socket.emit("player-ready", playerNum, ships);
        ready = true;
        setPlayerReady(playerNum);
        if (opponentReady) playGameMulti(socket);
        else sendMessage("opponent is not yet ready");
      } else {
        playGameSingle();
        placeShips(JSON.parse(JSON.stringify(opponentShips)));
      }
    }
  }

  //check if game can begin
};

const dragEnter = (e) => {
  e.preventDefault();
};

const dragLeave = (e) => {
  e.preventDefault();
  const positionArray = getShipGridIndex(
    e.target.id,
    draggedShipNameWithPositionIndex,
    draggedShip,
    userBoard
  );
  //highlight blocks that are being selected
  if (positionArray) {
    positionArray.forEach((index) => {
      const grid = userBoard[index].el;
      if (!(grid.classList && grid.classList.contains("target"))) {
        userBoard[index].el.style.backgroundColor = colors.gridBackground;
      }
    });
  }
};

const dragEnd = () => {};

const initGameLogic = () => {
  ships.forEach((ship) => {
    ship.el.addEventListener("mousedown", (e) => {
      draggedShipNameWithPositionIndex = e.target.id;
    });

    ship.el.addEventListener("mouseover", (e) => {
      const shipDiv = e.target.parentElement;
      console.log(shipDiv);
      selectedShip = shipDiv.style.outline = "2px solid blue";
      shipDiv.style.outlineOffset = "2px";
    });

    ship.el.addEventListener("mouseout", (e) => {
      const shipDiv = e.target.parentElement;
      shipDiv.style.outline = "";
    });

    ship.el.addEventListener("click", (e) => {
      console.log("clicked");
      // how do i rotate the ship
      const shipDiv = e.target.parentElement;
      const shipId = shipDiv.id.substr(-1);

      const ship = ships[shipId];
      const rotate = ship.rotated ? "inline-flex" : "inline-block";

      ship.rotated = !ship.rotated;
      shipDiv.style.display = rotate;
    });

    ship.el.addEventListener("dragstart", dragStart);
  });

  userBoard.forEach((square) => {
    square.el.addEventListener("dragstart", dragStart);
    square.el.addEventListener("dragover", dragOver);
    square.el.addEventListener("dragenter", dragEnter);
    square.el.addEventListener("dragleave", dragLeave);
    square.el.addEventListener("drop", dragDrop);
    square.el.addEventListener("dragend", dragEnd);
  });

  opponentBoard.forEach((grid) => {
    grid.el.style.cursor = "pointer";
    grid.el.addEventListener("click", (e) => {
      revealGrid(grid.el.classList, opponentShips);
      if (multiplayer) socket.emit("fire", grid.el.id);
    });
  });
};

//algorithim that places ships legally within the grid for the cpu
const placeShips = (ships) => {
  const randomShipIndex = _.random(0, ships.length - 1);
  const cpuShip = ships[randomShipIndex];
  const randomGridId = _.random(0, opponentBoard.length - 1);
  cpuShip.rotated = _.random(1) === 1 ? true : false;
  const positionArray = getShipGridIndex(
    randomGridId,
    "1",
    cpuShip,
    opponentBoard
  );

  if (positionArray) {
    const isOverlapping = positionArray.some((index) =>
      opponentBoard[index].el.classList.contains("target")
    );
    if (isOverlapping) {
      placeShips(ships);
      return;
    }

    positionArray.forEach((index) => {
      const grid = opponentBoard[index].el;
      grid.style.backgroundColor = cpuShip.color;
      grid.classList.add(cpuShip.name);
      grid.classList.add("target");

      //remove ship from ship container once placed
    });

    ships.splice(randomShipIndex, 1);
  }

  if (ships.length !== 0) {
    placeShips(ships);
  }
};

const startSinglePlayer = () => {
  sendMessage("Starting single player mode");
  generateShips(ships);
  initGameLogic();

  currentPlayer = "player";
};

document
  .getElementById("singleplayer-button")
  .addEventListener("click", startSinglePlayer);

const playGameSingle = () => {
  sendMessage(`${currentPlayer}'s turn`);
  switch (currentPlayer) {
    case "player":
      console.log("player turn");
      return;
    case "opponent":
      console.log("computer turn");
      const randomGridIndex = _.random(0, 99);
      const grid = userBoard[randomGridIndex];
      setTimeout(() => {
        revealGrid(grid.el.classList, ships);
      }, 200);
      return;
    default:
      return;
  }
};

const checkForWinner = (ships) => {
  console.log(ships);
  console.log(ships.every((ship) => ship.destroyed));
  if (ships.every((ship) => ship.destroyed)) {
    return players.filter((player) => player !== currentPlayer);
  }

  return null;
};

//probably going to have to change how this works fundametally if i wnt it to work for both
//single player and multiplayer
const revealGrid = (classList, ships) => {
  if (!classList.contains("exploded")) {
    ships.forEach((ship, index) => {
      if (classList.contains(ship.name)) ship.hitCount++;
      if (ship.hitCount === ship.length) ship.destroyed = true;
    });
  }

  if (classList.contains("target")) {
    classList.add("exploded");
    // gridEl.style.backgroundColor = "red";
  } else {
    classList.add("missed");
    // gridEl.style.backgroundColor = "grey";
  }

  const winner = checkForWinner(ships);
  console.log(winner);
  if (winner) {
    endGame();
  } else {
    currentPlayer = players.filter((player) => player !== currentPlayer)[0];
    console.log(currentPlayer, "current player");
    if (!multiplayer) playGameSingle();
  }
};

const endGame = () => {
  sendMessage(`${currentPlayer} is the winner!`);
  console.log("game end", currentPlayer);
};
