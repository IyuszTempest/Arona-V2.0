/**
 * @ ✨ Scrape Voice Changer HololiveID (RVC) Plugin
 * @ Base: https://kit-lemonfoot-vtuber-rvc-models.hf.space/
 * @ Description: Plugin ini menggabungkan kelas RVCHoloID untuk voice changer
 * dan handler bot untuk mengubah suara audio/voice note.
 **/

const axios = require('axios');
const FormData = require('form-data');
const { readFileSync } = require('fs'); // Tambahin buat baca file, kalau-kalau perlu

// --- Kelas RVCHoloID (Sudah Termasuk di Sini) ---
class RVCHoloID {
    constructor() {
        this.api_url = 'https://kit-lemonfoot-vtuber-rvc-models.hf.space';
        this.file_url = 'https://kit-lemonfoot-vtuber-rvc-models.hf.space/file=';
        this.models = {
            moona: {
                fn: 44,
                file: ['Moona Hoshinova', 'weights/hololive-id/Moona/Moona_Megaaziib.pth', 'weights/hololive-id/Moona/added_IVF1259_Flat_nprobe_1_v2_mbkm.index', '']
            },
            lofi: {
                fn: 45,
                file: ['Airani Iofifteen', 'weights/hololive-id/Iofi/Iofi_KitLemonfoot.pth', 'weights/hololive-id/Iofi/added_IVF256_Flat_nprobe_1_AiraniIofifteen_Speaking_V2_v2.index', '']
            },
            risu: {
                fn: 46,
                file: ['Ayunda Risu', 'weights/hololive-id/Risu/Risu_Megaaziib.pth', 'weights/hololive-id/Risu/added_IVF2090_Flat_nprobe_1_v2_mbkm.index', '']
            },
            ollie: {
                fn: 47,
                file: ['Kureiji Ollie', 'weights/hololive-id/Ollie/Ollie_Dacoolkid.pth', 'weights/hololive-id/Ollie/added_IVF2227_Flat_nprobe_1_ollie_v2_mbkm.index', '']
            },
            anya: {
                fn: 48,
                file: ['Anya Melfissa', 'weights/hololive-id/Anya/Anya_Megaaziib.pth', 'weights/hololive-id/Anya/added_IVF910_Flat_nprobe_1_anyav2_v2_mbkm.index', '']
            },
            reine: {
                fn: 49,
                file: ['Pavolia Reine', 'weights/hololive-id/Reine/Reine_KitLemonfoot.pth', 'weights/hololive-id/Reine/added_IVF256_Flat_nprobe_1_PavoliaReine_Speaking_KitLemonfoot_v2.index', '']
            },
            zeta: {
                fn: 50,
                file: ['Vestia Zeta', 'weights/hololive-id/Zeta/Zeta_Megaaziib.pth', 'weights/hololive-id/Zeta/added_IVF462_Flat_nprobe_1_zetav2_v2.index', '']
            },
            kaela: {
                fn: 51,
                file: ['Kaela Kovalskia', 'weights/hololive-id/Kaela/Kaela_Megaaziib.pth', 'weights/hololive-id/Kaela/added_IVF265_Flat_nprobe_1_kaelaV2_v2.index', '']
            },
            kobo: {
                fn: 52,
                file: ['Kobo Kanaeru', 'weights/hololive-id/Kobo/Kobo_Megaaziib.pth', 'weights/hololive-id/Kobo/added_IVF454_Flat_nprobe_1_kobov2_v2.index', '']
            }
        };
    }
    
    generateSession() {
        return Math.random().toString(36).substring(2);
    }
    
    async upload(buffer) {
        try {
            if (!Buffer.isBuffer(buffer)) {
                throw new Error('Input must be an audio buffer.');
            }
            const upload_id = this.generateSession();
            const orig_name = `audio_${Date.now()}.mp3`; // Changed name for clarity
            const form = new FormData();
            form.append('files', buffer, orig_name);
            
            const { data } = await axios.post(`${this.api_url}/upload?upload_id=${upload_id}`, form, {
                headers: {
                    ...form.getHeaders(),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            
            if (!data || !Array.isArray(data) || data.length === 0) {
                throw new Error('Upload failed: No data received from server.');
            }
            
            return {
                orig_name,
                path: data[0],
                url: `${this.file_url}${data[0]}`
            };
        } catch (error) {
            console.error('Error during upload:', error.message);
            throw new Error(`Failed to upload audio: ${error.message}`);
        }
    }
    
    async process(buffer, options = {}) {
        try {
            const {
                model = 'moona',
                transpose = 0
            } = options;
            
            if (!Buffer.isBuffer(buffer)) {
                throw new Error('Audio buffer is required for processing.');
            }
            if (!Object.keys(this.models).includes(model)) {
                throw new Error(`Model '${model}' not found. Available models: ${Object.keys(this.models).join(', ')}`);
            }
            
            const audio_upload_info = await this.upload(buffer);
            const session_hash = this.generateSession();

            const payload = {
                data: [
                    ...this.models[model].file,
                    {
                        path: audio_upload_info.path,
                        url: audio_upload_info.url,
                        orig_name: audio_upload_info.orig_name,
                        size: buffer.length,
                        mime_type: 'audio/mpeg',
                        meta: {
                            _type: 'gradio.FileData'
                        }
                    },
                    '',
                    'English-Ana (Female)',
                    transpose,
                    'pm',
                    0.4,
                    1,
                    0,
                    1,
                    0.23
                ],
                event_data: null,
                fn_index: this.models[model].fn,
                trigger_id: 620,
                session_hash: session_hash
            };
            
            await axios.post(`${this.api_url}/queue/join?`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            
            let result_url = null;
            let polling_attempts = 0;
            const max_polling_attempts = 30;
            const polling_interval = 2000;

            while (result_url === null && polling_attempts < max_polling_attempts) {
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
                            if (d.msg === 'process_completed' && d.output && d.output.data && d.output.data[1] && d.output.data[1].url) {
                                result_url = d.output.data[1].url;
                                break;
                            }
                        } catch (parseError) {
                            console.warn('Warning: Could not parse line data or incomplete data received:', line, parseError.message);
                        }
                    }
                }
                
                if (result_url === null) {
                    polling_attempts++;
                    await new Promise(resolve => setTimeout(resolve, polling_interval));
                }
            }

            if (!result_url) {
                throw new Error('Failed to get result URL after multiple attempts. The process might have timed out or failed on the server.');
            }
            
            return result_url;
        } catch (error) {
            console.error('Error during processing:', error.message);
            throw new Error(`Failed to process audio: ${error.message}`);
        }
    }
}

// --- Handler Plugin Bot ---
async function handler(m, { conn, text, command }) { // Tambahkan 'text' dan 'command' sebagai argumen yang umum di handler bot
    const rvc = new RVCHoloID();
    const availableModels = Object.keys(rvc.models).join(', ');

    if (!m.quoted) {
        return conn.reply(m.chat, `Masbro, reply (balas) voice note atau audio yang mau diubah suaranya ya. 
        \nContoh: *${command} kobo 5* (model Kobo, transpose 5 semitone)
        \nModel yang tersedia: ${availableModels}`, m);
    }

    if (!m.quoted.fileSha256) { // Pastikan yang direply itu file (voice note/audio)
         return conn.reply(m.chat, 'Yang kamu balas bukan audio/voice note masbro.', m);
    }

    // Mendapatkan buffer audio dari pesan yang di-reply
    let buffer;
    try {
        buffer = await m.quoted.download();
    } catch (e) {
        console.error('Error downloading quoted message:', e);
        return conn.reply(m.chat, 'Gagal mengunduh audio. Pastikan ukurannya tidak terlalu besar atau formatnya didukung.', m);
    }

    // Parsing argumen untuk model dan transpose
    let model = 'kobo'; // Default model Kobo
    let transpose = 0; // Default transpose 0

    if (text) {
        const args = text.split(' ');
        if (args[0] && rvc.models[args[0].toLowerCase()]) {
            model = args[0].toLowerCase();
        }
        if (args[1] && !isNaN(parseInt(args[1]))) {
            transpose = parseInt(args[1]);
        }
    }

    if (!rvc.models[model]) {
        return conn.reply(m.chat, `Model *${model}* tidak ditemukan. Model yang tersedia: ${availableModels}`, m);
    }

    try {
        await conn.reply(m.chat, `Oke masbro, lagi proses ubah suara ke model *${model}* dengan transpose *${transpose}*. Mohon tunggu sebentar ya...`, m);
        
        const resultUrl = await rvc.process(buffer, { model, transpose });
        
        // Kirim hasil audio
        await conn.sendMessage(m.chat, { 
            audio: { url: resultUrl }, 
            mimetype: 'audio/mp4', // Umumnya hasil dari RVC itu mp4 atau m4a
            fileName: `${model}_voice.mp4`,
            ptt: true // Ini untuk kirim sebagai voice note
        }, { quoted: m });
        
        await conn.reply(m.chat, `Berhasil masbro! Ini suara ${model} kamu.`, m);

    } catch (error) {
        console.error('Error saat proses voice change:', error);
        await conn.reply(m.chat, `Wah, gagal ubah suara nih masbro. Error: ${error.message}. Coba lagi nanti ya.`, m);
    }
}

handler.help = ['vnhololive [model] [transpose]'];
handler.tags = ['tools', 'ai','premium']; 
handler.premium = true;
handler.command = /^(rvc|vnholo|vnhololive)$/i;

module.exports = handler;
