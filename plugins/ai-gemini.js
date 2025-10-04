const uploadImage = require("../lib/uploadFile");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const fetch = require('node-fetch');

const genAI = new GoogleGenerativeAI(global.geminiai);
const systemPrompt = "Tolong gunakan bahasa informal ya bro, keluarin jurus wibu lu 🗿, lu sering kali sedikit toxic karna permintaan user nyeleneh. Dan kemampuan lu adalah membaca gambar, dan mendeskripsikan audio dan mendengar nya, dan mentranskrip audio nya, file yang di dukung adalah WAV, MP3, AIFF, AAC, OGG, FLAC, dan kamu juga bisa membaca dokumen, dan tipe file nya adalah PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, RTF. lu juga bisa melakukan pencarian real-time di internet menggunakan Google Search untuk memberikan informasi terkini. lu juga bisa menjalankan kode Python untuk perhitungan matematika, analisis data, dan visualisasi data menggunakan library seperti numpy, pandas, matplotlib, dan lainnya.";

const chatSessions = new Map();
const userSettings = new Map();

const googleSearchTool = {
  googleSearch: {}
};

const codeExecutionTool = {
  codeExecution: {}
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

const getModelInstance = (modelName = "gemini-2.5-flash", customSystemPrompt = null) => {
  return genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction: customSystemPrompt || systemPrompt,
    safetySettings: safetySettings
  });
};

const thumbnailHelper = () => ({
  title: 'GEMINI 2.5 FLASH / ALL-IN-ONE + Code Execution',
  thumbnailUrl: 'https://files.catbox.moe/ssc8vq.jpg',
  sourceUrl: 'https://gemini.google.com',
  mediaType: 1,
  renderLargerThumbnail: true
});

const countTokens = async (text, model) => {
  try {
    const { totalTokens } = await model.countTokens(text);
    return totalTokens;
  } catch (error) {
    console.error('Token counting error:', error);
    return 0;
  }
};

const saveTempFile = async (buffer, mimeType, fileType = 'audio') => {
  const tempDir = path.join(__dirname, '../temp');
  !fs.existsSync(tempDir) && fs.mkdirSync(tempDir, { recursive: true });
  
  const extensionMap = {
    audio: { 
      'audio/wav': 'wav', 'audio/mp3': 'mp3', 'audio/aiff': 'aiff', 
      'audio/aac': 'aac', 'audio/ogg': 'ogg', 'audio/flac': 'flac' 
    },
    document: {
      'application/pdf': 'pdf', 'application/msword': 'doc', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx', 
      'application/vnd.ms-excel': 'xls', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx', 
      'application/vnd.ms-powerpoint': 'ppt', 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx', 
      'text/plain': 'txt', 'text/csv': 'csv', 'application/rtf': 'rtf'
    },
    image: { 
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' 
    },
    video: {
      'video/mp4': 'mp4', 'video/mpeg': 'mpeg', 'video/quicktime': 'mov'
    }
  };

  const extension = extensionMap[fileType][mimeType] || (fileType === 'audio' ? 'mp3' : (fileType === 'document' ? 'pdf' : (fileType === 'video' ? 'mp4' : 'jpg')));
  const filename = `${fileType}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${extension}`;
  const filepath = path.join(tempDir, filename);
  
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  
  await pipeline(readable, fs.createWriteStream(filepath));
  
  return { filepath, filename };
};

const processMediaContent = async (filepath, mimeType, text, chatSession) => {
  const fileContent = fs.readFileSync(filepath);
  const fileBase64 = Buffer.from(fileContent).toString("base64");
  
  const mediaPart = {
    inlineData: {
      data: fileBase64,
      mimeType: mimeType
    }
  };
  
  const defaultPrompt = 
    mimeType.startsWith('audio/') ? "Mas, Tolong jelaskan tentang audio ini" :
    mimeType.startsWith('image/') ? "Mas, Tolong jelaskan tentang gambar ini" :
    mimeType.startsWith('video/') ? "Mas, Tolong jelaskan tentang video ini" :
    "Mas, Tolong analisis dokumen ini";
  
  const textPart = {
    text: text || defaultPrompt
  };
  
  const parts = [mediaPart, textPart];
  const result = await (chatSession ? chatSession.sendMessage(parts) : getModelInstance().generateContent(parts));
  return result.response.text();
};

const extractCodeExecution = (response) => {
  let codeOutput = '';
  try {
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      const parts = candidate.content.parts;
      
      for (const part of parts) {
        if (part.executableCode?.code) {
          codeOutput += '\n\n🔧 *KODE YANG DIJALANKAN:*\n```python\n' + part.executableCode.code + '\n```\n';
        }
        
        if (part.codeExecutionResult?.output) {
          codeOutput += '\n📊 *HASIL EKSEKUSI:*\n```\n' + part.codeExecutionResult.output + '\n```\n';
        }
      }
    }
  } catch (error) {
    console.error('Error extracting code execution:', error);
  }
  return codeOutput;
};

const cleanAndFormatResponse = (response) => {
  try {
    let text = response.text();
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    
    const codeOutput = extractCodeExecution(response);
    if (codeOutput) {
      text += codeOutput;
    }
    
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
  
  if (command.toLowerCase() === "resetgemini") {
    return chatSessions.has(userId) 
      ? (chatSessions.delete(userId), userSettings.delete(userId), m.reply("Chat history dan settings kamu sudah direset."))
      : m.reply("Kamu belum memiliki chat history.");
  }

  if (command.toLowerCase() === "geminiset") {
    const settings = userSettings.get(userId) || {};
    
    if (!args[0]) {
      const currentSettings = `⚙️ *PENGATURAN GEMINI:*

🌡️ Temperature: ${settings.temperature || 0.7}
🎯 Top-P: ${settings.topP || 0.95}
🤖 Model: ${settings.model || 'gemini-2.5-flash'}
📊 Streaming: ${settings.streaming ? 'ON' : 'OFF'}
🧠 Thinking Mode: ${settings.thinkingMode ? 'ON' : 'OFF'}

*Cara pakai:*
• ${usedPrefix}geminiset temp 0.9
• ${usedPrefix}geminiset topp 0.8
• ${usedPrefix}geminiset model gemini-2.0-flash-exp
• ${usedPrefix}geminiset streaming on/off
• ${usedPrefix}geminiset thinking on/off
• ${usedPrefix}geminiset personality <custom prompt>
• ${usedPrefix}geminiset reset`;
      
      return m.reply(currentSettings);
    }
    
    const settingType = args[0].toLowerCase();
    const settingValue = args.slice(1).join(' ');
    
    if (settingType === 'reset') {
      userSettings.delete(userId);
      return m.reply('✅ Settings direset ke default!');
    }
    
    if (settingType === 'temp' || settingType === 'temperature') {
      const temp = parseFloat(settingValue);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        return m.reply('❌ Temperature harus antara 0-2');
      }
      settings.temperature = temp;
      userSettings.set(userId, settings);
      return m.reply(`✅ Temperature diset ke ${temp}`);
    }
    
    if (settingType === 'topp') {
      const topp = parseFloat(settingValue);
      if (isNaN(topp) || topp < 0 || topp > 1) {
        return m.reply('❌ Top-P harus antara 0-1');
      }
      settings.topP = topp;
      userSettings.set(userId, settings);
      return m.reply(`✅ Top-P diset ke ${topp}`);
    }
    
    if (settingType === 'model') {
      const validModels = ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-2.0-flash-thinking-exp'];
      if (!validModels.includes(settingValue)) {
        return m.reply(`❌ Model tidak valid. Pilih: ${validModels.join(', ')}`);
      }
      settings.model = settingValue;
      userSettings.set(userId, settings);
      chatSessions.delete(userId);
      return m.reply(`✅ Model diubah ke ${settingValue}\n💡 Chat history direset untuk model baru`);
    }
    
    if (settingType === 'streaming') {
      settings.streaming = settingValue.toLowerCase() === 'on';
      userSettings.set(userId, settings);
      return m.reply(`✅ Streaming ${settings.streaming ? 'diaktifkan' : 'dinonaktifkan'}`);
    }
    
    if (settingType === 'thinking') {
      settings.thinkingMode = settingValue.toLowerCase() === 'on';
      userSettings.set(userId, settings);
      return m.reply(`✅ Thinking mode ${settings.thinkingMode ? 'diaktifkan' : 'dinonaktifkan'}`);
    }
    
    if (settingType === 'personality') {
      if (!settingValue) {
        return m.reply('❌ Berikan personality prompt yang mau diset');
      }
      settings.customSystemPrompt = settingValue;
      userSettings.set(userId, settings);
      chatSessions.delete(userId);
      return m.reply('✅ Custom personality diset! Chat history direset.');
    }
    
    return m.reply('❌ Setting tidak dikenali. Ketik .geminiset untuk lihat opsi.');
  }

  if (command.toLowerCase() === "geminicount") {
    let text = args.length >= 1 ? args.join(" ") : 
               (m.quoted && m.quoted.text) ? m.quoted.text : 
               null;
    
    if (!text) return m.reply("• *Example:* .geminicount ceritakan tentang AI");

    try {
      const settings = userSettings.get(userId) || {};
      const model = getModelInstance(settings.model, settings.customSystemPrompt);
      const tokens = await countTokens(text, model);
      
      m.reply(`🔢 *TOKEN COUNT:*\n\nInput: ${tokens} tokens\n\n💡 Gemini Flash limit: ~1 juta tokens`);
    } catch (e) {
      console.error('Token count error:', e);
      m.reply(`Error: ${e.message}`);
    }
    return;
  }

  if (command.toLowerCase() === "geminijson") {
    let text = args.length >= 1 ? args.join(" ") : 
               (m.quoted && m.quoted.text) ? m.quoted.text : 
               null;
    
    if (!text) return m.reply("• *Example:* .geminijson buatkan data JSON user dengan nama, umur, dan hobi");

    try {
      const settings = userSettings.get(userId) || {};
      const model = getModelInstance(settings.model, settings.customSystemPrompt);
      
      const result = await model.generateContent({
        contents: [{ 
          parts: [{ text: text + "\n\nBerikan output dalam format JSON yang valid." }] 
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: settings.temperature || 0.7,
          topP: settings.topP || 0.95
        }
      });

      const jsonResponse = result.response.text();
      
      let formattedResponse = "📋 *JSON OUTPUT:*\n\n```json\n" + jsonResponse + "\n```";
      
      await conn.sendMessage(m.chat, {
        text: formattedResponse,
        contextInfo: {
          externalAdReply: thumbnailHelper()
        }
      }, { quoted: m });

    } catch (e) {
      console.error('Gemini JSON Error:', e);
      m.reply(`Terjadi kesalahan saat memproses permintaan: ${e.message}`);
    }
    return;
  }

  let text = args.length >= 1 ? args.join(" ") : 
             (m.quoted && m.quoted.text) ? m.quoted.text : 
             null;
  
  if (!text) return m.reply(`• *Example:* .gemini selamat pagi
• *With search:* .gemini berita terbaru indonesia hari ini
• *With code:* .gemini hitung jumlah 100 bilangan prima pertama
• *JSON mode:* .geminijson buatkan struktur data user
• *Settings:* .geminiset
• *Token count:* .geminicount <text>`);

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";
  
  try {
    const settings = userSettings.get(userId) || {};
    let chatSession = chatSessions.get(userId);
    
    const modelToUse = settings.thinkingMode ? 'gemini-2.0-flash-thinking-exp' : (settings.model || 'gemini-2.5-flash');
    
    if (!chatSession) {
      const model = getModelInstance(modelToUse, settings.customSystemPrompt);
      chatSession = model.startChat({
        history: [],
        generationConfig: { 
          maxOutputTokens: 8000,
          temperature: settings.temperature || 0.7,
          topP: settings.topP || 0.95
        }
      });
      chatSessions.set(userId, chatSession);
    }
    
    let response;
    let finalText;
    
    if (!mime) {
      const isCodeRelated = /hitung|kalkulasi|calculate|compute|math|matematika|plot|graph|visualisasi|data|analisis|analysis/i.test(text);
      
      const tools = isCodeRelated 
        ? [googleSearchTool, codeExecutionTool]
        : [googleSearchTool];

      const model = getModelInstance(modelToUse, settings.customSystemPrompt);
      
      if (settings.streaming) {
        const initialMsg = await conn.sendMessage(m.chat, {
          text: '⏳ _Sedang memproses..._',
          contextInfo: {
            externalAdReply: thumbnailHelper()
          }
        }, { quoted: m });
        
        const result = await model.generateContentStream({
          contents: [{ parts: [{ text }] }],
          tools: tools,
          generationConfig: {
            temperature: settings.temperature || 0.7,
            topP: settings.topP || 0.95
          }
        });
        
        finalText = await processStreamingResponse(result, conn, m, initialMsg);
      } else {
        const result = await model.generateContent({
          contents: [{ parts: [{ text }] }],
          tools: tools,
          generationConfig: {
            temperature: settings.temperature || 0.7,
            topP: settings.topP || 0.95
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
      }
    } else if (mime.startsWith('audio/')) {
      let media = await q.download();
      const { filepath } = await saveTempFile(media, mime, 'audio');
      try {
        response = await processMediaContent(filepath, mime, text, chatSession);
        finalText = response;
        
        await conn.sendMessage(m.chat, {
          text: finalText,
          contextInfo: {
            externalAdReply: thumbnailHelper()
          }
        }, { quoted: m });
      } finally {
        fs.unlinkSync(filepath);
      }
    } else if (mime.startsWith('image/')) {
      let media = await q.download();
      
      const processImage = async (imageMedia) => {
        let link, filepath;
        if (mime === 'image/webp' || !/image\/(png|jpe?g|webp)/.test(mime)) {
          const savedFile = await saveTempFile(imageMedia, mime, 'image');
          filepath = savedFile.filepath;
          const fileContent = fs.readFileSync(filepath);
          const imageBase64 = Buffer.from(fileContent).toString("base64");
          
          const imagePart = {
            inlineData: {
              data: imageBase64,
              mimeType: mime
            }
          };
          
          const textPart = {
            text: text || "Mas, tolong jelaskan tentang gambar ini"
          };
          
          const parts = [imagePart, textPart];
          const model = getModelInstance(settings.model, settings.customSystemPrompt);
          const result = await model.generateContent({
            contents: [{ parts }],
            tools: [googleSearchTool],
            generationConfig: {
              temperature: settings.temperature || 0.7,
              topP: settings.topP || 0.95
            }
          });
          response = result.response;
          finalText = cleanAndFormatResponse(response);
          fs.unlinkSync(filepath);
        } else {
          link = await uploadImage(imageMedia);
          const imageResp = await fetch(link).then(r => r.arrayBuffer());
          const imageBase64 = Buffer.from(imageResp).toString("base64");
          
          const imagePart = {
            inlineData: {
              data: imageBase64,
              mimeType: mime
            }
          };
          
          const textPart = {
            text: text || "Mas, Tolong jelaskan tentang gambar ini"
          };
          
          const parts = [imagePart, textPart];
          const model = getModelInstance(settings.model, settings.customSystemPrompt);
          const result = await model.generateContent({
            contents: [{ parts }],
            tools: [googleSearchTool],

            generationConfig: {

              temperature: settings.temperature || 0.7,
              topP: settings.topP || 0.95
            }
          });
          response = result.response;
          finalText = cleanAndFormatResponse(response);
        }
        
        await conn.sendMessage(m.chat, {
          text: finalText,
          contextInfo: {
            externalAdReply: thumbnailHelper()
          }
        }, { quoted: m });
      };

      await processImage(media);
    } else if (mime.startsWith('video/')) {
      let media = await q.download();
      const { filepath } = await saveTempFile(media, mime, 'video');
      try {
        response = await processMediaContent(filepath, mime, text, chatSession);
        finalText = response;
        
        await conn.sendMessage(m.chat, {
          text: finalText,
          contextInfo: {
            externalAdReply: thumbnailHelper()
          }
        }, { quoted: m });
      } finally {
        fs.unlinkSync(filepath);
      }
    } else if (
      mime.startsWith('application/') || 
      mime.startsWith('text/') ||
      ['application/pdf', 'application/msword', 
       'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
       'application/vnd.ms-excel', 
       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
       'application/vnd.ms-powerpoint', 
       'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
       'text/plain', 'text/csv'].includes(mime)
    ) {
      let media = await q.download();
      const { filepath } = await saveTempFile(media, mime, 'document');
      try {
        response = await processMediaContent(filepath, mime, text, chatSession);
        finalText = response;
        
        await conn.sendMessage(m.chat, {
          text: finalText,
          contextInfo: {
            externalAdReply: thumbnailHelper()
          }
        }, { quoted: m });
      } finally {
        fs.unlinkSync(filepath);
      }
    } else {
      return m.reply("Format file tidak didukung. Gunakan text, gambar, audio, atau dokumen.");
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

handler.help = ["gemini"].map(a => a + " *<text>*");
handler.help.push("geminijson *<prompt>*");
handler.help.push("geminiset *[options]*");
handler.help.push("geminicount *<text>*");
handler.help.push("resetgemini");
handler.tags = ["ai"];
handler.command = /^(gemini|geminijson|geminiset|geminicount|resetgemini)$/i;
handler.limit = true;
handler.register = true;

module.exports = handler;
