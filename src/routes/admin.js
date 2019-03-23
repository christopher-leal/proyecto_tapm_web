const express = require("express");
const router = express.Router();
const passport = require("passport");
const Cliente = require("../models/cliente");
const Usuario = require("../models/usuario");
const qrcode = require("qrcode");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const { isAuthenticated } = require("../helpers/auth");

//configuracion de multer
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads/docs"),
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  dest: path.join(__dirname, "uploads/docs"),
  fileFilter: (req, files, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf/;
    const mimetype = fileTypes.test(files.mimetype);
    const extname = fileTypes.test(path.extname(files.originalname));

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: Archivo con formato invalido");
  }
}).fields([
  {
    name: "ineFront"
  },
  {
    name: "ineTras"
  },
  {
    name: "compDom"
  }
]);

router.get("/", (req, res) => {
  res.render("index");
});
router.get("/admin/signin", (req, res) => {
  res.render("admin/signin");
});
router.post(
  "/admin/signin",
  passport.authenticate("adminSignin", {
    successRedirect: "/admin/panelAdmin",
    failureRedirect: "/admin/signin",
    failureFlash: true
  })
);
router.get("/signup", (req, res) => {
  res.render("admin/signup");
});

router.post("/signup", function(req, res) {
  let { nombre, email, password } = req.body;
  let usuario = new Usuario({
    nombre,
    email,
    password: bcrypt.hashSync(password, 10)
  });
  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.render("admin/signup", {
        error_msg: err
      });
    }

    res.redirect("/signin");
  });
});

router.get("/admin/panelAdmin", isAuthenticated, (req, res) => {
  res.render("admin/panelAdmin");
});

router.get("/admin/registrarCliente", isAuthenticated, (req, res) => {
  res.render("admin/registrarCliente");
});
router.post(
  "/admin/registrarCliente",
  [upload, isAuthenticated],
  (req, res) => {
    let ineFront = req.files.ineFront;
    let ineTras = req.files.ineTras;
    let compDom = req.files.compDom;
    let nomInefront, nomInetras, nomCompdom;
    ineFront.forEach(info => {
      nomInefront = info.filename;
    });
    ineTras.forEach(info => {
      nomInetras = info.filename;
    });
    compDom.forEach(info => {
      nomCompdom = info.filename;
    });
    // return console.log(req.files.ineFront.destination);
    let body = req.body;

    if (body.ocupacion === "default") {
      return res.render("admin/registrarCliente", {
        err: "Debes seleccionar una ocupacion",
        body
      });
    }
    let iniTarjeta = "1010";
    let aleatorio = Math.round(
      Math.random() * (999999999999 - 100000000000) + 100000000000
    );
    let numTarjeta = `${iniTarjeta}${aleatorio}`;
    let pin = Math.round(Math.random() * (9999 - 1000) + 1000);
    let codVerif = Math.round(Math.random() * (9999 - 1000) + 1000);

    let lineaDebito = parseInt(body.lineaDebito);
    let tipoCliente;
    if (lineaDebito > 0) {
      if (lineaDebito >= 1000 && lineaDebito < 5000) {
        tipoCliente = "Ahorrador";
      } else if (lineaDebito >= 5000 && lineaDebito < 15000) {
        tipoCliente = "Premiun";
      } else if (lineaDebito >= 15000) {
        tipoCliente = "Platino";
      } else {
        return res.render("admin/registrarCliente", {
          err: "Debes ingresar un monto valido minimo de 7000",
          body
        });
      }
    } else {
      return res.render("admin/registrarCliente", {
        err: "Debes ingresar un monto valido minimo de 7000",
        body
      });
    }
    qrcode.toDataURL(numTarjeta, (err, url) => {
      let cliente = new Cliente({
        nombre: body.nombre,
        apellidoP: body.apellidoP,
        apellidoM: body.apellidoM,
        email: body.email,
        numCasa: body.numCasa,
        calle: body.calle,
        colonia: body.colonia,
        cp: body.cp,
        fechaNac: body.fechaNac,
        codIne: body.codIne,
        ocupacion: body.ocupacion,
        numTarjeta,
        lineaDebito,
        tipoCliente,
        qrTarjeta: url,
        codVerif,
        pin: pin,
        ineFront: nomInefront,
        ineTras: nomInetras,
        compDom: nomCompdom
      });
      cliente.save((err, clienteDB) => {
        if (err) {
          return res.render("admin/registrarCliente", {
            err
          });
        }
        if (!clienteDB) {
          return res.render("admin/registrarCliente", {
            err
          });
        }
        req.flash("success_msg", "Cliente registrado correctamente");
        res.redirect(`/admin/clientes`);
      });
    });
  }
);
router.get("/admin/verificacion/:id", isAuthenticated, (req, res) => {
  let id = req.params.id;
  Cliente.findById(id, (err, clienteDB) => {
    if (err) {
      return res.render("admin/verificarCodigo", {
        err: {
          message: "Error: No se ha encontrado ningun cliente con ese ID"
        }
      });
    }
    res.render("admin/verificarCodigo", {
      cliente: clienteDB
    });
  });
});
router.post("/admin/verificacion/:id", isAuthenticated, (req, res) => {
  let id = req.params.id;
  let cod = parseInt(req.body.codigo);
  Cliente.findByIdAndUpdate(id, { status: true }, (err, clienteDB) => {
    if (err) {
      return res.render("admin/verificarCodigo", {
        err: {
          message: "Error: No se ha encontrado ningun cliente con ese ID"
        }
      });
    }
    if (clienteDB.codVerif === cod) {
      req.flash("success_msg", "Codigo verificado correctamente");

      res.redirect(`/admin/clientes`);
    } else {
      return res.render("admin/verificarCodigo", {
        err: {
          message: "Error: El codigo de verificacion ingresado no es correcto"
        },
        cliente: clienteDB
      });
    }
  });
});
router.get("/admin/clientes", isAuthenticated, (req, res) => {
  Cliente.find({}, (err, clienteDB) => {
    if (err) {
      res.render("admin/clientes", {
        err
      });
    }

    return res.render("admin/clientes", {
      cliente: clienteDB
    });
  });
});

router.get("/admin/datosCliente/:id", isAuthenticated, (req, res) => {
  let id = req.params.id;
  Cliente.findById(id, (err, clienteDB) => {
    if (err) {
      return res.render("admin/datosCliente", {
        err: {
          message: "Error: No se ha encontrado ningun cliente con ese ID"
        }
      });
    }
    res.render("admin/datosCliente", {
      cliente: clienteDB
    });
  });
});

router.get("/admin/asignarCredito/:id", isAuthenticated, (req, res) => {
  let id = req.params.id;
  Cliente.findById(id, (err, clienteDB) => {
    if (err) {
      return res.render("admin/asignarCredito", {
        err: {
          message: "Error: No se ha encontrado ningun cliente con ese ID"
        }
      });
    }
    res.render("admin/asignarCredito", {
      cliente: clienteDB
    });
  });
});

router.post("/admin/asignarCredito/:id", isAuthenticated, (req, res) => {
  let id = req.params.id;
  let iniTarjeta = "1010";
  let aleatorio = Math.round(
    Math.random() * (999999999999 - 100000000000) + 100000000000
  );
  let numTarCred = `${iniTarjeta}${aleatorio}`;

  qrcode.toDataURL(numTarCred, async (err, url) => {
    let cliente = await Cliente.findOneAndUpdate({ _id: id }, { new: true });
    if (cliente) {
      if (cliente.tipoCliente === "Ahorrador") {
        cliente.lineaCredito = 7000;
      } else if (cliente.tipoCliente === "Platinum") {
        cliente.lineaCredito = 50000;
      } else {
        cliente.lineaCredito = 200000;
      }
      cliente.numTarCred = numTarCred;
      cliente.qrTarCred = url;
      cliente.save();
      req.flash("success_msg", "Credito asignado correctamente");
      res.redirect("/admin/clientes");
    } else {
      return res.render("admin/asignarCredito", {
        err: {
          message: "Error: No se ha encontrado ningun cliente con ese ID"
        }
      });
    }
  });
});

router.get("/admin/logout", (req, res) => {
  req.logout();
  res.redirect("/admin/signin");
});
module.exports = router;
