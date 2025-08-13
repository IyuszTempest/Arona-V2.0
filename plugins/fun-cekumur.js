/*
📌 Nama Fitur: Cek Umur
🏷️ Type : Plugin CJS
🔗 Sumber : https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
✍️ Convert By Gemini Ai
*/

// Pastikan moment sudah terinstal: npm install moment
const moment = require('moment');

async function handler(m, { text, command, prefix, conn }) { // Menggunakan 'conn' sebagai objek koneksi
    if (!text) { // Jika tidak ada argumen tanggal
        return conn.sendMessage(m.chat, { // Menggunakan conn.sendMessage untuk pesan peringatan
            text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*.cekumur 12/01/2005*_`,
        }, { quoted: m });
    }

    const birthDate = moment(text, 'DD/MM/YYYY', true); // 'true' untuk strict parsing

    if (!birthDate.isValid()) { // Jika format tanggal tidak valid
        return conn.sendMessage(m.chat, { // Menggunakan conn.sendMessage untuk pesan error
            text: `_❌ Format tanggal tidak valid! Gunakan format: DD/MM/YYYY_\n\n_Contoh:_ .cekumur 12/01/2005*`,
        }, { quoted: m });
    }

    const now = moment(); // Tanggal dan waktu sekarang
    const age = now.diff(birthDate, 'years'); // Hitung selisih tahun
    const months = now.diff(birthDate, 'months') % 12; // Hitung sisa bulan setelah tahun

    const responseText = `📅 Umur kamu adalah *${age} tahun ${months} bulan*\n🗓️ Tanggal lahir: *${birthDate.format('DD MMMM YYYY')}*`;

    // === URL gambar default untuk thumbnail ===
    // Mas Gemini pakai URL gambar yang lo kasih sebelumnya.
    // Kalau mau ganti gambar lain untuk fitur ini, tinggal ubah URL di bawah ya, Yus!
    const defaultThumbnailUrl = 'https://i.supa.codes/ei92vv'; 
    // =========================================

    try {
        // Cek apakah objek 'conn' tersedia sebelum digunakan
        if (!conn) {
            console.warn("⚠️ Objek 'conn' tidak ditemukan di handler. Mengirim hanya teks.");
            return m.reply(responseText); // Fallback ke reply teks biasa (pakai m.reply jika ada)
        }

        // === Menggunakan conn.relayMessage untuk tampilan thumbnail ===
        await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: responseText, // Teks utama pesan
                contextInfo: {
                    externalAdReply: {
                        title: `Cek Umur Kamu!`, // Judul yang muncul di thumbnail
                        mediaType: 1, // Tipe media: 1 untuk gambar
                        previewType: 0, // Tipe preview: 0 untuk gambar
                        renderLargerThumbnail: true, // Render thumbnail lebih besar
                        thumbnailUrl: defaultThumbnailUrl, // URL gambar thumbnail default
                        sourceUrl: 'https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c' // Link sumber atau channel bot lo
                    }
                }
            }
        }, { quoted: m }); // Biar pesan bot nge-reply pesan user

    } catch (error) {
        console.error('❌ Error saat mengirim pesan dengan thumbnail:', error);
        // Fallback jika pengiriman dengan thumbnail gagal.
        // Kembali ke pengiriman teks biasa menggunakan conn.sendMessage.
        conn.sendMessage(m.chat, { text: responseText }, { quoted: m });
    }
}

handler.help = ['cekumur <DD/MM/YYYY>'];
handler.command = ['cekumur'];
handler.tags = ['fun']; 

module.exports = handler; 