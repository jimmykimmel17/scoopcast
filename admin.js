document.addEventListener('DOMContentLoaded', function() {
    // Initialize sections with their frame limits
    const sectionLimits = {
        'frame': 15,
        'actor': 6,
        'eyes': 10,
        'curves': 15
    };
    
    const sections = Object.keys(sectionLimits);
    
    // Setup file input listeners for each section
    sections.forEach(section => {
        const fileInput = document.getElementById(`${section}-upload`);
        const previewContainer = document.getElementById(`${section}-preview`);
        const selected = document.getElementById(`${section}-selected`);
        
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            const currentImages = JSON.parse(localStorage.getItem(`${section}Images`) || '[]');
            const remainingSlots = sectionLimits[section] - currentImages.length;
            
            if (files.length > remainingSlots) {
                alert(`You can only select ${remainingSlots} more image(s) for this section.`);
                fileInput.value = '';
                return;
            }

            // Clear previous previews
            previewContainer.innerHTML = '';
            selected.textContent = `Selected: ${files.length} image(s)`;

            files.forEach((file, index) => {
                const reader = new FileReader();
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                reader.onload = function(e) {
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                        <button class="remove-btn" onclick="removePreview(this, '${section}', ${index})">×</button>
                    `;
                    previewContainer.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            });
        });

        // Add frame counter for each section
        const container = fileInput.closest('.upload-container');
        const frameCount = document.createElement('div');
        frameCount.className = 'frame-count';
        frameCount.style.marginTop = '10px';
        frameCount.style.color = '#4CAF50';
        updateFrameCount(section, frameCount);
        container.appendChild(frameCount);
    });

    // Frame viewer elements
    const frameImage = document.getElementById('frame-image');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    const frameCounter = document.querySelector('.frame-counter');
    const adminLoginButton = document.querySelector('.admin-login-button');
    const deleteAllButton = document.querySelector('.delete-all-button');
    const modal = document.getElementById('admin-modal');
    const adminForm = document.getElementById('admin-login-form');
    const closeModalButton = document.querySelector('.close-modal');

    // Frame management
    let currentFrame = 1;
    const totalFrames = 15;
    let frames = [];

    // Admin credentials
    const ADMIN_USERNAME = 'kaustubh';
    const ADMIN_PASSWORD = 'kaustubh#6379';

    // Load frames from localStorage or initialize with placeholder
    function loadFrames() {
        try {
            const savedFrames = localStorage.getItem('frameViewerFrames');
            if (savedFrames) {
                frames = JSON.parse(savedFrames);
                // Verify the frames array length
                if (frames.length !== totalFrames) {
                    frames = Array(totalFrames).fill('images/placeholder.svg');
                }
            } else {
                frames = Array(totalFrames).fill('images/placeholder.svg');
            }
        } catch (e) {
            console.error('Error loading frames:', e);
            frames = Array(totalFrames).fill('images/placeholder.svg');
        }
        updateFrame(); // Update display after loading
    }

    // Save frames to localStorage
    function saveFrames() {
        try {
            localStorage.setItem('frameViewerFrames', JSON.stringify(frames));
        } catch (e) {
            console.error('Error saving frames:', e);
            alert('Error saving frames. Please try again.');
        }
    }

    // Update frame display
    function updateFrame() {
        if (!frames[currentFrame - 1] || frames[currentFrame - 1] === 'undefined') {
            frames[currentFrame - 1] = 'images/placeholder.svg';
        }
        frameImage.src = frames[currentFrame - 1];
        if (frameCounter) {
            frameCounter.textContent = `Frame ${currentFrame} of ${totalFrames}`;
        }
        if (prevButton) {
            prevButton.disabled = currentFrame === 1;
        }
        if (nextButton) {
            nextButton.disabled = currentFrame === totalFrames;
        }

        // Add fade effect
        frameImage.style.opacity = '0';
        setTimeout(() => {
            frameImage.style.opacity = '1';
        }, 50);
    }

    // Delete all images function
    function deleteAllImages() {
        if (confirm('Are you sure you want to delete all images? This cannot be undone.')) {
            frames = Array(totalFrames).fill('images/placeholder.svg');
            saveFrames();
            currentFrame = 1;
            updateFrame();
            alert('All images have been deleted.');
        }
    }

    // Navigation handlers
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentFrame > 1) {
                currentFrame--;
                updateFrame();
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentFrame < totalFrames) {
                currentFrame++;
                updateFrame();
            }
        });
    }

    // Delete all button handler
    if (deleteAllButton) {
        deleteAllButton.addEventListener('click', () => {
            // Check if user is logged in as admin first
            const username = prompt('Enter admin username:');
            const password = prompt('Enter admin password:');
            
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                deleteAllImages();
            } else {
                alert('Invalid credentials. You must be an admin to delete all images.');
            }
        });
    }

    // Admin modal handlers (only on frame-viewer.html)
    if (adminLoginButton && modal) {
        adminLoginButton.addEventListener('click', () => {
            modal.classList.add('active');
        });

        closeModalButton.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Admin login handler
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                modal.classList.remove('active');
                showAdminPanel();
            } else {
                alert('Invalid credentials');
            }
        });
    }

    // Admin panel
    function showAdminPanel() {
        const adminPanel = document.createElement('div');
        adminPanel.className = 'admin-panel modal active';
        adminPanel.innerHTML = `
            <div class="modal-content">
                <h2>Admin Panel</h2>
                <div class="admin-controls">
                    <div class="form-group">
                        <label>Current Frame: ${currentFrame}</label>
                        <input type="file" accept="image/*" id="frame-upload">
                    </div>
                    <button id="save-frame">Save Frame</button>
                    <button class="close-modal">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(adminPanel);

        // Admin panel handlers
        const frameUpload = adminPanel.querySelector('#frame-upload');
        const saveButton = adminPanel.querySelector('#save-frame');
        const closeButton = adminPanel.querySelector('.close-modal');

        // Close panel when clicking outside
        adminPanel.addEventListener('click', (e) => {
            if (e.target === adminPanel) {
                adminPanel.remove();
            }
        });

        saveButton.addEventListener('click', () => {
            const file = frameUpload.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    frames[currentFrame - 1] = e.target.result;
                    saveFrames();
                    updateFrame();
                    adminPanel.remove();
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select an image first');
            }
        });

        closeButton.addEventListener('click', () => {
            adminPanel.remove();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentFrame > 1) {
            currentFrame--;
            updateFrame();
        } else if (e.key === 'ArrowRight' && currentFrame < totalFrames) {
            currentFrame++;
            updateFrame();
        }
    });

    // Initialize frames
    loadFrames();
});

// Function to remove preview
window.removePreview = function(button, section, index) {
    const fileInput = document.getElementById(`${section}-upload`);
    const previewContainer = document.getElementById(`${section}-preview`);
    const selected = document.getElementById(`${section}-selected`);
    
    // Remove the preview item
    button.closest('.preview-item').remove();
    
    // Create new FileList without the removed file
    const dt = new DataTransfer();
    const files = Array.from(fileInput.files);
    files.splice(index, 1);
    files.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
    
    // Update selected count
    selected.textContent = `Selected: ${files.length} image(s)`;
};

// Function to update frame count display
function updateFrameCount(section, element) {
    const sectionLimits = {
        'frame': 15,
        'actor': 6,
        'eyes': 10,
        'curves': 15
    };
    
    const images = JSON.parse(localStorage.getItem(`${section}Images`) || '[]');
    const remaining = sectionLimits[section] - images.length;
    element.textContent = `Frames: ${images.length}/${sectionLimits[section]} (${remaining} remaining)`;
    element.style.color = remaining > 0 ? '#4CAF50' : '#f44336';
}

// Function to compress image
function compressImage(base64String) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate new dimensions (maintaining aspect ratio)
            let width = img.width;
            let height = img.height;
            const maxDimension = 800; // Max width or height

            if (width > height && width > maxDimension) {
                height = (height * maxDimension) / width;
                width = maxDimension;
            } else if (height > maxDimension) {
                width = (width * maxDimension) / height;
                height = maxDimension;
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get compressed image as base64 string
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 0.7 is the quality (0 to 1)
            resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = base64String;
    });
}

// Save image function for each section
function saveImage(section) {
    const sectionLimits = {
        'frame': 15,
        'actor': 6,
        'eyes': 10,
        'curves': 15
    };

    const fileInput = document.getElementById(`${section}-upload`);
    const files = Array.from(fileInput.files);
    
    if (files.length === 0) {
        alert('Please select at least one image!');
        return;
    }

    // Check current number of images
    const currentImages = JSON.parse(localStorage.getItem(`${section}Images`) || '[]');
    if (currentImages.length + files.length > sectionLimits[section]) {
        alert(`Maximum number of frames (${sectionLimits[section]}) would be exceeded!`);
        return;
    }

    let savedCount = 0;
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Get existing images for this section
            let sectionImages = JSON.parse(localStorage.getItem(`${section}Images`) || '[]');
            
            // Add new image
            sectionImages.push(e.target.result);
            
            // Save back to localStorage
            localStorage.setItem(`${section}Images`, JSON.stringify(sectionImages));
            
            savedCount++;
            
            // If all files are saved, clear the input and preview
            if (savedCount === files.length) {
                fileInput.value = '';
                document.getElementById(`${section}-preview`).innerHTML = '';
                document.getElementById(`${section}-selected`).textContent = '';
                
                // Update frame count
                const container = fileInput.closest('.upload-container');
                const frameCount = container.querySelector('.frame-count');
                updateFrameCount(section, frameCount);
            }
        };
        reader.readAsDataURL(file);
    });
}

// Function to delete all images from a section
function deleteAllImages(section) {
    if (confirm(`Are you sure you want to delete all images from ${section}?`)) {
        localStorage.removeItem(`${section}Images`);
        localStorage.removeItem(`${section}Viewed`);
        
        // Clear preview
        document.getElementById(`${section}-preview`).innerHTML = '';
        document.getElementById(`${section}-selected`).textContent = '';
        document.getElementById(`${section}-upload`).value = '';
        
        // Update frame count
        const container = document.getElementById(`${section}-upload`).closest('.upload-container');
        const frameCount = container.querySelector('.frame-count');
        updateFrameCount(section, frameCount);
    }
}

// Function to check credentials
function checkCredentials(username, password) {
    return username === 'kaustubh' && password === 'kaustubh#6379';
} 