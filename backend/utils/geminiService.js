import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not set");
  process.exit(1);
}


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ---------------------------------------------------
 * Generate Flashcards
 * --------------------------------------------------- */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `
Generate exactly ${count} educational flashcards from the following text.

Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    const flashcards = [];
    const cards = generatedText.split("---").filter(c => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "";
      let answer = "";
      let difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) question = line.slice(2).trim();
        if (line.startsWith("A:")) answer = line.slice(2).trim();
        if (line.startsWith("D:")) {
          const diff = line.slice(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/* ---------------------------------------------------
 * Generate Quiz
 * --------------------------------------------------- */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `
Generate exactly ${numQuestions} multiple choice questions from the following text.

Format each question as:
Q: [Question]
01: [Option 1]
02: [Option 2]
03: [Option 3]
04: [Option 4]
C: [Correct option - exactly as written above]
E: [Brief Explanation]
D: [Difficulty :easy, medium, or hard]

Separate questions with "---"

Text:
${text.substring(0, 15000)}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    const questions = [];
    const questionBlocks = generatedText.split("---").filter(b => b.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split('\n');

      let question = "";
      let options = [];
      let correctAnswer = "";
      let explanation = "";
      let difficulty = "medium";

      for (const line of lines) {
        const t = line.trim();
        if (t.startsWith("Q:")) question = t.substring(2).trim();
        else if (t.match(/^0\d:/)) options.push(t.substring(3).trim());
        else if (t.startsWith("C:")) correctAnswer = t.substring(2).trim();
        else if (t.startsWith("E:")) explanation = t.substring(2).trim();
        else if (t.startsWith("D:")) {
          const diff= t.substring(2).trim().toLowerCase();
          if(['easy','medium','hard'].includes(diff)){
            difficulty=diff;
          }
      }
    }
      if (question && options.length === 4 && correctAnswer) {
        questions.push({ question, options, correctAnswer, explanation, difficulty });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate quiz");
  }
};

/* ---------------------------------------------------
 * Summary
 * --------------------------------------------------- */
export const generateSummary = async (text) => {

  const prompt=`provide a concise summary of the following text, highlighting the key concepts, main ideas, and
  keep the summary clear and structured.
  Text:
  ${text.substring(0,20000)}
  `
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    })

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Summary Error:",error)
    throw new Error("Failed to generate summary");
  }
};

/* ---------------------------------------------------
 * Chat with Context
 * --------------------------------------------------- */
export const chatWithContext = async (question, chunks) => {
  const context = chunks.map(c => c.content).join("\n\n");

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent(
      `Context:\n${context}\n\nQuestion: ${question}`
    );

    return result.response.text();
  } catch (error) {
    throw new Error("Chat failed");
  }
};

/**Explain a specific concept */
export const explainConcept=async(concept,context)=>{
  const prompt=`Explain the concept of "${concept}"based on the following context,
  Provide a clear,educational explanation that's easy to understand.
  Include examples if relevant.

   Context:
   ${context.substring(0,1000)} `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    })

    const result = await model.generateContent(prompt);
    return result.response.text();
  
    
}catch(error){
  console.error("Gemini API error:",error)
  throw new Error("Failed to explain concept");
}
}