const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*– Contoh:* ${usedPrefix + command} https://www.youtube.com/watch?v=K4xLi8IF1FM`
    
    if (!text.includes('youtu')) throw 'Masukkan link YouTube yang bener dong!'

    await conn.sendMessage(m.chat, { react: { text: '🎞️', key: m.key } });

    try {
        const apiUrl = `https://api.gimita.id/api/downloader/ytmp4?resolution=720&url=${encodeURIComponent(text)}`;
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0NSwidXNlcm5hbWUiOiJJeXVzelRlbXBlc3QiLCJyb2xlIjoidXNlciIsInN1YnNjcmlwdGlvbl90aWVyIjoiZnJlZSIsImlzcyI6ImdpbWl0YS1hcGkiLCJleHAiOjE3NzA1OTU5NTgsImlhdCI6MTc3MDU5NTA1OH0.gdjq1WwN0HoT5z2B69l-bm7STLv-TE0MDv7vJC6r7Co';

        const res = await axios.get(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.data.success) throw new Error('API sedang bermasalah.');

        const { download_url, title } = res.data.data;

        await conn.sendMessage(m.chat, {
            video: { url: download_url },
            caption: `*––––『 ⛩️ 𝚈𝚃𝙼𝙿𝟺 𝙳𝙾𝙽𝙴 ⛩️ 』––––*\n\n💠 *𝚃𝚒𝚝𝚕𝚎:* ${title}\n📊 *𝚀𝚞𝚊𝚕𝚒𝚝𝚢:* 720p\n\nSelamat menikmati videonya! 🌸`,
            fileName: `${title}.mp4`,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        m.reply(`*Gagal ambil Video!* ❌\n\nLog: ${e.message}`);
    }
}

handler.help = ['ytmp4']
handler.tags = ['downloader']
handler.command = /^(ytmp4|ytv)$/i
handler.premium = true

module.exports = handler;
