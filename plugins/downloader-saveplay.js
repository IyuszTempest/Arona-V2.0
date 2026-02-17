/**
    @ ✨ Scrape SavePlays Downloader
    @ Base: https://www.saveplays.com
    @ Support: BiliBili, Twitter & FB
**/

const axios = require('axios'); // Menggunakan require untuk CommonJS

const saa = {
    'Content-Type': 'application/json',
    'Origin': 'https://www.saveplays.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
};

function formatResponse(source, title, urls) {
    return {
        status: true,
        source,
        title,
        results: urls.map(v => ({
            quality: v.quality || v.resolution || 'unknown',
            ext: v.ext || (v.url.includes('.mp4') ? 'mp4' : 'unknown'),
            url: v.url.startsWith('/')
                ? `https://www.saveplays.com${v.url}`
                : v.url
        }))
    };
}

async function Bilibili(url) {
    if (!/bilibili\.com|b23\.tv/.test(url)) return { status: false, message: 'link bukan Bilibili' };
    try {
        const { data } = await axios.post(
            'https://www.saveplays.com/api/bilibili-downloader',
            { url },
            {
                headers: {
                    ...saa,
                    Referer: 'https://www.saveplays.com/bilibili-downloader/'
                }
            }
        );
        if (!data.downloadUrls) return { status: false, message: 'ga ada respon', raw: data };
        return formatResponse('bilibili', data.title, data.downloadUrls);
    } catch (e) {
        return {
            status: false,
            message: 'Gagal mengambil dari Bilibili',
            error: e.response?.data || e.message
        };
    }
}

async function Twitter(url) {
    if (!/twitter\.com|x\.com|mobile\.twitter\.com/.test(url)) return { status: false, message: 'link bukan Twitter' };
    try {
        const { data } = await axios.post(
            'https://www.saveplays.com/api/twitter-downloader',
            { url },
            {
                headers: {
                    ...saa,
                    Referer: 'https://www.saveplays.com/twitter-downloader/'
                }
            }
        );
        if (!data.downloadUrls) return { status: false, message: 'ga ada hasil', raw: data };
        return formatResponse('twitter', data.title, data.downloadUrls);
    } catch (e) {
        return {
            status: false,
            message: 'Gagal mengambil dari Twitter',
            error: e.response?.data || e.message
        };
    }
}

async function Facebook(url) {
    if (!/facebook\.com|fb\.watch/.test(url)) return { status: false, message: 'link bukan Facebook' };
    try {
        const { data } = await axios.post(
            'https://www.saveplays.com/api/facebook-downloader',
            { url },
            {
                headers: {
                    ...saa,
                    Referer: 'https://www.saveplays.com/facebook-downloader/'
                }
            }
        );
        if (!data.downloadUrls) return { status: false, message: 'ga ada hasil', raw: data };
        return formatResponse('facebook', data.title, data.downloadUrls);
    } catch (e) {
        return {
            status: false,
            message: 'Gagal mengambil dari Facebook',
            error: e.response?.data || e.message
        };
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
        let exampleText = `Mana link-nya, masbro? Support: Bilibili, Twitter, Facebook\n\n` +
                          `*Contoh:* \n` +
                          `  ${usedPrefix + command} https://www.bilibili.com/video/BV1cy4y1k7A2/\n` +
                          `  ${usedPrefix + command} https://x.com/2heartsoffcl/status/1939362919529304236\n` +
                          `  ${usedPrefix + command} https://www.facebook.com/share/v/1Byw74kNCw/`;
        return conn.reply(m.chat, exampleText, fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    let result;
    if (/bilibili\.com|b23\.tv/.test(text)) {
        result = await Bilibili(text);
    } else if (/twitter\.com|x\.com/.test(text)) {
        result = await Twitter(text);
    } else if (/facebook\.com|fb\.watch/.test(text)) {
        result = await Facebook(text);
    } else {
        result = { status: false, message: 'Link tidak dikenali atau tidak didukung.' };
    }

    if (result.status) {
        let caption = `✨ *${result.source.toUpperCase()} Downloader* ✨\n\n` +
                      `📌 *Judul:* ${result.title || 'Tidak Diketahui'}\n`;
        
        const videoUrls = result.results.filter(v => v.ext === 'mp4' || v.url.includes('.mp4'));

        if (videoUrls.length > 0) {
            // Urutkan berdasarkan kualitas dari yang tertinggi
            videoUrls.sort((a, b) => {
                const qA = parseInt(a.quality);
                const qB = parseInt(b.quality);
                return qB - qA; // Urutkan menurun
            });

            const bestQuality = videoUrls[0]; // Ambil kualitas terbaik
            
            caption += `🔗 *Link Download:* [${bestQuality.quality} ${bestQuality.ext}](${bestQuality.url})\n\n`;
            caption += `Sedang mengirim video... Mohon tunggu ya!`;
            
            await conn.sendMessage(m.chat, {
                video: { url: bestQuality.url },
                caption: caption,
                mimetype: 'video/mp4',
                fileName: `${result.title || 'video'}.mp4`,
                contextInfo: {
                    externalAdReply: {
                        title: result.title || 'SavePlays Downloader',
                        body: `Source: ${result.source.toUpperCase()}`,
                        thumbnailUrl: `https://www.saveplays.com/static/images/${result.source}.svg`, // Thumbnail bisa disesuaikan
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: fkontak });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } else {
            await conn.reply(m.chat, `Gagal menemukan link video MP4 yang bisa diunduh dari ${result.source.toUpperCase()}.`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }

    } else {
        await conn.reply(m.chat, `Gagal mendownload: ${result.message}\n${result.error ? `Error detail: ${result.error}` : ''}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['saveplay <link>'];
handler.tags = ['downloader'];
handler.command = ['saveplay', 'bili', 'twitterdl', 'fb5']; // Tambahkan alias command
handler.limit = true; // Tambahkan jika perlu limitasi
handler.premium = false; // Ganti jadi true jika command premium

module.exports = handler;
