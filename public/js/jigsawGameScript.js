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