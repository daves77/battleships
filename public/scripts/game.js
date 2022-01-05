const boardMetaData = {
  size: 10,
  width: 400,
  height: 400,
};

const ships = [
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
    color: "red",
    rotated: false,
    el: null,
  },
];

const board = [];

const userGrid = document.getElementById("user-grid");

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
const generateBoard = (grid) => {
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
      squareGrid.style.backgroundColor = "red";
      squareGrid.style.minWidth = `${
        boardMetaData.width / boardMetaData.size
      }px`;
      squareGrid.style.minHeight = `${
        boardMetaData.height / boardMetaData.size
      }px`;
      squareGrid.style.border = "1px solid #000";
      squareGrid.classList.add("square-grid");
      gridRow.appendChild(squareGrid);
      board.push(squareGridMetaData);
    }
    grid.appendChild(gridRow);
  }
};

generateShips(ships);
generateBoard(userGrid);

let selectedShip;
let draggedShip;
let draggedShipNameWithPositionIndex;

const dragStart = (e) => {
  const draggedShipIndex = e.target.id.substr(-1);
  draggedShip = ships[draggedShipIndex];
};

//check if player ship placement is legal
const checkIfPositionValid = (gridId, start, end, isRotated) => {
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

const getShipPositioning = (gridPlacementId) => {
  const shipPositionIndex = parseInt(
    draggedShipNameWithPositionIndex.substr(-1)
  ); //position index of ship

  let startingPositionOnGrid;
  let endingPositionOnGrid;
  let positionArray = [];
  if (!draggedShip.rotated) {
    // board placement logic if ship is not rotated
    startingPositionOnGrid = gridPlacementId - shipPositionIndex;
    endingPositionOnGrid = startingPositionOnGrid + draggedShip.length - 1;
  } else {
    // board placment logic if ship is rotated
    startingPositionOnGrid =
      gridPlacementId - shipPositionIndex * boardMetaData.size;
    endingPositionOnGrid =
      startingPositionOnGrid + (draggedShip.length - 1) * boardMetaData.size;
  }
  return { startingPositionOnGrid, endingPositionOnGrid };
};

const getShipGridIndex = (gridPlacementId) => {
  const { startingPositionOnGrid, endingPositionOnGrid } =
    getShipPositioning(gridPlacementId);

  const positionIsValid = checkIfPositionValid(
    gridPlacementId,
    startingPositionOnGrid,
    endingPositionOnGrid,
    draggedShip.rotated
  );

  if (positionIsValid) {
    if (draggedShip.rotated) {
      return _.range(startingPositionOnGrid, endingPositionOnGrid + 1, 10);
    }

    return _.range(startingPositionOnGrid, endingPositionOnGrid + 1);
  }

  return null;
};

const dragOver = (e) => {
  e.preventDefault();
  const positionArray = getShipGridIndex(e.target.id);
  //highlight blocks that are being selected
  if (positionArray) {
    console.log(positionArray);
    positionArray.forEach((index) => {
      board[index].el.style.backgroundColor = "blue";
    });
  }
};

const dragDrop = (e) => {
  const gridPlacementId = e.target.id;
  checkIfCanPlaceShip(gridPlacementId);
};

const dragEnter = (e) => {
  e.preventDefault();
};

const dragLeave = (e) => {
  e.preventDefault();
  const positionArray = getShipGridIndex(e.target.id);
  //highlight blocks that are being selected
  if (positionArray) {
    console.log(positionArray);
    positionArray.forEach((index) => {
      board[index].el.style.backgroundColor = "red";
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

board.forEach((square) => {
  square.el.addEventListener("dragstart", dragStart);
  square.el.addEventListener("dragover", dragOver);
  square.el.addEventListener("dragenter", dragEnter);
  square.el.addEventListener("dragleave", dragLeave);
  square.el.addEventListener("drop", dragDrop);
  square.el.addEventListener("dragend", dragEnd);
});
