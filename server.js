
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("morgan");
const app = express();
 const { OAuth2Client } = require('google-auth-library');
 const cookieParser = require('cookie-parser');
 const client = new OAuth2Client();
 const path=require("path")


// controllers
const testJwtRouter = require("./controllers/test-jwt");
const authRouter = require("./controllers/auth");
const userRouter = require("./controllers/users");
const notesRouter = require('./controllers/notes.js')
const eventsRouter = require('./controllers/events.js')
const verifyToken = require("./middleware/verify-token");
const profileRouter=require("./controllers/profile")

// connect DB
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});



app.use(cors());
app.use(express.json());
app.use(logger("dev"));
app.use("/assets",express.static(path.join(__dirname,"assets")))


// public routes
app.use("/auth", authRouter);
app.use("/test-jwt", testJwtRouter);
app.use('/:college/notes',notesRouter)
app.use('/:college/events',eventsRouter)
app.use("/profile",profileRouter)

// protected
app.use(verifyToken);
app.use("/users", userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on :${PORT}`));
