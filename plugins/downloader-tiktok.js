/* tiktok support video+foto
* tqto api vreden
* */
const axios = require('axios');

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Silakan masukkan URL TikTok!');

    try {
        let { data } = await axios.get(`https://api.vreden.my.id/api/tiktok?url=${encodeURIComponent(text)}`);

        if (data.status !== 200 || !data.result || !data.result.data) {
            return m.reply('Gagal mengambil data TikTok.');
        }

        let { title, durations, author, stats, data: media, music_info } = data.result;

        let caption = `🎥 *Judul:* ${title}
⏳ *Durasi:* ${durations} detik
👤 *Pengguna:* ${author.fullname} (@${author.nickname})
👀 *Dilihat:* ${stats.views}
❤️ *Suka:* ${stats.likes}
💬 *Komentar:* ${stats.comment}
🔄 *Dibagikan:* ${stats.share}`;

        // Jika ada video, kirim langsung
        let video = media.find(item => item.type === 'nowatermark');
        if (video) {
            await conn.sendMessage(m.chat, { video: { url: video.url }, caption }, { quoted: m });
        } else {
            // Jika tidak ada video, berarti ini foto slide
            for (let i = 0; i < media.length; i++) {
                await conn.sendMessage(m.chat, { 
                    image: { url: media[i].url }, 
                    caption: `📸 *Foto ${i + 1}/${media.length}*` 
                }, { quoted: m });
            }
        }

        // Kirim Audio secara terpisah jika ada
        if (music_info && music_info.url) {
            await conn.sendMessage(m.chat, { 
                audio: { url: music_info.url }, 
                mimetype: 'audio/mp4' 
            }, { quoted: m });
        }

    } catch (e) {
        console.error(e);
        m.reply('Terjadi kesalahan saat mengambil data TikTok.');
    }
};

handler.help = ['tiktok'];
handler.tags = ['downloader'];
handler.command = /^tiktok|tt$/i;
handler.limit = 5;
handler.register = true;

module.exports = handler;