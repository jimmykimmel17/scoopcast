console.log("hello")

document.addEventListener('DOMContentLoaded', function() {
    // Function to shuffle array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Array of images and names
    const slotImages = [
        'images/aziz2.png',
        'images/vish.png',
        'images/aman.png',
        'images/aamesh2.png'
    ];
    const people = [
        'Aziz2',
        'Vish',
        'Aman',
        'Aamesh'
    ];
    let selectedPeople = new Set();

    // Get DOM elements
    const slotReel = document.querySelector('.slot-reel');
    const spinButton = document.querySelector('.spin-button');
    
    // Add styles for slot machine
    const style = document.createElement('style');
    style.textContent = `
        .slot-machine {
            position: fixed;
            bottom: 50px;
            left: 100px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.5);
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }
        .slot-container {
            margin-bottom: 20px;
        }
        .slot-window {
            width: 160px;
            height: 160px;
            overflow: hidden;
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.3);
            position: relative;
        }
        .slot-reel {
            position: absolute;
            width: 100%;
            transition: transform 3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        .slot-item {
            width: 160px;
            height: 160px;
            margin: 4px 0;
            background-size: cover;
            background-position: center;
            border-radius: 8px;
        }
        .spin-button {
            width: 80%;
            margin: 0 auto;
            padding: 10px;
            font-size: 16px;
            font-weight: 300;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .spin-button:hover {
            background: #45a049;
        }
        .spin-button:disabled {
            background: #cccccc;
            cursor: not-allowed;
        }
        .notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 18px;
            z-index: 2000;
            animation: fadeInOut 2s ease-in-out;
        }
    `;
    document.head.appendChild(style);

    let isSpinning = false;
    let currentPosition = 0;
    const itemHeight = 168; // 160px height + 8px margin
    const duration = 3000;

    // Initialize slot machine
    function initializeSlotMachine() {
        slotReel.innerHTML = '';
        // Create multiple sets of items for continuous spinning effect
        for (let i = 0; i < 3; i++) {
            slotImages.forEach((image, index) => {
                const item = document.createElement('div');
                item.className = 'slot-item';
                item.style.backgroundImage = `url(${image})`;
                item.dataset.person = people[index];
                slotReel.appendChild(item);
            });
        }
    }

    // Spin function
    function spin() {
        if (isSpinning) return;
        
        const items = document.querySelectorAll('.slot-item');
        if (items.length === 0) return;

        isSpinning = true;
        spinButton.disabled = true;

        // Find available people
        const availablePeople = people.filter(person => !selectedPeople.has(person));
        if (availablePeople.length === 0) {
            selectedPeople.clear();
            availablePeople.push(...people);
        }

        // Calculate random position
        const randomPerson = availablePeople[Math.floor(Math.random() * availablePeople.length)];
        const personIndex = people.indexOf(randomPerson);
        const baseOffset = items.length / 3 * itemHeight;
        const targetPosition = -(baseOffset + (personIndex * itemHeight));

        // Apply animation
        slotReel.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
        slotReel.style.transform = `translateY(${targetPosition}px)`;

        // Reset after animation
        setTimeout(() => {
            isSpinning = false;
            spinButton.disabled = false;
            currentPosition = targetPosition;
            selectedPeople.add(randomPerson);

            // Show selected person notification
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = `Selected: ${randomPerson}`;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 2000);

            // Update display with selected image
            updateDisplay(randomPerson);
        }, duration);
    }

    // Event listeners
    spinButton.addEventListener('click', spin);

    // Initialize
    initializeSlotMachine();
});

// Wheel spinning functionality
const wheel = document.querySelector('.wheel-outer');
let isSpinning = false;
let currentRotation = 0;
let spinSpeed = 0;
let targetRotation = 0;

function getRandomRotation() {
    return Math.floor(Math.random() * 360) + 1440; // At least 4 full rotations
}

function getSelectedName(rotation) {
    const normalizedRotation = rotation % 360;
    const sections = ['aziz', 'vish'];
    const sectionSize = 360 / sections.length;
    const selectedIndex = Math.floor(normalizedRotation / sectionSize);
    return sections[selectedIndex];
}

// Add hover effect to wheel sections
document.querySelectorAll('.wheel-section').forEach(section => {
    section.addEventListener('mouseenter', () => {
        if (!isSpinning) {
            section.style.filter = 'brightness(1.2)';
        }
    });
    
    section.addEventListener('mouseleave', () => {
        section.style.filter = 'brightness(1)';
    });
});

function startSpinning() {
    if (isSpinning) return;
    
    isSpinning = true;
    targetRotation = currentRotation + getRandomRotation();
    spinSpeed = 20; // Initial fast speed
    
    // Animate the wheel
    function animate() {
        if (spinSpeed > 0.1) {
            currentRotation += spinSpeed;
            spinSpeed *= 0.98; // Gradually slow down
            wheel.style.transform = `rotate(${currentRotation}deg)`;
            requestAnimationFrame(animate);
        } else {
            const selectedName = getSelectedName(currentRotation);
            isSpinning = false;
        }
    }
    
    animate();
}

// Start spinning when the page loads
document.addEventListener('DOMContentLoaded', startSpinning);

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        padding: 15px 30px;
        border-radius: 25px;
        color: white;
        font-size: 18px;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
        animation: slideDown 0.5s ease-out;
        z-index: 1001;
    }

    @keyframes slideDown {
        from {
            transform: translate(-50%, -100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

function updateDisplay(selectedImage) {
    const slotReel = document.querySelector('.slot-reel');
    slotReel.style.transform = 'translateY(0)';
    slotReel.innerHTML = `<img src="${selectedImage}" alt="Selected" style="width: 100%; height: 100%; object-fit: contain;">`;
    
    // Show referee popup with the selected name
    const name = selectedImage.split('/').pop().split('.')[0];
    const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace('2', '');
    showRefereePopup(displayName);
}