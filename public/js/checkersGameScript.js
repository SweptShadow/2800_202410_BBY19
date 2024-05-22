class Piece {
  constructor(row, column, player) {
    this.row = row;
    this.column = column;
    this.player = player;
  }

  compare(piece) {
    return piece.row === this.row && piece.column === this.column;
  }
}

// Global variables
let currentPlayer = 'redPiece';
let board = [];
let selectedPiece = null;
let possibleMoves = [];

// Function to initialize the game
function initGame() {
  // Initialize the board with pieces
  for (let i = 0; i < 8; i++) {

    // Essential for creating board
    board[i] = new Array(8).fill(null);
    for (let j = 0; j < 8; j++) {
      if (i < 3 && (i + j) % 2 !== 0) {
        board[i][j] = new Piece(i, j, 'blackPiece');
      } else if (i > 4 && (i + j) % 2 !== 0) {
        board[i][j] = new Piece(i, j, 'redPiece');
      }
    }
  }
  buildBoard();
}

// Function to build the board
function buildBoard() {
  let game = document.getElementById('game');
  game.innerHTML = ''; // Clear the board

  // Create the board
  for (let i = 0; i < 8; i++) {
    let row = document.createElement('div');
    row.className = 'row';
    for (let j = 0; j < 8; j++) {
      let cell = document.createElement('div');
      cell.className = 'cell ' + ((i + j) % 2 === 0 ? 'light' : 'dark');
      cell.id = `cell-${i}-${j}`;

      let piece = board[i][j];
      if (piece) {
        let pieceElement = document.createElement('div');
        pieceElement.className = 'piece ' + piece.player;
        pieceElement.id = `piece-${i}-${j}`;
        pieceElement.addEventListener('click', selectPiece);
        cell.appendChild(pieceElement);
      }

      row.appendChild(cell);
    }
    game.appendChild(row);
  }
}

// Function to handle piece selection
function selectPiece(event) {
  console.log('Piece clicked', event.target);

  // Prevent the event from bubbling up to parent elements
  event.stopPropagation(); 
  let pieceElement = event.target;
  let [row, column] = pieceElement.id.split('-').slice(1).map(Number);
  let piece = board[row][column];

  if (piece && piece.player === currentPlayer) {

    // Deselect if the same piece is clicked again
    if (selectedPiece && selectedPiece.compare(piece)) {
      selectedPiece = null;
      clearPossibleMoves();
      buildBoard();
      return;
    }

    selectedPiece = piece;
    showPossibleMoves(piece);
  }
}

// Function to show possible moves for a selected piece
function showPossibleMoves(piece) {
  clearPossibleMoves(); // Clear previous possible moves

  // Calculate possible moves
  let directions = piece.player === 'redPiece' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];
  directions.forEach(([dx, dy]) => {
    let newRow = piece.row + dx;
    let newCol = piece.column + dy;
    if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
      possibleMoves.push({ row: newRow, column: newCol });
    }
  });

  // Highlight possible moves
  possibleMoves.forEach(move => {
    let cell = document.getElementById(`cell-${move.row}-${move.column}`);
    cell.classList.add('possible-move');
    cell.addEventListener('click', makeMove);
  });
}

// Function to clear highlighted possible moves
function clearPossibleMoves() {
  possibleMoves.forEach(move => {
    let cell = document.getElementById(`cell-${move.row}-${move.column}`);
    cell.classList.remove('possible-move');
    cell.removeEventListener('click', makeMove);
  });
  possibleMoves = [];
}

// Function to make a move
function makeMove(event) {
  if (!selectedPiece) return;

  let cell = event.target;
  let [row, column] = cell.id.split('-').slice(1).map(Number);

  // Move the piece
  board[selectedPiece.row][selectedPiece.column] = null;
  selectedPiece.row = row;
  selectedPiece.column = column;
  board[row][column] = selectedPiece;

  // Change player turn
  currentPlayer = currentPlayer === 'redPiece' ? 'blackPiece' : 'redPiece';

  // Rebuild the board
  clearPossibleMoves();
  buildBoard();
}

// Function to check if a position is on the board
function isValidPosition(row, column) {
  return row >= 0 && row < 8 && column >= 0 && column < 8;
}

// Call initialize function when the page loads
window.onload = initGame;

document.getElementById('game').addEventListener('click', function(event) {
  // Check if the clicked element is a piece
  if (event.target.classList.contains('piece')) {
    selectPiece(event);
  }
});
