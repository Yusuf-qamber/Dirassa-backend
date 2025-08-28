const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();
const User = require("../models/user");

const SALT_ROUNDS = 12;
const oAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (user) =>
  jwt.sign(
    { _id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ----- Local sign-up
router.post("/sign-up", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ err: "Username already used" });

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
    const user = await User.create({
      username,
      email: null,
      hashedPassword,
      authProvider: "local",
    });

    return res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    return res.status(400).json({ err: "Invalid, please try again." });
  }
});

// ----- Local sign-in
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

// ----- Google sign-in
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;               // <-- expect { token }
    if (!token) return res.status(400).json({ err: "Missing token" });

    const ticket = await oAuthClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();      // sub, email, name, picture, ...

    const googleId = payload.sub;
    const firstName = payload.given_name || (payload.name ? payload.name.split(' ')[0] : 'User');


    // find or create
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      // optionally check same email
      user = await User.findOne({ email: payload.email }) || null;

if (!user) {
      user = await User.create({
        username: firstName,            // <- first name as username
        googleId,
        authProvider: 'google',
        email: payload.email,
      });
    } else if (user.username !== firstName) {
      // optional: keep username synced with current Google first name
      user.username = firstName;
      await user.save();
    }
      else {
        user = await User.create({
          username: payload.name,             // <-- your requested behavior
          email: payload.email,
          googleId: payload.sub,
          picture: payload.picture,
          authProvider: "google",
        });
      }
    }

    return res.status(200).json({
      token: signToken(user),
      user: { _id: user._id, username: user.username, email: user.email, picture: user.picture },
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ err: "Google login failed" });
  }
});

module.exports = router;
