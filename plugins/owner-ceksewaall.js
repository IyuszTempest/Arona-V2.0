// Function untuk format milidetik ke Hari, Jam, Menit (reusable)
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
    
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const chats = Object.entries(global.db.data.chats)
            .filter(([id, data]) => id.endsWith('@g.us') && data.expired && data.expired > Date.now());

        if (chats.length === 0) {
            await conn.reply(m.chat, `Tidak ada grup yang sedang dalam masa sewa.`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        let message = `*📊 Daftar Sewa Semua Grup* 📊\n\n`;
        for (const [id, data] of chats) {
            const sisaWaktuMs = data.expired - Date.now();
            const sisaWaktuFormatted = msToDate(sisaWaktuMs);
            const tanggalKadaluarsa = new Date(data.expired).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            });

            const groupMetadata = await conn.groupMetadata(id).catch(() => null);
            const groupName = groupMetadata?.subject || 'Nama Grup Tidak Ditemukan';

            message += `*Nama Grup:* ${groupName}\n`;
            message += `*ID Grup:* ${id}\n`;
            message += `*Sisa Waktu:* ${sisaWaktuFormatted}\n`;
            message += `*Berakhir Pada:* ${tanggalKadaluarsa}\n`;
            message += `──────────────────\n\n`;
        }

        await conn.reply(m.chat, message.trim(), fkontak);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin Cek Semua Sewa:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mengecek status sewa: ${e.message}.`, fkontak);
    }
};

handler.help = ['ceksewaall'];
handler.tags = ['owner'];
handler.command = /^(ceksewaall|ceksemuasewagc)$/i;
handler.limit = false;
handler.owner = true;

module.exports = handler;