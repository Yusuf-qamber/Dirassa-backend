const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");


const router = express.Router();
const User = require("../models/user");

const SALT_ROUNDS = 12;
const oAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;
const signToken = (user) =>
  jwt.sign(
    { _id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );


router.post("/sign-up", async (req, res) => {
  try {
    const { username,emaill, password,picture } = req.body;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        err: "Password must be at least 12 characters and include an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }
    const existing = await User.findOne({ $or:[{username},{email}] });
    if (existing) return res.status(409).json({ err: "User already exists" });

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
    const user = await User.create({
      username,
      email: null,
      hashedPassword,
    });

    return res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    return res.status(400).json({ err: "Invalid, please try again." });
  }
});


router.post("/sign-in", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(401).json({ err: "Invalid credentials" });

    const ok = bcrypt.compareSync(req.body.password, user.hashedPassword || "");
    if (!ok) return res.status(401).json({ err: "Invalid credentials" });

    return res.status(200).json({ token: signToken(user), user });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        err: "Google credential is required",
      });
    }

    const ticket = await oAuthClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const picture = payload.picture;
    const username = payload.name;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        username,
        email,
        googleId,
        picture,
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user,
    });

  } catch (err) {
    console.error(err);

    return res.status(401).json({
      err: "Invalid Google credential",
    });
  }
});


module.exports = router;
