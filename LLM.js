import express from "express";
import cors from "cors";
import { config } from "dotenv";
config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";

const app = express();
app.use(cors());
app.use(express.json());

const model = new ChatGoogleGenerativeAI({
  model: "models/gemini-2.5-flash",
  maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: process.env.GEMINI_API_KEY,
});

const prompt = PromptTemplate.fromTemplate(
  "You are a assistance. Answer this question: {question}",
);

const chain = prompt.pipe(model);

app.post("/generate", async (req, res) => {
  const { question } = req.body;
  const response = await chain.invoke({
    question: question,
  });
  return res.status(200).json({ message: response.content });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Started on port ${PORT}`);
});
