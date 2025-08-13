const axios = require('axios');
const FormData = require('form-data'); // Menggunakan require untuk CommonJS

const styleMap = {
    photorealistic: 'photorealistic style image',
    cinematic: 'cinematic style image',
    hyperreal: 'hyperrealistic style image',
    portrait: 'portrait style image'
};
const resolutionMap = {
    '512x512': { width: 512, height: 512 },
    '768x768': { width: 768, height: 768 },
    '1024x1024': { width: 1024, height: 1024 },
    '1920x1080': { width: 1920, height: 1080 } // Resolusi ini besar, mungkin ada batasan di WhatsApp
};

async function RealisticImage({ prompt, style = 'photorealistic', resolution = '768x768', seed = null }) {
    const selectedStyle = styleMap[style.toLowerCase()];
    const selectedRes = resolutionMap[resolution];

    if (!selectedStyle) {
        throw new Error(`Style '${style}' tidak valid! Pilih salah satu: ${Object.keys(styleMap).join(', ')}`);
    }
    if (!selectedRes) {
        throw new Error(`Resolusi '${resolution}' tidak valid! Pilih salah satu: ${Object.keys(resolutionMap).join(', ')}`);
    }
    if (!prompt) {
        throw new Error('Prompt tidak boleh kosong!');
    }

    const fullPrompt = `${selectedStyle}: ${prompt}`;
    const form = new FormData();
    form.append('action', 'generate_realistic_ai_image');
    form.append('prompt', fullPrompt);
    form.append('seed', (seed || Math.floor(Math.random() * 100000)).toString()); // Gunakan seed random jika null
    form.append('width', selectedRes.width.toString());
    form.append('height', selectedRes.height.toString());

    try {
        const res = await axios.post('https://realisticaiimagegenerator.com/wp-admin/admin-ajax.php', form, {
            headers: {
                ...form.getHeaders(),
                'origin': 'https://realisticaiimagegenerator.com',
                'referer': 'https://realisticaiimagegenerator.com/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', // User-Agent yang lebih umum
                'accept': '*/*'
            }
        });
        const json = res.data;

        if (json?.success && json.data?.imageUrl) {
            return {
                success: true,
                url: json.data.imageUrl
            };
        } else {
            throw new Error(`Tidak ada hasil yang valid dari AI. Pesan: ${json?.data?.message || 'Tidak diketahui'}`);
        }
    } catch (e) {
        console.error('Error in RealisticImage scraper:', e.message);
        if (e.response && e.response.data) {
            console.error('API Response Data:', e.response.data);
        }
        throw new Error(`Gagal membuat gambar: ${e.message}`);
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

    const availableStyles = Object.keys(styleMap);
    const availableResolutions = Object.keys(resolutionMap);

    if (!text) {
        let exampleText = `Mau buat gambar AI realistis apa, masbro? Contoh: *${usedPrefix + command}* a girl sitting in a park\n\n` +
                          `Format lengkap: *${usedPrefix + command}* <prompt>|[style]|[resolution]|[seed_opsional]\n\n` +
                          `*Available Styles:* ${availableStyles.join(', ')} (default: photorealistic)\n` +
                          `*Available Resolutions:* ${availableResolutions.join(', ')} (default: 768x768)\n\n` +
                          `*Contoh:* \n` +
                          `  *${usedPrefix + command}* a man in a cyberpunk city|cinematic|1920x1080\n` +
                          `  *${usedPrefix + command}* a beautiful woman|portrait`;
        return conn.reply(m.chat, exampleText, fkontak);
    }

    const args = text.split('|').map(arg => arg.trim());
    const prompt = args[0];
    const style = args[1] || 'photorealistic';
    const resolution = args[2] || '768x768';
    const seed = args[3] ? parseInt(args[3]) : null;

    if (!prompt) {
        return conn.reply(m.chat, "Prompt tidak boleh kosong, masbro!", fkontak);
    }
    if (!availableStyles.includes(style.toLowerCase())) {
        return conn.reply(m.chat, `Style *${style}* tidak valid. Pilih salah satu: ${availableStyles.join(', ')}`, fkontak);
    }
    if (!availableResolutions.includes(resolution)) {
        return conn.reply(m.chat, `Resolusi *${resolution}* tidak valid. Pilih salah satu: ${availableResolutions.join(', ')}`, fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const result = await RealisticImage({ prompt, style, resolution, seed });

        if (result.success && result.url) {
            await conn.sendMessage(m.chat, {
                image: { url: result.url },
                caption: `✨ *Realistic AI Image Generated!* ✨\n\n` +
                         `*Prompt:* ${prompt}\n` +
                         `*Style:* ${style}\n` +
                         `*Resolusi:* ${resolution}\n` +
                         (seed ? `*Seed:* ${seed}\n` : '') +
                         `\n_Sumber: realisticaiimagegenerator.com_`,
                contextInfo: {
                    externalAdReply: {
                        title: `Realistic AI Image: ${style}`,
                        body: prompt.substring(0, 50) + '...',
                        thumbnailUrl: result.url,
                        sourceUrl: 'https://realisticaiimagegenerator.com/',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: fkontak });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } else {
            throw new Error('Gagal mendapatkan URL gambar dari AI.');
        }

    } catch (e) {
        console.error('Error di plugin Realistic AI Image:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat membuat gambar: ${e.message}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['realisticai <prompt>|[style]|[resolution]|[seed]'];
handler.tags = ['ai', 'image'];
handler.command = /^(realisticai|realimage|aiimage)$/i;
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;
