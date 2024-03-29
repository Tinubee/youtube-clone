const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn?.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn?.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn?.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const videoLike = document.getElementById("videoLike");

const likeIcon = document.getElementById("videoLike");
const unlikeIcon = document.getElementById("videoUnLike");
const shareIcon = document.getElementById("videoShare");
const subscriptBtn = document.getElementById("subscriptBtn");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
// video.volume = volumeValue;

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

const checkIsLike = () => {
  const { id } = videoLike?.dataset;

  if (id === "1") {
    likeIcon.style.color = "#3ea6ff";
  } else {
    likeIcon.style.color = "white";
  }
};

const handlePlayClick = (e) => {
  const { id } = videoContainer.dataset;
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

const handleMuteClick = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) => {
  return new Date(seconds * 1000).toISOString().substring(11, 19);
};

const handleLoadedMetadata = () => {
  if (!isNaN(video.duration)) {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
  }
  video.volume = volumeValue;
  checkIsLike();
};

const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
    video.style.height = "500px";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
    video.style.height = "100%";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};

const handleEnded = () => {
  playBtnIcon.classList = "fas fa-redo-alt";
};

const handleLikeVideo = async () => {
  const { id } = videoContainer.dataset;
  await fetch(`/api/videos/${id}/like`, {
    method: "POST",
  });
  window.location.reload();
};
const handleUnLikeVideo = () => {
  console.log("unlike");
};
const handleShareVideo = () => {
  console.log("share");
};

playBtn?.addEventListener("click", handlePlayClick);
muteBtn?.addEventListener("click", handleMuteClick);
volumeRange?.addEventListener("input", handleVolumeChange);
video?.addEventListener("canplay", handleLoadedMetadata);
// handleLoadedMetadata();
video?.addEventListener("timeupdate", handleTimeUpdate);
video?.addEventListener("ended", handleEnded);
videoContainer?.addEventListener("mousemove", handleMouseMove);
videoContainer?.addEventListener("mouseleave", handleMouseLeave);
timeline?.addEventListener("input", handleTimelineChange);
fullScreenBtn?.addEventListener("click", handleFullscreen);

likeIcon?.addEventListener("click", handleLikeVideo);
unlikeIcon?.addEventListener("click", handleUnLikeVideo);
shareIcon?.addEventListener("click", handleShareVideo);

if (subscriptBtn) checkIsSubs();
