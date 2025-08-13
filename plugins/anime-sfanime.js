/*`SFANIME, INI BUAT NYARI CHAR ANIME, BISA SFW, BISA NSFW, RESULT NYA HD AMAT AJG, GILA`
Weem :
https://whatsapp.com/channel/0029Vb9ZfML6GcGFm9aPgh0W
*/
const fetch = require('node-fetch');

let handler = async (m, { args, conn }) => {
    if (args.length < 2) {
        return m.reply("❌ Format salah!\nGunakan: *sfanime <type> <tag>*\n\nContoh:\n*sfanime sfw waifu*\n*sfanime nsfw neko*");
    }

    let type = args[0].toLowerCase();
    let tag = args.slice(1).join(" ").toLowerCase();

    if (!['sfw', 'nsfw'].includes(type)) {
        return m.reply("❌ Type tidak valid! Gunakan *sfw* atau *nsfw*.");
    }

    // ini buat premium, kalo kalian mau fiturnya free for all di bot kalian, hapus aja function ini
    let user = global.db.data.users[m.sender];
    if (type === 'nsfw' && !user.premium) {
        return m.reply("🚫 Fitur NSFW hanya untuk pengguna premium!");
    }

    let apiUrl = `https://fastrestapis.fasturl.cloud/sfwnsfw/anime?type=${type}&tag=${encodeURIComponent(tag)}`;

    try {
        m.reply("🔍 Sedang mencari gambar...");

        let response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Gagal fetch API, status: ${response.status}`);

        let buffer = await response.buffer();

        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: `🔹 *Type:* ${type.toUpperCase()}\n🔹 *Tag:* ${tag}\n📸 *Source:* FastRestAPI`
        }, { quoted: m });

    } catch (error) {
        console.error("Error saat fetch API:", error);
        m.reply("❌ Terjadi kesalahan saat mengambil gambar.");
    }
};

handler.command = /^(sfanime)$/i;
handler.help = ["sfanime"].map(v => v + " *<type> <tag>*");
handler.tags = ["anime"];
handler.limit = true;

module.exports = handler;