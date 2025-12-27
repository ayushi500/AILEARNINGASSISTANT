import fs from 'fs/promises'
import {PDFParse} from "pdf-parse"

export const extractTextFromPDF=async (filePath)=>{
    try{
        const dataBuffer=await fs.readFile(filePath);
        //pdf-parse expects a Uint8Array,nota buffer
        const parser=new PDFParse(new Uint8Array(dataBuffer))
        const data=await parser.getText()

        return{
            text:data.text,                               
            numPages:data.numpages,                     
            info:data.info,                               
        }                                                 
    } catch(error){
        console.error("PDF parsing error",error);
        throw new Error("Failed to extract text from PDF")
    }
}









































































/**
 * Parsing simply means:

Reading a PDF and extracting useful information from it

Like:
✔ Text
✔ Number of pages
✔ Author name
✔ PDF metadata

When we do:

const data = await parser.getText();


The library:
1️⃣ Opens PDF structure
2️⃣ Reads each page
3️⃣ Extracts text content
4️⃣ Returns result

So:
📖 PDF Parsing = Understanding PDF file contents
 */