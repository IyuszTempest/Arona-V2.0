const { createHash } = require('crypto'); // Untuk generate Serial Number
const isNumber = x => typeof x === 'number' && !isNaN(x);

let handler = async (m, { conn, text, usedPrefix, command }) => {
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

    if (!text) {
        return conn.reply(m.chat, `Masukkan Serial Number (SN) dari user yang ingin dihapus datanya.\n\nContoh: *${usedPrefix + command}* 6a94f6f27914f1b5d5d85c879d7d432b`, fkontak);
    }
    
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        let userFound = false;
        let deletedUser = null;
        let deletedUserJid = null;

        // Mencari user berdasarkan SN di database
        for (let jid in global.db.data.users) {
            let user = global.db.data.users[jid];
            let sn = createHash('md5').update(jid).digest('hex'); // Generate SN dari JID user
            
            if (sn === text.trim()) {
                userFound = true;
                deletedUser = user;
                deletedUserJid = jid;
                
                // Hapus data user dari database
                delete global.db.data.users[jid];
                break; // Hentikan loop setelah ditemukan dan dihapus
            }
        }
        
        if (userFound) {
            let successMessage = `✅ *Berhasil menghapus data user!*\n\n`;
            successMessage += `*Serial Number:* ${text}\n`;
            successMessage += `*Nama:* ${deletedUser.name || 'Tidak diketahui'}\n`;
            successMessage += `*JID:* ${deletedUserJid}\n`;
            successMessage += `*Catatan:* Pengguna ini sekarang sudah tidak terdaftar.`;

            await conn.reply(m.chat, successMessage, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } else {
            throw new Error('Tidak ada user ditemukan dengan Serial Number tersebut.');
        }

    } catch (e) {
        console.error('Error di plugin Unreg:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat menghapus data user: ${e.message}.`, fkontak);
    }
};

handler.help = ['unreguser <sn>'];
handler.tags = ['owner'];
handler.command = /^(unreguser)$/i;
handler.limit = false;
handler.owner = true; // Hanya owner yang bisa menggunakan fitur ini

module.exports = handler;