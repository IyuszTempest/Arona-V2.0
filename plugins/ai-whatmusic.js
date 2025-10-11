const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

const genAI = new GoogleGenerativeAI(global.geminiai);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const thumbnailHelper = () => ({
  title: 'WHATMUSIC FROM GEMINI AI',
  thumbnailUrl: 'https://files.catbox.moe/ssc8vq.jpg',
  sourceUrl: 'https://gemini.google.com',
  mediaType: 1,
  renderLargerThumbnail: true
});

const saveTempFile = async (buffer, mimeType, fileType = 'audio') => {
  const tempDir = path.join(__dirname, '../temp');
  !fs.existsSync(tempDir) && fs.mkdirSync(tempDir, { recursive: true });
  
  const extensionMap = {
    audio: { 
      'audio/wav': 'wav', 'audio/mp3': 'mp3', 'audio/aiff': 'aiff', 
      'audio/aac': 'aac', 'audio/ogg': 'ogg', 'audio/flac': 'flac' 
    },
  };

  const extension = extensionMap[fileType][mimeType] || 'mp3';
  const filename = `${fileType}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${extension}`;
  const filepath = path.join(tempDir, filename);
  
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  
  await pipeline(readable, fs.createWriteStream(filepath));
  
  return { filepath, filename };
};

const findMusic = async (filepath, mimeType) => {
  const fileContent = fs.readFileSync(filepath);
  const fileBase64 = Buffer.from(fileContent).toString("base64");
  
  const audioPart = {
    inlineData: {
      data: fileBase64,
      mimeType: mimeType
    }
  };
  
  const prompt = "Tolong identifikasi judul lagu dan nama artis dari audio ini secara akurat, mungkin kamu bisa cari di google atau youtube. Kemudain berikan jawaban dengan format: Judul: [Judul Lagu]\nArtis: [Nama Artis]";
  
  const parts = [prompt, audioPart];
  const result = await model.generateContent(parts);
  return result.response.text();
};

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || "";

  if (!/audio|video/.test(mime)) {
    return conn.reply(m.chat, `Kirim atau reply audio/video yang mau dicari judul lagunya, Sensei!\n\nContoh: *${usedPrefix + command}* (sambil reply audio)`, m);
  }

  await conn.reply(m.chat, '⏳ Tunggu sebentar ya...', m);

  try {
    let media = await q.download();
    const { filepath } = await saveTempFile(media, mime, 'audio');
    
    try {
      const resultText = await findMusic(filepath, mime);
      
      await conn.sendMessage(m.chat, {
        text: `*🎶 Lagu Ditemukan!* ✨\n\n${resultText}`,
        contextInfo: {
          externalAdReply: thumbnailHelper()
        }
      }, { quoted: m });

    } finally {
      // Selalu hapus file sementara setelah selesai
      fs.unlinkSync(filepath);
    }
  } catch (e) {
    console.error('Error di whatmusic:', e);
    m.reply(`Waduh, sepertinya ada masalah, Sensei. Gagal mengenali lagu: ${e.message}`);
  }
};

handler.help = ["whatmusic"];
handler.tags = ["tools", "ai"];
handler.command = /^(whatmusic)$/i;
handler.limit = true;
handler.register = true;

module.exports = handler;
