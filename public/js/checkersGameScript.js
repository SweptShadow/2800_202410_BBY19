//Define the players, currently just user vs computer(ai)
const PLAYER = 'red';
const AI = 'black';

//Function initializing the game
function initGame() {

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

    //Write logic fo captures and kinging here!!!!

    //After player move, computer's turn
    compMove();
  }
}

//Function for the computer to make a move
function compMove() {

  //Simple logic to move a random piece
  let pieces = document.querySelectorAll('.piece.' + AI);
  let randomPiece = pieces[Math.floor(Math.random() * pieces.length)];

  //Write comp logic to move the selected piece


  let currentCell = randomPiece.parentElement;
  let currentRow = parseInt(currentCell.id.split('-')[1]);
  let currentCol = parseInt(currentCell.id.split('-')[2]);
  //Move up for comp
  let newRow = currentRow - 1;
  //Alternate columns
  let newCol = currentCol % 2 === 0 ? currentCol - 1 : currentCol + 1;
  movePiece(randomPiece, newRow, newCol);
}

//Call initialize function when the page loads
initGame();