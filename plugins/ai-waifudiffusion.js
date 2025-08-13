/**
    @ ✨ Scrape WaifuDiffusion Tagger (Char Detector)
    @ Base: https://smilingwolf-wd-tagger.hf.space/
    @ Source: https://whatsapp.com/channel/0029VaAMjXT4yltWm1NBJV3J
**/

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs'); // Tambahkan fs untuk baca file lokal (jika perlu)

class WaifuTagger {
    constructor() {
        this.api_url = 'https://smilingwolf-wd-tagger.hf.space/gradio_api';
        this.file_url = 'https://smilingwolf-wd-tagger.hf.space/gradio_api/file=';
    }
    
    generateSession() {
        return Math.random().toString(36).substring(2);
    }
    
    async upload(buffer) {
        try {
            if (!Buffer.isBuffer(buffer)) {
                throw new Error('Input harus berupa buffer gambar.');
            }
            const upload_id = this.generateSession();
            const orig_name = `image_${Date.now()}.jpg`; // Ubah nama biar lebih jelas
            const form = new FormData();
            form.append('files', buffer, orig_name);

            const { data } = await axios.post(`${this.api_url}/upload?upload_id=${upload_id}`, form, {
                headers: {
                    ...form.getHeaders(),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' // Tambahkan User-Agent
                }
            });
            
            if (!data || !Array.isArray(data) || data.length === 0) {
                throw new Error('Upload gagal: Tidak ada data diterima dari server.');
            }

            return {
                orig_name,
                path: data[0],
                url: `${this.file_url}${data[0]}`
            };
        } catch (error) {
            console.error('Error saat upload gambar:', error.message);
            throw new Error(`Gagal mengunggah gambar: ${error.message}`);
        }
    }
    
    async process(buffer, options = {}) {
        try {
            const {
                model = 'SmilingWolf/wd-swinv2-tagger-v3',
                general_tags_threshold = 0.35,
                general_mcut_threshold = false,
                char_tags_threshold = 0.85,
                char_mcut_threshold = false
            } = options;
            
            const _model = ['deepghs/idolsankaku-eva02-large-tagger-v1', 'deepghs/idolsankaku-swinv2-tagger-v1', 'SmilingWolf/wd-convnext-tagger-v3', 'SmilingWolf/wd-eva02-large-tagger-v3', 'SmilingWolf/wd-swinv2-tagger-v3', 'SmilingWolf/wd-v1-4-convnext-tagger-v2', 'SmilingWolf/wd-v1-4-convnextv2-tagger-v2', 'SmilingWolf/wd-v1-4-moat-tagger-v2', 'SmilingWolf/wd-v1-4-swinv2-tagger-v2', 'SmilingWolf/wd-v1-4-vit-tagger-v2', 'SmilingWolf/wd-vit-large-tagger-v3', 'SmilingWolf/wd-vit-tagger-v3'];
            
            if (!Buffer.isBuffer(buffer)) throw new Error('Image buffer is required');
            if (!_model.includes(model)) throw new Error(`Model tidak valid. Model yang tersedia: ${_model.join(', ')}`);
            if (general_tags_threshold < 0 || general_tags_threshold > 1 || char_tags_threshold < 0 || char_tags_threshold > 1) throw new Error('Threshold harus antara 0 dan 1.');
            if (typeof general_mcut_threshold !== 'boolean' || typeof char_mcut_threshold !== 'boolean') throw new Error('Mcut threshold harus boolean (true/false)');
            
            const image_upload_info = await this.upload(buffer);
            const session_hash = this.generateSession();

            const payload = {
                data: [
                    {
                        path: image_upload_info.path,
                        url: image_upload_info.url,
                        orig_name: image_upload_info.orig_name,
                        size: buffer.length,
                        mime_type: 'image/jpeg', // Asumsi input selalu jpeg/valid
                        meta: {
                            _type: 'gradio.FileData'
                        }
                    },
                    model,
                    general_tags_threshold,
                    general_mcut_threshold,
                    char_tags_threshold,
                    char_mcut_threshold
                ],
                event_data: null,
                fn_index: 2, // Ini bisa berubah kalo UI di webnya berubah
                trigger_id: 18, // Ini juga bisa berubah
                session_hash: session_hash
            };
            
            // Request untuk memulai proses tagging
            await axios.post(`${this.api_url}/queue/join?`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            
            let result_data;
            let polling_attempts = 0;
            const max_polling_attempts = 60; // Batasi jumlah polling (misal 1 menit)
            const polling_interval = 1000; // Interval polling 1 detik

            // Polling untuk mendapatkan hasil
            while (!result_data && polling_attempts < max_polling_attempts) {
                const { data } = await axios.get(`${this.api_url}/queue/data?session_hash=${session_hash}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });
                
                const lines = data.split('\n\n');
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        try {
                            const d = JSON.parse(line.substring(6));
                            if (d.msg === 'process_completed') {
                                result_data = d.output.data;
                                break;
                            } else if (d.msg === 'process_starts' || d.msg === 'send_data') {
                                // Proses masih berjalan, lanjut polling
                            } else if (d.msg === 'queue_full' || d.msg === 'estimation' || d.msg === 'heartbeat') {
                                // Pesan status lain, abaikan
                            }
                        } catch (parseError) {
                            console.warn('Warning: Could not parse line data or incomplete data received:', line, parseError.message);
                        }
                    }
                }
                
                if (!result_data) {
                    polling_attempts++;
                    await new Promise(resolve => setTimeout(resolve, polling_interval));
                }
            }

            if (!result_data) {
                throw new Error('Gagal mendapatkan hasil setelah beberapa percobaan. Proses mungkin timeout atau gagal di server.');
            }
            
            return {
                prompt: result_data[0],
                rating: result_data[1]?.confidences || [],
                character: {
                    name: result_data[2]?.label,
                    confidences: result_data[2]?.confidences || []
                },
                tags: {
                    name: result_data[3]?.label,
                    confidences: result_data[3]?.confidences || []
                }
            };
        } catch (error) {
            console.error('Error saat proses tagging:', error.message);
            throw new Error(`Gagal memproses gambar: ${error.message}`);
        }
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

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
        return conn.reply(m.chat, `Reply gambar dengan caption ${usedPrefix + command} untuk mendeteksi karakter dan tag.`, fkontak);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } }); // Reaksi menunggu

        let buffer = await q.download(); // Download gambar yang di-reply

        const waifuTagger = new WaifuTagger();
        const result = await waifuTagger.process(buffer);

        let caption = `✨ *Waifu Tagger Result* ✨\n\n`;
        caption += `📝 *Prompt:* \n\`\`\`${result.prompt}\`\`\`\n\n`;

        if (result.character && result.character.name) {
            caption += `👩‍💻 *Karakter:* ${result.character.name}\n`;
            if (result.character.confidences && result.character.confidences.length > 0) {
                caption += `  (Kepercayaan: ${Math.round(result.character.confidences[0].confidence * 100)}%)\n`;
            }
        } else {
            caption += `👩‍💻 *Karakter:* Tidak terdeteksi\n`;
        }
        
        if (result.rating && result.rating.length > 0) {
            caption += `🌟 *Rating:* \n`;
            result.rating.forEach(r => {
                caption += `  - ${r.label}: ${Math.round(r.confidence * 100)}%\n`;
            });
        }

        if (result.tags && result.tags.name) {
            const tagsArray = result.tags.name.split(', ');
            caption += `\n🏷️ *Tags:* \n`;
            tagsArray.forEach(tag => {
                caption += `  - ${tag}\n`;
            });
            // Jika mau menampilkan kepercayaan per tag, perlu looping confidences dan label yang cocok
        }

        await conn.sendMessage(m.chat, { text: caption }, { quoted: fkontak }); // Pakai fkontak sebagai quoted

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } }); // Reaksi berhasil

    } catch (e) {
        console.error('Error in Waifu Tagger Plugin:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat memproses gambar: ${e.message}.`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }); // Reaksi error
    }
};

handler.help = ['waifutag', 'wdtag'];
handler.tags = ['ai', 'image'];
handler.command = /^(waifutag|wdtag|chardetect)$/i;
handler.limit = true; // Tambahkan jika perlu limitasi
handler.premium = false; // Ganti jadi true jika command premium

module.exports = handler;
