/* komik indo seach detail
Cjs
Scraper lang:https://whatsapp.com/channel/0029VafnytH2kNFsEp5R8Q3n
*/
const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://komikindo2.com/';

async function getHome() {
  let { data } = await axios.get(baseUrl);
  const $ = cheerio.load(data);
  let result = {
    popular: [],
    newest: []
  };

  $("div.odadingslider > div.animepost").each((i, e) => {
    const title = $(e).find("div.bigor > a").text().trim();
    const url = $(e).find("div.bigor > a").attr('href');
    const img = $(e).find("div.limit > img").attr('src');
    const lastChapter = $(e).find("div.lsch > a").text().trim().replace(/\s+/g, '');
    const uploaded = $(e).find("div.lsch > span.datech").text().trim();

    result.popular.push({
      title,
      url,
      img,
      lastChapter,
      uploaded
    });
  });

  $("div.listupd > div.animepost").each((i, e) => {
    const title = $(e).find("div.animepostxx-top-bottom > a").attr("title").split('Komik ')[1];
    const url = $(e).find("div.animepostxx-top-bottom > a").attr('href');
    const img = $(e).find("div.limietles > img").attr('src');
    const lastChapter = $(e).find("div.lsch > a").first().text().trim().replace(/\s+/g, '');
    const rating = $(e).find("div.flex-skroep").eq(0).text().trim();
    const type = $(e).find("div.flex-skroep").eq(1).text().trim();
    const views = $(e).find("div.flex-skroep").eq(2).text().trim();
    const status = $(e).find("div.flex-skroep").eq(4).text().trim();

    result.newest.push({
      title,
      url,
      img,
      lastChapter,
      rating,
      views,
      type,
      status
    });
  });

  return result;
}

async function getSearch(q) {
  let { data } = await axios.get(`${baseUrl}?s=${q}`);
  const $ = cheerio.load(data);
  let result = [];

  $("div.film-list > div.animepost").each((i, e) => {
    const title = $(e).find("div.bigors > a").text().trim();
    const url = $(e).find("div.bigors > a").attr('href');
    const img = $(e).find("div.limit > img").attr("src");
    const rating = $(e).find("div.adds > div.rating").text().trim();

    result.push({
      title,
      url,
      img,
      rating
    });
  });

  return result;
}

async function getDetail(url) {
  let { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $(".infoanime").find(".infox").find("span").eq(0).text().trim().split(':\n')[1].replace(/^\s+/g, '');
  const img = $(".infoanime").find(".thumb > img").attr('src');
  const status = $(".infoanime").find(".infox").find("span").eq(1).text().trim().split(':\n')[1].replace(/^\s+/g, '');
  const creator = $(".infoanime").find(".infox").find("span").eq(2).text().trim().split(':\n')[1].replace(/^\s+/g, '');
  const ilustrator = $(".infoanime").find(".infox").find("span").eq(3).text().trim().split(':\n')[1].replace(/^\s+/g, '');
  const grapich = $(".infoanime").find(".infox").find("span").eq(4).text().trim().split(':\n')[1].replace(/^\s+/g, '');
  const type = $(".infoanime").find(".infox").find("span").eq(5).text().trim().split(':\n')[1].replace(/^\s+/g, '');
  const genre = [];
  $(".infoanime").find(".genre-info > a").each((i, e) => {
    genre.push($(e).text().trim());
  });
  const lastCh = $("#chapter_list").find("ul li > .lchx").eq(0).text().trim().replace(/[\s\n]+/g, '').split('Chapter')[1];
  const lastUpload = $("#chapter_list").find("ul li > .dt").eq(0).text().trim();
  const sinopsis = $(".tabsarea").find("#sinopsis").find("p").text().trim();

  return {
    title,
    img,
    status,
    creator,
    ilustrator,
    grapich,
    type,
    genre,
    lastCh,
    lastUpload,
    sinopsis
  };
}

async function getChapter(url) {
  let { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $("div.dtlx").text().trim().split('\n')[1].replace(/^\s+/g, '');
  const nextCh = $("div.nextprev > a[rel='next']").attr('href');
  let result = {
    title,
    nextCh,
    image: []
  };

  $("div.chapter-image > div.img-landmine").find("img").each((i, e) => {
    const image = $(e).attr('src');
    result.image.push(image);
  });

  return result;
}

let handler = async (m, { conn, args, command }) => {
    try {
        if (command === "komikindo") {
            const data = await getHome();
            let message = `Komikindo - Komik Populer & Terbaru\n\n`;

            message += `📌 *Komik Populer:*\n`;
            data.popular.slice(0, 5).forEach((komik, i) => {
                message += `${i + 1}. ${komik.title}\n`;
                message += `Chapter: ${komik.lastChapter}\n`;
                message += `Upload: ${komik.uploaded}\n`;
                message += `Link: ${komik.url}\n\n`;
            });

            message += `🔥 *Komik Terbaru:*\n`;
            data.newest.slice(0, 5).forEach((komik, i) => {
                message += `${i + 1}. ${komik.title}\n`;
                message += `Chapter: ${komik.lastChapter}\n`;
                message += `Link: ${komik.url}\n\n`;
            });

            await conn.sendMessage(m.chat, { text: message });
        } else if (command === "komiksearch") {
            if (!args.length) return m.reply("Masukkan kata kunci pencarian.");
            const result = await getSearch(args.join(" "));
            if (!result.length) return m.reply("Tidak ada hasil yang ditemukan.");

            let message = `🔍 *Hasil Pencarian Komik:* \n\n`;
            result.slice(0, 5).forEach((komik, i) => {
                message += `${i + 1}. ${komik.title}\n`;
                message += `Rating: ${komik.rating}\n`;
                message += `Link: ${komik.url}\n\n`;
            });

            await conn.sendMessage(m.chat, { text: message });
        } else if (command === "komikdetail") {
            if (!args.length) return m.reply("Masukkan URL komik.");
            const detail = await getDetail(args[0]);
            if (!detail.title) return m.reply("Gagal mengambil detail komik.");

            let message = `📄 *Detail Komik*\n\n`;
            message += `Judul: ${detail.title}\n`;
            message += `Status: ${detail.status}\n`;
            message += `Creator: ${detail.creator}\n`;
            message += `Genre: ${detail.genre.join(", ")}\n`;
            message += `Sinopsis:\n${detail.sinopsis.slice(0, 500)}...\n\n`;
            message += `Link: ${args[0]}`;

            await conn.sendMessage(m.chat, { text: message });
        }
    } catch (error) {
        console.error(error);
        m.reply("Terjadi kesalahan saat mengambil data.");
    }
};

handler.help = ["komikindo", "komiksearch <query>", "komikdetail <url>"];
handler.tags = ["anime"];
handler.command = /^(komikindo|komiksearch|komikdetail)$/i;

module.exports = handler;