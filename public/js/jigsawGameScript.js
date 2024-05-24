//Array of elements belonging to the grid class and piece class
var grids = new Array();
var pieces = new Array();

//The puzzle piece currently selected by the user's mouse and keyboard
var mousePiece = null;
var keyPiece = null;

//The index number of keyPiece
var keyIndex = null;

//Boolean value, true = keyboard use is in Select Piece mode, false = keyboard use is in Move Piece mode
var selectMode = true;

/* Horizontal distance in pixels between the left edge of mousePiece and the mouse pointer */
var diffX = null;

/* Vertical distance in pixels between the top edge of mousePiece and the mouse pointer */
var diffY = null;

//Int representing the highest z-index value on the page
var maxZ = 1;
var hoverGrid = null;

window.onload = init;

//Reloads current page, re-arranging the puzzle
function jumbleIt() {
  window.location.reload();
}

//Places the puzzle images in the current order as background images for the grid squares
function solveIt() {
  for (var i = 0; i < grids.length; i++) {
    pieces[i].style.backgroundImage = "";
    grids[i].style.backgroundImage = "url(images/piece" + i + ".jpg)";
  }
}


/* Set up and initialize the page, define grid and pieces array, and appy event handlers to mouse and keyboard */
function init() {

  var allElem = document.getElementsByTagName("*");

  for (var i = 0; i < allElem.length; i++) {
    if (allElem[i].className == "grid") grids.push(allElem[i]);
    if (allElem[i].className == "pieces") pieces.push(allElem[i]);
  }

  var randomIntegers = randomArray(pieces.length);

  for (i = 0; i < pieces.length; i++) {
    pieces[i].style.backgroundImage = "url(images/piece" + randomIntegers[i] + ".jpg)";
    pieces[i].style.top = getStyle(pieces[i], "top");
    pieces[i].style.left = getStyle(pieces[i], "left");
    pieces[i].style.width = getStyle(pieces[i], "width");
    pieces[i].style.height = getStyle(pieces[i], "height");
    pieces[i].style.cursor = "pointer";

    addEvent(pieces[i], "mousedown", mouseGrab, false);
  }

  for (var i = 0; i < grids.length; i++) {
    grids[i].style.top = getStyle(grids[i], "top");
    grids[i].style.left = getStyle(grids[i], "left");
    grids[i].style.width = getStyle(grids[i], "width");
    grids[i].style.height = getStyle(grids[i], "height");
  }
  document.onkeydown = keyGrab;
  keyPiece = pieces[0];
  keyIndex = 0;

  document.getElementById("jumble").onclick = jumbleIt;
  document.getElementById("solve").onclick = solveIt;
}


function keyGrab(e) {
  var evt = e || window.event;
  if (evt.keyCode == 32) { toggleMode(); return false }
}

/* Returns Boolean value indicating whether valid to drop the object. */
function dropValid(object) {
  for (var i = 0; i < pieces.length; i++) {
    if (withinIt(object, pieces[i])) return false;
  }
  return true;
}

/* If object is over a grid square, aligns object with the top-left corner of the square */
function alignPiece(object) {
  for (var i = 0; i < grids.length; i++) {
    if (withinIt(object, grids[i])) {
      object.style.left = grids[i].style.left;
      object.style.top = grids[i].style.top;
      break;
    }
  }
}

/* If object is over a grid square, sets background color of square to light green */
function highlightGrid(object) {
  if (hoverGrid) hoverGrid.style.backgroundColor = "";

  for (var i = 0; i < grids.length; i++) {
    if (withinIt(object, grids[i])) {
      hoverGrid = grids[i];
      hoverGrid.style.backgroundColor = "rgb(75, 88, 98)";
      break;
    }
  }
}

/* "Grabs" a puzzle piece using the mouse. Sets the value of mousePiece. Calculates the value of diffX and diffY. */
function mouseGrab(e) {
  var evt = e || window.event;
  mousePiece = evt.target || evt.srcElement;
  maxZ++;

  //Place the piece above other objects
  mousePiece.style.zIndex = maxZ;
  mousePiece.style.cursor = "move";

  //x-coordinate  of  pointer
  var mouseX = evt.clientX;
  //y-coordinate  of  pointer
  var mouseY = evt.clientY;

  /*  Calculate  the  distance  from  the  pointer  to  the  piece  */
  diffX = parseInt(mousePiece.style.left) - mouseX;
  diffY = parseInt(mousePiece.style.top) - mouseY;

  /*  Add  event  handlers  for  mousemove  and  mouseup  events  */
  addEvent(document, "mousemove", mouseMove, false);
  addEvent(document, "mouseup", mouseDrop, false);
}

/* Move mousePiece across the Web page, keeping a constant distance from the mouse pointer */
function mouseMove(e) {
  var evt = e || window.event;

  var mouseX = evt.clientX;
  var mouseY = evt.clientY;

  mousePiece.style.left = mouseX + diffX + "px";
  mousePiece.style.top = mouseY + diffY + "px";
  highlightGrid(mousePiece);
}

/* Drops mousePiece on the page. Aligns the piece with the grid. Turns off event handlers for the mousemove and mouseup events. */
function mouseDrop(e) {

  if (dropValid(mousePiece)) {

    alignPiece(mousePiece);
    removeEvent(document, "mousemove", mouseMove, false);
    removeEvent(document, "mouseup", mouseDrop, false);
    mousePiece.style.cursor = "pointer";
  }
}