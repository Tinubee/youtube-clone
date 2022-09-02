import "regenerator-runtime";
import "../scss/styles.scss";

const home = document.getElementById("home");
const search = document.getElementById("search");
const subscribe = document.getElementById("subscribe");
const picture = document.getElementById("picture");
const likeVideo = document.getElementById("likeVideo");

switch (window.location.pathname) {
  case "/":
    home.style.opacity = 1;
    break;
  case "/search":
    search.style.opacity = 1;
    break;
  case "/subscribe":
    subscribe.style.opacity = 1;
    break;
  case "/picture":
    picture.style.opacity = 1;
    break;
  case "/likevideos":
    likeVideo.style.opacity = 1;
    break;
}
