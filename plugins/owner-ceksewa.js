// Function untuk format milidetik ke Hari, Jam, Menit (reusable dari profile.cjs)
function msToDate(ms) {
    if (isNaN(ms) || ms < 0) return 'Tidak diketahui';
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const daysms = ms % (24 * 60 * 60 * 1000);
    const hours = Math.floor((daysms) / (60 * 60 * 1000));
    const hoursms = ms % (60 * 60 * 1000);
    const minutes = Math.floor((hoursms) / (60 * 1000));
    const minutesms = ms % (60 * 1000);
    const sec = Math.floor((minutesms) / (1000));
    
    let result = [];
    if (days > 0) result.push(`${days} Hari`);
    if (hours > 0) result.push(`${hours} Jam`);
    if (minutes > 0) result.push(`${minutes} Menit`);
    if (sec > 0 && result.length === 0) result.push(`${sec} Detik`); 
    
    return result.length > 0 ? result.join(' ') : 'Kurang dari 1 menit';
}

let handler = async (m, { conn, usedPrefix, command }) => {
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

    if (!m.isGroup) {
        return conn.reply(m.chat, `Fitur ini hanya bisa digunakan di grup, masbro.`, fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); 

    try {
        const chatData = global.db.data.chats[m.chat];

        // --- PERBAIKAN DI SINI: Cek chatData.expired ---
        if (!chatData || !chatData.expired || chatData.expired < Date.now()) {
            await conn.reply(m.chat, `Grup ini tidak sedang dalam masa sewa, atau sewanya sudah berakhir.`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        const sisaWaktuMs = chatData.expired - Date.now(); // Gunakan .expired
        const sisaWaktuFormatted = msToDate(sisaWaktuMs);
        const tanggalKadaluarsa = new Date(chatData.expired).toLocaleString('id-ID', { // Gunakan .expired
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        });

        let message = `*📊 Cek Sewa Grup* 📊\n\n`;
        message += `*Nama Grup:* ${await conn.getName(m.chat)}\n`;
        message += `*ID Grup:* ${m.chat}\n`;
        message += `*Sewa Berakhir Pada:* ${tanggalKadaluarsa}\n`;
        message += `*Sisa Waktu Sewa:* ${sisaWaktuFormatted}\n\n`;
        message += `_Terima kasih telah menggunakan layanan sewa bot kami!_ ✨`;

        await conn.reply(m.chat, message, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin Cek Sewa:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mengecek status sewa: ${e.message}.`, fkontak);
    }
};

handler.help = ['ceksewa'];
handler.tags = ['group', 'info'];
handler.command = /^(ceksewa|sewaku)$/i;
handler.limit = false;
handler.group = true;

module.exports = handler;