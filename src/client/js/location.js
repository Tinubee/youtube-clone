const API_KEY = "cda1454b585bcb33d89d7c4cc9d0f41f";
const WEATHER_API = "https://api.openweathermap.org/data/2.5/weather?";

const location = document.getElementById("location");

function getLocation(coords) {
  fetch(
    `${WEATHER_API}lat=${coords.lat}&lon=${coords.lng}&appid=${API_KEY}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      const name = data.name;
      location.value = `${name}`;
    });
}

function handleGeoSuccess(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const coords = {
    lat,
    lng,
  };
  getLocation(coords);
}

function loadLocation() {
  navigator.geolocation.getCurrentPosition(handleGeoSuccess);
}

function init() {
  loadLocation();
}

init();
