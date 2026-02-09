const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*– Contoh:* ${usedPrefix + command} https://www.youtube.com/watch?v=K4xLi8IF1FM`
    
    // Validasi link YouTube sederhana
    if (!text.includes('youtu')) throw 'Itu bukan link YouTube yang valid!'

    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } });

    try {
        const apiUrl = `https://api.gimita.id/api/downloader/ytmp4?resolution=360&url=${encodeURIComponent(text)}`;
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0NSwidXNlcm5hbWUiOiJJeXVzelRlbXBlc3QiLCJyb2xlIjoidXNlciIsInN1YnNjcmlwdGlvbl90aWVyIjoiZnJlZSIsImlzcyI6ImdpbWl0YS1hcGkiLCJleHAiOjE3NzA1OTU5NTgsImlhdCI6MTc3MDU5NTA1OH0.gdjq1WwN0HoT5z2B69l-bm7STLv-TE0MDv7vJC6r7Co';

        const res = await axios.get(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.data.success) throw new Error('API sedang bermasalah.');

        const { download_url, title, thumbnail } = res.data.data;

        await conn.sendMessage(m.chat, {
            audio: { url: download_url },
            mimetype: 'audio/mp4',
            fileName: `${title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: `YTMP3 Downloader - Manual Link`,
                    thumbnailUrl: thumbnail,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        m.reply(`*Gagal ambil Audio!* ❌\n\nLog: ${e.message}`);
    }
}

handler.help = ['ytmp3']
handler.tags = ['downloader']
handler.command = /^(ytmp3)$/i
