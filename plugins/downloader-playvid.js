/*
 * Plugins CJS
 * Play YouTube MP4 (Privatezia API Version)
 */

const axios = require('axios');

async function downloadYtMp4(queryOrUrl) {
    const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytplaymp4?query=${encodeURIComponent(queryOrUrl)}`;
    try {
        const { data } = await axios.get(apiUrl);
        if (!data.status || !data.result || !data.result.downloadUrl) {
            throw new Error(data.message || 'API tidak mengembalikan link download video yang valid.');
        }
        return data.result;
    } catch (error) {
        console.error("Error calling API:", error);
        throw new Error(`Gagal menghubungi: ${error.message}`);
    }
}

let handler = async (m, { conn, text, command, usedPrefix }) => {
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
        return conn.reply(m.chat, `Mau nyari video apa nih? Contoh:\n*${usedPrefix + command} hanatan gradation*`, fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    await conn.reply(m.chat, '_Wait..._', fkontak);

    try {
        const downloadResult = await downloadYtMp4(text);

        const finalTitle = downloadResult.title || 'Judul Tidak Diketahui';
        const finalThumbnail = downloadResult.thumbnail || 'https://telegra.ph/file/a6a4fa97a0c0044b89a7b.jpg';
        const videoDownloadUrl = downloadResult.downloadUrl;
        const videoUrl = downloadResult.videoUrl;

        await conn.sendMessage(m.chat, {
            video: { url: videoDownloadUrl },
            mimetype: 'video/mp4',
            fileName: `${finalTitle}.mp4`,
            caption: `🎥 *Video Ditemukan!* 🎉\n\n📌 *Judul:* ${finalTitle}\n✨ *Kualitas:* ${downloadResult.quality || 'N/A'}\n🔗 *Link Asli:* ${videoUrl}`,
        }, { quoted: fkontak });

    } catch (err) {
        console.error('❌ Error saat proses YouTube Video:', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `Aduh, ada error nih: ${err.message}. Coba lagi ya.`, fkontak);
    }
}

handler.command = /^playvid$/i;
handler.tags = ['downloader'];
handler.help = ['playvid'];
handler.limit = true;

module.exports = handler;
                               
