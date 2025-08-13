/*
• Scrape Ai Code Generator
• Source: https://whatsapp.com/channel/0029Vb2XqiZBA1evs9OZMa36
*/
const axios = require('axios'); // Menggunakan require untuk CommonJS

const supportedLanguages = [
    'JavaScript', 'C#', 'C++', 'Java', 'Ruby', 'Go', 'Python', 'Custom'
];
const supportedModels = [
    'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo',
    'claude-3-opus', 'claude-3-5-sonnet'
];

async function generateCode(prompt, language = 'JavaScript', model = 'gpt-4o-mini') {
    if (!supportedLanguages.includes(language)) {
        return {
            status: false,
            error: `Bahasa ga ada. Gunakan salah satu: ${supportedLanguages.join(', ')}`
        };
    }
    if (!supportedModels.includes(model)) {
        return {
            status: false,
            error: `Model AI ga ada. Pilih salah satu: ${supportedModels.join(', ')}`
        };
    }

    const finalPrompt = language === 'Custom'
        ? prompt
        : `Tulis kode dalam bahasa ${language} untuk: ${prompt}`;

    try {
        const response = await axios.post(
            'https://best-ai-code-generator.toolzflow.app/api/chat/public',
            {
                chatSettings: {
                    model: model,
                    temperature: 0.3,
                    contextLength: 16385,
                    includeProfileContext: false,
                    includeWorkspaceInstructions: false,
                    includeExampleMessages: false
                },
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that writes code in requested language.'
                    },
                    {
                        role: 'user',
                        content: finalPrompt
                    }
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'code_response',
                        strict: true,
                        schema: {
                            type: 'object',
                            properties: {
                                code: { type: 'string', description: 'Generated code' }
                            },
                            required: ['code']
                        }
                    }
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://best-ai-code-generator.toolzflow.app',
                    'Referer': 'https://best-ai-code-generator.toolzflow.app/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                    'Accept': '*/*'
                }
            }
        );

        const rawCode = response.data?.code || '';
        const formattedCode = rawCode
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"');

        return {
            status: true,
            code: formattedCode.trim() || 'ga ada kode yang dihasilkan.'
        };
    } catch (e) {
        return {
            status: false,
            error: `Request gagal: ${e.message}`
        };
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

    if (!text) {
        let exampleText = `Gunakan format: ${usedPrefix + command} <prompt>|<bahasa>|<model>\n\n` +
                          `*Prompt:* Deskripsi kode yang diinginkan.\n` +
                          `*Bahasa (opsional):* ${supportedLanguages.join(', ')} (default: JavaScript).\n` +
                          `*Model (opsional):* ${supportedModels.join(', ')} (default: gpt-4o-mini).\n\n` +
                          `*Contoh:* ${usedPrefix + command} buat fungsi untuk menghitung faktorial|Python|claude-3-5-sonnet`;
        return conn.reply(m.chat, exampleText, fkontak);
    }

    const args = text.split('|').map(arg => arg.trim());
    const prompt = args[0];
    const language = args[1] || 'JavaScript';
    const model = args[2] || 'gpt-4o-mini';

    if (!prompt) {
        return conn.reply(m.chat, "Prompt tidak boleh kosong, masbro!", fkontak);
    }

    // Validasi bahasa dan model sebelum memanggil generateCode
    if (!supportedLanguages.includes(language)) {
        return conn.reply(m.chat, `Bahasa tidak didukung. Gunakan salah satu: ${supportedLanguages.join(', ')}`, fkontak);
    }
    if (!supportedModels.includes(model)) {
        return conn.reply(m.chat, `Model AI tidak didukung. Pilih salah satu: ${supportedModels.join(', ')}`, fkontak);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } }); // Reaksi menunggu

        const result = await generateCode(prompt, language, model);

        if (result.status) {
            await conn.reply(m.chat, `Ini kodenya, masbro:\n\`\`\`${result.code}\`\`\``, fkontak);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } }); // Reaksi berhasil
        } else {
            await conn.reply(m.chat, `Gagal membuat kode: ${result.error}`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }); // Reaksi gagal
        }
    } catch (e) {
        console.error('Error in AI Code Generator:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat memproses permintaan: ${e.message}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }); // Reaksi error
    }
};

handler.help = ['codeai <prompt>|<lang>|<model>'];
handler.tags = ['ai', 'premium'];
handler.command = /^(generatecode|codeai)$/i;
handler.limit = true;
handler.premium = true;

module.exports = handler;
