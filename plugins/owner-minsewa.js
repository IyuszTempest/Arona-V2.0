/*Plugins CJS 
Pengurang Masa Sewa Bot (Khusus Owner)
*/
// Reusable helper function
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

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Definisi fkontak
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    if (!args[0] || !args[1]) {
        return conn.reply(m.chat, `Format salah. Gunakan: *${usedPrefix + command}* <id_grup> <waktu_pengurangan>\n\nContoh: *${usedPrefix + command}* 6281xxxxxx@g.us 5d\n\n- d: hari\n- h: jam\n- m: menit`, fkontak);
    }
    
    const groupId = args[0].replace(/@/g, '') + '@g.us';
    const timeString = args[1];
    
    // Parser sederhana untuk waktu
    const timeMatch = timeString.match(/^(\d+)([dhm])$/);
    if (!timeMatch) {
        return conn.reply(m.chat, `Format waktu salah, masbro. Gunakan d (hari), h (jam), atau m (menit).\n\nContoh: 5d, 12h, 30m`, fkontak);
    }

    const value = parseInt(timeMatch[1]);
    const unit = timeMatch[2];
    
    let timeInMs;
    switch (unit) {
        case 'd':
            timeInMs = value * 24 * 60 * 60 * 1000;
            break;
        case 'h':
            timeInMs = value * 60 * 60 * 1000;
            break;
        case 'm':
            timeInMs = value * 60 * 1000;
            break;
        default:
            return conn.reply(m.chat, `Unit waktu tidak valid.`, fkontak);
    }
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        const chatData = global.db.data.chats[groupId];
        
        if (!chatData || !chatData.expired) {
            return conn.reply(m.chat, `ID grup *${groupId}* tidak ditemukan atau tidak sedang dalam masa sewa.`, fkontak);
        }

        const expiredBefore = chatData.expired;
        const expiredAfter = expiredBefore - timeInMs;
        
        if (expiredAfter < Date.now()) {
            return conn.reply(m.chat, `Pengurangan ini akan membuat masa sewa berakhir di masa lalu. Batalkan atau sesuaikan jumlahnya.`, fkontak);
        }
        
        global.db.data.chats[groupId].expired = expiredAfter;
        
        const waktuPenguranganFormatted = msToDate(timeInMs);
        const sisaWaktuFormatted = msToDate(expiredAfter - Date.now());
        
        let message = `*✅ Masa Sewa Berhasil Dikurangi* ✅\n\n`;
        message += `*ID Grup:* ${groupId}\n`;
        message += `*Masa Sewa Dikurangi:* ${waktuPenguranganFormatted}\n`;
        message += `*Sisa Waktu Sewa Baru:* ${sisaWaktuFormatted}\n`;
        message += `*Berakhir Pada:* ${new Date(expiredAfter).toLocaleString('id-ID')}\n\n`;
        message += `_Pemberitahuan ini hanya untuk owner._`;
        
        await conn.reply(m.chat, message, fkontak);
        await conn.sendMessage(groupId, { text: `⚠️ *Pemberitahuan* ⚠️\nMasa sewa bot di grup ini telah dikurangi oleh owner bot selama *${waktuPenguranganFormatted}*.`, quoted: fkontak });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin kurangisewa:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mengurangi masa sewa: ${e.message}.`, fkontak);
    }
};

handler.help = ['kurangisewa <id_grup> <waktu>'];
handler.tags = ['owner'];
handler.command = /^(kurangisewa|minsewa)$/i;
handler.owner = true;

module.exports = handler;