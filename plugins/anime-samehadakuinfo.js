const axios = require("axios");

class AnimeDetail {
  constructor() {
    this.apiUrl = "https://api.siputzx.my.id/api/animesamehadaku/detail";
  }

  async getAnimeDetail(link) {
    try {
      const response = await axios.get(this.apiUrl, {
        params: { link },
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
    response += `🔹 *Judul:* ${detail.title}\n`;
    response += `🔹 *Rating:* ${detail.rating}\n`;
    response += `🔹 *Deskripsi:* ${detail.description}\n`;
    response += `🔹 *Thumbnail:* ${detail.thumbnail}\n`;
    response += `🔹 *Genre:* ${detail.genres.join(", ")}\n`;
    response += `🔹 *Episod:* \n`;

    detail.episodes.forEach((episode, index) => {
      response += `  - ${episode.title} (Tanggal: ${episode.date})\n`;
      response += `    🔗 [Link](${episode.link})\n`;
    });

    m.reply(response);
  } catch (error) {
    m.reply("Terjadi kesalahan: " + error.message);
  }
};

// Menentukan perintah dan tag
handler.command = ["samehadakuinfo"];
handler.tags = ["anime"];
handler.limit = true;

module.exports = handler;