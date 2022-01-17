//game meta data just to keep things consistent
const boardMetaData = {
  size: 10,
  width: 400,
  height: 400,
};

const colors = {
  gridBackground: '#111827',
  gridBorders: '#39FF14',
};

//basic game variables
const ships = [
  {
    name: 'slowboat',
    length: 2,
    color: 'magenta',
    rotated: false,
    placed: false,
    hitCount: 0,
    destroyed: false,
    el: null,
  },
  // {
  //   name: 'bumboat',
  //   length: 2,
  //   color: 'green',
  //   rotated: false,
  //   placed: false,
  //   hitCount: 0,
  //   destroyed: false,
  //   el: null,
  // },
  // {
  //   name: 'speedboat',
  //   length: 3,
  //   color: 'gold',
  //   rotated: false,
  //   placed: false,
  //   hitCount: 0,
  //   destroyed: false,
  //   el: null,
  // },
  // {
  //   name: 'cruiser',
  //   length: 3,
  //   color: 'blue',
  //   rotated: false,
  //   placed: false,
  //   hitCount: 0,
  //   destroyed: false,
  //   el: null,
  // },
  // {
  //   name: 'submarine',
  //   length: 4,
  //   color: 'purple',
  //   rotated: false,
  //   placed: false,
  //   hitCount: 0,
  //   destroyed: false,
  //   el: null,
  // },
];
let opponentShips = JSON.parse(JSON.stringify(ships));
const userBoard = [];
const opponentBoard = [];
const players = ['player', 'opponent'];
let currentPlayer = 0;

// variables for multiplayer function
let multiplayer = false;
let playerNum = 0;
let opponentReady = false;
let shotFired = -1;
let isPlayerReady = false;
let socket;

// variables for drag/drop functionality
let selectedShip;
let draggedShip;
let draggedShipNameWithPositionIndex;
let isOverlapping;

const userGrid = document.getElementById('user-grid');
const opponentGrid = document.getElementById('opponent-grid');
const messageOutput = document.getElementById('message-output');

// functions that run after dom content has been fully loaded
document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('multiplayer-button')
    .addEventListener('click', startMultiplayer);

  document
    .getElementById('singleplayer-button')
    .addEventListener('click', startSinglePlayer);

  generateBoard(userGrid, userBoard, 'player');
  generateBoard(opponentGrid, opponentBoard, 'opponent');
});

const startMultiplayer = () => {
  generateShips(ships);
  initGameLogic();

  socket = io();

  multiplayer = true;

  socket.on('player-number', (num) => {
    console.log(typeof num);
    if (num === -1) {
      console.log('server is full');
    } else {
      playerNum = parseInt(num);
      if (playerNum === 1) currentPlayer = 'opponent';
      console.log('checking players');
      socket.emit('check-players');
    }
  });

  socket.on('player-connection', (num) => {
    console.log(`Player ${num} has connected`);
    playerConnectedOrDisconnected(num);
  });

  const playerConnectedOrDisconnected = (num) => {
    let player = `.p${parseInt(num) + 1} `;
    document
      .querySelector(`${player} .connected span`)
      .classList.toggle('green');
    if (parseInt(num) === playerNum) {
      document.querySelector(`${player} .player-num`).style.fontWeight = 'bold';
      document.querySelector(`${player} .player-num`).innerText = `Player ${
        playerNum + 1
      } (you)`;
    }
  };

  socket.on('opponent-ready', (num, ships) => {
    console.log('opponent ready', ships);
    opponentReady = true;
    opponentShips = ships;
    setPlayerReady(num);
    if (isPlayerReady) {
      sendMessage(
        opponentReady
          ? 'Both players ready, starting game now'
          : 'Opponent is not yet ready! '
      );
      playGameMulti(socket);
    }
  });

  socket.on('send-ships', () => {
    console.log('sending ships');
    socket.emit('sending-ships', ships);
  });

  socket.on('receive-ships', (ships) => {
    console.log('received ships', ships);
    opponentShips = ships;
    sendMessage(
      'Opponent is already ready, place your ships to start the game'
    );
  });

  socket.on('check-players', (players) => {
    players.forEach((p, i) => {
      if (p.connected) playerConnectedOrDisconnected(i);
      if (p.ready) {
        setPlayerReady(i);
        if (i !== playerNum) {
          opponentReady = true;
          console.log('i should be getting ships here');
          socket.emit('get-ships');
        }
      }
    });
  });

  socket.on('fire', (id, playerId) => {
    playGameMulti(socket);
    shotFired = id;
    const grid = userBoard[id];
    currentPlayer = Number(!playerId);
    socket.emit('fire-reply', grid.el.classList, currentPlayer);
    sendMessage('It is your turn');
    revealGrid(grid.el.classList, ships, 'player');
  });

  socket.on('fire-reply', (classList) => {
    console.log('fire reply');
    playGameMulti(socket);
    //change current player to opponent
    currentPlayer = Number(!playerNum);
    sendMessage("it is your opponent's turn");
    revealGrid(classList, opponentShips, 'opponent');
  });

  socket.on('game-over', (winner) => {
    // const reverseWinner = winner === 'Player' ? 'Opponent' : 'Player';
    // sendMessage(`${reverseWinner} is the winner! `);
    //need some game ending function where the users cant manipulate the board
  });
};

//TODO: NOT SURE IF THIS IS EVEN RUNNING
const playGameMulti = (socket) => {
  if (opponentReady) {
    if (currentPlayer === 'user') {
      sendMessage('your turn');
    }
    if (currentPlayer === 'ememy') {
      sendMessage("opponent's turn");
    }
  }
};

const setPlayerReady = (num) => {
  let player = `.p${parseInt(num) + 1}`;
  document.querySelector(`${player} .ready span`).classList.toggle('green');
};

const sendMessage = (message) => {
  messageOutput.innerText = message;
};

//creates a single ship in the DOM using the ship meta data provided
const createShip = (shipData, index) => {
  const shipOuterDiv = document.createElement('div');
  // shipOuterDiv.style.width = "100px";
  //create ship container
  const shipDiv = document.createElement('div');
  shipDiv.style.display = 'inline-flex';
  shipDiv.draggable = 'true';
  shipDiv.id = `${shipData.name}-${index}`;
  shipDiv.classList.add('ship');

  //create ship grid positioning components
  for (let i = 0; i < shipData.length; i++) {
    const shipGridDiv = document.createElement('div');
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

//generates all the player's / oppponent's ships
const generateShips = (ships) => {
  const shipsContainer = document.getElementById('ships-container');
  ships.forEach((ship, index) => {
    const createdShip = createShip(ship, index);

    // add ship to ships object
    ship.el = createdShip;
    shipsContainer.appendChild(createdShip);
  });
};

// generates the playing board for each battleship game
const generateBoard = (grid, board, role) => {
  idCounter = 0;
  for (let i = 0; i < boardMetaData.size; i++) {
    const gridRow = document.createElement('div');
    gridRow.style.width = `${boardMetaData.width}px`;
    gridRow.style.height = `${boardMetaData.height / boardMetaData.size}px`;
    gridRow.style.display = 'flex';
    for (let j = 0; j < boardMetaData.size; j++) {
      const squareGrid = document.createElement('div');
      const squareGridMetaData = {
        id: idCounter++,
        row: i,
        column: j,
        el: squareGrid,
      };
      squareGrid.id = `${role}-${squareGridMetaData.id}`;
      squareGrid.style.backgroundColor = colors.gridBackground;
      squareGrid.style.minWidth = `${
        boardMetaData.width / boardMetaData.size
      }px`;
      squareGrid.style.minHeight = `${
        boardMetaData.height / boardMetaData.size
      }px`;
      squareGrid.style.border = `1px solid ${colors.gridBorders}`;
      squareGrid.classList.add('square-grid');
      gridRow.appendChild(squareGrid);
      board.push(squareGridMetaData);
    }
    grid.appendChild(gridRow);
  }
};

const dragStart = (e) => {
  const draggedShipIndex = e.target.id.substr(-1);
  draggedShip = ships[draggedShipIndex];
};

//check if player ship placement is legal
const checkIfPositionValid = (gridId, start, end, isRotated, board) => {
  console.log(gridId);
  const id = gridId.split('-')[1];
  console.log(id);
  const gridMetaData = board[id];
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
  const id = gridPlacementId.split('-')[1];
  let startingPositionOnGrid;
  let endingPositionOnGrid;
  let positionArray = [];
  if (!ship.rotated) {
    // board placement logic if ship is not rotated
    startingPositionOnGrid = id - shipPositionIndex;
    endingPositionOnGrid = startingPositionOnGrid + ship.length - 1;
  } else {
    // board placment logic if ship is rotated
    startingPositionOnGrid = id - shipPositionIndex * boardMetaData.size;
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
  console.log(positionArray);
  //highlight blocks that are being selected
  if (positionArray) {
    isOverlapping = positionArray.some((index) =>
      userBoard[index].el.classList.contains('target')
    );
    positionArray.forEach((index) => {
      const grid = userBoard[index].el;
      if (!isOverlapping) {
        grid.style.backgroundColor = 'red';
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
      grid.classList.add('target');

      //remove ship from ship container once placed
    });
    draggedShip.el.style.visibility = 'hidden';
    draggedShip.placed = true;

    //check if all shipped have been placed
    isPlayerReady = ships.every((ship) => ship.placed);

    if (isPlayerReady) {
      if (multiplayer) {
        socket.emit('player-ready', playerNum, ships);
        setPlayerReady(playerNum);
        if (opponentReady) {
          playGameMulti(socket);
          sendMessage('Both players are ready starting game now');
        } else sendMessage('opponent is not yet ready');
      } else {
        playGameSingle();
        placeShips(JSON.parse(JSON.stringify(opponentShips)));
      }
    }
  }
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
      if (!(grid.classList && grid.classList.contains('target'))) {
        userBoard[index].el.style.backgroundColor = colors.gridBackground;
      }
    });
  }
};

// initialises drag and drop functionality for user's board, and point click
// functionality for opponent's board
const initGameLogic = () => {
  ships.forEach((ship) => {
    ship.el.addEventListener('mousedown', (e) => {
      draggedShipNameWithPositionIndex = e.target.id;
    });

    ship.el.addEventListener('mouseover', (e) => {
      const shipDiv = e.target.parentElement;
      console.log(shipDiv);
      selectedShip = shipDiv.style.outline = '2px solid blue';
      shipDiv.style.outlineOffset = '2px';
    });

    ship.el.addEventListener('mouseout', (e) => {
      const shipDiv = e.target.parentElement;
      shipDiv.style.outline = '';
    });

    ship.el.addEventListener('click', (e) => {
      console.log('clicked');
      // how do i rotate the ship
      const shipDiv = e.target.parentElement;
      const shipId = shipDiv.id.substr(-1);

      const ship = ships[shipId];
      const rotate = ship.rotated ? 'inline-flex' : 'inline-block';

      ship.rotated = !ship.rotated;
      shipDiv.style.display = rotate;
    });

    ship.el.addEventListener('dragstart', dragStart);
  });

  userBoard.forEach((square) => {
    square.el.addEventListener('dragstart', dragStart);
    square.el.addEventListener('dragover', dragOver);
    square.el.addEventListener('dragleave', dragLeave);
    square.el.addEventListener('drop', dragDrop);
  });

  opponentBoard.forEach((grid) => {
    grid.el.style.cursor = 'pointer';
    grid.el.addEventListener('click', (e) => {
      shotFired = e.target.id.split('-')[1];
      if (multiplayer) {
        if (currentPlayer === playerNum) {
          socket.emit('fire', grid.el.id.split('-')[1], playerNum);
        } else sendMessage('Please wait for your opponent to make their move!');
      } else revealGrid(grid.el.classList, opponentShips, 'opponent');
    });
  });
};

//algorithim that places ships legally within the grid for the cpu (for singleplayer mode)
const placeShips = (ships) => {
  const randomShipIndex = _.random(0, ships.length - 1);
  const cpuShip = ships[randomShipIndex];
  const randomGridId = _.random(0, opponentBoard.length - 1);
  cpuShip.rotated = _.random(1) === 1 ? true : false;
  const positionArray = getShipGridIndex(
    `opponent-${randomGridId}`,
    '1',
    cpuShip,
    opponentBoard
  );

  if (positionArray) {
    const isOverlapping = positionArray.some((index) =>
      opponentBoard[index].el.classList.contains('target')
    );
    if (isOverlapping) {
      placeShips(ships);
      return;
    }

    positionArray.forEach((index) => {
      const grid = opponentBoard[index].el;
      grid.style.backgroundColor = cpuShip.color;
      grid.classList.add(cpuShip.name);
      grid.classList.add('target');

      //remove ship from ship container once placed
    });

    ships.splice(randomShipIndex, 1);
  }

  if (ships.length !== 0) {
    placeShips(ships);
  }
};

//tells script to run single player mode
const startSinglePlayer = () => {
  sendMessage('Starting single player mode');
  generateShips(ships);
  initGameLogic();

  currentPlayer = 'player';
};

//game logic for single player mode
const playGameSingle = () => {
  sendMessage(`${currentPlayer}'s turn`);
  switch (currentPlayer) {
    case 'player':
      console.log('player turn');
      return;
    case 'opponent':
      console.log('computer turn');
      const randomGridIndex = _.random(0, 99);
      const grid = userBoard[randomGridIndex];
      setTimeout(() => {
        revealGrid(grid.el.classList, ships, 'player');
      }, 200);
      return;
    default:
      return;
  }
};

const checkForWinner = (ships) => {
  return ships.every((ship) => ship.destroyed);
};

//reveals if a ship is in the existing spot on the grid by getting an array of css classes
// works for both singleplayer/multiplayer mode
const revealGrid = (classList, ships, role) => {
  // because sometimes i get a object back instead, i need to reformat into a standard arr format (DONE)
  const grid = document.getElementById(`${role}-${shotFired}`);
  const arr = Object.values(classList);
  if (!arr.includes('exploded')) {
    ships.forEach((ship, index) => {
      if (arr.includes(ship.name)) ship.hitCount++;
      if (ship.hitCount === ship.length) ship.destroyed = true;
    });
  }

  if (arr.includes('target')) {
    grid.classList.add('exploded');
    grid.style.backgroundColor = 'red';
  } else {
    grid.classList.add('missed');
    grid.style.backgroundColor = 'grey';
  }

  const gameOver = checkForWinner(ships);
  if (gameOver) {
    console.log('triggered here');
    const winner = role === 'player' ? 'Opponent' : 'Player';
    endGame(winner);
    if (multiplayer) socket.emit('game-over', winner);
  } else {
    if (!multiplayer) {
      currentPlayer = players.filter((player) => player !== currentPlayer)[0];
      playGameSingle();
    }
  }
};

const endGame = (winner) => {
  sendMessage(`${winner} is the winner!`);
};
