/*weem :https://whatsapp.com/channel/0029Vb9ZfML6GcGFm9aPgh0W */

// Dapatin API : https://ai.google.dev/gemini-api/docs?hl=id
const uploadImage = require("../lib/uploadFile");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const fetch = require('node-fetch');

// PENTING: Ganti ini dengan API Key dari environment variable!
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || global.geminiai); // Contoh penggunaan env var dengan fallback

const systemPrompt = "Kamu adalah Arona, character dari Blue Archive, Tolong gunakan bahasa informal ya Arona.";

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
  } else if (fileType === 'video') { // Menambahkan ini agar ekstensi video benar
      switch(mimeType) {
        case 'video/mp4': extension = 'mp4'; break;
        case 'video/webm': extension = 'webm'; break;
        case 'video/ogg': extension = 'ogg'; break;
        default: extension = 'mp4'; // Default ke mp4 jika tidak dikenali
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
    console.error("Error nih kak:", error);
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
  // --- Definisi fkontak di sini (lokal untuk plugin ini) ---
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

  if (command.toLowerCase() === "resetarona") {
    const userId = m.sender;
    if (chatSessions.has(userId)) {
      chatSessions.delete(userId);
      return conn.reply(m.chat, "Chat history kamu sudah direset.", fkontak); // Pakai fkontak
    }
    return conn.reply(m.chat, "Kamu belum memiliki chat history.", fkontak); // Pakai fkontak
  }

  let text;
  if (args.length >= 1) {
    text = args.join(" ");
  } else if (m.quoted && m.quoted.text) {
    text = m.quoted.text;
  } else {
    return conn.reply(m.chat, `• *Example:* ${usedPrefix + command} selamat pagi`, fkontak); // Pakai fkontak dan prefix + command
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
      
      if (!response) throw new Error("Responnya ga valid dari APInya");

      await conn.sendMessage(m.chat, {
        text: response,
        contextInfo: {
          externalAdReply: {
            title: 'Arona Bot Multidevice',
            thumbnailUrl: 'https://files.catbox.moe/ptobqs.jpg',
            sourceUrl: 'https://bluearchive.nexon.com',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: fkontak }); // Pakai fkontak
    } 
    else if (mime.startsWith('audio/')) {
      await conn.reply(m.chat, "Memproses audio, mohon bersabar...", fkontak); // Pakai fkontak
      
      let media = await q.download();
      const { filepath, filename } = await saveTempFile(media, mime, 'audio');
      
      try {
        const response = await processAudioOrDocument(filepath, mime, text);
        
        if (!response) throw new Error("Responnya ga valid dari APInya");
        
        await conn.sendMessage(m.chat, {
          text: response,
          contextInfo: {
            externalAdReply: {
              title: 'Arona Bot Multidevice',
              thumbnailUrl: 'https://files.catbox.moe/ptobqs.jpg',
              sourceUrl: 'https://bluearchive.nexon.com',
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
      
      // Mengubah ini karena isTele tidak dipakai dan link akan didapat dari uploadImage
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
        
        if (!response) throw new Error("Responnya ga valid dari APInya");

        await conn.sendMessage(m.chat, {
          text: response,
          contextInfo: {
            externalAdReply: {
              title: 'Arona Bot Multidevice',
              thumbnailUrl: link, // Gunakan link gambar yang diupload
              sourceUrl: 'https://bluearchive.nexon.com',
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: fkontak }); // Pakai fkontak
      } else if (isVideo) { // Pastikan ini terpisah untuk video
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
          
          const parts = [videoPart, text || "Tolong jelaskan tentang video ini"];
          const result = await geminiModel.generateContent(parts);
          const response = result.response.text();
          
          if (!response) throw new Error("Responnya gak valid dari APInya");
          
          await conn.sendMessage(m.chat, {
            text: response,
            contextInfo: {
              externalAdReply: {
                title: 'Arona Bot Multidevice',
                thumbnailUrl: 'https://files.catbox.moe/ptobqs.jpg', // Thumbnail default untuk video
                sourceUrl: 'https://bluearchive.nexon.com',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: fkontak }); // Pakai fkontak
          
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
      await conn.reply(m.chat, "Memproses dokumen, mohon bersabar ya kak...", fkontak); // Pakai fkontak
      
      let media = await q.download();
      const { filepath, filename } = await saveTempFile(media, mime, 'document');
      
      try {
        const response = await processAudioOrDocument(filepath, mime, text);
        
        if (!response) throw new Error("Responnya ga valid dari APInya");
        
        await conn.sendMessage(m.chat, {
          text: response,
          contextInfo: {
            externalAdReply: {
              title: 'Arona Bot Multidevice',
              thumbnailUrl: 'https://files.catbox.moe/ptobqs.jpg',
              sourceUrl: 'https://bluearchive.nexon.com',
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
    conn.reply(m.chat, `Error nih kak: ${e.message}`, fkontak); // Pakai fkontak
  }
};

handler.help = ["arona"].map(a => a + " *<text>*");
handler.help.push("resetarona");
handler.tags = ['main','ai'];
handler.command = /^(arona|resetarona)$/i;
handler.limit = true;
handler.register = true;

module.exports = handler