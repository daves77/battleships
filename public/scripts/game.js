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

board = [];

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

const rotateShips = () => {};

let selectedShip;

let draggedShip;
let draggedShipNameWithPositionIndex;

const selectShip = (e) => {};

const dragStart = (e) => {
  const draggedShipIndex = e.target.id.substr(-1);
  draggedShip = ships[draggedShipIndex];
};

const dragOver = (e) => {
  e.preventDefault();
};

const checkIfPlacmentWithinGrid = (gridId, start, end, isRotated) => {
  console.log(gridId, start, end);
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

const dragDrop = (e) => {
  console.log("dropped");
  const lastShipDivId = draggedShip.el.lastElementChild.id;
  const shipType = lastShipDivId.slice(0, -2);
  const gridPlacementId = parseInt(e.target.id); //id of grid placed on
  const shipPositionIndex = parseInt(
    draggedShipNameWithPositionIndex.substr(-1)
  ); //position index of ship

  let filledGridsIndex = [];
  if (!draggedShip.rotated) {
    // board placement logic if ship is not rotated
    const startingPositionOnGrid = gridPlacementId - shipPositionIndex;
    const endingPositionOnGrid =
      startingPositionOnGrid + draggedShip.length - 1;

    const isLegalPlacment = checkIfPlacmentWithinGrid(
      gridPlacementId,
      startingPositionOnGrid,
      endingPositionOnGrid,
      draggedShip.rotated
    );
    console.log(isLegalPlacment);
  } else {
    // board placment logic if ship is rotated
    console.log(e.target.id);
    console.log(parseInt(draggedShipNameWithPositionIndex.substr(-1)));
    const startingPositionOnGrid =
      gridPlacementId - shipPositionIndex * boardMetaData.size;
    const endingPositionOnGrid =
      startingPositionOnGrid + (draggedShip.length - 1) * boardMetaData.size;
    console.log(startingPositionOnGrid, "start pos");
    console.log(endingPositionOnGrid, "end pos");
    const isLegalPlacment = checkIfPlacmentWithinGrid(
      gridPlacementId,
      startingPositionOnGrid,
      endingPositionOnGrid,
      draggedShip.rotated
    );
    console.log(isLegalPlacment);
  }
};

const dragEnter = (e) => {
  e.preventDefault();
};

const dragLeave = () => {};

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
    console.log(shipId);

    const ship = ships[shipId];
    const rotate = ship.rotated ? "inline-flex" : "inline-block";

    ship.rotated = !ship.rotated;
    console.log(rotate);
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
