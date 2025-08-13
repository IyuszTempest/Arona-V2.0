/**
 * @ ✨ AI Video Generator
 * @ Source: Based on your provided code for Pastebin content
 * @ Description: Plugin ini membuat video AI berdasarkan prompt teks.
 **/

const axios = require('axios'); // Menggunakan require untuk CommonJS

// --- Handler Plugin Bot ---
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 
            `📝 *Senpai*, masukkan prompt untuk membuat video!
            \nContoh: *${usedPrefix + command}* Cute Antro Furry Cub`, m
        );
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        // URL API untuk generate video dari prompt
        const apiUrl = `https://api.fasturl.link/aiimage/meta?prompt=${encodeURIComponent(text)}&mode=animated`;
        
        const { data } = await axios.get(apiUrl);

        // Cek status dan hasil dari API
        if (data.status !== 200 || !data.result?.animated_media?.length) {
            throw new Error('Video tidak tersedia untuk prompt ini atau API mengembalikan respons tidak valid.');
        }

        const videoUrl = data.result.animated_media[0].url.trim();
        
        let caption = `🎥 *Hasil Video AI* 🎥\n`;
        caption += `📘 *Prompt:* ${text}`;
        
        // Kirim video hasil generate
        await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: caption }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "✨", key: m.key } });

    } catch (e) {
        console.error('Error generating AI Video:', e); // Log error lebih detail
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        await conn.reply(m.chat, 
            `⚠️ *Ups, gagal membuat video, Senpai!*
            \n${e.message || 'Fitur ini sedang gangguan, coba lagi nanti ya 😅'}
            \nCoba dengan prompt yang berbeda atau ulangi beberapa saat lagi.`, m
        );
    }
};

// --- Export Plugin (CommonJS) ---
handler.help = ['prompttovideo <prompt>', 'prompt2video <prompt>', 'texttovideo <prompt>', 'text2video <prompt>'];
handler.tags = ['ai','premium'];
handler.premium = true;
handler.command = /^(prompttovideo|prompt2video|texttovideo|text2video)$/i;
handler.register = true;
handler.limit = true;

module.exports = handler;