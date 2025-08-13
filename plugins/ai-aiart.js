/**
  @ 🍀 AI Art Generator
  @ 🍀 Source: https://whatsapp.com/channel/0029VbBDTFd6mYPDtnetTK1f
  @ 🍀 Scrape: https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/210
**/

const axios = require('axios'); // Menggunakan require untuk CommonJS
const { v4: uuidv4 } = require('uuid'); // Menggunakan require untuk CommonJS

// Konfigurasi untuk model, rasio, dan gaya AI Art
const conf = {
    models: {
        flux: 'flux_text2img',
        artist: 'text2img_artist',
        anime: 'text2img_anime',
        realistic: 'text2img_real',
        realistic_v2: 'text2img_real_v2'
    },
    ratios: {
        '1:1': { width: 1024, height: 1024 },
        '3:4': { width: 864, height: 1152 },
        '4:3': { width: 1152, height: 864 },
        '4:5': { width: 921, height: 1152 },
        '5:4': { width: 1152, height: 921 },
        '9:16': { width: 756, height: 1344 },
        '16:9': { width: 1344, height: 756 }
    },
    flux_styles: ['general', 'anime', 'fantasy_art', 'line_art', 'photograph', 'comic'],
    styles: ['general', 'anime', 'ghibli', 'fantasy_art', 'line_art', 'photograph', 'comic']
};

/**
 * Fungsi untuk memanggil API AI Art Generator.
 * @param {string} prompt - Deskripsi gambar yang ingin dibuat.
 * @param {object} options - Opsi konfigurasi.
 * @param {string} [options.base_model='flux'] - Model AI yang akan digunakan (misal: 'flux', 'anime').
 * @param {string} [options.style='anime'] - Gaya gambar (misal: 'general', 'ghibli', 'photograph').
 * @param {string} [options.ratio='1:1'] - Rasio aspek gambar (misal: '16:9', '1:1').
 * @returns {Promise<string>} URL gambar hasil generate.
 */
const aiart = async (prompt, { base_model = 'flux', style = 'anime', ratio = '1:1' } = {}) => {
    try {
        if (!prompt) throw new Error('Prompt diperlukan.');
        if (!Object.keys(conf.models).includes(base_model)) throw new Error(`Model tidak valid. Model yang tersedia: ${Object.keys(conf.models).join(', ')}`);
        
        // Cek gaya berdasarkan model yang dipilih
        if (base_model === 'flux' && !conf.flux_styles.includes(style)) throw new Error(`Gaya '${style}' tidak tersedia untuk model *${base_model}*. Gaya yang tersedia: ${conf.flux_styles.join(', ')}`);
        if (base_model !== 'flux' && !conf.styles.includes(style)) throw new Error(`Gaya '${style}' tidak tersedia untuk model *${base_model}*. Gaya yang tersedia: ${conf.styles.join(', ')}`);
        
        if (!Object.keys(conf.ratios).includes(ratio)) throw new Error(`Rasio tidak valid. Rasio yang tersedia: ${Object.keys(conf.ratios).join(', ')}`);
        
        const deviceId = uuidv4(); // Menggunakan deviceId yang konsisten untuk kedua request

        // Request pertama untuk mendapatkan konfigurasi (walaupun di kode asli params nya kosong, ini untuk jaga-jaga)
        // Perlu diperhatikan bahwa API ini bisa berubah, jadi mungkin request config ini tidak selalu diperlukan
        await axios.get('https://api-cdn.aiartgen.net/comfyapi/v4/config ', {
            params: {
                app_version_code: '469',
                app_version_name: '3.41.0',
                device_id: deviceId, // Gunakan deviceId yang sama
                ad_id: '',
                platform: 'android'
            },
            headers: {
                'accept-encoding': 'gzip',
                'content-type': 'application/json; charset=UTF-8',
                'user-agent': 'okhttp/4.12.0'
            }
        });
        
        // Request kedua untuk generate gambar
        const { data: responseData } = await axios.post('https://api-cdn.aiartgen.net/comfyapi/v4/prompt ', {
            batch_size: 1, // Jumlah gambar yang digenerate (default 1)
            diamond_remain: 3, // Tidak jelas fungsinya, mungkin terkait kuota
            height: conf.ratios[ratio].height,
            model_id: style, // Ini adalah ID gaya yang dipakai API
            prompt: prompt,
            prompt_translated: prompt, // Prompt yang diterjemahkan (bisa sama dengan prompt asli jika tidak ada terjemahan)
            ratio: ratio,
            width: conf.ratios[ratio].width,
            work_type: conf.models[base_model] // Model dasar yang dipakai
        }, {
            params: {
                app_version_code: '469',
                app_version_name: '3.41.0',
                device_id: deviceId, // Gunakan deviceId yang sama
                ad_id: uuidv4(), // ad_id bisa berbeda setiap request
                platform: 'android'
            },
            headers: {
                'accept-encoding': 'gzip',
                'content-type': 'application/json; charset=UTF-8',
                'user-agent': 'okhttp/4.12.0'
            }
        });
        
        // Cek jika API mengembalikan array gambar dan ambil yang pertama
        if (responseData && Array.isArray(responseData.images) && responseData.images.length > 0) {
            return responseData.images[0];
        } else {
            throw new Error('Tidak ada gambar yang dihasilkan atau format respons tidak valid.');
        }
    } catch (error) {
        console.error('Error in aiart function:', error.message);
        throw new Error(`Gagal generate gambar: ${error.message}`);
    }
};

// Handler utama untuk plugin bot
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Pesan instruksi jika tidak ada argumen
    if (!text) {
        let caption = `🎨 *AI Art Generator* 🎨\n`
        caption += `📘 *Usage:* *${usedPrefix + command}* <prompt>|<model>|<style>|<ratio>\n`
        caption += `\n*Penting:* Pastikan urutan parameter benar dan dipisahkan dengan '|' (pipe).\n`
        caption += `\n📌 *Daftar Pilihan:*\n`
        caption += `• *Model:* \`${Object.keys(conf.models).join('`, `')}\`\n`
        caption += `• *Gaya (Style):*\n`
        caption += `  - Untuk model 'flux': \`${conf.flux_styles.join('`, `')}\`\n`
        caption += `  - Untuk model lainnya: \`${conf.styles.join('`, `')}\`\n`
        caption += `• *Rasio (Ratio):* \`${Object.keys(conf.ratios).join('`, `')}\`\n`
        caption += `\n💡 *Contoh:* \n`
        caption += `  *${usedPrefix + command}* girl wearing glasses|anime|ghibli|16:9\n`
        caption += `  *${usedPrefix + command}* a cat in space|flux|photograph|1:1`
        
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, caption, m);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        const args = text.split('|').map(arg => arg.trim()); // Trim whitespace dari setiap argumen
        
        // Validasi jumlah argumen
        if (args.length !== 4) {
            throw new Error('Format command salah. Gunakan: prompt|model|style|ratio');
        }
        
        const [prompt, base_model, style, ratio] = args;
        
        // Panggil fungsi aiart untuk generate gambar
        const imageUrl = await aiart(prompt, { base_model, style, ratio });
        
        // Buat caption untuk gambar yang akan dikirim
        let caption = `✨ *AI Art Generator* ✨
╭ 📝 *Prompt:* ${prompt}
│ 🎨 *Model:* ${base_model}
│ 🖌️ *Style:* ${style}
│ 📐 *Rasio:* ${ratio}
╰ 🔗 *URL:* ${imageUrl}`
        
        // Kirim gambar dan caption
        await conn.sendMessage(m.chat, { image: { url: imageUrl }, caption: caption }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "✨", key: m.key } });

    } catch (e) {
        console.error('Error generating AI Art:', e); // Log error lebih detail
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        await conn.reply(m.chat, `⚠️ *Ups, terjadi kesalahan!* ${e.message || 'Fitur ini sedang gangguan, coba lagi nanti ya 😅'}\n\n*Tips:* Pastikan semua parameter (prompt, model, style, ratio) diisi dengan benar dan sesuai pilihan yang tersedia.`, m);
    }
};

// --- Export Plugin (CommonJS) ---
handler.help = ['aiart <prompt>|<model>|<style>|<ratio>'];
handler.tags = ['ai', 'image'];
handler.command = /^(aiart|genart|drawai)$/i;
handler.limit = true;

module.exports = handler;
