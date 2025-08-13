/*
📌 Nama Fitur: Cek Mati
🏷️ Type : Plugin CJS
🔗 Sumber : https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
✍️ Convert By Gemini AI
*/

// Hapus: const { sendMessageWithMention } = require('@lib/utils');

async function handler(m, { text, command, prefix, conn, mentionedJid }) { // Sesuaikan argumen
    // 'm' adalah objek pesan lengkap
    // 'text' adalah argumen setelah command (misal: "Budi" dari ".cekmati Budi" atau "@tag" dari ".cekmati @tag")
    // 'command', 'prefix' sesuai namanya
    // 'conn' adalah objek koneksi bot untuk mengirim pesan
    // 'mentionedJid' adalah array JID (ID WhatsApp lengkap) dari user yang di-tag

    // Validasi: Pastikan ada orang yang ditandai ATAU ada teks setelah command
    if (!mentionedJid?.length && !text) {
        return conn.sendMessage(m.chat, {
            text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*$.cekmati @TAG*_\n_Atau:_ _*.cekmati [Nama Orang]*_`
        }, { quoted: m });
    }

    // Tentukan 'nama' yang akan ditampilkan.
    // Jika ada yang di-mention, kita gunakan string @mention.
    // Jika tidak ada mention, kita gunakan teks yang diberikan user.
    let displayedName;
    if (mentionedJid && mentionedJid.length > 0) {
        // Asumsi bot framework bisa merender JID di teks jadi mention
        // Contoh: text berisi "@6281234567890", ini sudah cukup untuk ditampilkan dan array mentions akan menghandle tag-nya.
        displayedName = text; // 'text' di sini sudah berisi string mention jika ada
        // Atau jika lo mau nama kontaknya (perlu fungsi dari bot framework lo, misal conn.getName(mentionedJid[0]))
        // displayedName = conn.getName(mentionedJid[0]) || `@${mentionedJid[0].split('@')[0]}`;
    } else {
        displayedName = text; // Gunakan teks yang diberikan user jika tidak ada mention
    }
    
    // Tentukan usia secara acak (antara 20 dan 50 tahun)
    const random_cekmati = Math.floor(Math.random() * 31) + 20;

    // Format pesan dengan teks yang lebih menarik dan informatif
    const responseText = `🔮 *Nama:* ${displayedName}\n🕒 *Mati Pada Umur:* ${random_cekmati} Tahun\n\n⚠️ _Cepet-cepet Tobat, karena mati itu tak ada yang tahu!_`;

    try {
        // Cek apakah objek 'conn' tersedia sebelum digunakan
        if (!conn) {
            console.warn("⚠️ Objek 'conn' tidak ditemukan di handler. Mengirim hanya teks.");
            return m.reply(responseText); // Fallback ke reply teks biasa (pakai m.reply jika ada)
        }

        // Kirim pesan dengan mention (jika ada)
        await conn.sendMessage(m.chat, {
            text: responseText,
            mentions: mentionedJid || [] // Pastikan ini selalu array, kosong jika tidak ada mention
        }, { quoted: m });
    } catch (error) {
        console.error('❌ Error saat mengirim pesan:', error);
        // Fallback jika pengiriman pesan gagal
        if (conn) {
            conn.sendMessage(m.chat, { text: 'Terjadi kesalahan saat memproses permintaan.' }, { quoted: m });
        } else {
            m.reply('Terjadi kesalahan saat memproses permintaan.'); // Jika conn tidak ada, pakai m.reply
        }
    }
}

// Properti handler untuk informasi plugin
handler.help = ['cekmati @tag', 'cekmati [nama]']; // Cara penggunaan
handler.command = ['cekmati']; // Perintah untuk memicu plugin
handler.tags = ['fun']; // Tag kategori plugin

module.exports = handler;