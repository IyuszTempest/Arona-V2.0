/* Plugin: Instagram Downloader (Multi-Media Edition)
   Source: api.vreden.my.id
   Feature: Auto Detect Single/Carousel (Image & Video)
*/

const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*– Contoh:* ${usedPrefix + command} https://www.instagram.com/p/C6...`
    
    // Validasi link IG sederhana
    if (!/instagram.com\/(p|reels|reel|tv)/.test(text)) {
        throw 'Pastikan itu link Instagram (Post/Reels/TV) yang valid ya!'
    }

    // Fast React
    await conn.sendMessage(m.chat, { react: { text: '📸', key: m.key } });

    try {
        const apiUrl = `https://api.vreden.my.id/api/v1/download/instagram?url=${encodeURIComponent(text)}`;
        const res = await axios.get(apiUrl);

        if (!res.data.status) throw new Error('API lagi nggak mood, coba lagi nanti ya.');

        const result = res.data.result;
        const mediaData = result.data; // Ini array isinya foto/video
        const caption = result.caption.text || '';
        const profile = result.profile;

        // Loop untuk kirim semua media (Carousel support)
        for (let media of mediaData) {
            if (media.type === 'video') {
                await conn.sendMessage(m.chat, { 
                    video: { url: media.url },
                    caption: `🎬 *Video dari @${profile.username}*`
                }, { quoted: m });
            } else if (media.type === 'image') {
                await conn.sendMessage(m.chat, { 
                    image: { url: media.url },
                    caption: `🖼️ *Image dari @${profile.username}*`
                }, { quoted: m });
            }
            // Kasih jeda dikit biar nggak spam/limit
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`*Gagal Download IG!* 🛠️\n\nError: ${e.message}`);
    }
}

handler.help = ['igdl']
handler.tags = ['downloader']
handler.command = /^(igdl|ig|instagram)$/i

module.exports = handler;
