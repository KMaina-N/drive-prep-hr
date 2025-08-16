import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const runtime = "edge";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
  }

  const { messages, question, correctAnswer, explanation } = await req.json();
  const lastUserMessage = messages[messages.length - 1]?.content || "";

  // System prompt with strict guidance for AI
  const systemPrompt = `
You are an AI assistant for a Croatian driving school. Your purpose is to provide detailed explanations for questions about the Croatian driving test.

- Original test question: "${question}"
- User's selected answer: "${messages[0].content}"
- Correct answer: "${correctAnswer}"
- Provided explanation: "${explanation}"

Strict rules:
1. Only provide information about Croatian driving laws, road signs, and safe driving practices.
2. If a user asks about unrelated topics (e.g., "who made you", history, technology), respond with: "I am built by Kelvin Maina and powered by Google Gemini. My purpose is to assist with Croatian driving test topics only."
3. Do not speculate or make up information outside official Croatian driving regulations.
4. Respond clearly, concisely, and educationally in English.
5. Treat each session as new; do not reference previous conversations.
`;

  // Convert message history for the Gemini model
  const conversation = messages.map((msg: any) => ({
    role: msg.type === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            { text: "Understood. I'm ready to answer your questions about the Croatian driving test." },
          ],
        },
        ...conversation.slice(1), // include previous messages except initial AI intro
      ],
      generationConfig: { maxOutputTokens: 2048 },
    });

    const result = await chat.sendMessageStream(lastUserMessage);

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          controller.enqueue(new TextEncoder().encode(chunk.text()));
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain" } });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}
