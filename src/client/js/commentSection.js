const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const subscriptButton = document.getElementById("subscriptBtn");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__commentlist ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.innerText = "❌";
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    window.location.reload();
    // const { newCommentId } = await response.json();
    // addComment(text, newCommentId);
  }
};

const handleSubscription = (event) => {
  console.log(event);
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

subscriptButton.addEventListener("click", handleSubscription);
