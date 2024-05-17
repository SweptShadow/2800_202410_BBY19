var usedNums = new Array(55);

function newCard() {
    //Starting loop through each square card
    for (var i = 0; i < 24; i++) {  //<--always this code for loops. change in red
        setSquare(i);
    }
}

function setSquare(thisSquare) {
    var currSquare = "square" + thisSquare;
    var newNum;

    do {
        newNum = getNewNum();
    }
    while (usedNums[newNum]);

    usedNums[newNum] = true;
    document.getElementById(currSquare).innerHTML = newNum;
}

function getNewNum() {
    return Math.floor(Math.random() * 50);

}

function anotherCard() {
    for (var i = 1; i < usedNums.length; i++) {
        usedNums[i] = false;
    }

    newCard();
}

function pickNumber() {
    // Generate a random number
    var currNum = Math.floor(Math.random() * 50);
    console.log("Random number:", currNum);
    // Check if the random number matches any number on the board
    for (var i = 0; i < usedNums.length; i++) {
        console.log(usedNums[i])
        if (usedNums[i] === currNum) {
            console.log("Match found at index:", i);
            // Mark the square with an "X"
            var currSquare = "square" + i;
            document.getElementById(currSquare).innerHTML = "X";
            break; // Exit the loop after finding the first match
        }
    }
}
pickNumber()