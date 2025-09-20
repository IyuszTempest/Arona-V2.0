const axios = require('axios');

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Masukkan prompt atau deskripsi gambar.\nContoh: .artai gadis anime lucu');

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        // Ganti ke API yang lebih stabil
        const url = `https://api.privatezia.biz.id/api/ai/ai4chat?query=${encodeURIComponent(text)}`;
        const { data } = await axios.get(url);

        if (!data.status || !data.result) {
            throw new Error('API tidak memberikan hasil gambar yang valid.');
        }

        await conn.sendMessage(m.chat, {
            image: { url: data.result },
            caption: `🖼️ *AI Art Result*\n\n*Prompt:* ${text}`
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error(err);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ Gagal memproses permintaan AI. Server API mungkin sedang bermasalah. Coba lagi nanti.\n\n*Error:* ${err.message}`);
    }
};
handler.help = ['aiart']
handler.tags = ['ai','image','premium']
handler.command = ['aiart']
handler.premium = true;
module.exports = handler
