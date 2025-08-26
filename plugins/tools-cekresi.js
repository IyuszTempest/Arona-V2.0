const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
    
    if (!text) {
        let listEkspedisi = `*Daftar Ekspedisi yang Didukung:*\n\n`;
        listEkspedisi += `- jne\n- jnt\n- pos\n- sicepat\n- tiki\n- anteraja\n- wahana\n- ninja\n- lion\n- paxel\n- rex\n- first\n- idexpress\n- spx (shopee_express)\n- jnt_cargo\n- sentral_cargo\n\n`;
        listEkspedisi += `*Contoh Penggunaan:*\n*${usedPrefix + command}* jne | 1234567890`;
        return conn.reply(m.chat, listEkspedisi, fkontak);
    }
    
    const args = text.split('|');
    if (args.length !== 2) {
        return conn.reply(m.chat, `Formatnya salah, pake pemisah | ya.\n\nContoh:\n*${usedPrefix + command}* sicepat | 001234567890`, fkontak);
    }
    
    const [ekspedisi, noresi] = args.map(arg => arg.trim());
    if (!ekspedisi || !noresi) {
        return conn.reply(m.chat, `Ekspedisi dan nomor resi tidak boleh kosong ya.\n\nContoh:\n*${usedPrefix + command}* jnt | JP1234567890`, fkontak);
    }

    try {
        await conn.reply(m.chat, `📦 Sabar, lagi lacak resi *${noresi}*...`, fkontak);

        const response = await axios.get(`https://api.zenzxz.my.id/tools/cekresi?noresi=${noresi}&ekspedisi=${ekspedisi}`);
        const result = response.data.result;

        if (!response.data.success || !result || !result.history) {
            return conn.reply(m.chat, `❌ Resi *${noresi}* dari *${ekspedisi.toUpperCase()}* tidak ditemukan atau tidak valid.`, fkontak);
        }

        let statusEmoji = '🚚'; 
        if (result.status.toLowerCase().includes('delivered')) statusEmoji = '✅';
        if (result.status.toLowerCase().includes('gagal')) statusEmoji = '❌';

        let output = `📦 *Lacak Resi Paket*\n\n`;
        output += `*Nomor Resi:* ${result.resi}\n`;
        output += `*Ekspedisi:* ${result.ekspedisi}\n`;
        output += `*Status:* ${statusEmoji} *${result.status}* (${result.message})\n`;
        output += `\n================================\n\n`;
        output += `📜 *Riwayat Perjalanan Paket:*\n\n`;

        result.history.forEach(item => {
            output += `🕒 *${item.waktu}*\n`;
            output += `  📍 ${item.keterangan}\n\n`;
        });

        await conn.reply(m.chat, output.trim(), fkontak);

    } catch (error) {
        console.error("Error fetching cekresi:", error);
        await conn.reply(m.chat, 'Gagal melacak resi. Pastikan kode ekspedisi dan nomor resi sudah benar sesuai daftar, atau coba lagi nanti.', fkontak);
    }
};

handler.help = ['cekresi <ekspedisi>|<no resi>'];
handler.tags = ['tools'];
handler.command = ['cekresi'];
handler.limit = true;

module.exports = handler;