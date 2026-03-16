import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

console.log("--- DEBUG START ---");
console.log("Environment Key:", process.env.GOOGLE_API_KEY ? "EXISTS" : "NOT FOUND");
console.log("Key value starts with:", process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.substring(0, 7) : "N/A");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function run() {
  try {
    const result = await model.generateContent("hi");
    console.log("✅ API SUCCESS:", result.response.text());
  } catch (e) {
    console.error("❌ API FAILURE:", e.message);
  }
}

run();