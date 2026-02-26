// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active class to nav links on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Click to call functionality
function handleCallClick(phoneNumber) {
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
        // Copy to clipboard for Android
        navigator.clipboard.writeText(phoneNumber).then(() => {
            alert('Phone number copied to clipboard: ' + phoneNumber);
        }).catch(() => {
            // Fallback if clipboard API fails
            window.location.href = 'tel:' + phoneNumber;
        });
    } else {
        // Direct call for other devices
        window.location.href = 'tel:' + phoneNumber;
    }
}

// Randomly assign colors to menu cards
document.addEventListener('DOMContentLoaded', function() {
    const menuCards = document.querySelectorAll('.menu-card');
    const colorClasses = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
    
    menuCards.forEach(card => {
        const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];
        card.classList.add(randomColor);
    });
});
