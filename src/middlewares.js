export const localsMiddleware = (req, res, next) => {
  res.locals.isLoggedIn = Boolean(req.session.loggedIn);
  res.locals.user = req.session.user;
  console.log(res.locals);
  next();
};
