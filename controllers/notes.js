const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const note = require("../models/note.js");
const router = express.Router();


router.get('/', (req,res)=>{
  res.send('hello world')
})




module.exports = router;