
// Coordinates for different buildings (replace with actual coordinates)
const buildingCoordinates = {
    "Admin Block": { lat: 28.664342058750258, lng: 77.23351795120453 },
    "Computer Center": { lat: 28.664037181641103, lng: 77.2331925525165 },
    "ECE/CSE Block": { lat: 28.664400473810506, lng: 77.2324077324539 },
    "IT Block": { lat: 28.663858254600793, lng: 77.23271264257677 },
    "Mechanical Block": { lat: 28.66480585988023, lng: 77.23319461481147 },
    "Auditorium": { lat: 28.665113427711184, lng: 77.232406660203 },
    "Kaveri Hostel": { lat: 28.665610675036543, lng: 77.2325965746482 },
    "Krishna Hostel": { lat: 28.66490546298798, lng: 77.23187338038237 },
    "Academic Branch": { lat: 28.664121592232444, lng: 77.23332736544694 },
};

function updateMap() {
    const searchInput = document.getElementById("search-bar").value.trim();
    const iframe = document.getElementById("map");

    if (buildingCoordinates[searchInput]) {
                const { lat, lng } = buildingCoordinates[searchInput];
                const newSrc = `https://www.google.com/maps/embed/v1/view?key=AIzaSyCELIyu1xbXueo5ckAwqVJNBA-zRa3CSHw&center=${lat},${lng}&zoom=20&maptype=satellite`;
                iframe.src = newSrc;
           
    } else {
        alert("Building not found. Please try another name.");
    }
}


