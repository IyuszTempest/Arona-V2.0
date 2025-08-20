/* 
Plugin: Danbooru Search (CJS)
Command: danboorusearch | dbsearch | danbosearch | dbs
Source: danbooru.donmai.us API
Author : F6F411 
*/

const fetch = require('node-fetch');

let handler = async (m, { conn, args, command }) => {
  if (!args[0]) return m.reply(`Contoh: .${command} arona`);

  let query = args.join("_"); // query digabung pake underscore biar sesuai format danbooru
  let url = `https://danbooru.donmai.us/posts.json?tags=${encodeURIComponent(query)}&limit=5`;

  try {
    let res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    let data = await res.json();

    if (!data.length) {
      return m.reply(`❌ Tidak ditemukan hasil untuk query: *${args.join(" ")}*`);
    }

    let out = `🔍 *Hasil Pencarian Danbooru: ${args.join(" ")}* 🔍\n\n`;

    data.forEach((post, i) => {
      let id = post.id || "N/A";
      let author = post.uploader_name || "N/A";
      let tags = post.tag_string?.split(" ").slice(0, 5).join(", ") || "N/A";
      let link = `https://danbooru.donmai.us/posts/${id}`;

      out += `🆔 Id: ${id}\n👤 Author: ${author}\n🏷️ Tags: ${tags}\n🔗 Link: ${link}\n`;
      if (i < data.length - 1) out += `────────────────────────────\n`;
    });

    out += `\n\n© HATSUNE MIKU V13 BY ALFAT. SYAH`;

    m.reply(out);

  } catch (err) {
    console.error("Danbooru search error:", err);
    m.reply(`❌ Gagal mencari di Danbooru: ${err.message}`);
  }
};

handler.help = ['danbooru2'];
handler.tags = ['downloader'];
handler.command = /^(danbooru2)$/i;
handler.premium = true;

module.exports = handler;
