document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector(".login-form");
  
    loginForm.addEventListener("submit", function(event) {
      const email = document.getElementById("email-phone").value;
      const password = document.getElementById("password").value;
  
      if (email.trim() === "") {
        alert("Email is required.");
        event.preventDefault(); 
        return;
      }
  
      if (password.trim() === "") {
        alert("Password is required.");
        event.preventDefault();
        return;
      }
    });
  });
  