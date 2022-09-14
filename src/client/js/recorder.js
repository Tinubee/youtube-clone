import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const seeCameraBtn = document.getElementById("seeCamera");
const video = document.getElementById("preview");

const thumbInput = document.getElementById("thumb");
const fileLabel = document.getElementById("file-label");

const videoInput = document.getElementById("video");
const videoLabel = document.getElementById("video-label");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumbnail: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumbnail
  );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbnailFile = ffmpeg.FS("readFile", files.thumbnail);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbnailBlob = new Blob([thumbnailFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbnailBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumbnail);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "다시 녹화하기";
  actionBtn.addEventListener("click", handleStart);
};

const handleStart = () => {
  actionBtn.innerText = "녹화 중지";
  actionBtn.removeEventListener("click", handleStart);

  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
    actionBtn.innerText = "다운로드";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

const init = async () => {
  if (stream) {
    seeCameraBtn.innerText = "카메라 연결";
    window.location.reload();
    return;
  }
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  video.srcObject = stream;
  video.play();
  actionBtn.disabled = false;
  seeCameraBtn.innerText = "카메라 연결 해제";
};
const handleSeeCamera = () => {
  init();
};

function handleInputImage(event) {
  const input = event.target;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImage = document.getElementById("preview-image");
      const imageIcon = fileLabel.querySelector("i");
      imageIcon.classList = "";
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function handleInputVideo(event) {
  const input = event.target;
  if (input.files && input.files[0]) {
    const videoUrl = URL.createObjectURL(input.files[0]);
    const videoPre = document.getElementById("videofile");
    const imageIcon = videoLabel.querySelector("i");
    imageIcon.classList = "";

    videoPre.setAttribute("src", videoUrl);
    videoPre.play();
  }
}

if (actionBtn) {
  actionBtn.addEventListener("click", handleStart);
  actionBtn.disabled = true;
}

if (seeCameraBtn) seeCameraBtn.addEventListener("click", handleSeeCamera);

if (thumbInput) thumbInput.addEventListener("change", handleInputImage);

if (videoInput) videoInput.addEventListener("change", handleInputVideo);
