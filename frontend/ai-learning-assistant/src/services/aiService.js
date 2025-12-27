import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const generateFlashcards=async (documentId,options)=>{
    try{
        const response=await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS,{documentId,...options})
        return response.data;
    }catch(error){
        throw error.response?.data || {message:"Failed to generate flashcards"}
    }
}

const generateQuiz=async (documentId,options)=>{
    try{
        const response=await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ,{documentId,...options})
        return response.data;
    }catch(error){
        throw error.response?.data || {message:"Failed to generate quiz"}
    }
}

const generateSummary=async (documentId)=>{
    try{
        const response=await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY,{documentId})
        return response.data?.data;
    }catch(error){
        throw error.response?.data || {message:"Failed to generate summary"}
    }
}

const chat=async (documentId,message)=>{
    try{
        const response=await axiosInstance.post(API_PATHS.AI.CHAT,{documentId , question:message})
        return response.data;
    }catch(error){
        throw error.response?.data || {message:"Chat request failed"}
    }
}

const explainConcept=async (documentId,concept)=>{
    try{
        const response=await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT,{documentId , concept})
        return response.data?.data;
    }catch(error){
        throw error.response?.data || {message:"Failed to explain concept"}
    }
}

const getChatHistory=async (documentId)=>{
    try{
        const response=await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId))   //GET request me documentId URL me pass kiya     No body required
        return response.data;
    }catch(error){
        throw error.response?.data || {message:"Failed to fetch chat history"}
    }
}

const aiService={
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory
}

export default aiService




/**
 * 🔹 Why options Are Required

1️⃣ Customize flashcard generation
Server ko bas documentId milna kaafi nahi hai.
Options allow karte hain ki:

options = {
    numberOfCards: 10,       // kitne flashcards chahiye
    difficulty: "medium",    // easy, medium, hard
    includeSummary: true,    // summary ke saath flashcards
    language: "en"           // English / Hindi
}

Backend ye options use karke AI model ko instructions deta hai.
 */

//************************************************************
 /**response.data?.data
  * 
   response = {
  data: { … },      // ← backend ka response JSON   i.e.response.data = backend se jo JSON aaya
  status: 200,
  statusText: "OK",
  headers: { … },
  config: { … }
}

2️⃣ Backend Response Example
Suppose backend summary generate karta hai:
return res.json({
  success: true,
  message: "Summary generated",
  data: {
    summary: "This is the generated summary..."
  }
});

response.data?.data   optional chaining

Agar response.data undefined hua (server ne kuch galat bheja)
To error throw hone ki bajay undefined return hoga
Safe programming ka tareeka hai

  */