/*
 * Plugins CJS
 * YouTube MP3 Downloader (Khusus Link - Privatezia API)
 */

const axios = require('axios');

async function downloadYtMp3FromLink(youtubeUrl) {
    const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
    try {
        const { data } = await axios.get(apiUrl);
        if (!data.status || !data.result || !data.result.downloadUrl) {
            throw new Error(data.message || 'API tidak mengembalikan link download MP3 yang valid.');
        }
        return data.result;
    } catch (error) {
        console.error("Error calling API:", error);
        throw new Error(`Gagal menghubungi API: ${error.message}`);
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
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

    const youtubeLinkRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
    if (!args[0] || !youtubeLinkRegex.test(args[0])) {
        return conn.reply(m.chat, `Masukkan link YouTube yang valid\n\n*Contoh:*\n${usedPrefix + command} https://www.youtube.com/watch?v=xxxxxxxxxxx`, fkontak);
    }
    const youtubeUrl = args[0];

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    await conn.reply(m.chat, '_Wait..._', fkontak);

    try {
        const downloadResult = await downloadYtMp3FromLink(youtubeUrl);

        const finalTitle = downloadResult.title || 'Judul Tidak Diketahui';
        const finalThumbnail = downloadResult.thumbnail || 'https://telegra.ph/file/a6a4fa97a0c0044b89a7b.jpg';
        const audioUrl = downloadResult.downloadUrl;

        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${finalTitle}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: finalTitle,
                    body: global.wm || 'YT MP3 Link',
                    thumbnailUrl: finalThumbnail,
                    sourceUrl: youtubeUrl, 
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

    } catch (err) {
        console.error('❌ Error saat proses YouTube MP3 (Link):', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `Aduh, ada error nih: ${err.message}. Pastikan link-nya bener ya.`, fkontak);
    }
}

handler.command = /^ytmp3$/i;
handler.tags = ['downloader'];
handler.help = ['ytmp3'];
handler.limit = true;

module.exports = handler;
