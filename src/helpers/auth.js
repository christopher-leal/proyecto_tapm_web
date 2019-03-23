const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error_msg", "No has iniciado sesion!");
  res.redirect("/admin/signin");
};

helpers.clienteAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error_msg", "No has iniciado sesion!");
  res.redirect("/cliente/signin");
};

module.exports = helpers;
