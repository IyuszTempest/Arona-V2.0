const fetch = require('node-fetch');
const ytSearch = require('yt-search');
const axios = require('axios');
const cheerio = require('cheerio');

function extractVideoId(url) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
}

async function ytmp3(url) {
    if (!url) throw 'Masukkan URL YouTube!';
    const videoId = extractVideoId(url);
    const thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

    try {
        const form = new URLSearchParams();
        form.append('q', url);
        form.append('type', 'mp3');
        const res = await axios.post('https://yt1s.click/search', form.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://yt1s.click',
                'Referer': 'https://yt1s.click/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });
        const $ = cheerio.load(res.data);
        const link = $('a[href*="download"]')?.attr('href');
        if (link) {
            return {
                link,
                title: $('title').text().trim() || 'Unknown Title',
                thumbnail,
                filesize: null,
                duration: null,
                success: true
            };
        }
    } catch (e) {
        console.warn('Gagal YT1S:', e.message || e.toString());
    }

    try {
        if (!videoId) throw 'Video ID tidak valid';
        const payload = {
            fileType: 'MP3',
            id: videoId
        };
        const res = await axios.post('https://ht.flvto.online/converter', payload, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://ht.flvto.online',
                'Referer': `https://ht.flvto.online/widget?url=https://www.youtube.com/watch?v=$$${videoId}`, // Perhatikan ini, harusnya URL yang valid
                'User-Agent': 'Mozilla/5.0 (Linux; Android 13)',
            },
        });
        const data = res?.data;
        if (!data || typeof data !== 'object') {
            throw 'ga ada respon';
        }
        if (data.status !== 'ok' || !data.link) {
            throw `Status gagal: ${data.msg || 'Tidak diketahui'}`;
        }
        return {
            link: data.link,
            title: data.title,
            thumbnail,
            filesize: data.filesize,
            duration: data.duration,
            success: true
        };
    } catch (e) {
        console.warn('Gagal FLVTO:', e.message || e.toString());
    }
    throw 'ga ada link download.';
}

async function handler(m, { conn, text, command, usedPrefix }) { // Tambahkan usedPrefix
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
        return conn.sendMessage(m.chat, {
            text: `Eh, mau nyari lagu apa nih? Contoh:\n*${usedPrefix + command} suki ga levechi*\natau\n*${usedPrefix + command} https://www.youtube.com/watch?v=xxxxxxxxxxx*`, // Gunakan usedPrefix + command
        }, { quoted: fkontak }); // Pakai fkontak
    }

    // Perbaiki bagian ini agar lebih robust dalam mendeteksi link YouTube
    const isYouTubeLink = text.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);

    let videoUrl = '';
    let videoTitleFromSearch = '';

    const sentMsg = await conn.sendMessage(m.chat, {
        text: 'wait...',
    }, { quoted: fkontak }); // Pakai fkontak

    try {
        if (isYouTubeLink) {
            videoUrl = text;
            const searchResult = await ytSearch(text); // ytSearch bisa langsung pake link
            if (searchResult && searchResult.videos.length > 0) {
                videoTitleFromSearch = searchResult.videos[0].title;
            }
        } else {
            const searchResult = await ytSearch(text);
            if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
                await conn.sendMessage(m.chat, { text: 'Aduh, video yang lu cari nggak ketemu nih di YouTube. Coba kata kunci lain deh.' }, { quoted: fkontak }); // Pakai fkontak
                return;
            }
            videoUrl = searchResult.videos[0].url;
            videoTitleFromSearch = searchResult.videos[0].title;
        }

        // Gunakan scraper function
        const scrapedData = await ytmp3(videoUrl);

         if (!scrapedData || !scrapedData.link) {
            console.error('❌ Gagal mendapatkan data MP3 dari scraper.');
            await conn.sendMessage(m.chat, { text: 'Aduh, gw gagal dapat link MP3 nih. Coba lagi ya, Masbro.' }, { quoted: fkontak }); // Pakai fkontak
            return;
        }

        const finalTitle = scrapedData.title || videoTitleFromSearch || 'Judul Tidak Diketahui';
        const finalThumbnail = scrapedData.thumbnail || 'https://telegra.ph/file/a6a4fa97a0c0044b89a7b.jpg';

        await conn.sendMessage(m.chat, {
            audio: { url: scrapedData.link }, // Menggunakan URL media dari scraper
            mimetype: 'audio/mpeg',
            fileName: `${finalTitle}.mp3`,
            caption: `🎵 *MP3 Udah Ketemu!* 🎉\n\n📌 *Judul:* ${finalTitle}\n🔗 *Link Video Asli:* ${videoUrl}`,
            contextInfo: {
                externalAdReply: {
                    title: finalTitle,
                    body: global.wm,
                    thumbnailUrl: finalThumbnail,
                    sourceUrl: videoUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                }
            }
        }, { quoted: fkontak }); // Pakai fkontak

    } catch (err) {
        console.error('❌ Error saat proses YouTube:', err);
        await conn.sendMessage(m.chat, { text: `Aduh, ada error nih jirr: ${err.message}. Coba lagi ya atau cek link/kata kuncinya, Masbro.` }, { quoted: fkontak }); // Pakai fkontak
    } finally {
        try {
            await conn.deleteMessage(m.chat, sentMsg.key);
        } catch { }
    }
}

handler.command = /^play|ytmp3$/i;
handler.tags = ['downloader'];
handler.help = ['play <judul_lagu>', 'ytmp3 <link_youtube>'];

module.exports = handler;