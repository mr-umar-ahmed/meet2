function trackUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            let userLat = position.coords.latitude;
            let userLng = position.coords.longitude;

            fetch('/get_reminders')
                .then(response => response.json())
                .then(reminders => {
                    reminders.forEach(reminder => {
                        let distance = getDistance(userLat, userLng, reminder.lat, reminder.lng);
                        if (distance < 0.5) { // If within 500 meters
                            alert(`Reminder: ${reminder.task}`);
                        }
                    });
                });
        }, (error) => {
            console.error("Error getting location:", error);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function getDistance(lat1, lon1, lat2, lon2) {
    let R = 6371; // Radius of the Earth in km
    let dLat = (lat2 - lat1) * (Math.PI / 180);
    let dLon = (lon2 - lon1) * (Math.PI / 180);
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

// Call tracking function after map loads
setTimeout(trackUserLocation, 3000);
