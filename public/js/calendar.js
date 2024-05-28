document.addEventListener('DOMContentLoaded', function() {
    let currentMonthOffset = 0;

    async function generateCalendar(monthOffset = 0) {
        const now = new Date();
        const month = now.getMonth() + monthOffset;
        const year = now.getFullYear();
        const today = now.getDate();

        const datesElement = document.getElementById('dates');
        if (!datesElement) return;
        datesElement.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyElement = document.createElement('div');
            datesElement.appendChild(emptyElement);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            
            if (day === today && month === now.getMonth()) {
                dayElement.classList.add('today');
            }

            dayElement.addEventListener('click', () => {
                document.getElementById('event-date').value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                document.getElementById('event-modal').style.display = 'block';
            });

            datesElement.appendChild(dayElement);
        }

        document.querySelector('.month-year').textContent = `${new Date(year, month).toLocaleDateString('default', { month: 'long' })} ${year}`;
    }

    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonthOffset--;
        generateCalendar(currentMonthOffset);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentMonthOffset++;
        generateCalendar(currentMonthOffset);
    });

    document.getElementById('event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const participants = data.participants.split(',').map(participant => participant.trim());

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: data.date, game: data.game, participants })
            });

            if (response.ok) {
                alert('Event created successfully!');
                document.getElementById('event-modal').style.display = 'none';
                generateCalendar(currentMonthOffset);
            } else {
                const error = await response.json();
                alert('Error creating event: ' + error.message);
            }
        } catch (error) {
            alert('Error creating event: ' + error.message);
        }
    });

    generateCalendar(currentMonthOffset);
});
