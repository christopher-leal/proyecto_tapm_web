require("./keys");
const express = require("express");
const app = express();
const exhbs = require("express-handlebars");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");

/**
 * Settings
 */
//configuramos el puerto
require("./passport/passport");
app.set("port", process.env.PORT || 3000);
//configuracion de handlebars
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exhbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs"
  })
);
app.set("view engine", ".hbs");
//configuracion de body-parser
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

//confiuracion de passport
app.use(
  session({
    secret: "tapmProyecto",
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

//configuracion de flash
app.use(flash());

//variable global
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;

  next();
});

//arvhicos publicos
app.use(express.static(path.join(__dirname, "public")));
//routes
app.use(require("./routes/admin"));
app.use(require("./routes/cliente"));

//iniciando la base de datos
mongoose.connect(
  process.env.URLDB,
  {
    useNewUrlParser: true,
    useCreateIndex: true
  },
  (err, res) => {
    if (err) throw err;
    console.log("Base de datos online");
  }
);
//empezando el servidor
app.listen(app.get("port"), () => {
  console.log("Servidor corriendo en el puerto", app.get("port"));
});
