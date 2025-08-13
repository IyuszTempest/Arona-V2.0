/**
    @ ✨ Scrape Chat AI
    @ Base: https://play.google.com/store/apps/details?id=com.appzone.chatbotai
**/

const axios = require('axios'); // Menggunakan require untuk CommonJS

async function chatai(question, { system_prompt = null, model = 'grok-3-mini' } = {}) {
    try {
        const _model = ['gpt-4.1-nano', 'gpt-4.1-mini', 'gpt-4.1', 'o4-mini', 'deepseek-r1', 'deepseek-v3', 'claude-3.7', 'gemini-2.0', 'grok-3-mini', 'qwen-qwq-32b', 'gpt-4o', 'o3', 'gpt-4o-mini', 'llama-3.3'];
        
        if (!question) throw new Error('Question is required');
        if (!_model.includes(model)) throw new Error(`Available models: ${_model.join(', ')}`);
        
        const response = await axios.post('https://api.appzone.tech/v1/chat/completions', {
            messages: [
                ...(system_prompt ? [{
                    role: 'system',
                    content: [
                        {
                            type: 'text',
                            text: system_prompt
                        }
                    ]
                }] : []),
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: question
                        }
                    ]
                }
            ],
            model: model,
            isSubscribed: true // Ini mungkin perlu diganti jika bukan akun subscribe
        }, {
            headers: {
                authorization: 'Bearer az-chatai-key', // Hardcoded key dari aplikasi
                'content-type': 'application/json',
                'user-agent': 'okhttp/4.9.2',
                'x-app-version': '3.0',
                'x-requested-with': 'XMLHttpRequest',
                'x-user-id': '$RCAnonymousID:84947a7a4141450385bfd07a66c3b5c4' // Hardcoded user ID
            },
            responseType: 'text' // Penting untuk menerima sebagai teks agar bisa di-split
        });
        
        let fullText = '';
        // Memastikan `data` adalah string sebelum di-split
        const lines = String(response.data).split('\n\n').map(line => line.substring(6));
        for (const line of lines) {
            if (line === '[DONE]') continue;
            try {
                const d = JSON.parse(line);
                if (d.choices && d.choices[0] && d.choices[0].delta && d.choices[0].delta.content) {
                    fullText += d.choices[0].delta.content;
                }
            } catch (e) {
                // console.error("Error parsing line:", e);
            }
        }
        
        const thinkMatch = fullText.match(/<think>([\s\S]*?)<\/think>/);
        return {
            think: thinkMatch ? thinkMatch[1].trim() : '',
            response: fullText.replace(/<think>[\s\S]*?<\/think>/, '').trim()
        };
    } catch (error) {
        // Cek jika error dari axios response (status code bukan 2xx)
        if (error.response && error.response.data) {
            console.error('API Error Response:', error.response.data);
            throw new Error(`API Error: ${error.response.data.message || error.response.statusText}`);
        }
        console.error('Error in chatai function:', error.message);
        throw new Error(`Terjadi kesalahan: ${error.message}`);
    }
}

// --- Handler Plugin Bot ---
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Definisi fkontak di sini untuk plugin ini
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    const availableModels = ['gpt-4.1-nano', 'gpt-4.1-mini', 'gpt-4.1', 'o4-mini', 'deepseek-r1', 'deepseek-v3', 'claude-3.7', 'gemini-2.0', 'grok-3-mini', 'qwen-qwq-32b', 'gpt-4o', 'o3', 'gpt-4o-mini', 'llama-3.3'];

    if (!text) {
        let exampleText = `Mau ngobrol apa, masbro? Contoh: *${usedPrefix + command}* siapa kamu?\n\n` +
                          `Format lengkap: *${usedPrefix + command}* <pertanyaan>|model|<system_prompt>\n` +
                          `Model yang tersedia: ${availableModels.join(', ')}\n\n` +
                          `*Contoh:* \n` +
                          `  *${usedPrefix + command}* ceritakan dongeng|deepseek-v3\n` +
                          `  *${usedPrefix + command}* berikan resep rendang|grok-3-mini|Kamu adalah koki terkenal`;
        return conn.reply(m.chat, exampleText, fkontak);
    }

    const args = text.split('|').map(arg => arg.trim());
    const question = args[0];
    const model = args[1] || 'grok-3-mini';
    const system_prompt = args[2] || null;

    if (!question) {
        return conn.reply(m.chat, "Pertanyaan tidak boleh kosong, masbro!", fkontak);
    }

    if (!availableModels.includes(model)) {
        return conn.reply(m.chat, `Model *${model}* tidak didukung. Pilih salah satu: ${availableModels.join(', ')}`, fkontak);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } }); // Reaksi menunggu

        const result = await chatai(question, { system_prompt, model });

        let responseText = result.response;
        if (result.think) {
            responseText = `_Berpikir: ${result.think}_\n\n` + responseText;
        }

        if (responseText) {
            await conn.reply(m.chat, responseText, fkontak);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            throw new Error('Tidak ada respons dari AI.');
        }

    } catch (e) {
        console.error('Error di plugin Chat AI:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat berkomunikasi dengan AI: ${e.message}.`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    }
};

handler.help = ['chatai <pertanyaan>', 'chatai <pertanyaan>|model|<system_prompt>'];
handler.tags = ['ai'];
handler.command = /^(chatai|chatbotai|askai)$/i;
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;
