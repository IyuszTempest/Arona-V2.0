/*
 * Plugins CJS 
 * Play YouTube MP3 (Privatezia API Version)
 */

const axios = require('axios');
const ytSearch = require('yt-search');

async function downloadYtMp3(queryOrUrl) {
    const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytplaymp3?query=${encodeURIComponent(queryOrUrl)}`;
    try {
        const { data } = await axios.get(apiUrl);
        if (!data.status || !data.result || !data.result.downloadUrl) {
            throw new Error(data.message || 'API tidak mengembalikan link download yang valid.');
        }
        return data.result; 
    } catch (error) {
        console.error("Error calling API:", error);
        throw new Error(`Error Kak: ${error.message}`);
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
        return conn.reply(m.chat, `Mau nyari lagu apa nih? Contoh:\n*${usedPrefix + command} suki ga levechi*`, fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    await conn.reply(m.chat, '_Wait..._', fkontak);

    try {
        const downloadResult = await downloadYtMp3(text); 

        const finalTitle = downloadResult.title || 'Judul Tidak Diketahui';
        const finalThumbnail = downloadResult.thumbnail || 'https://telegra.ph/file/a6a4fa97a0c0044b89a7b.jpg';
        const audioUrl = downloadResult.downloadUrl;
        const videoUrl = downloadResult.videoUrl;

        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl }, 
            mimetype: 'audio/mpeg',
            fileName: `${finalTitle}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: finalTitle,
                    body: global.wm || 'YT Play MP3',
                    thumbnailUrl: finalThumbnail,
                    sourceUrl: videoUrl, 
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

    } catch (err) {
        console.error('❌ Error saat proses YouTube:', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `Aduh, ada error nih: ${err.message}. Coba lagi ya.`, fkontak);
    }
}

handler.command = /^play$/i;
handler.tags = ['downloader'];
handler.help = ['play'];
handler.limit = true;

module.exports = handler;
