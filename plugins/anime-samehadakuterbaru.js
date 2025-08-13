const axios = require("axios");

class SamehadakuLatest {
  constructor() {
    this.apiUrl = "https://api.nyxs.pw/anime/samehadakulatest";
  }

  async getLatestAnime() {
    try {
      const response = await axios.get(this.apiUrl);
      const { result } = response.data;

      if (result && result.length > 0) {
        return result;
      } else {
        throw new Error("Tidak ada anime terbaru.");
      }
    } catch (error) {
      throw new Error("Terjadi kesalahan: " + error.message);
    }
  }
}

// Handler untuk menghubungkan dengan sistem
const handler = async (m, { command }) => {
  const samehadakuLatest = new SamehadakuLatest();

  try {
    const latestAnime = await samehadakuLatest.getLatestAnime();
    let response = `🆕 *Anime Terbaru dari Samehadaku:*\n\n`;

    latestAnime.forEach((anime, index) => {
      response += `🔹 *${index + 1}.* ${anime.title}\n`;
      response += `📺 *Episode:* ${anime.episode}\n`;
      response += `📅 *Rilis:* ${anime.rilis}\n`;
      response += `🔗 *Link:* ${anime.url}\n`;
      response += `🖼️ *Thumbnail:* ${anime.thumbnail}\n\n`;
    });

    m.reply(response);
  } catch (error) {
    m.reply("Terjadi kesalahan: " + error.message);
  }
};

// Menentukan perintah dan tag
handler.command = ["samehadakuterbaru"];
handler.tags = ['anime','news'];
handler.limit = true;

module.exports = handler;