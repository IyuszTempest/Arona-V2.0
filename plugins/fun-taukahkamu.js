/*
📌 Nama Fitur: Tahukah Kamu?
🏷️ Type : Plugin CJS
🔗 Sumber API: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
✍️ Convert By Gemini AI
*/
// Pastikan node-fetch sudah terinstal: npm install node-fetch
const fetch = require('node-fetch');

async function handler(m, { conn, command, prefix }) {
    // Tidak ada input 'text' karena API ini tidak memerlukan parameter.

    // Pesan loading awal
    await conn.sendMessage(m.chat, { text: 'Hmm, ntar lagi nyari fakta menarik nih, tunggu bentar yo...' }, { quoted: m });

    const apiUrl = 'https://api.ownblox.my.id/api/tahukahkamu';

    let res;
    try {
        res = await fetch(apiUrl);
    } catch (err) {
        console.error('❌ Error saat fetch API Tahukah Kamu?:', err);
        return conn.sendMessage(m.chat, { text: 'Aduh, gagal ambil data dari API nih. Mungkin servernya lagi sibuk.' }, { quoted: m });
    }

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ API Tahukah Kamu? Error: Status ${res.status}, Response: ${errorText}`);
        return conn.sendMessage(m.chat, { text: `Terjadi kesalahan dari API. Status: ${res.status}. Coba lagi ya!` }, { quoted: m });
    }

    let data;
    try {
        data = await res.json();
    } catch (err) {
        console.error('❌ Gagal parse JSON dari API Tahukah Kamu?:', err);
        return conn.sendMessage(m.chat, { text: 'Nggak bisa baca respons dari API nih. Mungkin formatnya bukan JSON.' }, { quoted: m });
    }

    if (!data || !data.result) {
        console.error('❌ Struktur data API tidak sesuai atau properti "result" tidak ditemukan:', JSON.stringify(data, null, 2));
        return conn.sendMessage(m.chat, { text: 'Nggak dapet fakta menariknya, sorry cok :(' }, { quoted: m });
    }

    const factText = `✨ *Tahukah Kamu?* ✨\n\n${data.result}`;

    // === Bagian pengiriman pesan dengan tampilan kartu info ===
    // Pastikan objek 'conn' tersedia sebelum digunakan
    if (!conn) {
        console.warn("⚠️ Objek 'conn' tidak ditemukan di handler. Mengirim hanya teks.");
        return m.reply(factText); // Fallback ke reply teks biasa
    }

    try {
        // Judul untuk kartu info
        const titleForCard = "Fakta Menarik Hari Ini"; 
        // URL gambar thumbnail
        const thumbnailUrl = "https://i.supa.codes/jdcGQP"; // Menggunakan URL gambar yang lo kasih
        // URL sumber untuk link di kartu info
        const sourceUrl = "https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c"; // Menggunakan URL channel lo

        await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: factText, // Teks fakta langsung di dalam kartu info
                contextInfo: {
                    externalAdReply: {
                        title: titleForCard,
                        mediaType: 1, // 1 untuk gambar
                        previewType: 0, // 0 untuk gambar
                        renderLargerThumbnail: true,
                        thumbnailUrl: thumbnailUrl,
                        sourceUrl: sourceUrl
                    }
                }
            }
        }, { quoted: m });
    } catch (error) {
        console.error('❌ Error saat mengirim fakta dengan tampilan kartu info:', error);
        // Fallback ke pesan teks biasa jika gagal mengirim kartu info
        conn.sendMessage(m.chat, { text: factText }, { quoted: m });
    }
}

handler.help = ['tahukahkamu']; 
handler.command = ['tahukahkamu']; 
handler.tags = ['fun']; 

module.exports = handler;