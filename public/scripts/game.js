const boardMetaData = {
  size: 10,
  width: 400,
  height: 400,
};

const ships = [
  {
    name: "bumboat",
    length: 2,
    color: "green",
    rotated: false,
    el: null,
  },
  {
    name: "speedboat",
    length: 3,
    color: "gold",
    rotated: false,
    el: null,
  },
  {
    name: "cruiser",
    length: 3,
    color: "blue",
    rotated: false,
    el: null,
  },
  {
    name: "submarine",
    length: 4,
    color: "purple",
    rotated: false,
    el: null,
  },
];

const colors = {
  gridBackground: "#111827",
  gridBorders: "#39FF14",
};

const userBoard = [];
const opponentBoard = [];

const userGrid = document.getElementById("user-grid");
const opponentGrid = document.getElementById("opponent-grid");

const createShip = (shipData, index) => {
  const shipOuterDiv = document.createElement("div");
  shipOuterDiv.style.width = "100%";
  //create ship container
  const shipDiv = document.createElement("div");
  shipDiv.style.display = "inline-flex";
  shipDiv.draggable = "true";
  shipDiv.id = `${shipData.name}-${index}`;

  //create ship grid positioning components
  for (let i = 0; i < shipData.length; i++) {
    const shipGridDiv = document.createElement("div");
    shipGridDiv.id = `${shipData.name}-${i}`;
    shipGridDiv.style.height = "40px";
    shipGridDiv.style.width = "40px";
    shipGridDiv.style.backgroundColor = shipData.color;
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

generateShips(ships);
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
      grid.style.backgroundColor = draggedShip.color;
      grid.classList.add("target");

      //remove ship from ship container once placed
    });
    draggedShip.el.style.visibility = "hidden";
    console.log(draggedShip.el);
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
    console.log(positionArray);
    positionArray.forEach((index) => {
      const grid = userBoard[index].el;
      if (!(grid.classList && grid.classList.contains("target"))) {
        userBoard[index].el.style.backgroundColor = colors.gridBackground;
      }
    });
  }
};

const dragEnd = () => {};

ships.forEach((ship) => {
  ship.el.addEventListener("mousedown", (e) => {
    draggedShipNameWithPositionIndex = e.target.id;
  });

  ship.el.addEventListener("mouseover", (e) => {
    const shipDiv = e.target.parentElement;
    selectedShip = shipDiv.style.outline = "2px solid blue";
    shipDiv.style.outlineOffset = "2px";
  });

  ship.el.addEventListener("mouseout", (e) => {
    const shipDiv = e.target.parentElement;
    shipDiv.style.outline = "";
  });

  ship.el.addEventListener("click", (e) => {
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

const placeCpuShip = () => {
  const cpuShips = [...ships];
  while (cpuShips.length !== 0) {
    const randomShipIndex = _.random(0, cpuShips.length);
    const ship = cpuShips[randomShipIndex];
    const randomGridId = _.random(0, opponentBoard.length);
    const positionArray = getShipGridIndex(
      randomGridId,
      _.random(0, ship.length),
      ship
    );

    if (positionArray) {
      positionArray.forEach((index) => {
        const grid = opponentBoard[index].el;
        grid.style.backgroundColor = ship.color;
        grid.classList.add("target");

        //remove ship from ship container once placed
      });
    }
  }
};

// placeCpuShip();
