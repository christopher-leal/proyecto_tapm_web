const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const Usuario = require("../models/usuario");
const Cliente = require("../models/cliente");

passport.use(
  "adminSignin",
  new LocalStrategy(
    {
      usernameField: "email"
    },
    async (email, password, done) => {
      const usuario = await Usuario.findOne({ email: email });
      if (!usuario) {
        return done(null, false, { message: "Usuario no encontrado" });
      } else {
        const match = await bcrypt.compareSync(password, usuario.password);
        if (match) {
          return done(null, usuario);
        } else {
          return done(null, false, {
            message: "email o contraseña incorrectos"
          });
        }
      }
    }
  )
);
passport.use(
  "clienteSignin",
  new LocalStrategy(
    {
      usernameField: "numTarjeta",
      passwordField: "pin"
    },
    async (numTarjeta, pin, done) => {
      const cliente = await Cliente.findOne({ numTarjeta: numTarjeta });
      if (!cliente) {
        return done(null, false, { message: "Cliente no encontrado" });
      } else {
        if (pin == cliente.pin) {
          return done(null, cliente);
        } else {
          return done(null, false, {
            message: "Pin incorrecto"
          });
        }
      }
    }
  )
);

passport.serializeUser((usuario, done) => {
  done(null, usuario.id);
});
passport.deserializeUser(async (id, done) => {
  Usuario.findById(id, (err, usuarioDB) => {
    if (usuarioDB) {
      done(err, usuarioDB);
    } else {
      Cliente.findById(id, (err, clienteDB) => {
        done(err, clienteDB);
      });
    }
  });
});
