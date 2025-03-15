let map;
let marker;
let userMarker;
let reminders = [];

// Initialize Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 12.9716, lng: 77.5946 }, // Default center (Bangalore)
        zoom: 13,
    });

    // Load saved reminders from the server
    fetchReminders();

    // Add click event to select location for new reminder
    map.addListener("click", function(event) {
        placeMarker(event.latLng);
    });
}

// Place marker when user selects a location
function placeMarker(location) {
    if (marker) {
        marker.setMap(null);
    }
    marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Reminder Location",
    });

    // Store latitude and longitude in hidden fields for form submission
    document.getElementById("latitude").value = location.lat();
    document.getElementById("longitude").value = location.lng();
}

// Fetch and display existing reminders
function fetchReminders() {
    fetch("/get_reminders")
        .then(response => response.json())
        .then(data => {
            reminders = data;
            data.forEach(reminder => {
                addReminderMarker(reminder);
            });
        })
        .catch(error => console.error("Error fetching reminders:", error));
}

// Add reminder markers to the map
function addReminderMarker(reminder) {
    new google.maps.Marker({
        position: { lat: reminder.lat, lng: reminder.lng },
        map: map,
        title: reminder.task,
    });
}

// Track user's live location
function trackUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                let userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Update user marker
                if (userMarker) {
                    userMarker.setPosition(userLocation);
                } else {
                    userMarker = new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#fff",
                        },
                        title: "Your Location",
                    });
                }

                // Check proximity to reminders (could be part of future AI functionality)
                checkProximity(userLocation);
            },
            (error) => {
                console.error("Error getting location:", error);
            },
            { enableHighAccuracy: true }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Check if user is near a reminder location (Future AI feature)
function checkProximity(userLocation) {
    const RADIUS_THRESHOLD = 0.05; // ~50 meters

    reminders.forEach(reminder => {
        let distance = getDistance(userLocation, { lat: reminder.lat, lng: reminder.lng });
        if (distance < RADIUS_THRESHOLD) {
            alert(`Reminder: ${reminder.task}`);
        }
    });
}

// Calculate distance between two coordinates (Haversine formula)
function getDistance(loc1, loc2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
    const dLon = (loc2.lng - loc1.lng) * (Math.PI / 180);

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Run functions when the page loads
window.onload = function() {
    initMap();
    trackUserLocation();
};