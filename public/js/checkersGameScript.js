//Define the players, currently just user vs computer(ai)
const PLAYER = 'red';
const AI = 'black';

//Global var to track the current turn
let currentTurn = PLAYER;

//Initialize the game board
let board = [];
for (let i = 0; i < 8; i++) {
  board[i] = new Array(8).fill(null);
}

//Function to switch turns
function switchTurns() {

  currentTurn = currentTurn === PLAYER ? AI : PLAYER;

  //If it's the AI's turn, make a move
  if (currentTurn === AI) {
    compMove();
  }
}

//Function initializing the game
function initGame() {
  //Place the pieces on the board
  for (let i = 0; i < 3; i++) {
    for (let j = (i % 2); j < 8; j += 2) {
      board[i][j] = PLAYER;
    }
  }
  for (let i = 5; i < 8; i++) {
    for (let j = (i % 2); j < 8; j += 2) {
      board[i][j] = AI;
    }
  }
  //Add click event-listeners for player pieces
  document.querySelectorAll('.piece.' + PLAYER).forEach(piece => {
    piece.addEventListener('click', selectPiece);
  });
}

//Function handling piece selection
function selectPiece(event) {

  //Deselect previously selected piece
  let selected = document.querySelector('.selected');
  if (selected) {
    selected.classList.remove('selected');
  }

  //Select new piece
  event.currentTarget.classList.add('selected');
}

//Function to move piece to new cell
function movePiece(piece, newRow, newCol) {

  let targetCell = document.getElementById('cell-' + newRow + '-' + newCol);
  if (targetCell && !targetCell.firstChild) {

    targetCell.appendChild(piece);
    piece.classList.remove('selected');

    //Update the board state
    updateBoard(piece, newRow, newCol);

    //Logic for kinging checked here!
    checkForKinging(piece, newRow);

    //Sitch turn logic, after player move, computer's turn
    switchTurns();
  }
}

//Function to handle capturing a piece
function capturePiece(fromRow, fromCol, toRow, toCol) {
  let capturedRow = (fromRow + toRow) / 2;
  let capturedCol = (fromCol + toCol) / 2;
  let piece = document.getElementById(`cell-${fromRow}-${fromCol}`).firstChild;
  let capturedPiece = document.getElementById(`cell-${capturedRow}-${capturedCol}`).firstChild;

  //Remove the captured piece from the board
  if (capturedPiece) {
    capturedPiece.remove();
    board[capturedRow][capturedCol] = null; // Update the board array
  }

  //Move the capturing piece
  movePiece(piece, toRow, toCol);
}


//Function to update the internal board representation
function updateBoard(piece, newRow, newCol) {
  let [oldRow, oldCol] = piece.id.split('-').map(Number);
  board[oldRow][oldCol] = null;
  board[newRow][newCol] = piece.classList.contains(PLAYER) ? PLAYER : AI;
}

//Function for the computer to make a move, including forced captures
function compMove() {
  let captures = checkForcedCaptures(board, AI);
  if (captures.length > 0) {

    //If captures are available, make a capture
    let randomCapture = captures[Math.floor(Math.random() * captures.length)];
    capturePiece(randomCapture.fromRow, randomCapture.fromCol, randomCapture.toRow, randomCapture.toCol);
  } else {

    //If no captures, move a random piece
    let pieces = document.querySelectorAll('.piece.' + AI);
    let randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    let currentCell = randomPiece.parentElement;
    let [currentRow, currentCol] = currentCell.id.split('-').map(Number);

    //Attempt to move to a random adjacent cell
    let potentialMoves = [
      [currentRow - 1, currentCol - 1],
      [currentRow - 1, currentCol + 1],

      //Added for king movement
      [currentRow + 1, currentCol - 1],
      //Added for king movement
      [currentRow + 1, currentCol + 1]
    ];

    for (let [newRow, newCol] of potentialMoves) {

      if (isValidMove(newRow, newCol)) {
        movePiece(randomPiece, newRow, newCol);
        break;
      }
    }
  }
}


//Function to check if a move is valid
function isValidMove(newRow, newCol) {
  return newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && board[newRow][newCol] === null;
}

//Function to check if a piece should be kinged
function checkForKinging(piece, newRow) {
  if ((piece.classList.contains(PLAYER) && newRow === 7) ||
    (piece.classList.contains(AI) && newRow === 0)) {
    piece.classList.add('king');
  }
}

//Function to check for possible captures
function checkForcedCaptures(board, player) {

  let capturesAvailable = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === player) {

        //Check all possible capture moves
        let captureMoves = getCaptureMoves(board, row, col, player);
        capturesAvailable.push(...captureMoves);
      }
    }
  }
  return capturesAvailable;
}

//Function to get all possible capture moves for a piece
function getCaptureMoves(board, row, col, player) {

  let opponent = player === PLAYER ? AI : PLAYER;

  //Directions in which to look for captures
  let directions = player === PLAYER ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  let captureMoves = [];

  directions.forEach(([dx, dy]) => {
    let enemyRow = row + dx;
    let enemyCol = col + dy;
    let captureRow = enemyRow + dx;
    let captureCol = enemyCol + dy;

    if (isValidPosition(enemyRow, enemyCol) && isValidPosition(captureRow, captureCol) &&
      board[enemyRow][enemyCol] === opponent && board[captureRow][captureCol] === EMPTY) {
      captureMoves.push({ fromRow: row, fromCol: col, toRow: captureRow, toCol: captureCol });
    }
  });

  return captureMoves;
}

//Function to check if a position is on the board
function isValidPosition(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}


//Call initialize function when the page loads
initGame();