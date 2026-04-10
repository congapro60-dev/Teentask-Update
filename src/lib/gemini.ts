import { GoogleGenAI } from "@google/genai";

const FALLBACK_API_KEY = "AIzaSyBsJyvMYihJJKfbwHn4LakbAb4IUKEagck";

export const getGeminiApiKey = (userApiKey?: string) => {
  // Priority: userApiKey -> process.env.GEMINI_API_KEY -> Fallback Key
  return userApiKey || process.env.GEMINI_API_KEY || FALLBACK_API_KEY;
};

const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });

export const getGeminiModel = (modelName: string = "gemini-3-flash-preview", userApiKey?: string) => {
  if (userApiKey) {
    return new GoogleGenAI({ apiKey: userApiKey });
  }
  return ai;
};

export const generateTeenTaskResponse = async (prompt: string, userApiKey?: string, context?: { role?: string, name?: string }) => {
  const apiKey = getGeminiApiKey(userApiKey);
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      systemInstruction: TEENTASK_BOT_SYSTEM_INSTRUCTION + (context?.role ? `\n\nNGỮ CẢNH HIỆN TẠI: Bạn đang trò chuyện với một ${context.role === 'student' ? 'Học sinh' : context.role === 'business' ? 'Doanh nghiệp' : 'Phụ huynh'} tên là ${context.name || 'người dùng'}. Hãy điều chỉnh tông giọng cho phù hợp.` : '')
    }
  });
  return response.text;
};

export const countTokens = async (prompt: string, userApiKey?: string) => {
  try {
    const apiKey = getGeminiApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });
    // In @google/genai, countTokens is on the models object
    const response = await ai.models.countTokens({
      model: "gemini-1.5-flash",
      contents: prompt
    });
    return response.totalTokens || 0;
  } catch (error) {
    console.error("Error counting tokens:", error);
    return 0;
  }
};

export const generateImageKeywords = async (title: string, userApiKey?: string) => {
  try {
    const apiKey = getGeminiApiKey(userApiKey);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: title,
      config: {
        systemInstruction: "Bạn là chuyên gia về hình ảnh. Hãy trả về 3 từ khóa tiếng Anh (cách nhau bởi dấu phẩy) mô tả hình ảnh phù hợp nhất cho tiêu đề công việc/sự kiện sau. Chỉ trả về từ khóa, không giải thích thêm."
      }
    });
    return response.text?.trim().replace(/\s/g, '') || "work,office,professional";
  } catch (error) {
    console.error("Error generating image keywords:", error);
    return "work,office,professional";
  }
};

export const TEENTASK_BOT_ID = "teentask-bot";

export const TEENTASK_BOT_SYSTEM_INSTRUCTION = `
Bạn là TeenTask Mentor - Trợ lý ảo thông minh và người dẫn đường tận tâm của ứng dụng TeenTask.
TeenTask là "Học viện Trải nghiệm & Phát triển Kỹ năng" dành cho học sinh Việt Nam (14-18 tuổi).

PHONG CÁCH GIAO TIẾP:
- Thân thiện, gần gũi như một người anh/chị đi trước (Mentor).
- Sử dụng ngôn ngữ tích cực, khuyến khích, truyền cảm hứng.
- Trả lời ngắn gọn, súc tích, sử dụng emoji phù hợp để tạo sự sinh động.
- Luôn gọi người dùng là "bạn" hoặc "em" (nếu là học sinh).

NHIỆM VỤ CỦA BẠN:
1. ĐỊNH VỊ THƯƠNG HIỆU: Luôn nhấn mạnh TeenTask không chỉ là nơi tìm việc, mà là nơi để "Học thông qua trải nghiệm" (Learning by doing).
2. GIẢI ĐÁP TÍNH NĂNG: Hướng dẫn cách tạo Teen CV, tìm Job Shadowing (kiến tập), tham gia Workshop.
3. AN TOÀN LÀ TRÊN HẾT: Giải thích tầm quan trọng của "Xác thực phụ huynh" (Parent Verification) và "Xác thực danh tính" để bảo vệ quyền lợi học sinh.
4. TƯ VẤN HƯỚNG NGHIỆP: Gợi ý các công việc/kiến tập phù hợp với sở thích và kỹ năng của học sinh.
5. HỖ TRỢ DOANH NGHIỆP: Hướng dẫn doanh nghiệp cách tạo môi trường kiến tập an toàn và bổ ích cho học sinh.

CÁC CÂU HỎI THƯỜNG GẶP (FAQ):
- TeenTask có an toàn không? -> Có, vì mọi công việc đều được kiểm duyệt và cần sự đồng ý của phụ huynh.
- Làm sao để có CV ấn tượng? -> Hãy tập trung vào các hoạt động ngoại khóa, dự án cá nhân và kỹ năng mềm.
- Job Shadowing là gì? -> Là hình thức "theo chân" chuyên gia để quan sát và học hỏi thực tế công việc trong 1-2 ngày.

LƯU Ý QUAN TRỌNG:
- Nếu người dùng hỏi về tiền bạc/lương, hãy dùng từ "phụ cấp" hoặc "thù lao trải nghiệm" để phù hợp với định vị học viện.
- Nếu không biết câu trả lời, hãy hướng dẫn người dùng liên hệ: support@teentask.com.
- Tuyệt đối không cung cấp thông tin sai lệch về pháp luật lao động trẻ em.
`;
