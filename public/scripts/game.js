const boardSize = 10;
const board = [];

const userGrid = document.getElementById("user-grid");

// generates the playing board for each battleship game
const generateBoard = (grid) => {
  idCounter = 0;
  for (let i = 0; i < boardSize; i++) {
    const gridRow = document.createElement("div");
    gridRow.style.width = "100%";
    gridRow.style.height = `${100}%`;
    for (let j = 0; j < boardSize; j++) {
      const squareGrid = document.createElement("div");
      const squareGridMetaData = {
        id: ++idCounter,
        row: i,
        column: j,
        el: squareGrid,
      };
      squareGrid.id = squareGridMetaData.id;
      squareGrid.style.backgroundColor = "red";
      squareGrid.style.minWidth = `${100 / boardSize}%`;
      squareGrid.style.minHeight = `${100 / boardSize}%`;
      squareGrid.style.border = "1px solid #000";
      squareGrid.classList.add("square-grid");
      gridRow.appendChild(squareGrid);
      board.push(squareGridMetaData);
    }
    grid.appendChild(gridRow);
  }
};

generateBoard(userGrid);

let selectedShipId;
let draggedShip;

const selectShip = (e) => {};

const dragStart = (e) => {
  draggedShip = e.target;
  console.log(draggedShip);
};

const dragOver = (e) => {
  e.preventDefault();
};

const dragDrop = () => {
  console.log("dropped");
  const shipDivId = draggedShip.lastElementChild.id;
  const shipType = shipDivId.slice(0, -2);
  console.log(shipType);
};

const dragEnter = (e) => {
  e.preventDefault();
};

const dragLeave = () => {};

const dragEnd = () => {};

const testShip = document.getElementById("test-ship");
testShip.addEventListener("dragstart", dragStart);

board.forEach((square) => {
  square.el.addEventListener("dragstart", dragStart);
  square.el.addEventListener("dragover", dragOver);
  square.el.addEventListener("dragenter", dragEnter);
  square.el.addEventListener("dragleave", dragLeave);
  square.el.addEventListener("drop", dragDrop);
  square.el.addEventListener("dragend", dragEnd);
});

console.log(board);
