

document.addEventListener("DOMContentLoaded", () => {
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const fetchButton = document.querySelector(".filters button");

    if (startDateInput && endDateInput) {
        setupDateInputs(startDateInput, endDateInput);
    }

    if (fetchButton) {
        fetchButton.addEventListener("click", handleFetchImages);
    }
});

async function handleFetchImages() {
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const galleryContainer = document.getElementById("gallery");

    const startDate = startDateInput ? startDateInput.value : "";
    const endDate = endDateInput ? endDateInput.value : "";

    if (!startDate || !endDate) {
        alert("Please select both a start and end date.");
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        alert("Start date cannot be after the end date.");
        return;
    }

    galleryContainer.innerHTML = `<p class="loading-message">Loading space photos...</p>`;

    try {
        const url = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&start_date=${startDate}&end_date=${endDate}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayGallery(data);
    } catch (error) {
        console.error("Error fetching APOD data:", error);
        galleryContainer.innerHTML = `<p class="error-msg">Failed to load space photos. Please check your date range and try again.</p>`;
    }
}

function displayGallery(items) {
    const galleryContainer = document.getElementById("gallery");
    if (!galleryContainer) return;

    galleryContainer.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
        galleryContainer.innerHTML = `<p>No data found for this date range.</p>`;
        return;
    }

    items.slice().reverse().forEach((item) => {
        const card = document.createElement("div");
        card.className = "gallery-item";

        card.innerHTML = `
            <img src="${item.hdurl || item.url}" alt="${item.title}" class="gallery-img" />
            <div class="gallery-info">
                <h3>${item.title}</h3>
                <p>${item.date}</p>
            </div>
        `;

        card.addEventListener("click", () => openModal(item));
        galleryContainer.appendChild(card);
    });
}

function openModal(item) {
    const modal = document.getElementById("apod-modal") || createModalElement();

    if (!modal) return;

    modal.querySelector(".modal-img").src = item.hdurl || item.url;
    modal.querySelector(".modal-title").textContent = item.title;
    modal.querySelector(".modal-date").textContent = item.date;
    modal.querySelector(".modal-description").textContent = item.explanation || "No description available.";
    modal.style.display = "flex";
}

function createModalElement() {
    const modalDiv = document.createElement("div");
    modalDiv.id = "apod-modal";
    modalDiv.className = "modal-overlay";
    modalDiv.innerHTML = `
        <div class="modal-content">
            <button class="modal-close-btn" aria-label="Close image">&times;</button>
            <img class="modal-img" src="" alt="" style="width:100%; max-height:50vh; object-fit:contain;" />
            <h2 class="modal-title"></h2>
            <p class="modal-date"></p>
            <p class="modal-description"></p>
        </div>
    `;
    document.body.appendChild(modalDiv);

    modalDiv.addEventListener("click", (event) => {
        if (event.target === modalDiv || event.target.classList.contains("modal-close-btn")) {
            modalDiv.style.display = "none";
        }
    });

    return modalDiv;
}