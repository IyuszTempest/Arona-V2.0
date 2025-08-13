/* plugins  beritaanime
  type cjs
   code  by ZIA ULHAQ
   *SUMBER*
https://whatsapp.com/channel/0029VbB2nGuDZ4LWVu9nlY1h
   ai yang buat bang jadi gak kaku tangan ku coding*/


const axios = require("axios");

let handler = async (m, { conn }) => {
  try {
    const { data } = await axios.get("https://api.privatezia.biz.id/api/anime/berita-anime");

    if (!data?.status || !data?.data?.articles) {
      return m.reply("Gagal mengambil data berita anime.");
    }

    const berita = data.data.articles.slice(0, 5);

    let teks = `📰 *Berita Anime Terbaru*\n\n`;

    berita.forEach((item, i) => {
      teks += `*${i + 1}. ${item.title}*\n`;
      if (item.category) teks += `📁 ${item.category}\n`;
      if (item.dateText) teks += `🗓️ ${item.dateText}\n`;
      teks += `🔗 ${item.url}\n\n`;
    });

    await conn.sendMessage(m.chat, {
      text: teks.trim(),
      contextInfo: {
        externalAdReply: {
          title: berita[0].title,
          body: "Klik untuk baca selengkapnya",
          thumbnailUrl: berita[0].imgSrc,
          sourceUrl: berita[0].url,
          mediaUrl: berita[0].url,
          renderLargerThumbnail: true,
          mediaType: 1
        }
      }
    }, { quoted: m });
  } catch (e) {
    console.error(e);
    m.reply("Terjadi kesalahan saat mengambil berita.");
  }
};

handler.help = ['beritaanime'];
handler.tags = ['anime', 'news'];
handler.command = ['beritaanime'];
handler.register = true;
handler.limit = 5;

module.exports = handler;