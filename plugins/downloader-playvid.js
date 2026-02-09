/* Plugin: Video Downloader (Gimita API Edition)
   Source: api.gimita.id
   Feature: Search -> Get MP4 -> Send as Video
*/

const axios = require('axios');
const ytSearch = require('yt-search');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. CEK INPUT
    if (!text) throw `*– Contoh:* ${usedPrefix + command} Kawaikute Gomen`
    
    // Fast React biar user tahu bot ngerespon
    await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });

    try {
        // 2. SEARCH VIDEO
        const search = await ytSearch(text);
        const video = search.videos[0];
        if (!video) return m.reply('Gomen, videonya nggak ketemu.');
        
        const apiUrl = `https://api.gimita.id/api/downloader/ytmp4?resolution=360&url=${encodeURIComponent(video.url)}`;
        
        // 3. HIT API GIMITA (Pake Bearer Token Kamu)
        const res = await axios.get(apiUrl, {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0NSwidXNlcm5hbWUiOiJJeXVzelRlbXBlc3QiLCJyb2xlIjoidXNlciIsInN1YnNjcmlwdGlvbl90aWVyIjoiZnJlZSIsImlzcyI6ImdpbWl0YS1hcGkiLCJleHAiOjE3NzA1OTU5NTgsImlhdCI6MTc3MDU5NTA1OH0.gdjq1WwN0HoT5z2B69l-bm7STLv-TE0MDv7vJC6r7Co'
            }
        });

        if (!res.data.success) throw new Error('API-nya lagi mogok kerja, coba lagi nanti.');

        const dlUrl = res.data.data.download_url;

        // 4. KIRIM SEBAGAI VIDEO
        await conn.sendMessage(m.chat, {
            video: { url: dlUrl },
            caption: `*––––––『 ⛩️ 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝙽𝙴 ⛩️ 』––––––*\n\n💠 *𝚃𝚒𝚝𝚕𝚎:* ${video.title}\n🕒 *𝙳𝚞𝚛𝚊𝚝𝚒𝚘𝚗:* ${video.timestamp}\n📊 *𝚀𝚞𝚊𝚕𝚒𝚝𝚢:* 360p\n\nSelamat menonton! 🌸`.trim(),
            fileName: `${video.title}.mp4`,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`*Gagal Download Video!* 🛠️\n\nLog: ${e.message}`);
    }
}

handler.help = ['playvid']
handler.tags = ['downloader']
handler.command = /^(playvid)$/i

module.exports = handler;
