const socket = io();

console.log("Socket.IO client initialized, ID:", socket.id); // Log client socket ID

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Sending location from ${socket.id}:`, { latitude, longitude });
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

const map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    console.log(`Received location for ${id}:`, { latitude, longitude });

    const customIcon = L.icon({
        iconUrl: "/images/marker-icon.png",
        iconRetinaUrl: "/images/marker-icon-2x.png",
        shadowUrl: "/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
        if (Object.keys(markers).length === 1) {
            map.setView([latitude, longitude], 16);
        }
    }

    const bounds = Object.values(markers).map(marker => marker.getLatLng());
    if (bounds.length > 1) {
        map.fitBounds(bounds);
    }
});

socket.on("user-disconnected", (id) => {
    console.log(`User disconnected: ${id}`);
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});