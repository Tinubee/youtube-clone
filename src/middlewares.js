export const localsMiddleware = (req, res, next) => {
  res.locals.isLoggedIn = Boolean(req.session.loggedIn);
  res.locals.user = req.session.user || {};
  console.log(res.locals);
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
};
