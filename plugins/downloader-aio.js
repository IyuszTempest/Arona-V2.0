/**
    @ ✨ Scrape All In One Downloader
    @ Base: https://play.google.com/store/apps/details?id=tweeter.savetwitter.twittervideodownloader.downloadtwittervideos
    @ Supported Platform: TikTok, Instagram, Facebook, Twitter, YouTube, Soundcloud, Vimeo, etc.
**/

const axios = require('axios'); // Menggunakan require untuk CommonJS

// --- PENTING: AMANKAN API KEY INI DI ENVIRONMENT VARIABLE! ---
// Contoh: RAPIDAPI_KEY = 
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98';

async function aio(url) {
    try {
        if (!url || !url.includes('http')) throw new Error('URL is required and must start with http(s)://');
        
        const { data } = await axios.post('https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink', {
            url: url
        }, {
            headers: {
                'accept-encoding': 'gzip',
                'cache-control': 'no-cache',
                'content-type': 'application/json; charset=utf-8',
                referer: 'https://auto-download-all-in-one.p.rapidapi.com/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 OPR/78.0.4093.184',
                'x-rapidapi-host': 'auto-download-all-in-one.p.rapidapi.com',
                'x-rapidapi-key': RAPIDAPI_KEY // Menggunakan API Key dari variabel
            }
        });
        
        // Cek jika API mengembalikan error atau data tidak valid
        if (data.status === 'fail' || !data.medias || data.medias.length === 0) {
            throw new Error(data.msg || 'Gagal mengambil data dari API, mungkin link tidak didukung atau key salah.');
        }

        return data; // Return objek data lengkap
    } catch (error) {
        console.error('Error in aio function:', error.message);
        throw new Error(`Terjadi kesalahan saat mengakses API: ${error.message}`);
    }
}

// --- Handler Plugin Bot ---
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
        return conn.reply(m.chat, `Mau download dari mana, masbro? Kasih link-nya! Contoh: *${usedPrefix + command}* <link_tiktok/ig/fb/twitter>`, fkontak);
    }

    if (!text.includes('http')) {
        return conn.reply(m.chat, 'Link harus dimulai dengan http(s)://', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const result = await aio(text);
        
        let message = `✨ *All In One Downloader* ✨\n`;
        message += `📌 *Judul:* ${result.title || 'Tidak Diketahui'}\n`;
        message += `🔗 *Sumber:* ${result.source || 'Tidak Diketahui'}\n\n`;

        // Filter dan kirim media terbaik (misal, video kualitas tertinggi)
        const videos = result.medias.filter(media => media.type === 'video');
        const audios = result.medias.filter(media => media.type === 'audio');
        const images = result.medias.filter(media => media.type === 'image');

        if (videos.length > 0) {
            // Urutkan video berdasarkan kualitas (misal: "hd", "sd", atau angka resolusi)
            videos.sort((a, b) => {
                const qA = (a.quality || '').toLowerCase();
                const qB = (b.quality || '').toLowerCase();
                if (qA === 'hd' && qB !== 'hd') return -1;
                if (qA !== 'hd' && qB === 'hd') return 1;
                return (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0);
            });

            const bestVideo = videos[0];
            message += `_Mengirim video (${bestVideo.quality || 'Kualitas Default'})_...`;

            await conn.sendMessage(m.chat, {
                video: { url: bestVideo.url },
                caption: message,
                mimetype: 'video/mp4', // Asumsi mp4, sesuaikan jika API mengembalikan mime lain
                fileName: `${result.title || 'video'}.${bestVideo.ext || 'mp4'}`,
                contextInfo: {
                    externalAdReply: {
                        title: result.title || 'Downloaded Video',
                        body: `Dari ${result.source || 'Link'}`,
                        thumbnailUrl: result.thumbnail || 'https://i.ibb.co/37456Ym/download.png', // Thumbnail default
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: fkontak });

        } else if (audios.length > 0) {
            const bestAudio = audios[0];
            message += `_Mengirim audio_...`;

            await conn.sendMessage(m.chat, {
                audio: { url: bestAudio.url },
                caption: message,
                mimetype: bestAudio.mimeType || 'audio/mpeg',
                fileName: `${result.title || 'audio'}.${bestAudio.ext || 'mp3'}`,
                contextInfo: {
                    externalAdReply: {
                        title: result.title || 'Downloaded Audio',
                        body: `Dari ${result.source || 'Link'}`,
                        thumbnailUrl: result.thumbnail || 'https://i.ibb.co/37456Ym/download.png', // Thumbnail default
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: fkontak });

        } else if (images.length > 0) {
            const bestImage = images[0];
            message += `_Mengirim gambar_...`;

            await conn.sendMessage(m.chat, {
                image: { url: bestImage.url },
                caption: message,
                mimetype: bestImage.mimeType || 'image/jpeg',
                fileName: `${result.title || 'image'}.${bestImage.ext || 'jpg'}`,
                contextInfo: {
                    externalAdReply: {
                        title: result.title || 'Downloaded Image',
                        body: `Dari ${result.source || 'Link'}`,
                        thumbnailUrl: result.thumbnail || 'https://i.ibb.co/37456Ym/download.png', // Thumbnail default
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: fkontak });
        } else {
            throw new Error('Tidak ditemukan media yang didukung dari link ini.');
        }
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin All In One Downloader:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat mendownload: ${e.message}. Pastikan link valid dan didukung.`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['aio <link_url>'];
handler.tags = ['downloader'];
handler.command = /^(aio)$/i;
handler.limit = true;
handler.premium = true;

module.exports = handler;