const axios = require("axios");

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(`Masukkan URL yang ingin di-screenshot!\n\nContoh:\n.${command} https://api.privatezia.biz.id`);
  }

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const start = Date.now();
    const res = await axios.get(`https://api.privatezia.biz.id/api/generator/ssweb?url=${encodeURIComponent(text)}`, {
      responseType: 'arraybuffer'
    });

    const speed = Date.now() - start;

    await conn.sendMessage(m.chat, {
      image: res.data,
      caption: `✅ *Screenshot Berhasil!*\n🌐 URL: ${text}\n⚡ Cepetan: *${speed} ms*`
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("❌ SSWeb Error:", err);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mengambil screenshot dari URL tersebut.");
  }
};

handler.command = /^ssweb2$/i;
handler.help = ["ssweb2 <url>"];
handler.tags = ["tools"];
handler.limit = 3;

module.exports = handler;