const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },       // will use Google "name"
    email: { type: String, index: true, lowercase: true, trim: true },
    hashedPassword: {                                  // only required for local users
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },
    googleId: { type: String, index: true },
    picture: String,
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
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
