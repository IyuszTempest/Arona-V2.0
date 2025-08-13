const axios = require('axios');

async function handler(m, { conn, text, command }) {
    if (!text) {
        return conn.reply(m.chat, `Masbro, mau tanya apa nih ke GPT-4?\nContoh: *${command} siapa presiden pertama indonesia?*`, m);
    }

    try {
        const apiUrl = `https://api.privatezia.biz.id/api/ai/GPT-4?query=${encodeURIComponent(text)}`;
        
        const { data } = await axios.get(apiUrl);

        if (data.status && data.response) {
            let captionText = `🤖 *GPT-4 Jawab:*\n\n${data.response}\n\n`;
            captionText += `_Model: ${data.model || 'Tidak Diketahui'}_`;

            // --- Bagian yang ditambahkan ---
            const customImageUrl = 'https://telegra.ph/file/a6a4fa97a0c0044b89a7b.jpg'; 
            const titleForAdReply = "ChatGPT4"; 
            const sourceUrlForAdReply = 'https://api.privatezia.biz.id'; 

            await conn.relayMessage(m.chat, {
                extendedTextMessage: {
                    text: captionText,
                    contextInfo: {
                        externalAdReply: {
                            title: titleForAdReply,
                            mediaType: 1, // 1 = gambar, 2 = video
                            previewType: 0, // 0 = thumbnail default, 1 = thumbnail video
                            renderLargerThumbnail: true,
                            thumbnailUrl: customImageUrl, 
                            sourceUrl: sourceUrlForAdReply
                        }
                    }
                }
            }, { quoted: m });
            // --- Akhir bagian yang ditambahkan ---

        } else {
            await conn.reply(m.chat, 'Aduh, GPT-4 kayaknya lagi sibuk atau ada masalah nih. Responnya nggak valid.', m);
            console.error('API GPT-4 response invalid:', data);
        }

    } catch (e) {
        console.error('Error in GPT-4 plugin handler:', e);
        await conn.reply(m.chat, `Maaf masbro, ada error nih pas nyambung ke GPT-4: ${e.message}. Coba lagi nanti ya.`, m);
    }
}

handler.help = ['gpt4 <pertanyaan>'];
handler.tags = ['ai'];
handler.command = /^(gpt4|ai|askgpt)$/i;

module.exports = handler;