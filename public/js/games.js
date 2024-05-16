document.getElementById("game1").addEventListener('click', function() {
    window.location.href = "/gamesSpecific/?game=chess";
});

document.getElementById("game2").addEventListener('click', function() {
    window.location.href = "gamesSpecific/?game=checkers";
})

document.getElementById("game3").addEventListener('click', function() {
    window.location.href = "gamesSpecific/?game=jigsaw";
})
