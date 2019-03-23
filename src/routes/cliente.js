const express = require("express");
const router = express.Router();
const passport = require("passport");
const { clienteAuthenticated } = require("../helpers/auth");
const Cliente = require("../models/cliente");
const Compra = require("../models/compra");

// const Instascan = require("instascan");

router.get("/cliente/signin", (req, res) => {
  res.render("cliente/signin");
});
router.post(
  "/cliente/signin",
  passport.authenticate("clienteSignin", {
    successRedirect: "/cliente/panelCliente",
    failureRedirect: "/cliente/signin",
    failureFlash: true
  })
);
router.get("/cliente/panelCliente", clienteAuthenticated, (req, res) => {
  res.render("cliente/panelCliente");
});
router.get("/cliente/comprar", clienteAuthenticated, (req, res) => {
  res.render("cliente/comprar");
});
router.post("/cliente/comprar", clienteAuthenticated, (req, res) => {
  let id = req.user._id;
  let { producto, precio } = req.body;
  let compra = new Compra({
    producto,
    precio,
    cliente: id
  });
  precio = parseInt(precio);
  compra.save(async (err, compraDB) => {
    if (err) {
      req.flash("error_msg", `No se ha podido realizar la compra`);
      res.redirect("/cliente/compra");
    }
    let cliente = await Cliente.findOneAndUpdate({ _id: id }, { new: true });
    if (cliente.lineaDebito > 0) {
      cliente.lineaDebito -= precio;
      cliente.save();
      req.flash(
        "success_msg",
        `Compra realizado correctamente por la cantidad de ${precio}`
      );
      res.redirect("/cliente/panelCliente");
    } else {
      req.flash(
        "error_msg",
        `Compra no realizada por que la cantidad de compra ${precio} es mayor al saldo`
      );
      res.redirect("/cliente/panelCliente");
    }
  });
});
router.get("/cliente/retirarEfectivo", clienteAuthenticated, (req, res) => {
  res.render("cliente/retirarEfectivo");
});
router.post(
  "/cliente/retirarEfectivo",
  clienteAuthenticated,
  async (req, res) => {
    let id = req.user._id;
    let { cantidad } = req.body;
    cantidad = parseInt(cantidad);
    let cliente = await Cliente.findOneAndUpdate({ _id: id }, { new: true });

    if (cliente.lineaDebito > 0 && cantidad <= cliente.lineaDebito) {
      cliente.lineaDebito -= cantidad;
      cliente.save();
      req.flash(
        "success_msg",
        `Retiro realizado correctamente por la cantidad de ${cantidad}`
      );
      res.redirect("/cliente/panelCliente");
    } else {
      req.flash(
        "error_msg",
        `Retiro no realizado por que la  cantidad de ${cantidad} es mayor al saldo`
      );
      res.redirect("/cliente/panelCliente");
    }
  }
);

router.get("/cliente/historialCompras", clienteAuthenticated, (req, res) => {
  Compra.find({ cliente: req.user._id })
    .sort("fecha")
    .populate("cliente", "nombre apellidoP apellidoM")
    .exec((err, compras) => {
      if (err) {
        req.flash("error_msg", "Hubo un error con el historial");
        res.redirect("/cliente/panelCliente");
      }
      console.log(compras);
      res.render("cliente/historialCompras", {
        compras
      });
    });
});

router.get("/cliente/logout", (req, res) => {
  req.logout();
  res.redirect("/cliente/signin");
});

router.post("/clienteMovil/signin", async (req, res) => {
  let { numTarjeta, pin } = req.body;
  const cliente = await Cliente.findOne({ numTarjeta });
  if (!cliente) {
    return res.json({
      err: true,
      message: "Cliente no encontrado!"
    });
  } else {
    if (pin == cliente.pin) {
      return res.json({
        err: false,
        message: "Iniciando sesion",
        cliente
      });
    } else {
      return res.json({
        err: true,
        message: "Pin incorrecto, intenta de nuevo!"
      });
    }
  }
});
router.post("/clienteMovil/comprar", (req, res) => {
  let { id, producto, precio } = req.body;
  let compra = new Compra({
    producto,
    precio,
    cliente: id
  });
  precio = parseInt(precio);
  compra.save(async (err, compraDB) => {
    if (err) {
      req.flash("error_msg", `No se ha podido realizar la compra`);
      res.redirect("/cliente/compra");
    }
    let cliente = await Cliente.findOneAndUpdate({ _id: id }, { new: true });
    if (cliente.lineaDebito > 0) {
      cliente.lineaDebito -= precio;
      cliente.save();
      return res.json({
        err: false,
        message: `Compra realizado correctamente por la cantidad de ${precio}`
      });
    } else {
      return res.json({
        err: true,
        message: `Compra no realizada por que la cantidad de compra ${precio} es mayor al saldo`
      });
    }
  });
});

router.post("/clienteMovil/retirarEfectivo", async (req, res) => {
  let { id, cantidad } = req.body;
  cantidad = parseInt(cantidad);
  let cliente = await Cliente.findOneAndUpdate({ _id: id }, { new: true });

  if (cliente.lineaDebito > 0 && cantidad <= cliente.lineaDebito) {
    cliente.lineaDebito -= cantidad;
    cliente.save();
    return res.json({
      err: false,
      message: `Retiro realizado correctamente por la cantidad de ${cantidad}`
    });
  } else {
    return res.json({
      err: true,
      message: `Retiro no realizado por que la  cantidad de ${cantidad} es mayor al saldo`
    });
  }
});

module.exports = router;
