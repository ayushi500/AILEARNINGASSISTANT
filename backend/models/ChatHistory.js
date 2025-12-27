import mongoose from "mongoose";

const chatHistorySchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    documentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Document",
        required:true
    },
    messages:[{
        role:{
            type:String,
            enum:['user','assistant'],
            required:true
        },
        content:{
            type:String,
            required:true
        },
        timeStamp:{
            type:Date,
            default:Date.now
        },
        relevantChunks:{
            type:[Number],
            default:[]
        }
    }]
},{
    timestamps:true
})

//Index for faster queries
chatHistorySchema.index({userId:1 ,documentId:1 })

const ChatHistory=mongoose.model('Chatistory',chatHistorySchema)

export default ChatHistory