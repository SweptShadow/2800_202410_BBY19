document.addEventListener("DOMContentLoaded", function() {
  const bioTextarea = document.getElementById("bioTextarea");
  const updateBioButton = document.getElementById("updateBioButton");

  bioTextarea.addEventListener("click", function() {
    updateBioButton.style.display = "inline-block";
  });

  updateBioButton.addEventListener("click", function(event) {
    event.preventDefault();
    if (confirm("Are you sure you want to update your bio?")) {
      document.getElementById("bioForm").submit();
    }
  });

  const favGameButton = document.getElementById("favGameButton");
  favGameButton.addEventListener("click", function(event) {
    event.preventDefault();
    if (confirm("Are you sure you want to update your favorite game?")) {
      document.getElementById("favGameForm").submit();
    }
  });

  const usernameButton = document.getElementById("usernameButton");
  usernameButton.addEventListener("click", function(event) {
    event.preventDefault();
    if (confirm("Are you sure you want to update your username?")) {
      document.getElementById("usernameForm").submit();
    }
  });

  const emailButton = document.getElementById("emailButton");
  emailButton.addEventListener("click", function(event) {
    event.preventDefault();
    if (confirm("Are you sure you want to update your email?")) {
      document.getElementById("emailForm").submit();
    }
  });

  const pfpButton = document.getElementById("pfpButton");
  pfpButton.addEventListener("click", function(event) {
    event.preventDefault();
    if (confirm("Are you sure you want to update your profile picture?")) {
      document.getElementById("pfpForm").submit();
    }
  });
});
