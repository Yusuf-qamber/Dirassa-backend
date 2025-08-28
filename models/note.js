const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const noteSchema= new mongoose.Schema({

  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  title:{
    type:String, required:true,
  },

  file_url:{
    type:String,
   required:true
  }
  ,
  description:{
    type:String,
    required:true,
  },
  college:{
    type:String,
    required:true,
    enum:["IT","Business","Science","Law","Engineering","Art"],
  },
  comments:[commentSchema],
  
},

{timestamps:true}
)

const Note= mongoose.model("Note",noteSchema)
mongoose.model.export=Note