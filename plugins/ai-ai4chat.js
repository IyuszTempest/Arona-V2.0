/* plugins  ai4chat  type cjs
  tqto kiuur
   code  by ZIA ULHAQ
   *SUMBER*
https://whatsapp.com/channel/0029VbB2nGuDZ4LWVu9nlY1h
   ai yang buat bang jadi gak kaku tangan ku coding😹
  */


const axios = require("axios");

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`Masukkan prompt!\n\nContoh:\n.${command} cat lucu sedang tidur`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const url = `https://api.privatezia.biz.id/api/ai/ai4chat?query=${encodeURIComponent(text)}`;
    const { data } = await axios.get(url);

    if (!data.status || !data.result) throw '❌ Gagal mengambil gambar dari AI.';

    await conn.sendFile(m.chat, data.result, 'ai4chat.jpg', `🖼️ *AI4Chat Result*\n\nPrompt: ${text}`, m);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    
  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply('❌ Gagal memproses permintaan AI.');
  }
};

handler.command = /^ai4chat$/i;
handler.help = ['ai4chat <teks>'];
handler.tags = ['ai'];
handler.limit = 3;
handler.register = true;

module.exports = handler;