
function openHelpOverlay() {
    document.getElementById("helpOverlay").style.display = "block";
}

function closeHelpOverlay() {
    document.getElementById("helpOverlay").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function() {
    var helpButton = document.querySelector(".helpButton");
    var helpOverlay = document.getElementById("helpOverlay");
    var closeButton = document.querySelector("#helpOverlay .close");

    helpButton.addEventListener("click", function() {
        console.log("clicked");
        openHelpOverlay();
        
    });

    closeButton.addEventListener("click", closeHelpOverlay);

    helpOverlay.addEventListener("click", function(event) {
        if (event.target === helpOverlay) {
            closeHelpOverlay();
        }
    });
});