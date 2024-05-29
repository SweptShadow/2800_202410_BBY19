document.addEventListener("DOMContentLoaded", function () {
  console.log("loaded root.js");
    const tutorialContent = [
      `<h2>Welcome to Golden Gaming</h2><p>This is the first page of your tutorial.</p>`,
      `<h2>Feature 1</h2><p>Details about feature 1.</p>`,
      `<h2>Feature 2</h2><p>Details about feature 2.</p>`,
      `<h2>Feature 3</h2><p>Details about feature 3.</p>`,
      `<h2>Get Started</h2><p>Let's get started with Golden Gaming!</p>`
    ];
  
    let currentPage = 0;
  
    const tutorialBody = document.getElementById("tutorialBody");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
  
    function updateModalContent() {
      tutorialBody.innerHTML = tutorialContent[currentPage];
      prevButton.style.display = currentPage === 0 ? "none" : "inline-block";
      nextButton.textContent = currentPage === tutorialContent.length - 1 ? "Finish" : "Next";
    }
  
    prevButton.addEventListener("click", function () {
      if (currentPage > 0) {
        currentPage--;
        updateModalContent();
      }
    });
  
    nextButton.addEventListener("click", function () {
      if (currentPage < tutorialContent.length - 1) {
        currentPage++;
        updateModalContent();
      } else {
        $('#tutorialModal').modal('hide');  // Use jQuery to close the modal if you are using Bootstrap
      }
    });
  
    document.getElementById("tutorialButton").addEventListener("click", function () {
      currentPage = 0;
      updateModalContent();
    });
  
    updateModalContent();  // Initialize modal with the first page content
  });