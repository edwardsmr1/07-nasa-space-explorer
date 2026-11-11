// script.js - NASA Space Explorer App

document.addEventListener("DOMContentLoaded", () => {
    // Find our date picker inputs on the page
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');

    // Call the setupDateInputs function from dateRange.js
    // This sets up the date pickers to:
    // - Default to a range of 9 days (from 9 days ago to today)
    // - Restrict dates to NASA's image archive (starting from 1995)
    setupDateInputs(startInput, endInput);

    // Event listener for the fetch button
    const fetchButton = document.getElementById('fetch-btn'); // Update ID if your button has a different id in HTML
    if (fetchButton) {
        fetchButton.addEventListener('click', handleFetchImages);
    }
});

async function handleFetchImages() {
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    const galleryContainer = document.getElementById('gallery');
    
    const startDate = startInput ? startInput.value : '';
    const endDate = endInput ? endInput.value : '';
    
    if (!startDate || !endDate) {
        alert('Please select both a start and end date.');
        return;
    }
    
    // 1. Show Loading Message before data loads
    galleryContainer.innerHTML = `<p class="loading-message">Loading space photos...</p>`;
    
    try {
        // Fetch data from NASA's APOD API using the selected date range
        const url = `https://api.nasa.gov/planetary/apod?api_key=PRGLKCdNbBQQJcRhTM6wf7TTQwPWTDjBNmcQBptt&start_date=${startDate}&end_date=${endDate}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayGallery(data);
    } catch (error) {
        console.error('Error fetching APOD data:', error);
        galleryContainer.innerHTML = `<p class="error-msg">Failed to load space photos. Please check your date range and try again.</p>`;
    }
}

// 2. Display the Gallery and handle items
function displayGallery(items) {
    const galleryContainer = document.getElementById('gallery');
    galleryContainer.innerHTML = '';
    
    if (!Array.isArray(items) || items.length === 0) {
        galleryContainer.innerHTML = `<p>No data found for this date range.</p>`;
        return;
    }
    
    // Reverse array to show newest dates first
    items.reverse().forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-item';
        
        card.innerHTML = `
            <img src="${item.hdurl || item.url}" alt="${item.title}" class="gallery-img" />
            <div class="gallery-info">
                <h3>${item.title}</h3>
                <p>${item.date}</p>
            </div>
        `;
        
        // 3. Build Modal View trigger on click
        card.addEventListener('click', () => openModal(item));
        galleryContainer.appendChild(card);
    });
}

// Modal View Logic
function openModal(item) {
    const modal = document.getElementById('apod-modal') || createModalElement();
    
    modal.querySelector('.modal-img').src = item.hdurl || item.url;
    modal.querySelector('.modal-title').textContent = item.title;
    modal.querySelector('.modal-date').textContent = item.date;
    modal.querySelector('.modal-description').textContent = item.explanation;
    
    modal.style.display = 'flex';
}

function createModalElement() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'apod-modal';
    modalDiv.className = 'modal-overlay';
    modalDiv.innerHTML = `
        <div class="modal-content">
            <button class="modal-close-btn">&times;</button>
            <img class="modal-img" src="" alt="" style="width:100%; max-height:50vh; object-fit:contain;" />
            <h2 class="modal-title"></h2>
            <p class="modal-date"></p>
            <p class="modal-description"></p>
        </div>
    `;
    document.body.appendChild(modalDiv);
    
    modalDiv.addEventListener('click', (e) => {
        if (e.target === modalDiv || e.target.classList.contains('modal-close-btn')) {
            modalDiv.style.display = 'none';
        }
    });
    return modalDiv;
}