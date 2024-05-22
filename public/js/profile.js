
document.addEventListener("DOMContentLoaded", function() {
    const bioTextarea = document.getElementById("bioTextarea");
    const updateBioButton = document.getElementById("updateBioButton");
  
    bioTextarea.addEventListener("click", function() {
      updateBioButton.style.display = "inline-block";
    });
  });
