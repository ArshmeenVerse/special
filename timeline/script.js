document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    // Change to '2026-02-10' to test 'today' behavior
    const DEBUG_DATE = null;

    const valentineWeek = [
        { date: '2026-02-07', title: 'Rose Day', icon: '🌹', desc: 'Starting with a flower for my Bubu...', theme: 'theme-rose' },
        { date: '2026-02-08', title: 'Propose Day', icon: '💍', desc: 'I have a question...', theme: 'theme-propose' },
        { date: '2026-02-09', title: 'Chocolate Day', icon: '🍫', desc: 'Sweetness for my sweet...', theme: 'theme-chocolate' },
        { date: '2026-02-10', title: 'Teddy Day', icon: '🧸', desc: 'Cuddles and hugs...', theme: 'theme-teddy' },
        { date: '2026-02-11', title: 'Promise Day', icon: '🤞', desc: 'My vows to you...', theme: 'theme-promise' },
        { date: '2026-02-12', title: 'Hug Day', icon: '🤗', desc: 'Hold me tight...', theme: 'theme-hug' },
        { date: '2026-02-13', title: 'Kiss Day', icon: '💋', desc: 'Sealed with love...', theme: 'theme-kiss' },
        { date: '2026-02-14', title: 'Valentine’s Day', icon: '❤️', desc: 'The big day!', theme: 'theme-valentine' }
    ];

    const container = document.getElementById('timeline-container');
    const toast = document.getElementById('toast');

    // --- Date Logic ---
    function getCurrentDate() {
        if (DEBUG_DATE) return new Date(DEBUG_DATE);
        return new Date();
    }

    function getStatus(targetDateStr) {
        const now = getCurrentDate();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const tParts = targetDateStr.split('-');
        const targetDateObj = new Date(tParts[0], tParts[1] - 1, tParts[2]);

        if (today.getTime() === targetDateObj.getTime()) {
            return 'today';
        } else if (today.getTime() > targetDateObj.getTime()) {
            return 'unlocked';
        } else {
            return 'locked';
        }
    }

    function getDaysLeft(targetDateStr) {
        const now = getCurrentDate();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const tParts = targetDateStr.split('-');
        const targetDateObj = new Date(tParts[0], tParts[1] - 1, tParts[2]);

        const diffTime = targetDateObj - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // --- Render ---
    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.3 });

    valentineWeek.forEach((day, index) => {
        const status = getStatus(day.date);
        const section = document.createElement('section');
        section.classList.add('day-section');
        if (day.theme) section.classList.add(day.theme);
        section.dataset.index = index;

        observer.observe(section);

        let contentClass = 'content-wrapper';
        let mainContent = '';
        let lockOverlay = '';

        if (status === 'locked') {
            section.classList.add('locked');
            const daysLeft = getDaysLeft(day.date);

            lockOverlay = `
                <div class="lock-overlay-content">
                    <div class="lock-icon-wrapper">
                        <i class="fas fa-heart"></i>
                        <i class="fas fa-lock small-lock"></i>
                    </div>
                    <h2 class="lock-title">Locked for now...</h2>
                    <p class="lock-subtitle">This surprise is waiting for its special day!</p>
                    
                    <div class="countdown-box">
                        <span class="count-number">${daysLeft}</span>
                        <span class="count-label">Days to Go</span>
                    </div>

                    <p class="unlock-date-hint">Unlocks on ${day.title} (${day.date})</p>
                </div>
            `;
        } else {
            const isToday = status === 'today';
            if (isToday) section.classList.add('today');

            mainContent = `
                <div class="${contentClass}">
                    <div class="day-date">${day.date}</div>
                    <div class="main-icon">${day.icon}</div>
                    <h1 class="day-title">${day.title}</h1>
                    <p class="day-status">${day.desc}</p>
                    <button class="action-btn" onclick="openContent('${day.title}')">
                        ${isToday ? "Enter Today's Love 💖" : "Revisit Memory"}
                    </button>
                </div>
            `;
        }

        section.innerHTML = lockOverlay + mainContent;
        container.appendChild(section);

        if (status === 'locked') {
            section.addEventListener('click', () => {
                showToast(`Patience Bubu! Only ${getDaysLeft(day.date)} more sleeps! 🌙`);
            });
        }
    });

    // --- Auto Scroll to Today ---
    setTimeout(() => {
        const todayEl = document.querySelector('.day-section.today');
        if (todayEl) {
            todayEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 500);

    // --- Global Functions ---
    window.openContent = function (title) {
        if (title === 'Rose Day') {
            window.location.href = '../feb07-roseday/index.html';
        } else if (title === 'Propose Day') {
            window.location.href = '../feb08-proposeday/index.html';
        } else if (title === 'Chocolate Day') {
            window.location.href = '../feb09-chocolateday/index.html';
        } else if (title === 'Teddy Day') {
            window.location.href = '../feb10-teddyday/index.html';
        } else if (title === 'Promise Day') {
            window.location.href = '../feb11-promiseday/index.html';
        } else if (title === 'Hug Day') {
            window.location.href = '../feb12-hugday/index.html';
        } else {
            alert(`Opening content for: ${title} (Next Step: Create these pages!)`);
        }
    };

    function showToast(msg) {
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // --- Mouse Wheel Support ---
    container.addEventListener('wheel', (evt) => {
        if (evt.deltaY !== 0) {
            container.scrollLeft += evt.deltaY;
            evt.preventDefault();
        }
    });
});
