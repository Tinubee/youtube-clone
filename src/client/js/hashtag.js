const hashHome = document.getElementById("hashHome");
const hashWord = document.getElementsByClassName("hashtag");

const init = () => {
  for (let i = 0; i < hashWord.length; i++) {
    if (window.location.href === hashWord[i].href) {
      hashWord[i].style.backgroundColor = "whitesmoke";
    }
  }
  if (window.location.pathname === "/") {
    hashHome.style.backgroundColor = "whitesmoke";
  }
};

init();
