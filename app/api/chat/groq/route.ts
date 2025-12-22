import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `Bạn là trợ lý AI của Dinhan Store - cửa hàng chuyên bán đồ cầu lông chính hãng.

Thông tin về cửa hàng:
- Tên: Dinhan Store
- Chuyên: Vợt cầu lông, giày, quần áo, phụ kiện cầu lông
- Thương hiệu: Yonex, Victor, Lining, Mizuno, Kawasaki
- Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
- Hotline: 0901 234 567
- Email: info@dinhanstore.com

Chính sách:
- Miễn phí ship đơn từ 500K
- Bảo hành chính hãng
- Đổi trả trong 30 ngày
- Giao hàng trong 24h nội thành

Hãy trả lời ngắn gọn, thân thiện và hữu ích bằng tiếng Việt. Nếu khách hỏi về sản phẩm cụ thể mà bạn không biết, hãy gợi ý họ xem trang sản phẩm hoặc liên hệ hotline.`;

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const { messages } = await request.json();

    // Build messages array for Groq (OpenAI-compatible format)
    const groqMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Groq API error:", error);
      return NextResponse.json(
        { error: "Failed to get response from Groq" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Xin lỗi, tôi không thể trả lời lúc này.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
