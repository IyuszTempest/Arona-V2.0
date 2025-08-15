const fetch = require('node-fetch');

const handler = async (m, { text, conn }) => {
    if (!text) return m.reply("Masukkan kata kunci pencarian TikTok.");

    m.reply("⏳ ᴛᴜɴɢɢᴜɴ, sᴇᴅᴀɴɢ ᴍᴇɴᴄᴀʀɪ....");

    try {
        let url = `https://api.siputzx.my.id/api/s/tiktok?query=${encodeURIComponent(text)}`;
        let response = await fetch(url);
        let json = await response.json();

        if (!json.status || !json.data || json.data.length === 0) {
            return m.reply("❌ Tidak ditemukan hasil untuk pencarian ini.");
        }

        let result = json.data[0]; // Ambil hasil pertama
        let caption = `🎵 *${result.title}*\n👤 *Author:* ${result.author.nickname} (@${result.author.unique_id})\n📥 *Unduhan:* ${result.download_count}\n❤️ *Likes:* ${result.digg_count}\n💬 *Komentar:* ${result.comment_count}`;

        let videoUrl = result.play || result.wmplay; // Gunakan link tanpa watermark jika tersedia

        await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption }, { quoted: m });

    } catch (error) {
        console.error("Error fetching TikTok search:", error);
        return m.reply("❌ Terjadi kesalahan saat mengambil data.");
    }
};

handler.help = ['ttsearch'];
handler.command = ['ttsearch', 'tiktoksearch'];
module.exports = handler;
