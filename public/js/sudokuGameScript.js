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
    "--74916-5",
    "2---6-3-9",
    "-----7-1-",
    "-586----4",
    "--3----9-",
    "--62--187",
    "9-4-7---2",
    "67-83----",
    "81--45---"
];

var solution = [
    "387491625",
    "241568379",
    "569327418",
    "758619234",
    "123784596",
    "496253187",
    "934176852",
    "675832941",
    "812945763"
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

    // Board
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            if (board[r][c] != "-") {
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
            document.getElementById("board").appendChild(tile);
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
    if (numSelected) {
        if (this.classList.contains("tile-start")) {
            return;
        }
        const coords = this.id.split("-");
        const r = parseInt(coords[0]);
        const c = parseInt(coords[1]);
        const enteredNumber = numSelected.id;
        const correctNumber = solution[r][c];
        let current = this.innerText;

        if (enteredNumber !== correctNumber) {
            // Set the text color to red for incorrect numbers
            this.style.color = "red";
        } else {
            // Reset the text color to black for correct numbers
            this.style.color = "black";
        }
        this.innerText = enteredNumber;
        undoMoves.push([r, c, current, this.innerText]);
        redoMoves.clear();
    }
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
}