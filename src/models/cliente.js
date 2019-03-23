const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let clienteSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es necesario"]
  },
  apellidoP: {
    type: String,
    required: [true, "El apellido paterno es necesario"]
  },
  apellidoM: {
    type: String,
    required: [true, "El apellido materno es necesario"]
  },
  email: {
    type: String,
    required: [true, "El email es necesario"]
  },
  numCasa: {
    type: String,
    required: [true, "El numero de casa es necesario"]
  },
  calle: {
    type: String,
    required: [true, "La calle es necesaria"]
  },
  colonia: {
    type: String,
    required: [true, "La colonia es necesaria"]
  },
  ciudad: {
    type: String,
    required: [true, "La ciudad es necesaria"],
    default: "Morelia"
  },
  cp: {
    type: Number,
    min: 58000,
    max: 58999,
    required: [true, "El cp es necesario"]
  },
  fechaNac: {
    type: Date,
    required: [true, "La fecha de nacimiento es necesaria"]
  },
  fechaReg: {
    type: Date,
    default: Date.now
  },
  codIne: {
    type: String,
    required: [true, "El codigo del ine es necesario"]
  },
  ocupacion: {
    type: String,
    required: [true, "La ocupacion es necesaria"]
  },
  ineFront: {
    type: String,
    required: [true, "La ine frontal es necesaria"]
  },
  ineTras: {
    type: String,
    required: [true, "La ine trasera es necesaria"]
  },
  compDom: {
    type: String,
    required: [true, "El comprobante de domicilio es necesario"]
  },
  numTarjeta: {
    type: String,
    required: [true, "El numero de tarjeta es necesario"]
  },
  lineaDebito: {
    type: Number
  },
  tipoCliente: {
    type: String,
    required: [true, "El tipo de cliente es necesario"]
  },
  numTarCred: {
    type: String
  },
  lineaCredito: {
    type: Number
  },
  qrTarjeta: {
    type: String,
    required: [true, "El qr de tarjeta es necesario"]
  },
  qrTarCred: {
    type: String
  },
  pin: {
    type: Number,
    min: 1000,
    max: 9999,
    required: [true, "El pin es necesario"]
  },
  codVerif: {
    type: Number,
    min: 1000,
    max: 9999
  },
  status: {
    type: Boolean,
    default: false
  }
});

// encriptar contraseña
clienteSchema.method.encryptPassword = password => {
  return bcrypt.hashSync(password, 10);
};
// desencriptar contraseña
clienteSchema.method.decryptPassword = password => {
  return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model("Cliente", clienteSchema);
