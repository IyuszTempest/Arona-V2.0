const axios = require("axios");

class AnimeDetail {
  constructor() {
    this.apiUrl = "https://api.siputzx.my.id/api/anime/otakudesu/detail"; // Ganti URL API sesuai dengan yang Anda inginkan
  }

  async getAnimeDetail(link) {
    try {
      const response = await axios.get(this.apiUrl, {
        params: { url: link }, // Menggunakan parameter 'url' sesuai dengan API yang Anda berikan
      });

      const { status, data } = response.data;

      if (!status) {
        throw new Error("Anime tidak ditemukan.");
      }

      return data; // Mengembalikan data anime jika status true
    } catch (error) {
      throw new Error("Terjadi kesalahan: " + error.message);
    }
  }
}

// Handler untuk menghubungkan dengan sistem
const handler = async (m, { text, command }) => {
  const animeDetail = new AnimeDetail();

  if (!text) {
    return m.reply("Silakan masukkan link anime yang ingin dicari.");
  }

  try {
    const detail = await animeDetail.getAnimeDetail(text);
    let response = `📖 *Detail Anime:*\n\n`;
    response += `🔹 *Judul:* ${detail.animeInfo.title}\n`;
    response += `🔹 *Judul Jepang:* ${detail.animeInfo.japaneseTitle}\n`;
    response += `🔹 *Rating:* ${detail.animeInfo.score}\n`;
    response += `🔹 *Produser:* ${detail.animeInfo.producer}\n`;
    response += `🔹 *Tipe:* ${detail.animeInfo.type}\n`;
    response += `🔹 *Status:* ${detail.animeInfo.status}\n`;
    response += `🔹 *Total Episode:* ${detail.animeInfo.totalEpisodes}\n`;
    response += `🔹 *Durasi:* ${detail.animeInfo.duration}\n`;
    response += `🔹 *Tanggal Rilis:* ${detail.animeInfo.releaseDate}\n`;
    response += `🔹 *Studio:* ${detail.animeInfo.studio}\n`;
    response += `🔹 *Genre:* ${detail.animeInfo.genres}\n`;
    response += `🔹 *Thumbnail:* ${detail.animeInfo.imageUrl}\n`;
    response += `🔹 *Episod:* \n`;

    detail.episodes.forEach((episode) => {
      response += `  - ${episode.title} (Tanggal: ${episode.date})\n`;
      response += `    🔗 [Link](${episode.link})\n`;
    });

    m.reply(response);
  } catch (error) {
    m.reply("Terjadi kesalahan: " + error.message);
  }
};

// Menentukan perintah dan tag
handler.command = ["otakudesuinfo"]; // Ganti nama perintah sesuai kebutuhan
handler.tags = ["anime"];
handler.limit = true;

module.exports = handler;