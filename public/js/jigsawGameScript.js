//Initialize the game
function initGame() {

  let pieces = document.querySelectorAll('.puzzle-piece');
  pieces.forEach(piece => {
    piece.addEventListener('dragstart', dragStart);
  });

  let puzzleArea = document.getElementById('jigsaw-puzzle');
  puzzleArea.addEventListener('dragover', dragOver);
  puzzleArea.addEventListener('drop', dropPiece);
}

//Function to handle drag start
function dragStart(event) {

  event.dataTransfer.setData('text/plain', event.target.dataset.position);
}

//Function to handle drag over
function dragOver(event) {

  event.preventDefault();
}

//Function to handle dropping of a piece
function dropPiece(event) {

  event.preventDefault();
  let target = event.target;
  if (target.classList.contains('puzzle-piece')) {

    let sourcePosition = event.dataTransfer.getData('text/plain');
    let targetPosition = target.dataset.position;

    //Swap the positions of the pieces
    let sourcePiece = document.querySelector(`[data-position="${sourcePosition}"]`);
    let targetStyle = target.getAttribute('style');
    target.setAttribute('style', sourcePiece.getAttribute('style'));
    sourcePiece.setAttribute('style', targetStyle);

    //Update the positions in the dataset
    target.dataset.position = sourcePosition;
    sourcePiece.dataset.position = targetPosition;

    //Check if puzzle is completed
    checkCompletion();
  }
}

//Function to check if puzzle is completed
function checkCompletion() {

  let pieces = document.querySelectorAll('.puzzle-piece');
  let isCompleted = true;
  pieces.forEach(piece => {

    let position = piece.dataset.position.split('-');
    let expectedBackgroundPosition = `${-position[1] * 100}px ${-position[0] * 100}px`;
    if (piece.getAttribute('style').indexOf(expectedBackgroundPosition) === -1) {
      isCompleted = false;
    }
  });

  if (isCompleted) {
    
    alert('Congratulations! You have completed the puzzle.');
  }
}

//Initialize function when the page loads
initGame();