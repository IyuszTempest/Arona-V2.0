const uploadImage = require("../lib/uploadFile");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const genAI = new GoogleGenerativeAI(global.geminiai);
const systemPrompt = "lu adalah 'Itami Youji' dari anime gate, seorang otaku yang berkerja demi hobi yang sangat mencintai dunia anime, manga, dan kultur Jepang. lu selalu update dengan berita anime terbaru, bisa diajak diskusi tentang episode terbaru, rekomendasi anime, atau sekadar jadi teman ngobrol saat gabut. Gunakan bahasa yang santai, asik, dan campur sedikit istilah-istilah wibu yang umum (misal: 'sugoi', 'isekai', 'waifu', dll) agar terasa lebih akrab dan disingkat aja, Jadilah teman diskusi yang seru untuk gw yang wibu ini!";

const chatSessions = new Map();

const googleSearchTool = {
  googleSearch: {}
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const getModelInstance = () => {
  return genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
    safetySettings: safetySettings
  });
};

const thumbnailHelper = () => ({
  title: 'Itami Youji - Si Wibu Akut',
  thumbnailUrl: 'https://files.catbox.moe/w2jre4.jpg',
  sourceUrl: 'https://myanimelist.net',
  mediaType: 1,
  renderLargerThumbnail: true
});

const saveTempImage = async (buffer, mimeType) => {
  const tempDir = path.join(__dirname, '../temp');
  !fs.existsSync(tempDir) && fs.mkdirSync(tempDir, { recursive: true });
  const extension = mimeType.split('/')[1] || 'jpg';
  const filename = `image_${Date.now()}.${extension}`;
  const filepath = path.join(tempDir, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
};

const cleanAndFormatResponse = (response) => {
  try {
    let text = response.text();
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    
    if (!groundingMetadata) {
      return text;
    }
    
    const supports = groundingMetadata.groundingSupports || [];
    const chunks = groundingMetadata.groundingChunks || [];
    
    if (supports.length === 0 || chunks.length === 0) {
      return text;
    }
    
    let sourcesList = [];
    const usedSources = new Set();
    
    supports.forEach(support => {
      if (support.groundingChunkIndices?.length) {
        support.groundingChunkIndices.forEach(i => {
          const chunk = chunks[i];
          if (chunk?.web?.uri && chunk?.web?.title && !usedSources.has(chunk.web.uri)) {
            usedSources.add(chunk.web.uri);
            sourcesList.push({
              title: chunk.web.title.length > 60 ? chunk.web.title.substring(0, 60) + '...' : chunk.web.title,
              url: chunk.web.uri
            });
          }
        });
      }
    });
    
    if (sourcesList.length > 0) {
      text += '\n\n━━━━━━━━━━━━━━━━━━━━━━\n📚 *SUMBER INFORMASI:*\n';
      sourcesList.slice(0, 3).forEach((source, index) => {
        text += `${index + 1}. ${source.title}\n   🔗 ${source.url}\n\n`;
      });
    }
    
    const webSearchQueries = groundingMetadata.webSearchQueries;
    if (webSearchQueries && webSearchQueries.length > 0) {
      const cleanQueries = webSearchQueries
        .filter(q => q && q.length > 0)
        .slice(0, 2)
        .map(q => `"${q}"`)
        .join(', ');
      
      if (cleanQueries) {
        text += `🔍 *Pencarian:* ${cleanQueries}\n━━━━━━━━━━━━━━━━━━━━━━`;
      }
    }
    
    return text;
  } catch (error) {
    console.error('Error formatting response:', error);
    return response.text();
  }
};

const processStreamingResponse = async (result, conn, m, initialMsg) => {
  let fullResponse = '';
  let lastUpdate = Date.now();
  const updateInterval = 2000;
  
  try {
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      if (Date.now() - lastUpdate > updateInterval) {
        await conn.sendMessage(m.chat, {
          text: fullResponse + '\n\n⏳ _Masih ngetik..._',
          edit: initialMsg.key
        });
        lastUpdate = Date.now();
      }
    }
    
    const finalResponse = await result.response;
    const formattedResponse = cleanAndFormatResponse(finalResponse);
    
    await conn.sendMessage(m.chat, {
      text: formattedResponse,
      edit: initialMsg.key
    });
    
    return formattedResponse;
  } catch (error) {
    throw error;
  }
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const userId = m.sender;
  
  if (command.toLowerCase() === "resetnakama") {
    return chatSessions.has(userId) 
      ? (chatSessions.delete(userId), m.reply("Sesi chat dengan Itami telah direset. Mari kita mulai dari awal!"))
      : m.reply("Kamu belum memiliki chat history.");
  }

  let text = args.length >= 1 ? args.join(" ") : 
             (m.quoted && m.quoted.text) ? m.quoted.text : null;
  
  if (!text && !((m.quoted ? m.quoted : m).mimetype || "").startsWith('image/')) {
    return m.reply(`Ohayou! Mau ngobrolin apa kita hari ini?

• *Contoh:* .itami rekomendasi anime isekai terbaru
• *Dengan gambar:* Kirim gambar waifu-mu lalu reply dengan .itami siapa dia?`);
  }
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";
  
  try {
    let chatSession = chatSessions.get(userId);

    if (!chatSession) {
      const model = getModelInstance();
      chatSession = model.startChat({
        history: [],
        generationConfig: { 
          maxOutputTokens: 8000,
          temperature: 0.7,
          topP: 0.95
        }
      });
      chatSessions.set(userId, chatSession);
    }
    
    let response;
    let finalText;
    
    if (!mime) {
      const model = getModelInstance();

      const result = await model.generateContent({
        contents: [{ parts: [{ text }] }],
        tools: [googleSearchTool],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95
        }
      });

      response = result.response;
      finalText = cleanAndFormatResponse(response);

      await conn.sendMessage(m.chat, {
        text: finalText,
        contextInfo: {
          externalAdReply: thumbnailHelper()
        }
      }, { quoted: m });

    } else if (mime.startsWith('image/')) {
      let media = await q.download();
      let filepath;
      try {
        if (mime === 'image/webp' || !/image\/(png|jpe?g|webp)/.test(mime)) {
          filepath = await saveTempImage(media, mime);
          media = fs.readFileSync(filepath);
        }

        const imageBase64 = Buffer.from(media).toString("base64");
        
        const imagePart = {
          inlineData: {
            data: imageBase64,
            mimeType: mime
          }
        };
        
        const textPart = {
          text: text || "Coba jelaskan gambar ini, sepertinya ini dari anime ya?"
        };
        
        const parts = [imagePart, textPart];
        const model = getModelInstance();
        const result = await model.generateContent({
          contents: [{ parts }],
          tools: [googleSearchTool],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95
          }
        });
        response = result.response;
        finalText = cleanAndFormatResponse(response);

         await conn.sendMessage(m.chat, {
          text: finalText,
          contextInfo: {
            externalAdReply: thumbnailHelper()
          }
        }, { quoted: m });
      } finally {
        if (filepath) fs.unlinkSync(filepath);
      }
    } else {
      return m.reply("Gomen! aku hanya bisa membaca teks dan gambar (JPG, PNG) ya.");
    }
    
    setTimeout(() => {
      if (chatSessions.has(userId)) {
        chatSessions.delete(userId);
      }
    }, 10 * 60 * 1000);
    
  } catch (e) {
    console.error('Gemini Error:', e);
    m.reply(`Terjadi kesalahan saat memproses permintaan: ${e.message}`);
  }
};

handler.help = ["itami *<pertanyaan>*", "resetitami"];
handler.tags = ["ai"];
handler.command = /^(itami|resetitami)$/i;
handler.limit = true;
handler.register = true;

module.exports = handler;
