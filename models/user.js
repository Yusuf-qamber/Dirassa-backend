const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },       
    email: { type: String, index: true, lowercase: true, trim: true },
    hashedPassword: {                              
      type: String,
    },
    googleId: { type: String, index: true },
    picture: String,
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.hashedPassword;
    return ret;
  },
});


const User = mongoose.model("User", userSchema);

module.exports = User;
