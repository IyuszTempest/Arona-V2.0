/* Plugins CJS
Danbooru search/id/link
Sumber :https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
Author : F6F411
*/
const fetch = require("node-fetch");

let handler = async (m, { conn, args, command }) => {
    if (!args[0]) throw `📌 Contoh:\n• .${command} hatsune miku\n• .${command} 1234567\n• .${command} https://danbooru.donmai.us/posts/1234567`;

    let query = args.join(" ");
    let posts = [];

    try {
        await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

        // Mode 1: Download by link
        if (/danbooru\.donmai\.us\/posts\/(\d+)/i.test(query)) {
            let id = query.match(/danbooru\.donmai\.us\/posts\/(\d+)/i)[1];
            let json = await fetchPostById(id);
            if (!json.file_url) throw `❌ Gambar tidak ditemukan`;
            posts = [json];

        // Mode 2: Download by ID
        } else if (/^\d+$/.test(args[0])) {
            let json = await fetchPostById(args[0]);
            if (!json.file_url) throw `❌ Gambar tidak ditemukan`;
            posts = [json];

        // Mode 3: Search random by tag
        } else {
            posts = await searchDanbooru(query, 3); // ambil 3 gambar
            if (!posts.length) {
                posts = await searchDanbooru(query.replace(/\s+/g, "_"), 3);
                if (!posts.length) throw `❌ Foto dengan tag *${query}* tidak ditemukan.`;
            }
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        // Kirim semua gambar + info ID + link
        for (let post of posts) {
            let caption = `🆔 *ID:* ${post.id}\n🏷️ *Tags:* ${post.tag_string_general}\n🔗 *Link:* https://danbooru.donmai.us/posts/${post.id}`;
            await conn.sendFile(m.chat, post.file_url, "danbooru.jpg", caption, m);
        }

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        if (String(e).includes("429")) {
            throw `⚠️ Terkena rate limit Danbooru, coba lagi nanti!`;
        } else {
            throw e;
        }
    }
};

// 🔍 Search random di Danbooru
async function searchDanbooru(tags, limit = 1) {
    let url = `https://danbooru.donmai.us/posts.json?tags=${encodeURIComponent(tags)}&limit=${limit}&random=true`;
    let res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
}

// 📥 Ambil foto by ID
async function fetchPostById(id) {
    let url = `https://danbooru.donmai.us/posts/${id}.json`;
    let res = await fetch(url);
    if (!res.ok) throw `⚠️ Gagal ambil data: ${res.status}`;
    return await res.json();
}

handler.help = ["danbooru <tag|id|link>"];
handler.tags = ["internet", "anime"];
handler.command = /^danbooru$/i;
handler.limit = true;

module.exports = handler;