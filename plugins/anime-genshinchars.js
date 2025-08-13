/*
📌 Nama Fitur: Genshin Character Build
🏷️ Type : Plugin CJS
🔗 Sumber : https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
✍️ Convert By Gemini AI
*/

const fetch = require('node-fetch');

async function handler(m, { conn, text, command, prefix }) {
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _* .genshinchar Yae Miko*_`
        }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { text: `Otw nyari build *${text}* nih, tunggu bentar ya...` }, { quoted: m });

    const characterName = encodeURIComponent(text); // Encode nama karakter untuk URL
    const apiUrl = `https://api.ownblox.my.id/api/genshinbuild?q=${characterName}`;

    let res;
    try {
        res = await fetch(apiUrl);
    } catch (err) {
        console.error('❌ Error saat fetch API:', err);
        return conn.sendMessage(m.chat, { text: 'Aduh, gagal ambil data dari API nih. Mungkin servernya lagi sibuk.' }, { quoted: m });
    }

    // Cek apakah respons HTTP-nya sukses (kode 200-an)
    if (!res.ok) {
        // Coba baca teks error dari API jika ada
        const errorText = await res.text();
        console.error(`❌ API Error: Status ${res.status}, Response: ${errorText}`);
        // Jika statusnya 404 atau 400, kemungkinan karakter tidak ditemukan
        if (res.status === 404 || res.status === 400) {
            return conn.sendMessage(m.chat, { text: `Kayaknya karakter *${text}* nggak ditemukan deh di database build.` }, { quoted: m });
        }
        return conn.sendMessage(m.chat, { text: `Terjadi kesalahan dari API. Status: ${res.status}.` }, { quoted: m });
    }

    let imageBuffer;
    try {
        // Asumsi API mengembalikan data gambar langsung (binary data)
        imageBuffer = await res.buffer();
    } catch (err) {
        console.error('❌ Gagal membaca data gambar dari respons API:', err);
        return conn.sendMessage(m.chat, { text: 'Nggak bisa baca data gambarnya nih dari API. Formatnya aneh.' }, { quoted: m });
    }

    // Pastikan buffer gambar tidak kosong
    if (!imageBuffer || imageBuffer.length === 0) {
        return conn.sendMessage(m.chat, { text: 'Gambar build-nya kosong atau tidak ditemukan.' }, { quoted: m });
    }

    try {
        // Kirim gambar build dengan caption
        await conn.sendMessage(m.chat, {
            image: imageBuffer, // Menggunakan buffer gambar
            caption: `⚔️ Build untuk *${text}* ⚔️`
        }, { quoted: m });
    } catch (error) {
        console.error('❌ Error saat mengirim gambar:', error);
        // Fallback ke pesan teks jika gagal mengirim gambar
        conn.sendMessage(m.chat, { text: `Maaf, gagal mengirim gambar build untuk *${text}*.` }, { quoted: m });
    }
}


handler.help = ['genshinchars <nama_karakter>'];
handler.command = ['genshinchar'];
handler.tags = ['anime'];

module.exports = handler; 