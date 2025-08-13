/*
📌 Nama Fitur: Chat GPT 
🏷️ Type : Plugin CJS
🔗 Sumber Scrape: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
✍️ Convert By Gemini AI
*/

// Pastikan axios sudah terinstal: npm install axios
const axios = require('axios');

const handler = async (m, { text, command, prefix, conn }) => { // Pastikan 'conn' ada di argumen
    if (!text) {
        return m.reply(`Contoh: .ai Halo mas`);
    }

    // -- Pesan loading dihapus --

    const chatgpt4_config = {
        api: 'https://stablediffusion.fr/gpt4/predict2',
        referer: 'https://stablediffusion.fr/chatgpt4'
    };

    // === URL gambar yang lo kasih, Yus ===
    const customImageUrl = 'https://telegra.ph/file/a6a4fa97a0c0044b89a7b.jpg'; 
    // ===================================

    try {
        // Langkah 1: Ambil cookie dari referer (untuk chatgpt4)
        const refererResponse = await axios.get(chatgpt4_config.referer, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36'
            }
        });

        const cookies = refererResponse.headers['set-cookie'] ? refererResponse.headers['set-cookie'].join('; ') : '';

        // Langkah 2: Kirim POST request ke API GPT4
        const { data } = await axios.post(chatgpt4_config.api, {
            prompt: text
        }, {
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'Origin': 'https://stablediffusion.fr',
                'Referer': chatgpt4_config.referer,
                'Cookie': cookies,
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36'
            }
        });

        const resultText = data.message || 'Tidak ada jawaban dari ChatGPT4.';
        const captionText = `*ChatGPT4*:\n${resultText}`;

        // === Bagian untuk menampilkan gambar custom dengan conn.relayMessage ===
        // Cek apakah objek 'conn' tersedia sebelum digunakan
        if (!conn) {
            console.warn("⚠️ Objek 'conn' tidak ditemukan di handler. Mengirim hanya teks.");
            return m.reply(captionText); // Fallback ke reply teks biasa
        }

        try {
            // Gunakan judul sesuai konteks ChatGPT, bisa juga lo ganti
            const titleForAdReply = "ChatGPT4"; 
            const sourceUrlForAdReply = chatgpt4_config.referer; // Link ke halaman GPT4

            await conn.relayMessage(m.chat, {
                extendedTextMessage: {
                    text: captionText,
                    contextInfo: {
                        externalAdReply: {
                            title: titleForAdReply,
                            mediaType: 1, // 1 untuk gambar
                            previewType: 0, // 0 untuk gambar
                            renderLargerThumbnail: true,
                            thumbnailUrl: customImageUrl, // <<< INI YANG DIGANTI PAKE LINK DARI LO, YUS!
                            sourceUrl: sourceUrlForAdReply
                        }
                    }
                }
            }, { quoted: m }); // { quoted: m } ini biar pesan bot jadi reply ke pesan user

        } catch (e) {
            console.error("❌ Gagal mengirim pesan dengan gambar via conn.relayMessage:", e);
            // Kalau gagal kirim gambar, kirim teksnya aja sebagai fallback
            m.reply(captionText);
        }

    } catch (e) {
        // Tangani error jika gagal mengambil jawaban dari ChatGPT4
        console.error('❌ Terjadi kesalahan saat mengambil jawaban dari ChatGPT4:', e);
        if (e.response) {
            console.error(`Status: ${e.response.status}, Data:`, e.response.data);
        }
        m.reply('Terjadi kesalahan saat memproses permintaan.');
    }
};

handler.help = ['chatgpt <pertanyaan>'];
handler.tags = ['ai'];
handler.command = /^chatgpt$/i;

module.exports = handler;