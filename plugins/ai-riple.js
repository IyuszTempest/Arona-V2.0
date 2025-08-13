/* plugins  riple  type cjs
  tqto kiuur
   code  by ZIA ULHAQ
   *SUMBER*
https://whatsapp.com/channel/0029VbB2nGuDZ4LWVu9nlY1h
   ai yang buat bang jadi gak kaku tangan ku coding😹
  */


const axios = require('axios');

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(`Masukkan pertanyaan!\n\nContoh: .${command} siapa presiden Indonesia?`);
  }

  await conn.sendMessage(m.chat, { react: { text: "💬", key: m.key } });

  try {
    const url = `https://api.privatezia.biz.id/api/ai/riple?query=${encodeURIComponent(text)}`;
    const { data } = await axios.get(url);

    if (!data.status || !data.data?.result) throw '❌ Tidak ada jawaban dari AI.';

    await conn.sendMessage(m.chat, {
      text: `🤖 *Riple AI*\n\n${data.data.result}`,
      quoted: m
    });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply('❌ Gagal mendapatkan jawaban dari Riple AI.');
  }
};

handler.help = ['riple <teks>'];
handler.tags = ['ai'];
handler.command = /^riple$/i;

module.exports = handler;