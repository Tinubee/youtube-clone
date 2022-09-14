const API_KEY = "cda1454b585bcb33d89d7c4cc9d0f41f";
const WEATHER_API = "https://api.openweathermap.org/data/2.5/weather?";

const location = document.getElementById("location");
const imageInput = document.getElementById("avatar");
const fileLabel = document.getElementById("file-label");

function getLocation(coords) {
  fetch(
    `${WEATHER_API}lat=${coords.lat}&lon=${coords.lng}&appid=${API_KEY}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      const name = data.name;
      location.value = name;
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

function handleInputImage(event) {
  const input = event.target;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImage = document.getElementById("preview-image");
      const imageIcon = fileLabel.querySelector("i");
      imageIcon.classList = "";
      previewImage.style.width = "150px";
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

init();

if (imageInput) imageInput.addEventListener("change", handleInputImage);
