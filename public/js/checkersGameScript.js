//Define the player, comp and kings
const PLAYER = 'red';
const AI = 'black';
const KING = 'king';
const EMPTY = null;

//Global var to track the current turn
let currentTurn = PLAYER;

//Initialize the game board
let board = [];
for (let i = 0; i < 8; i++) {
  board[i] = new Array(8).fill(EMPTY);
}

//Function to switch turns
function switchTurns() {

  currentTurn = currentTurn === PLAYER ? AI : PLAYER;

  let turnIndicator = document.getElementById('turn-indicator');
  if (currentTurn === PLAYER) {
    turnIndicator.textContent = "Player's turn";
  } else {
    turnIndicator.textContent = "Computer's turn";
  }

  // If it's the AI's turn, make a move
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
  //Attach event listeners to player pieces
  let playerPieces = document.querySelectorAll('.piece.' + PLAYER);
  playerPieces.forEach(piece => {

    piece.addEventListener('click', function(event) {

      selectPiece(event, piece);
    });
  });
}

//Function handling piece selection
function selectPiece(event) {

   // Clear any previous move listeners to prevent stacking
   clearMoveListeners();

   // Deselect any previously selected piece
   let previouslySelected = document.querySelector('.selected');
   if (previouslySelected) {
     previouslySelected.classList.remove('selected');
   }
 
   // Select the new piece and highlight it
   let selectedPiece = event.currentTarget;
   selectedPiece.classList.add('selected');
 
   // Add logic to handle piece movement when a destination cell is clicked
   let destinationCells = document.querySelectorAll('.cell.dark:not(.occupied)');
   destinationCells.forEach(cell => {
     cell.addEventListener('click', function() {
       // Get the new row and column from the target cell's ID
      let [newRow, newCol] = cell.id.split('-').slice(1).map(Number);
      // Check if the move is valid before moving the piece
      if (isValidMove(selectedPiece, newRow, newCol)) {
        movePiece(selectedPiece, newRow, newCol);
      }
     });
   });
 }

// Function to clear move listeners
function clearMoveListeners() {
  let destinationCells = document.querySelectorAll('.cell.dark:not(.occupied)');
  destinationCells.forEach(cell => {
    let newCell = cell.cloneNode(true);
    cell.parentNode.replaceChild(newCell, cell);
  });
}

// Function to move piece to new cell
function movePiece(piece, newRow, newCol) {
  // Get the new row and column from the target cell's ID
  let [newRow, newCol] = targetCell.id.split('-').slice(1).map(Number);
  let originalCell = document.getElementById(`cell-${oldRow}-${oldCol}`);
  if (originalCell) {
    originalCell.innerHTML = ''; // Clear the original cell
  }

  // Move the piece to the target cell
  targetCell.appendChild(piece);
  piece.classList.remove('selected');

  // Update the board state
  updateBoard(piece, newRow, newCol);

  // Logic for kinging checked here!
  checkForKinging(piece, newRow);

  // Switch turn logic, after player move, computer's turn
  switchTurns();

  // Clear move listeners after the move
  clearMoveListeners();

  // Check for win/loss after the move
  checkWinLoss();
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

  //Check for win/loss after the move
  checkWinLoss();
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


//Function to check if a move is valid, including jump moves
function isValidMove(piece, fromRow, fromCol, toRow, toCol) {

  if (!piece.classList.contains('king')) {
    if (currentTurn === PLAYER && newRow <= oldRow) return false; // Red moves down
    if (currentTurn === AI && newRow >= oldRow) return false; // Black moves up
  }

  //Check if destination cell is empty
  if (board[toRow][toCol] !== EMPTY) return false;

  //Calculate distance of the move
  let rowDistance = Math.abs(toRow - fromRow);
  let colDistance = Math.abs(toCol - fromCol);

  //Regular move
  if (rowDistance === 1 && colDistance === 1) {
    if (piece.classList.contains(KING)) {

      //Kings can move backward
      return true;
    }

    return (currentTurn === PLAYER && toRow > fromRow) || //Red moves down
      (currentTurn === AI && toRow < fromRow); //Black moves up
  }

  //Capture move
  if (rowDistance === 2 && colDistance === 2) {

    let capturedRow = (fromRow + toRow) / 2;
    let capturedCol = (fromCol + toCol) / 2;
    let opponent = currentTurn === PLAYER ? AI : PLAYER;
    if (board[capturedRow][capturedCol] === opponent) {

      //Valid capture
      return true;
    }
  }

  //Invalid move
  return false;
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

//Function to check for a win or loss
function checkWinLoss() {

  let playerPieces = 0;
  let aiPieces = 0;

  //Count pieces for each player
  for (let row = 0; row < 8; row++) {

    for (let col = 0; col < 8; col++) {

      if (board[row][col] === PLAYER) playerPieces++;
      if (board[row][col] === AI) aiPieces++;
    }
  }

  //Check win/loss conditions
  if (playerPieces === 0) {

    alert('AI wins!');
    //Reset game or handle loss
  } else if (aiPieces === 0) {

    alert('Player wins!');
    //Reset game or handle win
  }
}

//Call initialize function when the page loads
window.onload = initGame();