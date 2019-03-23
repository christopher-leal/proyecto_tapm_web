const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let compraSchema = new Schema({
  producto: {
    type: String,
    required: [true, "El producto es obligatorio"]
  },
  precio: {
    type: Number,
    required: [true, "El precio es obligatorio"]
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  cliente: {
    type: Schema.Types.ObjectId,
    ref: "Cliente"
  }
});

module.exports = mongoose.model("Compra", compraSchema);
