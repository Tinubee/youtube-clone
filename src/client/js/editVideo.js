const imageInput = document.getElementById("thumb");
const thumbLabel = document.getElementById("thumb-label");

function handleInputImage(event) {
  const input = event.target;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImage = document.getElementById("preview-image");
      const imageIcon = thumbLabel.querySelector("i");
      const imageUrl = URL.createObjectURL(input.files[0]);
      imageIcon.classList = "";
      previewImage.style.backgroundImage = `url(${imageUrl})`;
      previewImage.style.backgroundSize = "cover";
      previewImage.style.backgroundPosition = "center";
    };
    reader.readAsDataURL(input.files[0]);
  }
}

if (imageInput) imageInput.addEventListener("change", handleInputImage);
