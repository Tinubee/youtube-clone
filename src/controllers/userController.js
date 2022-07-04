import User from "../models/User";

export const getJoin = (req, res) => res.render("join", { pageTitle: "join" });
export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: "join",
      errMessage: "Passwords do not match",
    });
  }
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "join",
      errMessage: "Username or email already exists",
    });
  }
  await User.create({
    name,
    email,
    username,
    password,
    location,
  });
  return res.redirect("/login");
};
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const login = (req, res) => res.send("Login User");
export const logout = (req, res) => res.send("Logout User");
export const see = (req, res) => res.send("See User");
