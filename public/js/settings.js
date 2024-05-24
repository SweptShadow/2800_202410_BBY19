function setTheme(theme) {
  const root = document.documentElement;
  switch (theme) {
    case 'option1':
      root.style.setProperty('--background-color-default', '#f7a54c'); 
      localStorage.setItem('theme', 'option1');
      break;
    case 'option2':
      root.style.setProperty('--background-color-default', '#9370DB'); 
      localStorage.setItem('theme', 'option2');
      break;
    case 'option3':
      root.style.setProperty('--background-color-default', '#98FB98'); 
      localStorage.setItem('theme', 'option3');
      break;
    default:
      root.style.setProperty('--background-color-default', '#87CEEB');
      localStorage.setItem('theme', 'default');
      break;
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
  const savedTheme = localStorage.getItem('theme') || 'default';
  setTheme(savedTheme);
});
  
  // Toggle the settings modal
  document.getElementById('settings-btn').onclick = function(event) {
    event.stopPropagation(); 
    const modal = document.getElementById('settings-modal');
    if (modal.classList.contains('open')) {
      modal.classList.remove('open');
      modal.classList.add('closed');
    } else {
      modal.classList.remove('closed');
      modal.classList.add('open');
    }
  };
  
  // Close the modal if clicked outside
  window.onclick = function(event) {
    const modal = document.getElementById('settings-modal');
    if (event.target !== document.getElementById('settings-btn') && event.target.parentNode !== document.getElementById('settings-btn') && !modal.contains(event.target)) {
      modal.classList.remove('open');
      modal.classList.add('closed');
    }
  };
  