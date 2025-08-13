// plugins/owner-outall.js

const axios = require('axios'); // axios mungkin tidak terpakai di plugin ini tapi tetap disertakan jika sebelumnya ada

async function handler(m, { conn, args, isOwner, mess }) { // 'isCreator' diganti jadi 'isOwner'
    // Definisi pesan default jika 'mess' tidak ada atau 'mess.owner' tidak didefinisikan
    const ownerMessage = mess?.owner || 'Maaf masbro, perintah ini hanya bisa digunakan oleh owner bot.';

    // Pastikan hanya owner yang bisa pakai command ini
    // Cek apakah pengirim pesan (m.sender) adalah owner bot
    if (!isOwner) { // Menggunakan isOwner yang sudah di-pass dari argumen
        return conn.reply(m.chat, ownerMessage, m);
    }

    // Fungsi helper untuk meninggalkan grup
    const leaveGroup = async (groupId) => {
        try {
            await conn.sendMessage(groupId, { text: 'Dadah 👋 Bot pamit dari grup ini ya.' });
            await conn.groupLeave(groupId);
            return `✅ Berhasil keluar dari grup: ${groupId}`;
        } catch (error) {
            console.error('Error leaving group:', error);
            return `❌ Gagal keluar dari grup ${groupId}: ${error.message}`;
        }
    };

    const text = args.join(' ').trim(); // Ambil semua argumen sebagai teks

    // Jika bot di dalam grup dan tidak ada argumen (keluar dari grup saat ini)
    if (m.isGroup && !text) {
        await conn.reply(m.chat, 'Dadah aku cinta kalian. Muachhhh 👋', m);
        await conn.groupLeave(m.chat); // m.chat adalah ID grup saat ini
        return;
    }

    // Jika ada argumen (keluar dari grup tertentu berdasarkan ID atau link invite)
    if (text) {
        let groupId = text;
        
        // Cek jika yang diberikan adalah link invite grup
        if (groupId.includes('chat.whatsapp.com')) {
            try {
                // Ekstrak kode invite dari link
                const groupCode = groupId.split('/').pop().split('?')[0]; // Ambil bagian kode saja
                if (!groupCode) {
                    return conn.reply(m.chat, 'Link grup tidak valid atau tidak ditemukan kode invite.', m);
                }
                const groupInfo = await conn.groupGetInviteInfo(groupCode);
                groupId = groupInfo.id; // Dapatkan ID grup dari info invite
            } catch (e) {
                console.error('Error getting group info from invite link:', e);
                return conn.reply(m.chat, '❌ Gagal mendapatkan info grup dari link invite. Pastikan linknya valid dan bot punya akses.', m);
            }
        }

        // Validasi format ID grup setelah diproses
        if (!groupId.endsWith('@g.us')) {
            return conn.reply(m.chat, 'Format ID grup tidak benar. Contoh: `1234567890@g.us` atau kirim link invite grup.', m);
        }

        // Panggil fungsi untuk meninggalkan grup
        const result = await leaveGroup(groupId);
        return conn.reply(m.chat, result, m);
    }

    // Jika command digunakan di personal chat tanpa argumen
    if (!m.isGroup && !text) {
        return conn.reply(m.chat, 
            'Contoh penggunaan:\n' +
            '  *1.* Di dalam grup: `.outall` (bot akan keluar dari grup itu)\n' +
            '  *2.* Di personal chat: `.outall <ID_GRUP>` (contoh: `.outall 1234567890@g.us`)\n' +
            '  *3.* Di personal chat: `.outall <LINK_INVITE_GRUP>` (contoh: `.outall https://chat.whatsapp.com/ABCDEFGHIJKLMN`)', m
        );
    }
}

handler.help = ['outgc', 'outgc <group_id/invite_link>'];
handler.tags = ['owner'];
handler.command = /^(outgc)$/i;
handler.owner = true; // Tandai sebagai command khusus owner

module.exports = handler;