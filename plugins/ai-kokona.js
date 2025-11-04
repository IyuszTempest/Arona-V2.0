/*
 * Plugin CJS Chatbot Kokona (Versi Sederhana)
 * Disesuaikan oleh Gemini untuk Yus
 * Hanya support chat teks
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(global.geminiai);

const systemPrompt = global.promptkokona;

const chatSessions = new Map();

const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
  systemInstruction: systemPrompt
});

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const fkontak = {
      key: {
          participants: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          fromMe: false,
          id: "Halo"
      },
      message: {
          contactMessage: {
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
      },
      participant: "0@s.whatsapp.net"
  };

  const cmd = command.toLowerCase();
  const userId = m.sender;

  if (cmd === "resetkokona") {
    if (chatSessions.has(userId)) {
      chatSessions.delete(userId);
      return conn.reply(m.chat, "Memori obrolan kita udah Kokona reset ya, Sensei! ☺️", fkontak);
    }
    return conn.reply(m.chat, "Sensei, kita kan belum ngobrol apa-apa... 😅", fkontak);
  }
  let text;
  if (args.length >= 1) {
    text = args.join(" ");
  } else if (m.quoted && m.quoted.text) {
    text = m.quoted.text;
  } else {
    return conn.reply(m.chat, `Mau ngobrol apa sama Kokona, Sensei?\n\n*Contoh:*\n${usedPrefix + command} selamat pagi, Kokona!`, fkontak);
  }

  try {
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
    const result = await chatSession.sendMessage(text);
    const response = result.response.text();
    if (!response) throw new Error("Responnya ga valid dari APInya");
    await conn.sendMessage(m.chat, {
      text: response,
      contextInfo: {
        externalAdReply: {
          title: 'Sunohara Kokona',
          body: global.bodykokona,
          thumbnailUrl: 'https://files.catbox.moe/t9f51k.jpg',
          sourceUrl: 'https://bluearchive.nexon.com',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: fkontak });
    setTimeout(() => {
      if (chatSessions.has(userId)) {
        chatSessions.delete(userId);
      }
    }, 30 * 60 * 1000);
    
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `Aduh, Sensei... Kayaknya Kokona lagi pusing. 😵\n*Error:* ${e.message}`, fkontak); 
  }
};

handler.help = ["kokona"].map(a => a + " *<text>*");
handler.help.push("resetkokona");
handler.tags = ['ai'];
handler.command = /^(kokona|resetkokona)$/i;
handler.limit = true;
handler.register = true;

module.exports = handler;
