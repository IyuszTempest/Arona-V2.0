// Function untuk format milidetik ke Hari, Jam, Menit
function msToDate(ms) {
    // Dipastikan ini juga berada di file ceksewa.cjs atau di common lib
    // Jika tidak, definisikan di sini atau require dari file lain
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
    // Definisi fkontak (tidak ada di kode ini, perlu ditambahkan jika ingin fkontak)
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

    if (!args[0] || isNaN(args[0])) {
        return conn.reply(m.chat, `Masukkan angka mewakili jumlah hari !\n*Misal : ${usedPrefix + command} 30*`, fkontak);
    }

    let targetJid;
    let daysToAdd = parseInt(args[0]);

    if (m.isGroup) {
        if (args[1]) {
            let mentionMatch = args[1].match(/\d+/); 
            if (mentionMatch) {
                targetJid = mentionMatch[0] + '@s.whatsapp.net';
                if (!targetJid.startsWith('62')) { 
                    return conn.reply(m.chat, `Nomor target tidak valid atau bukan nomor Indonesia.`, fkontak);
                }
            } else if (m.mentionedJid && m.mentionedJid[0]) {
                targetJid = m.mentionedJid[0];
            } else {
                return conn.reply(m.chat, `Format target tidak dikenali.\n\nContoh:\n*${usedPrefix + command} 30* (untuk grup ini)\n*${usedPrefix + command} 30 @taggrup*\n*${usedPrefix + command} 30 628xxxxxxxxx*`, fkontak);
            }
        } else {
            targetJid = m.chat; 
        }
    } else { 
        if (!args[1]) {
            return conn.reply(m.chat, `Jika di chat pribadi, Anda harus menentukan target JID (nomor/mention).\n\nContoh: *${usedPrefix + command} 30 628xxxxxxxxx*`, fkontak);
        }
        let mentionMatch = args[1].match(/\d+/);
        if (mentionMatch) {
            targetJid = mentionMatch[0] + '@s.whatsapp.net';
            if (!targetJid.startsWith('62')) {
                return conn.reply(m.chat, `Nomor target tidak valid atau bukan nomor Indonesia.`, fkontak);
            }
        } else if (m.mentionedJid && m.mentionedJid[0]) {
            targetJid = m.mentionedJid[0];
        } else {
            return conn.reply(m.chat, `Format target tidak dikenali. Masukkan nomor atau tag grup/user.`, fkontak);
        }
    }

    if (!targetJid || (!targetJid.endsWith('@g.us') && !targetJid.endsWith('@s.whatsapp.net'))) {
        return conn.reply(m.chat, `Target tidak valid. Masukkan JID grup atau nomor yang benar.`, fkontak);
    }

    if (typeof global.db.data.chats[targetJid] === 'undefined') {
        global.db.data.chats[targetJid] = {};
    }

    let chatData = global.db.data.chats[targetJid];
    let now = new Date() * 1;
    
    if (typeof chatData.expired === 'undefined' || chatData.expired < now) {
        chatData.expired = now + (daysToAdd * 86400000);
    } else {
        chatData.expired += (daysToAdd * 86400000);
    }

    let targetName;
    try {
        targetName = await conn.getName(targetJid);
    } catch {
        targetName = targetJid.split('@')[0]; 
    }

    await conn.reply(m.chat, `Berhasil menetapkan masa sewa untuk *${targetName}* selama *${daysToAdd} hari*.\n\nSewa akan berakhir pada: ${new Date(chatData.expired).toLocaleString('id-ID')}\nHitung Mundur Sisa Waktu: ${msToDate(chatData.expired - now)}`, fkontak);
}

handler.help = ['addsewa <hari> [nomor/tag_grup/tag_user]']; 
handler.tags = ['owner'];
handler.command = /^(addsewa)$/i;
handler.owner = true;
module.exports = handler;