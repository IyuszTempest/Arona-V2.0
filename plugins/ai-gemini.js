/*`UPDATE NIH, SEKARANG GEMINI AI & VISION UDAH BISA SUPPORT SESI + RESET SESI + TRANSKRIP AUDIO ATAU MENGENALI AUDIO + MEMBACA DOKUMEN + MELIHAT IMAGE`
`Note : sesi bakal di simpan di ram, jadi harap bijak menggunakan nya ya! tapi untuk dokumen dan image/video, dan sound, itu langsung di simpan ke google nya langsung!`
weem :
https://whatsapp.com/channel/0029Vb9ZfML6GcGFm9aPgh0W */

// Dapatin API : https://ai.google.dev/gemini-api/docs?hl=id
const uploadImage = require("../lib/uploadFile");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const fetch = require('node-fetch');

// Pastikan API Key lo valid dan aman di-handle
const genAI = new GoogleGenerativeAI(global.geminiai); // Ganti dengan API Key lo yang sebenarnya

const systemPrompt = "Tolong gunakan bahasa informal ya brosis🗿.";

const chatSessions = new Map();

const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  systemInstruction: systemPrompt
});

async function saveTempFile(buffer, mimeType, fileType = 'audio') {
  const tempDir = path.join(__dirname, '../temp');
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  let extension = 'bin';
  
  if (fileType === 'audio') {
    switch(mimeType) {
      case 'audio/wav': extension = 'wav'; break;
      case 'audio/mp3': extension = 'mp3'; break;
      case 'audio/aiff': extension = 'aiff'; break;
      case 'audio/aac': extension = 'aac'; break;
      case 'audio/ogg': extension = 'ogg'; break;
      case 'audio/flac': extension = 'flac'; break;
      default: extension = 'mp3';
    }
  } else if (fileType === 'document') {
    switch(mimeType) {
      case 'application/pdf': extension = 'pdf'; break;
      case 'application/msword': extension = 'doc'; break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': extension = 'docx'; break;
      case 'application/vnd.ms-excel': extension = 'xls'; break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': extension = 'xlsx'; break;
      case 'application/vnd.ms-powerpoint': extension = 'ppt'; break;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation': extension = 'pptx'; break;
      case 'text/plain': extension = 'txt'; break;
      case 'text/csv': extension = 'csv'; break;
      case 'application/rtf': extension = 'rtf'; break;
      default: extension = 'pdf';
    }
  } else if (fileType === 'video') { // Tambahkan video extension
      switch(mimeType) {
        case 'video/mp4': extension = 'mp4'; break;
        case 'video/webm': extension = 'webm'; break;
        case 'video/ogg': extension = 'ogg'; break;
        default: extension = 'mp4';
      }
  }
  
  const filename = `${fileType}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${extension}`;
  const filepath = path.join(tempDir, filename);
  
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  
  await pipeline(readable, fs.createWriteStream(filepath));
  
  return { filepath, filename };
}

function cleanupTempFile(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error("Error bangke:", error);
  }
}

async function processAudioOrDocument(filepath, mimeType, text) {
  const fileContent = fs.readFileSync(filepath);
  const fileBase64 = Buffer.from(fileContent).toString("base64");
  
  const filePart = {
    inlineData: {
      data: fileBase64,
      mimeType: mimeType
    }
  };
  
  const prompt = text || (mimeType.startsWith('audio/') ? 
    "Tolong dong jelasin tentang audio ini" : 
    "Tolong dong analisis dokumen ini");
  
  const parts = [filePart, prompt];
  const result = await geminiModel.generateContent(parts);
  return result.response.text();
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // --- Definisi fkontak di sini ---
  const fkontak = {
      key: {
          participants: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          fromMe: false,
          id: "Halo"
      },
      message: {
          contactMessage: {
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
      },
      participant: "0@s.whatsapp.net"
  };
  // --- Akhir Definisi fkontak ---

  if (command.toLowerCase() === "resetgemini") {
    const userId = m.sender;
    if (chatSessions.has(userId)) {
      chatSessions.delete(userId);
      return conn.reply(m.chat, "Chat history lu udah direset.", fkontak); // Pakai fkontak
    }
    return conn.reply(m.chat, "lu ga ada chat historinya.", fkontak); // Pakai fkontak
  }

  let text;
  if (args.length >= 1) {
    text = args.join(" ");
  } else if (m.quoted && m.quoted.text) {
    text = m.quoted.text;
  } else {
    return conn.reply(m.chat, "• *Example:* .gemini selamat pagi masbro", fkontak); // Pakai fkontak
  }

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";
  
  try {
    const userId = m.sender;
    let chatSession;
    
    if (!chatSessions.has(userId)) {
      chatSession = geminiModel.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });
      chatSessions.set(userId, chatSession);
    } else {
      chatSession = chatSessions.get(userId);
    }
    
    if (!mime) {
      const result = await chatSession.sendMessage(text);
      const response = result.response.text();
      
      if (!response) throw new Error("Response tidak valid dari API");

      await conn.sendMessage(m.chat, {
        text: response,
        contextInfo: {
          externalAdReply: {
            title: 'GEMINI-PRO / VISION',
            thumbnailUrl: 'https://telegra.ph/file/4bae3d5130aabcbe94588.jpg',
            sourceUrl: 'https://gemini.google.com',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: fkontak }); // Pakai fkontak
    } 
    else if (mime.startsWith('audio/')) {
      await conn.reply(m.chat, "Otw memproses soundnya, sabar...", fkontak); // Pakai fkontak
      
      let media = await q.download();
      const { filepath, filename } = await saveTempFile(media, mime, 'audio');
      
      try {
        const response = await processAudioOrDocument(filepath, mime, text);
        
        if (!response) throw new Error("Response gak valid dari APInya");
        
        await conn.sendMessage(m.chat, {
          text: response,
          contextInfo: {
            externalAdReply: {
              title: 'GEMINI-PRO / AUDIO',
              thumbnailUrl: 'https://telegra.ph/file/4bae3d5130aabcbe94588.jpg',
              sourceUrl: 'https://gemini.google.com',
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: fkontak }); // Pakai fkontak
      } finally {
        cleanupTempFile(filepath);
      }
    }
    else if (mime.startsWith('image/') || mime.startsWith('video/')) {
      let media = await q.download();
      let isImage = mime.startsWith('image/');
      let isVideo = mime.startsWith('video/');
      let isTele = isImage && /image\/(png|jpe?g)/.test(mime); // isTele ini tidak terpakai lagi kalau uploadImage diubah

      if (isImage) {
        let link = await uploadImage(media); // Asumsi uploadImage mengembalikan URL langsung
        
        const imageResp = await fetch(link).then(response => response.arrayBuffer());
        const imageBase64 = Buffer.from(imageResp).toString("base64");
        
        const mimeType = mime || "image/jpeg";
        
        const imagePart = {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        };
        
        const parts = [imagePart, text];
        const result = await chatSession.sendMessage(parts);
        const response = result.response.text();
        
        if (!response) throw new Error("Response gak valid dari APInya");

        await conn.sendMessage(m.chat, {
          text: response,
          contextInfo: {
            externalAdReply: {
              title: 'GEMINI-PRO / VISION',
              thumbnailUrl: link, // Gunakan link gambar yang diupload
              sourceUrl: 'https://gemini.google.com',
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: fkontak }); // Pakai fkontak
      } else if (isVideo) {
        await conn.reply(m.chat, "Otw memproses videonya, sabar...", fkontak); // Pakai fkontak
        const { filepath, filename } = await saveTempFile(media, mime, 'video');
        try {
          const fileContent = fs.readFileSync(filepath);
          const fileBase64 = Buffer.from(fileContent).toString("base64");
          
          const videoPart = {
            inlineData: {
              data: fileBase64,
              mimeType: mime
            }
          };
          
          const parts = [videoPart, text || "Tolong jelasin tentang video ini"];
          const result = await geminiModel.generateContent(parts);
          const response = result.response.text();
          
          if (!response) throw new Error("Response gak valid dari APInya");
          
          await conn.sendMessage(m.chat, {
            text: response,
            contextInfo: {
              externalAdReply: {
                title: 'GEMINI-PRO / VIDEO',
                thumbnailUrl: 'https://telegra.ph/file/4bae3d5130aabcbe94588.jpg',
                sourceUrl: 'https://gemini.google.com',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: fkontak }); // Pakai fkontak
          
          // No need to cleanup here, it's done in finally block
        } finally {
          cleanupTempFile(filepath);
        }
      }
    }
    else if (
      mime.startsWith('application/') || 
      mime.startsWith('text/') ||
      mime === 'application/pdf' ||
      mime === 'application/msword' ||
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/vnd.ms-excel' ||
      mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mime === 'application/vnd.ms-powerpoint' ||
      mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      mime === 'text/plain' ||
      mime === 'text/csv'
    ) {
      await conn.reply(m.chat, "Memproses dokumennya, mohon bersabar ya masbro...", fkontak); // Pakai fkontak
      
      let media = await q.download();
      const { filepath, filename } = await saveTempFile(media, mime, 'document');
      
      try {
        const response = await processAudioOrDocument(filepath, mime, text);
        
        if (!response) throw new Error("Response gak valid dari API");
        
        await conn.sendMessage(m.chat, {
          text: response,
          contextInfo: {
            externalAdReply: {
              title: 'GEMINI-PRO / DOCUMENT',
              thumbnailUrl: 'https://telegra.ph/file/4bae3d5130aabcbe94588.jpg',
              sourceUrl: 'https://gemini.google.com',
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: fkontak }); // Pakai fkontak
      } finally {
        cleanupTempFile(filepath);
      }
    } else {
      return conn.reply(m.chat, "Format file gak didukung. Gunakan text, gambar, audio, atau dokumen.", fkontak); // Pakai fkontak
    }
    
    // Reset sesi abis 30 menit
    setTimeout(() => {
      if (chatSessions.has(userId)) {
        chatSessions.delete(userId);
      }
    }, 30 * 60 * 1000);
    
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `error coks: ${e.message}`, fkontak); // Pakai fkontak
  }
};

handler.help = ["gemini"].map(a => a + " *<text>*");
handler.help.push("resetgemini");
handler.tags = ["ai","premium"];
handler.command = /^(gemini|resetgemini)$/i;
handler.limit = true;
handler.register = true;
handler.premium = true;

module.exports = handler