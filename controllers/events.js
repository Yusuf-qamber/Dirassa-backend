const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Event = require("../models/event.js");
const router = express.Router({ mergeParams: true });
const existingCollege = Event.schema.path('college').enumValues;


// -------------------Puplic routes------------------
// GIT ALL EVENTS UNDER A CERTAIN COLLEGE
router.get("/", async (req, res) => {
   if (!existingCollege.includes(req.params.college)) {
    return res.status(404).json({ error: `College '${req.params.college}' does not exist` });
  }
  try {
    
    const events = await Event.find({ college: req.params.college })
      .populate("owner")
      .sort({ createdAt: "desc" })
    res.status(200).json(events)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


//  SHOW A SINGLE EVENT
router.get("/:eventId",async(req,res)=>{
  try{
    const event=await Event.findById(req.params.eventId).populate("owner").populate("comments.author")
    if(!event){
      return res.status(404).json({err:"Event not found"})
    }
    res.status(200).json(event)
  }catch(err){
    res.status(500).json(err)
  }
})


// ----------------------Protected routes-----------
router.use(verifyToken)
// CREATE AN EVENT UNDER A CERTAIN COLLEGE
router.post("/", async (req, res) => {
  try {
    req.body.owner = req.user._id
    req.body.college = req.params.college   // <-- capture from URL
    const event = await Event.create(req.body)
    res.status(200).json(event)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


module.exports = router;