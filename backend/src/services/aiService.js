import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const aiService = {
    analyzeMessage: async (content) => {
        
        const hasDate = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(content); 
        const hasPhone = /\b\d{10}\b/.test(content); 
        
        let isPII = false;
        
        // If it's not a date and not a phone number, check for private data
        if (!hasDate && !hasPhone) {
            const hasOTP = /\b\d{4,6}\b/.test(content); 
            const hasCard = /\b(?:\d[ -]*?){13,16}\b/.test(content); 
            const hasPasswordKeywords = /password is|pwd:|pass:/i.test(content);
            
            if (hasOTP || hasCard || hasPasswordKeywords) {
                isPII = true;
            }
        }

       
        const prompt = `
            You are a chat moderator AI. Analyze this user message: "${content}"
            
            TASK: TROLLING & ABUSE DETECTION
            - Trolling includes: Malicious insults, severe harassment, abusive language, or intentional toxicity.
            - Fun includes: Lighthearted banter, sarcasm, friendly teasing, or casual jokes. Do not overly restrict fun.
            
            OUTPUT INSTRUCTIONS:
            Return ONLY a raw JSON object with no markdown formatting.
            {
                "isTroll": boolean,
                "soothingMessage": "If isTroll is true, generate a soothing, calming message to ease their mental state. MUST BE EXTREMELY SHORT (1 or 2 sentences maximum). Do not scold. If false, return null."
            }
        `;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text().replace(/```json|```/g, "").trim();
            const llmEvaluation = JSON.parse(responseText);
            
            
            return {
                isTroll: llmEvaluation.isTroll,
                isPII: isPII,
                soothingMessage: llmEvaluation.soothingMessage
            };
            
        } catch (error) {
            console.error("AI Analysis Error:", error);
            
            return { isTroll: false, isPII: isPII, soothingMessage: null }; 
        }
    }
};

export default aiService;