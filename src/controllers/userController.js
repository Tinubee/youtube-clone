import User from "../models/User";
import fetch from "cross-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};
export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errMessage: "Passwords do not match",
    });
  }
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errMessage: "Username or email already exists",
    });
  }
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (err) {
    return res.status(400).render("join", {
      pageTitle: "Join Error",
      errMessage: err._message,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errMessage: "Username does not exist",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).render("login", {
      pageTitle,
      errMessage: "Password is incorrect",
    });
  }

  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startKakaoLogin = (req, res) => {
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code`;

  return res.redirect(KAKAO_AUTH_URL);
};

export const finishKakaoLogin = async (req, res) => {
  const baseURL = "https://kauth.kakao.com/oauth/token";
  const config = {
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_REST_API,
    redirect_uri: process.env.REDIRECT_URI,
    code: req.query.code,
    client_secret: process.env.KAKAO_CLIENT_SECRET,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseURL}?${params}`;

  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = `https://kapi.kakao.com/v2/user/me`;
    const userData = await (
      await fetch(`${apiUrl}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();

    const {
      kakao_account: {
        email,
        profile: { profile_image_url, nickname },
      },
    } = userData;

    let user = await User.findOne({ email: email });
    if (!user) {
      user = await User.create({
        avatarUrl: profile_image_url,
        name: nickname,
        username: nickname,
        email: email,
        password: "",
        socialOnly: true,
        location: "",
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseURL = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseURL}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = `https://api.github.com`;
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  if (
    req.session.user.username !== username ||
    req.session.user.email !== email
  ) {
    const exists = await User.exists({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errMessage: "Username or email already exists",
      });
    }
  }
  const isHeroku = process.env.NODE_ENV === "production";
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly) {
    req.flash("error", "You can't change your password");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, confirmPassword },
  } = req;
  const user = await User.findByIdAndUpdate(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errMessage: "Passwords do not match",
    });
  }

  user.password = newPassword;
  await user.save();
  req.flash("info", "Password Changed");
  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  let { user } = req.session;
  const { id } = req.params;
  let isSubsLength = 0;
  if (id === "undefined") {
    return res.redirect("/login");
  }

  const seeuser = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });

  if (!seeuser) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }
  if (user) {
    const findUser = await User.findById(user._id).populate("subsript");
    const isSubs = findUser.subsript.filter(
      (e) => e.username === seeuser.username
    );
    isSubsLength = isSubs.length;
  } else {
    user = [];
  }

  return res.render("users/profile", {
    pageTitle: "User Profile",
    user,
    seeuser,
    isSubsLength,
  });
};
