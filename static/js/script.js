let map;
let marker;

function initMap() {
    // Initialize the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 }, // Default: San Francisco
        zoom: 12,
    });

    // Add a click event listener to place a marker
    map.addListener('click', (event) => {
        placeMarker(event.latLng);
    });
}

function placeMarker(location) {
    // Remove existing marker
    if (marker) {
        marker.setMap(null);
    }

    // Add a new marker
    marker = new google.maps.Marker({
        position: location,
        map: map,
    });

    // Update hidden fields in the form
    document.getElementById('latitude').value = location.lat();
    document.getElementById('longitude').value = location.lng();
}

// Handle form submission
document.getElementById('reminder-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const task = document.getElementById('task').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;

    fetch('/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `task=${encodeURIComponent(task)}&latitude=${latitude}&longitude=${longitude}`,
    }).then(() => {
        window.location.reload();
    });
});

// Initialize the map when the page loads
window.onload = initMap;