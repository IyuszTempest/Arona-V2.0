let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Hai, jika kamu menemukan error, laporkan di sini ya.\n\nContoh: *${usedPrefix + command} Menu downloader error, tidak bisa mengunduh video YouTube.*`;

    const fkontak = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: 'status@broadcast' } : {}) }, message: { 'contactMessage': { 'displayName': `Laporan dari ${m.name}`, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:;XL;;\nFN:${m.name},\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 'jpegThumbnail': null } } };

    let reportMessage = `*Laporan Baru Diterima!* 📢\n\n`;
    reportMessage += `*Dari:* @${m.sender.split('@')[0]}\n`;
    reportMessage += `*Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n`;
    reportMessage += `*Isi Laporan:*\n${text}`;

    for (let owner of global.owner) {
        conn.reply(owner + '@s.whatsapp.net', reportMessage, fkontak, { mentions: [m.sender] });
    }

    m.reply(`✅ Laporanmu telah berhasil dikirim ke Owner. Terima kasih atas masukannya, fitur error akan segera ditangani owner!`);
};
handler.help = ['laporerror <pesan>'];
handler.tags = ['main', 'owner'];
handler.command = /^(lapor|laporerror|report)$/i;

module.exports = handler;
