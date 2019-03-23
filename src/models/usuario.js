const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es necesario"]
  },
  email: {
    type: String,
    required: [true, "El correo es necesario"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "El password es necesario"]
  }
});

usuarioSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject();
  delete userObject.password;

  return userObject;
};

usuarioSchema.plugin(uniqueValidator, {
  message: "El {PATH} debe de ser unico"
});
module.exports = mongoose.model("Usuario", usuarioSchema);
