/* Plugin: Y2Play V2 (API Edition)
   Source: api.gimita.id
   Feature: Search -> Get MP4 -> Send as Audio
*/

const axios = require('axios');
const ytSearch = require('yt-search');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*– Contoh:* ${usedPrefix + command} Kawaikute Gomen`
    
    await conn.sendMessage(m.chat, { react: { text: '🎐', key: m.key } });

    try {
        // 1. Search Video
        const search = await ytSearch(text);
        const video = search.videos[0];
        if (!video) return m.reply('Lagu nggak ketemu.');
        
        const apiUrl = `https://api.gimita.id/api/downloader/ytmp4?resolution=720&url=${encodeURIComponent(video.url)}`;
        
        // 2. Hit API Gimita (Pake Token Kamu)
        const res = await axios.get(apiUrl, {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0NSwidXNlcm5hbWUiOiJJeXVzelRlbXBlc3QiLCJyb2xlIjoidXNlciIsInN1YnNjcmlwdGlvbl90aWVyIjoiZnJlZSIsImlzcyI6ImdpbWl0YS1hcGkiLCJleHAiOjE3NzA1OTU5NTgsImlhdCI6MTc3MDU5NTA1OH0.gdjq1WwN0HoT5z2B69l-bm7STLv-TE0MDv7vJC6r7Co'
            }
        });

        if (!res.data.success) throw new Error('API lagi mogok kerja nih.');

        const dlUrl = res.data.data.download_url;

        // 3. Kirim sebagai Audio (Mimetype mp4 biar gampang diputer tapi dikirim sebagai audio)
        await conn.sendMessage(m.chat, {
            audio: { url: dlUrl },
            mimetype: 'audio/mp4', // Tetap bisa dibaca sebagai audio meski sumbernya mp4
            fileName: `${video.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: `Euphylia Mangeta`,
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        m.reply(`*Gagal Konversi!* ❌\n\nLog: ${e.message}`);
    }
}

handler.help = ['yplay2']
handler.tags = ['downloader']
handler.command = /^(yplay2|y2p2)$/i

module.exports = handler;
