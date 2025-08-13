let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Definisi fkontak di sini
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

    let user = global.db.data.users[m.sender];

    if (!text) {
        if (command === 'setwaifu') {
            return conn.reply(m.chat, `Mau set waifu kamu siapa nih, masbro? Contoh: *${usedPrefix + command}* Hatsune Miku`, fkontak);
        } else if (command === 'sethusbu') {
            return conn.reply(m.chat, `Mau set husbu kamu siapa nih, kak? Contoh: *${usedPrefix + command}* Levi Ackerman`, fkontak);
        }
    }
    
    // Validasi panjang nama (opsional)
    if (text.length > 50) {
        return conn.reply(m.chat, 'Nama terlalu panjang, maksimal 50 karakter ya!', fkontak);
    }

    let message = '';
    if (command === 'setwaifu') {
        user.waifu = text.trim();
        message = `Selamat! Waifu lu sekarang adalah *${user.waifu}*! 🥰`;
    } else if (command === 'sethusbu') {
        user.husbu = text.trim();
        message = `Selamat! Husbu kamu sekarang adalah *${user.husbu}*! 🔥`;
    } else {
        // Fallback jika command tidak dikenal, seharusnya tidak terjadi
        return conn.reply(m.chat, 'Perintah tidak dikenal. Gunakan .setwaifu atau .sethusbu', fkontak);
    }
    
    await conn.reply(m.chat, message, fkontak);
};

handler.help = ['setwaifu <nama_waifu>', 'sethusbu <nama_husbu>'];
handler.tags = ['rpg', 'fun','anime'];
handler.command = /^(setwaifu|sethusbu)$/i; // Mendaftarkan kedua command
handler.limit = false;
handler.register = true;
handler.group = true;

module.exports = handler;