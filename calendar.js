async function generateCalendar() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const today = now.getDate();
  
    const datesElement = document.getElementById('dates');
    if (!datesElement) return; // Safety check
    datesElement.innerHTML = ''; // Clear previous dates
  
    for (let day = 1, firstDayOfMonth = new Date(year, month, 1).getDay(); day <= new Date(year, month + 1, 0).getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        
        if (day === today) {
            dayElement.classList.add('today');
        }
    
        // Adjust for first day of the month
        if (day === 1) {
            dayElement.style.gridColumnStart = firstDayOfMonth + 1;
        }
    
        datesElement.appendChild(dayElement);
        
    }
  
    // Set month and year title
    document.querySelector('.month-year').textContent = `${now.toLocaleDateString('default', { month: 'long' })} ${year}`;
}

document.addEventListener('DOMContentLoaded', function() {
    generateCalendar();
});
