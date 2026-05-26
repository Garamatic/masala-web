// Whitman Spoor Portal - Meldpunt Spoor
// Mobile-first with camera and geolocation support

// Basic input sanitization (strip HTML tags)
function sanitizeInput(input) {
    if (!input) return '';
    return String(input).replace(/<[^>]*>/g, '');
}

const __API_BASE = window.__API_BASE__ || 'http://localhost:5000';
const API_ENDPOINT = `${__API_BASE}/api/portal/submit`;

// Type selection
const optionButtons = document.querySelectorAll('.option-btn');
const interventionTypeInput = document.getElementById('interventionType');

optionButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        optionButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        interventionTypeInput.value = this.dataset.type;
    });
});

// Priority selection
const priorityButtons = document.querySelectorAll('.priority-btn');
const priorityInput = document.getElementById('priority');

priorityButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        priorityButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        priorityInput.value = this.dataset.priority;
    });
});

// Set default priority
if (priorityButtons.length > 0) {
    priorityButtons[0].classList.add('active');
}

// Geolocation
const getLocationBtn = document.getElementById('getLocationBtn');
const locationInput = document.getElementById('location');
const locationStatus = document.getElementById('locationStatus');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');

getLocationBtn.addEventListener('click', function () {
    if (!navigator.geolocation) {
        alert('Geolocatie wordt niet ondersteund door uw browser');
        return;
    }

    locationStatus.textContent = 'Locatie ophalen...';
    locationStatus.classList.add('active');

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            latitudeInput.value = lat;
            longitudeInput.value = lon;

            locationStatus.textContent = '';
            const icon = document.createElement('i');
            icon.className = 'fas fa-check-circle';
            locationStatus.appendChild(icon);
            locationStatus.appendChild(
                document.createTextNode(` Locatie vastgelegd: ${lat.toFixed(6)}, ${lon.toFixed(6)}`)
            );
            locationStatus.style.backgroundColor = '#d4edda';
            locationStatus.style.borderColor = '#28a745';

            // Optionally update location text
            if (!locationInput.value) {
                locationInput.value = `GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            }
        },
        function (error) {
            locationStatus.classList.remove('active');
            locationStatus.textContent = '';
            const icon = document.createElement('i');
            icon.className = 'fas fa-times-circle';
            locationStatus.appendChild(icon);
            locationStatus.appendChild(
                document.createTextNode(` Fout bij ophalen locatie: ${error.message}`)
            );
            locationStatus.style.backgroundColor = '#f8d7da';
            locationStatus.style.borderColor = '#dc3545';
        }
    );
});

// Photo upload
const photoInput = document.getElementById('photo');
const photoLabel = document.getElementById('photoLabel');
const photoPreview = document.getElementById('photoPreview');

photoInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        photoLabel.textContent = '';
        const icon = document.createElement('i');
        icon.className = 'fas fa-check';
        photoLabel.appendChild(icon);
        photoLabel.appendChild(document.createTextNode(` ${file.name}`));

        // Show preview
        const reader = new FileReader();
        reader.onload = function (e) {
            photoPreview.textContent = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Preview';
            photoPreview.appendChild(img);
            photoPreview.classList.add('active');
        };
        reader.readAsDataURL(file);
    }
});

// Form submission
const form = document.getElementById('reportForm');
const loadingOverlay = document.getElementById('loadingOverlay');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validate intervention type
    if (!interventionTypeInput.value) {
        alert('Selecteer een type interventie');
        return;
    }

    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    loadingOverlay.style.display = 'flex';

    try {
        const formData = new FormData();

        formData.append(
            'CustomerName',
            sanitizeInput(document.getElementById('reporterName').value)
        );
        formData.append(
            'CustomerEmail',
            sanitizeInput(document.getElementById('reporterEmail').value)
        );
        formData.append(
            'CustomerPhone',
            sanitizeInput(document.getElementById('reporterPhone').value || '')
        );
        formData.append('Description', sanitizeInput(document.getElementById('description').value));
        formData.append('WorkItemType', interventionTypeInput.value);
        formData.append('PriorityScore', priorityInput.value);

        // Add location
        const location = locationInput.value;
        formData.append('Tags', `Locatie:${sanitizeInput(location)}`);

        if (latitudeInput.value && longitudeInput.value) {
            formData.append('Latitude', latitudeInput.value);
            formData.append('Longitude', longitudeInput.value);
        }

        // Add photo
        const photo = photoInput.files[0];
        if (photo) {
            formData.append('Attachment', photo);
        }

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('submissionResult', JSON.stringify(result));
            window.location.href = 'success.html';
        } else {
            throw new Error(result.message || 'Fout bij verzenden');
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('Er is een fout opgetreden. Probeer het opnieuw.');
        loadingOverlay.style.display = 'none';
    }
});
