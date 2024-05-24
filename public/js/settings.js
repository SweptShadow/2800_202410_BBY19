

function setTheme(theme) {
  const root = document.documentElement;
  switch (theme) {
    case 'option1':
      root.style.setProperty('--background-color-default', '#f7a54c'); 
      break;
    case 'option2':
      root.style.setProperty('--background-color-default', '#5dc4de'); 
      break;
    case 'option3':
      root.style.setProperty('--background-color-default', '#FFFFFF'); 
      break;
    default:
      root.style.setProperty('--background-color-default', '#87CEEB');
      break;
  }
}
  
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
  