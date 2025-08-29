const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Note = require("../models/note.js");
// 👇 ADD mergeParams: true
const router = express.Router({ mergeParams: true });


// -------------------Puplic routes------------------
// GIT ALL NOTES UNDER A CERTAIN COLLEGE
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({ college: req.params.college })
      .populate("owner")
      .sort({ createdAt: "desc" })
    res.status(200).json(notes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// ----------------------Protected routes-----------
router.use(verifyToken)
// CREATE A NOTE UNDER A CERTAIN COLLEGE
router.post("/", async (req, res) => {
  try {
    req.body.owner = req.user._id
    req.body.college = req.params.college   // <-- capture from URL
    const note = await Note.create(req.body)
    res.status(200).json(note)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


//  SHOW A SINGLE NOTE
router.get("/:noteId",async(req,res)=>{
  try{
    const note=await Note.findById(req.params.noteId).populate("owner").populate("comments.author")
    if(!note){
      return res.status(404).json({err:"Note not found"})
    }
    res.status(200).json(note)
  }catch(err){
    res.status(500).json(err)
  }
})



//  UPDATE A SINGLE NOTE
router.put("/:noteId",async(req,res)=>{
  try{
    const note=await Note.findById(req.params.noteId)
    if(!note){
      return res.status(404).send("Note not found")
    }

    if(!note.owner.equals(req.user._id)){
      return res.status(403).send("You are note autharized")
    }

    const updateNote=await Note.findByIdAndUpdate(req.params.noteId, req.body ,{new:true})
    res.status(200).json(updateNote)

  }catch(err){
    res.status(500).json(err)
  }
})



//  DELETE A SINGLE NOTE
router.delete("/:noteId",async(req,res)=>{
  try{
    const note= await Note.findById(req.params.noteId)
    if(!note.owner.equals(req.user._id)){
      return res.status(403).send("You are not autharized")
    }

    const deletedNote=await Note.findByIdAndDelete(req.params.noteId)
    res.status(200).json(deletedNote)
  }catch(err){
    res.status(500).json(err)
  }
})




module.exports = router;