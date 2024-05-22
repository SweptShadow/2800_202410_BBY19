async function generateCalendar() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const today = now.getDate();
  
    const datesElement = document.getElementById('dates');
    if (!datesElement) return; // Safety check
    datesElement.innerHTML = ''; // Clear previous dates
  
    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1).getDay();
  
    // Calculate the number of days in the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
  
    // Create empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyElement = document.createElement('div');
        datesElement.appendChild(emptyElement);
    }
  
    // Create day elements for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        
        if (day === today) {
            dayElement.classList.add('today');
        }
    
        datesElement.appendChild(dayElement);
    }
  
    // Set month and year title
    document.querySelector('.month-year').textContent = `${now.toLocaleDateString('default', { month: 'long' })} ${year}`;
}

document.addEventListener('DOMContentLoaded', function() {
    generateCalendar();
});
