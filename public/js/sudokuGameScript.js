import Stack from './stack.js';

var numSelected = null;
var tileSelecter = null;
var undoMoves = new Stack();
var redoMoves = new Stack();

const undoButton = document.getElementById("undo-button");
undoButton.addEventListener("click", undoMove);
const redoButton = document.getElementById("redo-button");
redoButton.addEventListener("click", redoMove);


var board = [
    [0,0,7,4,9,1,6,0,5],
    [2,0,0,0,6,0,3,0,9],
    [0,0,0,0,0,7,0,1,0],
    [0,5,8,6,0,0,0,0,4],
    [0,0,3,0,0,0,0,9,0],
    [0,0,6,2,0,0,1,8,7],
    [9,0,4,0,7,0,0,0,2],
    [6,7,0,8,3,0,0,0,0],
    [8,1,0,0,4,5,0,0,0]
];

var solution = [
    [3,8,7,4,9,1,6,2,5],
    [2,4,1,5,6,8,3,7,9],
    [5,6,9,3,2,7,4,1,8],
    [7,5,8,6,1,9,2,3,4],
    [1,2,3,7,8,4,5,9,6],
    [4,9,6,2,5,3,1,8,7],
    [9,3,4,1,7,6,8,5,2],
    [6,7,5,8,3,2,9,4,1],
    [8,1,2,9,4,5,7,6,3]
];

window.onload = function () {
    setGame();
}

function setGame() {
    // Digits 1-9
    for (let i = 1; i <= 9; i++) {
        // <div id="1">1</div>
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", selectNumber);
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);
    }

    // Eraser
    let eraser = document.createElement("div");
    eraser.id = "";
    eraser.addEventListener("click", selectNumber);
    eraser.classList.add("number");
    let img = document.createElement("img");
    img.src = "/images/eraser.png";
    img.alt = "Eraser";
    img.style.width = "100%";
    eraser.appendChild(img);
    document.getElementById("digits").appendChild(eraser);

    // Solver
    let hint = document.createElement("div");
    hint.id = "H";
    hint.innerText = "H";
    hint.addEventListener("click", selectNumber);
    hint.classList.add("number");
    document.getElementById("digits").appendChild(hint);

    // Board
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            if (board[r][c] != "0") {
                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            }
            if (r == 2 || r == 5) {
                tile.classList.add("horizontal-line");
            }
            if (c == 2 || c == 5) {
                tile.classList.add("vertical-line");
            }
            tile.addEventListener("click", selectTile);
            tile.classList.add("tile");
            document.getElementById("sudokuBoard").appendChild(tile);
        }
    }
}

function selectNumber() {
    if (numSelected != null) {
        numSelected.classList.remove("number-selected");
    }
    numSelected = this;
    numSelected.classList.add("number-selected");
}



function selectTile() {
    if (numSelected.id === "H") {
        if (this.classList.contains("tile-start")) {
            return;
        }
        const coords = this.id.split("-");
        const r = parseInt(coords[0]);
        const c = parseInt(coords[1]);
        const enteredNumber = solution[r][c];
        let current = this.innerText;
        this.style.color = "black";
        this.innerText = enteredNumber;
        undoMoves.push([r, c, current, this.innerText]);
        redoMoves.clear();
        evaluateBoard();
    } else if (numSelected) {
        if (this.classList.contains("tile-start")) {
            return;
        }
        const coords = this.id.split("-");
        const r = parseInt(coords[0]);
        const c = parseInt(coords[1]);
        const enteredNumber = numSelected.id;
        const correctNumber = solution[r][c];
        let current = this.innerText;

        if (enteredNumber !== correctNumber.toString()) {
            // Set the text color to red for incorrect numbers
            this.style.color = "red";
        } else {
            // Reset the text color to black for correct numbers
            this.style.color = "black";
        }
        this.innerText = enteredNumber;
        undoMoves.push([r, c, current, this.innerText]);
        redoMoves.clear();
        evaluateBoard();
    }
}

function evaluateBoard() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let onBoard = document.getElementById(r + "-" + c).innerText;
            let onSolution = solution[r][c];
            if (onBoard === "") {
                return;
            }
        }
    }
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let onBoard = document.getElementById(r + "-" + c).innerText;
            let onSolution = solution[r][c].toString();
            if (onBoard != onSolution) {
                alert("Incorrect solution!");
                return;
            }
        }
    }
    alert("You win!");
}

function undoMove() {
    if (undoMoves.isEmpty()) {
        return;
    }
    let content = undoMoves.pop();
    redoMoves.push(content);
    let r = content[0].toString();
    let c = content[1].toString();
    let prev = content[2];
    if (solution[r][c] != prev) {
        document.getElementById(r + "-" + c).style.color = 'red';
    } else {
        document.getElementById(r + "-" + c).style.color = 'black';
    }
    document.getElementById(r + "-" + c).innerText = prev;
}

function redoMove() {
    if (redoMoves.isEmpty()) {
        return;
    }
    let content = redoMoves.pop();
    undoMoves.push(content);
    let r = content[0].toString();
    let c = content[1].toString();
    let prev = content[3];
    if (solution[r][c] != prev) {
        document.getElementById(r + "-" + c).style.color = 'red';
    } else {
        document.getElementById(r + "-" + c).style.color = 'black';
    }
    document.getElementById(r + "-" + c).innerText = prev;
    evaluateBoard();
}