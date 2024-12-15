const mongoose=require("mongoose")

    const taskModel = new mongoose.Schema({
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        task: [{
            date: {
                type: String, // Store the date as a string in the format "DD-MM-YYYY"
                default: " "
            },
            data: {
                type: String,
                required: true
            },
            taskname:
            {
                type:String
            },
            isEncrypted:
            {
                type:Boolean,
                default:false
            }
        }]
    });
const task=mongoose.model('task',taskModel)
module.exports=task