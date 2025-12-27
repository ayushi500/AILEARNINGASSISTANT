import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import flashcardRoutes from './routes/flashcardRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import quizRoutes from './routes/quizRoutes.js'
import progressRoutes from './routes/progressRoutes.js'

//ES6 module __dirname alternative
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)

//Initialise express app
const app=express();

////connect to mongoDB
connectDB();
app.use(express.json());


//Middleware to handle CORS
app.use(
    cors({
      origin:"*",
      methods:["GET","POST","PUT","DELETE"],
      allowedHeaders:["Content-Type","Authorization"],
      credentials:true,
    })
)

app.use('/uploads',express.static(path.join(__dirname,"uploads")))

//Routes
app.use('/api/auth',authRoutes)
app.use('/api/documents',documentRoutes)
app.use('/api/flashcards',flashcardRoutes)
app.use('/api/ai',aiRoutes)
app.use('/api/quizzes',quizRoutes)
app.use('/api/progress',progressRoutes)

app.use(errorHandler)

//404 handler
app.use((req,res)=>{
    res.status(404).json({
        success:false,
        error:"Route not found",
        statusCode:"404"
    })
})

//start server
const PORT=process.env.PORT || 8000;
app.listen(PORT,()=>{
    console.log(`Server running in ${process.env.NODE_ENV} node on port ${PORT}`)
})

process.on('unhandledRejection',(err)=>{
    console.error(`Error:${err.message}`);
    process.exit(1)
})

//used for generating JWT_SECURITY_KEY
//node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

/**
 * CORS backend ka gatekeeper hai  CORS=> Cross-Origin Resource Sharing
Jo decide karta hai:
kaun aa sakta hai
kya request bhej sakta hai
Matlab:
Kaun-si website / frontend tumhare backend API ko call kar sakti hai
token/cookies allowed hain ya nahi

 example

Frontend: http://localhost:3000
Backend: http://localhost:5000
Ye different origin hain
Browser bolta hai:
"Agar backend allow kare tabhi request bhejunga"
Isko hi CORS rule kehte hain

app.use(cors({...}))
➡️ Express ko bol rahe ho:
“Har request ke liye CORS rules apply karo”

origin: "*"
Koi bhi website tumhari API access kar sakti hai
localhost, production, kisi aur domain se bhi
⚠️ Production mein unsafe hota hai

methods: ["GET", "POST", "PUT", "DELETE"]
🟢 Browser ko bol rahe ho:
“Sirf ye HTTP methods allowed hain”

allowedHeaders: ["Content-Type", "Authorization"]
🟢 Browser ko bol rahe ho:
“Frontend ye headers bhej sakta hai”
Header	         Kaam
Content-Type	JSON / form data
Authorization	JWT token
 */