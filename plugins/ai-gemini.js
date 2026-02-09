/* Plugin: Gemini All-in-One (Wibu Edition)
   Features: Image, Audio, Video, Document, Python, Google Search
*/

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

// Inisialisasi API
const genAI = new GoogleGenerativeAI(global.gemini);
const systemPrompt = "Tolong gunakan bahasa informal ya bro, keluarin jurus wibu lu 🗿, lu sering kali sedikit toxic karna permintaan user nyeleneh. Dan kemampuan lu adalah membaca gambar, mendeskripsikan audio, mentranskrip audio (WAV, MP3, AIFF, AAC, OGG, FLAC), membaca dokumen (PDF, DOCX, XLS, PPTX, TXT, CSV), pencarian real-time Google Search, dan eksekusi Python (numpy, pandas, matplotlib).";

const chatSessions = new Map();
const userSettings = new Map();

// Helper Tools
const tools = [
  { googleSearch: {} },
  { codeExecution: {} }
];

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
];

const getModelInstance = (modelName = "gemini-1.5-flash") => {
  return genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction: systemPrompt,
    safetySettings
  });
};

// Fungsi Save Temp File (Tetap pake logic lu)
const saveTempFile = async (buffer, mimeType, fileType) => {
  const tempDir = path.join(__dirname, '../storage/temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  
  const ext = mimeType.split('/')[1] || 'bin';
  const filename = `${fileType}_${Date.now()}.${ext}`;
  const filepath = path.join(tempDir, filename);
  fs.writeFileSync(filepath, buffer);
  return { filepath, filename };
};

const cleanAndFormatResponse = (response) => {
  try {
    let text = response.text();
    // Tambahkan log eksekusi kode jika ada
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      candidate.content.parts.forEach(part => {
        if (part.executableCode) text += `\n\n💻 *Python Code:*\n\`\`\`python\n${part.executableCode.code}\n\`\`\``;
        if (part.codeExecutionResult) text += `\n\n📊 *Execution Result:*\n\`\`\`\n${part.codeExecutionResult.output}\n\`\`\``;
      });
    }
    return text;
  } catch (e) { return response.text(); }
};

let handler = async (m, { client, text, args, prefix, command }) => {
    const userId = m.sender;

    // Logic Reset & Settings (Singkat)
    if (command === "resetgemini") {
        chatSessions.delete(userId);
        return m.reply("✅ History dihapus, memori gue udah bersih kayak otak lu 🗿");
    }

    if (!text && !m.quoted) return m.reply(`Mana teksnya? Minimal kasih gambar atau audio lah, jangan bikin gue bingung 🗿`);

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";
    
    try {
        const settings = userSettings.get(userId) || { model: 'gemini-1.5-flash' };
        let chat = chatSessions.get(userId);
        
        if (!chat) {
            const model = getModelInstance(settings.model);
            chat = model.startChat({ history: [] });
            chatSessions.set(userId, chat);
        }

        let result;
        if (mime) {
            // Media Process
            let media = await q.download();
            const type = mime.split('/')[0];
            const { filepath } = await saveTempFile(media, mime, type);
            
            const mediaPart = {
                inlineData: { data: media.toString("base64"), mimeType: mime }
            };
            
            result = await chat.sendMessage([mediaPart, text || "Jelasin ini apa bro"]);
            fs.unlinkSync(filepath);
        } else {
            // Text Only with Tools
            const model = getModelInstance(settings.model);
            result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text }] }],
                tools
            });
        }

        const finalMsg = cleanAndFormatResponse(result.response);
        await client.sendMessage(m.chat, { 
            text: finalMsg,
            contextInfo: {
                externalAdReply: {
                    title: 'GEMINI MULTIMODAL AI',
                    body: 'Powered by Google AI',
                    thumbnailUrl: 'https://files.catbox.moe/ssc8vq.jpg',
                    sourceUrl: 'https://gemini.google.com',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`Error nih: ${e.message}. Mungkin API Key lu limit atau file lu kegedean 🗿`);
    }
}

handler.command = /^(gemini|resetgemini)$/i
handler.limit = true
module.exports = handler;
          
