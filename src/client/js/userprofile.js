const subscriptButton = document.getElementById("subscriptBtn");
const seeUserId = document.getElementById("seeUserId");
const myVideo = document.getElementById("myVideo");

if (window.location.pathname === `/users/${myVideo.dataset.id}`) {
  myVideo.style.opacity = 1;
}

const checkIsSubs = () => {
  const { id } = subscriptBtn.dataset;
  if (id === "1") {
    subscriptBtn.style.backgroundColor = "gray";
    subscriptBtn.innerText = "구독중 🔔";
  } else {
    subscriptBtn.style.backgroundColor = "red";
    subscriptBtn.innerText = "구독";
  }
};

const handleSubscription = async () => {
  const { id } = seeUserId.dataset;
  const response = await fetch(`/api/user/${id}/subscript`, {
    method: "POST",
  });

  window.location.reload();
};

if (subscriptButton) {
  checkIsSubs();
  subscriptButton.addEventListener("click", handleSubscription);
}
