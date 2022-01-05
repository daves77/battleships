const boardSize = 10;
const board = [];

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
  for (let i = 0; i < boardSize; i++) {
    const gridRow = document.createElement("div");
    gridRow.style.width = `${boardMetaData.width}px`;
    gridRow.style.height = `${boardMetaData.height / boardMetaData.size}px`;
    gridRow.style.display = "flex";
    for (let j = 0; j < boardSize; j++) {
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
let draggedShipLength;
let draggedShipNameWithPositionIndex;

const selectShip = (e) => {};

const dragStart = (e) => {
  draggedShip = e.target;
  draggedShipLength = draggedShip.children.length;
};

const dragOver = (e) => {
  e.preventDefault();
};

const dragDrop = (e) => {
  console.log("dropped");
  const lastShipDivId = draggedShip.lastElementChild.id;
  const shipType = lastShipDivId.slice(0, -2);
  const startingPositionOnGrid =
    parseInt(e.target.id) -
    parseInt(draggedShipNameWithPositionIndex.substr(-1));
  const endingPositionOnGrid = startingPositionOnGrid + draggedShipLength - 1;
  console.log(
    e.target.id,
    parseInt(draggedShipNameWithPositionIndex.substr(-1))
  );
  console.log(startingPositionOnGrid, "start pos");
  console.log(endingPositionOnGrid, "end pos");
};

const dragEnter = (e) => {
  e.preventDefault();
};

const dragLeave = () => {};

const dragEnd = () => {};

// const testShip = document.getElementById("test-ship-0");
// testShip.addEventListener("mousedown", (e) => {
//   draggedShipNameWithPositionIndex = e.target.id;
//   console.log(draggedShipNameWithPositionIndex);
// });
// testShip.addEventListener("dragstart", dragStart);

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
