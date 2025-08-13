/*Plugins CJS 
YouTube Video Downloader
*/
const axios = require("axios");

async function youtubeSearch(query) {
    try {
        const { data } = await axios.get(`https://api.privatezia.biz.id/api/search/youtubesearch?query=${encodeURIComponent(query)}`);
        if (!data || !data.data || data.data.length === 0) {
            throw new Error('Tidak ada video yang ditemukan dari pencarian.');
        }
        const searchResult = data.data[0];
        if (!searchResult.url) {
            throw new Error('URL video tidak ditemukan dari hasil pencarian.');
        }
        return searchResult;
    } catch (e) {
        throw new Error('Gagal mencari video di YouTube: ' + e.message);
    }
}

async function youtubeDownload(url) {
    try {
        // Menggunakan API download yang baru
        const { data } = await axios.get(`https://fgsi.koyeb.app/api/downloader/youtube/v1?url=${encodeURIComponent(url)}&apikey=${global.fgsiapi}`);
        if (!data || !data.status || !data.data || !data.data.download_url) {
            throw new Error(data.message || 'Gagal mendapatkan link download dari API. API mungkin sedang bermasalah.');
        }
        return data.data;
    } catch (e) {
        throw new Error('Gagal mendownload video: ' + e.message);
    }
}

let handler = async (m, { conn, text, usedPrefix }) => {
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
        return conn.reply(m.chat, `Masukkan judul video nya\n\n*Contoh:* ${usedPrefix}ytvid opening black clover`, fkontak);
    }
    
    try {
        if (!global.fgsiapi) {
            return conn.reply(m.chat, 'Maaf, API key FGSI belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }

        await conn.reply(m.chat, global.wait, fkontak);
        
        const searchResult = await youtubeSearch(text);
        
        if (searchResult.duration && searchResult.duration.split(':').length > 2) { // Cek durasi lebih dari 1 jam
            return conn.reply(m.chat, 'Durasi video lebih dari 1 jam!', fkontak);
        }
        
        const videoDownloadResult = await youtubeDownload(searchResult.url);
        
        let caption = `
✨ *YouTube Video Downloader* ✨
        
∘ *Judul:* ${searchResult.title}
∘ *Durasi:* ${searchResult.duration}
∘ *Penonton:* ${searchResult.views.toLocaleString()}
∘ *Link:* ${searchResult.url}

_Sedang mengirim video..._`.trim();

        await conn.sendMessage(m.chat, {
            video: {
                url: videoDownloadResult.download_url
            },
            caption: caption,
            mimetype: 'video/mp4',
            contextInfo: {
                externalAdReply: {
                    title: searchResult.title,
                    body: `Durasi: ${searchResult.duration}`,
                    thumbnailUrl: searchResult.thumbnail,
                    sourceUrl: searchResult.url,
                    mediaType: 1,
                    showAdAttribution: false,
                    renderLargerThumbnail: true
                }
            }
        }, {
            quoted: fkontak
        });
        
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan: ` + e.message, fkontak);
    }
};

handler.command = handler.help = ['ytvid', 'ytvideo'];
handler.tags = ['downloader'];
handler.limit = true;
handler.premium = true;

module.exports = handler;
