/* Plugins CJS
Zerochan Search Downloader
Sumber :https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
Author : F6F411
*/

const fetch = require("node-fetch");
const cheerio = require("cheerio");

async function searchZerochan(tag, limit = 1) {
    const url = `https://www.zerochan.net/${encodeURIComponent(tag)}`;
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    });
    if (!res.ok) throw `⚠️ Gagal ambil data: ${res.status}`;
    const html = await res.text();
    const $ = cheerio.load(html);

    let results = [];
    $("ul#thumbs2 li").each((i, el) => {
        if (i >= limit) return false;
        const imgEl = $(el).find("img");
        const linkEl = $(el).find("a.thumb");
        let src = imgEl.attr("src") || imgEl.attr("data-src");
        if (src && src.startsWith("//")) src = "https:" + src;
        results.push({
            id: linkEl.attr("href").replace("/", ""),
            file_url: src,
            tags: imgEl.attr("alt") || ""
        });
    });
    return results;
}

let handler = async (m, { conn, args, command }) => {
    if (!args[0]) throw `📌 Contoh:\n• .${command} hatsune miku\n• .${command} anime girl`;

    let query = args.join(" ");
    try {
        await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

        let posts = await searchZerochan(query, 1);
        if (!posts.length) throw `❌ Foto dengan tag *${query}* tidak ditemukan.`;

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        let post = posts[0];
        let caption = `🆔 *ID:* ${post.id}\n🏷️ *Tags:* ${post.tags}\n🔗 *Link:* https://www.zerochan.net/${post.id}`;
        await conn.sendFile(m.chat, post.file_url, "zerochan.jpg", caption, m);

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        throw e;
    }
};

handler.help = ["zerochan <tag>"];
handler.tags = ["internet"];
handler.command = /^zerochan$/i;
handler.limit = true;

module.exports = handler;