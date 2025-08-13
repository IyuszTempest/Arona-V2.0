const axios = require("axios");
const cheerio = require("cheerio");

// 🔍 Ambil link t.me asli dari halaman join
async function getRealTelegramLink(joinUrl) {
  try {
    const { data} = await axios.get(joinUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
}
});

    const $ = cheerio.load(data);
    const realLink = $('a[href^="tg://resolve"]').attr("href");

    if (realLink) {
      const username = realLink.split("tg://resolve?domain=")[1];
      return `https://t.me/${username}`;
}
} catch (e) {
    console.error(`💢 Gagal ambil link asli: ${e.message}`);
}
  return joinUrl;
}

// 🔍 Fungsi utama pencarian channel Telegram
async function searchTelegramChannels(keywords) {
  const keywordList = keywords.split(",");
  const results = [];

  console.log(`🔍 Mencari channel Telegram untuk ${keywordList.length} keyword(s)...`);

  for (const keyword of keywordList.map(k => k.trim())) {
    console.log(`\n📌 Keyword: "${keyword}"`);
    const url = `https://en.tgramsearch.com/search?query=${encodeURIComponent(keyword)}`;

    try {
      const { data} = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
}
});

      const $ = cheerio.load(data);
      const found = [];

      for (const el of $(".tg-channel-wrapper").toArray()) {
        const name = $(el).find(".tg-channel-link a").text().trim();
        let link = $(el).find(".tg-channel-link a").attr("href");
        const image = $(el).find(".tg-channel-img img").attr("src");
        const members = $(el).find(".tg-user-count").text().trim();
        const description = $(el).find(".tg-channel-description").text().trim();
        const category = $(el).find(".tg-channel-categories a").text().trim();

        if (link?.startsWith("/join/")) {
          link = await getRealTelegramLink(`https://en.tgramsearch.com${link}`);
} else if (link?.startsWith("tg://resolve?domain=")) {
          const username = link.split("tg://resolve?domain=")[1];
          link = `https://t.me/${username}`;
}

        found.push({
          Name: name,
          Link: link,
          Image: image,
          Members: members,
          Description: description || "Tidak ada deskripsi",
          Category: category,
          Keyword: keyword
});
}

      if (!found.length) {
        console.log(` ⚠️ Tidak ada hasil untuk keyword "${keyword}"`);
} else {
        console.log(` ✅ Ditemukan ${found.length} channel untuk keyword "${keyword}"`);
        results.push(...found);
}
} catch (err) {
      console.log(` ❌ Error saat mencari "${keyword}": ${err.message}`);
}
}

  return results;
}

// 🧩 Handler untuk bot
let handler = async (m, { conn, args}) => {
  if (!args[0]) throw 'Format salah, contoh: tgsearch <query>';
  conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key}});

  const keywords = args.join(" ");
  try {
    const channels = await searchTelegramChannels(keywords);
    if (!channels.length) throw 'Tidak ada channel ditemukan.';

    let text = '📋 HASIL PENCARIAN CHANNEL TELEGRAM\n\n';
    channels.forEach((ch, i) => {
      text += `${i + 1}. 📌 Nama: ${ch.Name}\n`;
      text += ` 🔗 Link: ${ch.Link}\n`;
      text += ` 👥 Members: ${ch.Members}\n`;
      text += ` 📝 Deskripsi: ${ch.Description}\n`;
      text += ` 🏷️ Kategori: ${ch.Category}\n`;
      text += ` 🔎 Keyword: ${ch.Keyword}\n\n`;
});
    text += `✅ Total Channel Ditemukan: ${channels.length}`;
    m.reply(text);
    conn.sendMessage(m.chat, { react: { text: '✅', key: m.key}});
} catch (err) {
    m.reply('Terjadi kesalahan: ' + err);
}
};

handler.help = ['tgsearch', 'telesearch'];
handler.tags = ['tools', 'search'];
handler.command = /^(tgsearch|telesearch)$/i;

module.exports = handler;