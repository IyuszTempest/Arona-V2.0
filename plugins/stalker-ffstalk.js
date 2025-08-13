const axios = require('axios'); // Menggunakan require untuk CommonJS

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
        return conn.reply(m.chat, `Kirim UID Free Fire!\nContoh: *${usedPrefix + command}* 2134554847`, fkontak); // Pakai fkontak
    }

    await conn.reply(m.chat, '🌀 Prosess Bossquuu', fkontak); // Pakai fkontak

    try {
        const res = await axios.get(`https://apii.baguss.web.id/stalker/ffstalk?apikey=bagus&uid=${encodeURIComponent(text)}`);
        const data = res.data;

        if (!data.success) {
            return conn.reply(m.chat, 'Gagal mengambil data dari Free Fire. Mungkin UID salah atau server sedang bermasalah.', fkontak); // Pakai fkontak
        }

        const {
            uid,
            nickname,
            level,
            exp,
            like,
            region,
            title, // Asumsi 'title' adalah properti yang benar dari API
            seasonId, // Asumsi 'seasonId' adalah properti yang benar
            createTime, // Asumsi 'createTime' adalah properti yang benar
            lastLogin, // Asumsi 'lastLogin' adalah properti yang benar
            diamondCost, // Asumsi 'diamondCost' adalah properti yang benar
            creditScore, // Asumsi 'creditScore' adalah properti yang benar
            signature, // Asumsi 'signature' adalah properti yang benar
            guild, // Asumsi 'guild' adalah properti yang benar
            rank // Asumsi 'rank' adalah properti yang benar
        } = data;

        // Pastikan properti rank.battleRoyale.max, rank.battleRoyale.point, dll. ada
        const brMaxRank = rank?.battleRoyale?.max || '-';
        const brPoint = rank?.battleRoyale?.point || '-';
        const csMaxRank = rank?.clashSquad?.max || '-';
        const csPoint = rank?.clashSquad?.point || '-';

        let caption = `🎮 *Free Fire Stalker (Baguss.web.id)*\n\n` +
                      `👤 *Nickname:* ${nickname || '-'}\n` +
                      `🆔 *UID:* ${uid || '-'}\n` +
                      `📅 *Akun Dibuat:* ${createTime || '-'}\n` +
                      `🕓 *Login Terakhir:* ${lastLogin || '-'}\n` +
                      `🗺️ *Region:* ${region || '-'}\n` +
                      `🏷️ *Signature:* ${signature || 'Tidak ada'}\n\n` +
                      `📈 *Level:* ${level || '-'}\n` +
                      `🔢 *Exp:* ${exp || '-'}\n` +
                      `❤️ *Like:* ${like || '-'}\n` +
                      `💎 *Diamond Cost:* ${diamondCost || '-'}\n` +
                      `⭐ *Credit Score:* ${creditScore || '-'}\n` +
                      `🏆 *Season:* ${seasonId || '-'}\n` +
                      `\n`;
        
        // Menampilkan info guild jika ada
        if (guild && guild.name) {
            caption += `🛡️ *Info Guild:*\n` +
                       `  Nama Guild: ${guild.name || '-'}\n` +
                       `  ID Guild: ${guild.id || '-'}\n` +
                       `  Owner: ${guild.owner || '-'}\n` +
                       `  Level: ${guild.level || '-'}\n` +
                       `  Members: ${guild.members || '-'}/${guild.capacity || '-'}\n\n`;
        }

        caption += `🎖️ *Rank Battle Royale:* ${brMaxRank} | Point: ${brPoint}\n` +
                   `🛡️ *Rank Clash Squad:* ${csMaxRank} | Point: ${csPoint}`;

        await conn.sendMessage(m.chat, { text: caption }, { quoted: fkontak }); // Pakai fkontak

    } catch (err) {
        console.error("Error di plugin FF Stalker (Baguss.web.id):", err);
        await conn.reply(m.chat, `❌ Terjadi kesalahan saat memproses UID tersebut: ${err.message || 'Server API tidak merespons.'}`, fkontak); // Pakai fkontak
    }
};

handler.help = ['ffstalk <uid>']; // Tambahkan '2' untuk membedakan dengan plugin ffstalk sebelumnya
handler.tags = ['stalk'];
handler.command = /^(ffstalk|stalkff|epepstalk)$/i; // Command yang berbeda
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;