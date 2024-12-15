const mongoose= require("mongoose")

const userSchema = new mongoose.Schema({
   Fname:String,
   Lname:String,
   Email : String,
   Password:String
})

const User=mongoose.model("user",userSchema)

module.exports=User