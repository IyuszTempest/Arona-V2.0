/**
══ ✨ 「 Yeonelle ID 」 ✨ ══
 @ *Name:* Plugins CJS SupaWork AI
 @ *Author:* Yeonelle (Disesuaikan oleh IyuszTempest dibantu gemini)
 @ *Source Code:* https://whatsapp.com/channel/0029VbBDTFd6mYPDtnetTK1f
 @ *Source Scrape:* https://whatsapp.com/channel/0029Vb5blhMEawdx2QFALZ1D/263
═══════════════
**/

// Menggunakan require untuk memanggil modul di CJS
const axios = require('axios');
const { randomUUID } = require('crypto');

// Daftar style & rasio tetap di luar biar rapi
const STYLES = [
    '2D Art Poster', '2D Art Poster V2', '3D Render', 'Acid Art', 'Acrylic Painting', 'Animation', 'Auto',
    'Black and White', 'Black and White V2', 'Caricature', 'Cartoon Cookie', 'Children Illustration',
    'Chinese Ink Painting', 'Chocolate Art', 'Cloud Pattern', 'Colored Pen Drawing', 'Comic', 'Constructivism',
    'Crystal Glass', 'Cute Cartoon', 'Film Noir', 'Flower Pattern', 'Futurism', 'Graffiti', 'Grainy Art',
    'Graphic Art', 'Graphic Icons', 'Hand Drawn', 'Hand Drawn Outline', 'Handmade 3D', 'Hard Flash', 'HDR',
    'High Renaissance', 'Ice Sculpture', 'Icy Elegance', 'Illustration', 'Illustration V2', 'Indian Miniature',
    'Isometric', 'Japanese Anime', 'Kids Drawing', 'Liquid Metal', 'Logos & Brands', 'Medieval Art',
    'Modern Photography', 'Motion Blur', 'Mughal Art', 'Mystic Dark', 'Natural Light', 'Northern Renaissance',
    'Pixel Art', 'Pencil Sketch', 'Pop Line Art', 'Psychedelic', 'Sci-Fi Illustration', 'Snow Globe',
    'Soviet Retro', 'Steampunk', 'Studio Photography', 'Studio Portrait', 'Stylized Animation', 'Surrealism',
    'Synthwave', 'Thick Impasto', 'Ukiyo-e', 'Ultra Realism', 'Ultra Realism V2', 'Urban Noir', 'Warm Tone'
];

const ASPECT_RATIOS = ['1:1', '16:9', '3:2', '2:3', '3:4', '4:3', '9:16'];

// Mengganti nama 'yeon' menjadi 'handler' sesuai standar CJS
let handler = async (m, { conn, text, usedPrefix, command }) => {
    const argsText = text?.trim() || '';

    // --- Bagian Bantuan & Daftar ---
    if (!argsText) {
        const helpMessage = `
🖌️ *SupaWork AI*

Wih, mau bikin gambar pake AI ya. Gini nih caranya, gampang kok:

*Format Perintah:*
\`\`\`${usedPrefix + command} <prompt> | <style> | <ratio>\`\`\`

*Contoh Simpel:*
\`\`\`${usedPrefix + command} cewek anime pake kacamata\`\`\`
*(Ini bakal pake style 'auto' dan rasio '1:1')*

*Contoh Lengkap:*
\`\`\`${usedPrefix + command} cewek anime pake kacamata | pixel art | 16:9\`\`\`

---

✨ *Mau liat daftar lengkap Style & Rasio?* ✨
Ketik command di bawah ini ya:
- \`${usedPrefix + command} styles\`
- \`${usedPrefix + command} ratios\`
        `.trim();
        return conn.reply(m.chat, helpMessage, m);
    }

    if (argsText.toLowerCase() === 'styles') {
        return conn.reply(m.chat, `🎨 *Daftar Style SupaWork AI* 🎨\n\nIni daftar style yang bisa lu pake, bro:\n\n- ${STYLES.join('\n- ')}`, m);
    }

    if (argsText.toLowerCase() === 'ratios') {
        const ratioListMessage = `
📐 *Daftar Rasio Gambar* 📐

- *1:1* (Persegi, pas buat profil)
- *16:9* (Layar Lebar, pas buat wallpaper PC)
- *3:2* (Landscape Klasik)
- *2:3* (Portrait Agak Tinggi)
- *3:4* (Portrait Biasa)
- *4:3* (Landscape TV Jadul)
- *9:16* (Portrait Vertikal, pas buat status WA)
        `.trim();
        return conn.reply(m.chat, ratioListMessage, m);
    }

    // --- Bagian Proses Generate Gambar ---
    const args = argsText.split(/\s*\|\s*/);
    const prompt = args[0];
    const style = args[1]?.toLowerCase() || 'auto';
    const ratio = args[2] || '1:1';

    if (!STYLES.map(s => s.toLowerCase()).includes(style)) {
        return conn.reply(m.chat, `Waduh, style *"${style}"* kaga ada di daftar. Coba ketik \`${usedPrefix + command} styles\` buat liat daftarnya.`, m);
    }

    if (!ASPECT_RATIOS.includes(ratio)) {
        return conn.reply(m.chat, `Bro, rasio *"${ratio}"* itu salah. Coba ketik \`${usedPrefix + command} ratios\` buat liat pilihan yang bener.`, m);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const result = await generateImage(prompt, style, ratio);
        
        if (!result.urls || result.urls.length === 0) {
            throw new Error('API nggak ngasih URL gambar, bro.');
        }

        for (const url of result.urls) {
            await conn.sendMessage(m.chat, {
                image: { url },
                caption: `💌 *SupaWork - AI*
📝 *Prompt:* \`${prompt}\`
🎨 *Style:* ${style.charAt(0).toUpperCase() + style.slice(1)}
📐 *Ratio:* ${ratio}`
            }, { quoted: m });
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error('Error di SupaWork:', e);
        await conn.reply(m.chat, `Yah, gagal, bro. 😭\n*Pesan Error:* ${e.message}\n\nAI-nya lagi pusing kayaknya. Coba bentar lagi ya.`, m);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

// Fungsi helper tetap sama, tidak perlu diubah
async function generateImage(prompt, style, aspect_ratio) {
    try {
        const identity_id = randomUUID();
        const headers = {
            'accept': 'application/json',
            'accept-language': 'id-ID,id;q=0.9',
            'content-type': 'application/json'
        };

        const submitBody = {
            aigc_app_code: 'text_to_image_generator',
            model_code: 'flux_schnell',
            custom_prompt: prompt,
            aspect_ratio: aspect_ratio,
            style: style,
            currency_type: 'silver',
            identity_id
        };

        const submitResponse = await axios.post(
            'https://supawork.ai/supawork/headshot/api/media/image/generator',
            submitBody,
            { headers }
        );

        const creation_id = submitResponse.data?.data?.creation_id;
        if (!creation_id) throw new Error('Gagal dapet creation_id dari API.');

        const maxRetries = 60;
        for (let i = 0; i < maxRetries; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000));

            const resultResponse = await axios.get(
                `https://supawork.ai/supawork/headshot/api/media/aigc/result/list/v1?page_no=1&page_size=30&identity_id=${identity_id}`,
                { headers }
            );

            const list = resultResponse.data?.data?.list || [];
            const readyItems = list.filter(item =>
                item.creation_id === creation_id &&
                item.status === 1 &&
                Array.isArray(item.list)
            );

            const urls = readyItems.flatMap(item =>
                item.list.flatMap(sub => sub.url || [])
            );

            if (urls.length > 0) {
                return { urls };
            }
        }

        throw new Error('Waktu tunggu habis! Gambarnya kelamaan dibuat, coba lagi nanti.');
    } catch (e) {
        const errorMessage = e.response?.data?.message || e.response?.data || e.message || 'Terjadi kesalahan tidak diketahui.';
        throw new Error(`Gagal manggil API SupaWork: ${errorMessage}`);
    }
}

// Menambahkan properti ke objek handler
handler.help = ['supawork <prompt>|<style>|<ratio>'];
handler.tags = ['ai','image','premium'];
handler.command = /^supawork$/i;
handler.premium = true;
handler.register = true;
handler.limit = true;

// Mengekspor handler dengan module.exports untuk CJS
module.exports = handler;