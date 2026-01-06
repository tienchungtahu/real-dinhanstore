import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { context, keywords } = await req.json();

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json({ error: "Groq API Key not configured" }, { status: 500 });
        }

        const prompt = `
    You are an expert SEO content writer. Write a high-quality, engaging blog post based on the following context and keywords.
    
    Context from documents:
    ${context.slice(0, 10000)} // Limit context to avoid token limits

    Keywords: ${keywords}

    Instructions:
    1. Write a catchy Title.
    2. Write a short SEO optimized Excerpt.
    3. Write the content in Markdown format. Use H2, H3 for structure.
    4. Include a conclusion.
    5. Tone: Professional, informative, and engaging.
    6. Language: Vietnamese.

    Output format JSON:
    {
      "title": "...",
      "excerpt": "...",
      "content": "..."
    }
    `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant that writes blog posts in JSON format.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error("No content generated");
        }

        const parsedContent = JSON.parse(content);

        return NextResponse.json(parsedContent);
    } catch (error) {
        console.error("[AI_GENERATE]", error);
        return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
    }
}
