const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const subscriptButton = document.getElementById("subscriptBtn");
const videoOwner = document.getElementById("videoOwner");
const loginUser = document.getElementById("loginUser");
const deleteComment = document.getElementById("deleteComment");
const deleteBtnIcon = deleteComment.querySelector("i");
const videoComment = document.getElementById("videoComment");

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

const handleDeleteComment = async (event) => {
  event.preventDefault();
  const videoId = videoContainer.dataset.id;
  const commentId = videoComment.dataset.id;
  const response = await fetch(
    `/api/videos/${videoId}/deletecomment/${commentId}`,
    {
      method: "POST",
    }
  );
  if (response.status === 201) {
    window.location.reload();
  }
};

const handleDeleteBtnIcon = (event) => {
  event.preventDefault();
  deleteBtnIcon.classList = "fas fa-trash-restore";
};

const handleMouseLeave = (event) => {
  event.preventDefault();
  deleteBtnIcon.classList = "fas fa-trash-alt";
};

const handleSubscription = async () => {
  const { id } = videoOwner.dataset;
  const response = await fetch(`/api/user/${id}/subscript`, {
    method: "POST",
  });

  window.location.reload();
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (videoOwner.dataset.id !== loginUser.dataset.id) {
  subscriptButton.addEventListener("click", handleSubscription);
}

deleteComment.addEventListener("click", handleDeleteComment);
deleteComment.addEventListener("mouseover", handleDeleteBtnIcon);
deleteComment.addEventListener("mouseleave", handleMouseLeave);
