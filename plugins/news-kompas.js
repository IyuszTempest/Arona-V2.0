const axios = require("axios");

let handler = async (m, { conn }) => {
  try {
    let { data } = await axios.get("https://api-furina.vercel.app/berita/kompas");
    if (!data?.status || !data.result?.length) return m.reply("Berita tidak ditemukan");

    let teks = `*📰 Berita Kompas*\n\n`;
    data.result.forEach((v, i) => {
      teks += `*${i + 1}.* ${v.title}\n`;
      teks += `📅 ${v.published_at}\n`;
      teks += `${v.url}\n\n`;
    });

    await conn.sendMessage(
      m.chat,
      {
        text: teks.trim(),
        contextInfo: {
          externalAdReply: {
            title: "Berita Kompas",
            body: global.wm2,
            thumbnailUrl: data.result[0].thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: global.instagramowner
          },
        },
      },
      { quoted: m }
    );
  } catch (e) {
    await conn.reply(m.chat, "Gagal mengambil data berita", m);
  }
};

handler.help = ["kompas"];
handler.tags = ["news"];
handler.command = /^kompas$/i;

module.exports = handler;
