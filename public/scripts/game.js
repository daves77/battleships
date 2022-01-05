const boardSize = 10;
const board = [];

const boardMetaData = {
  size: 10,
  width: 400,
  height: 400,
};

const userGrid = document.getElementById("user-grid");

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
        id: ++idCounter,
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

generateBoard(userGrid);

let selectedShip;
let selectedShipIndex;
let draggedShip;

const selectShip = (e) => {};

const dragStart = (e) => {
  draggedShip = e.target;
  console.log(draggedShip);
  selectedShip = e.target;
  selectedShipIndex = parseInt(selectedShip.id.substr(-1));
  console.log(selectedShipIndex);
};

const dragOver = (e) => {
  e.preventDefault();
};

const dragDrop = (e) => {
  console.log("dropped");
  console.log(e.target);
  const lastShipDivId = draggedShip.lastElementChild.id;
  const shipType = lastShipDivId.slice(0, -2);
  const lastShipId = parseInt(lastShipDivId.substr(-1));
  console.log(lastShipId);
  console.log(e.target.id);
  console.log(selectedShip.id);
};

const dragEnter = (e) => {
  e.preventDefault();
};

const dragLeave = () => {};

const dragEnd = () => {};

const testShip = document.getElementById("test-ship-0");
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
