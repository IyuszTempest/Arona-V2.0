/**
 * @ ✨ Scrape MLBB News
 * @ Author : SaaOfc's
 * @ Noted : Kalo kurang tambahin sendiri saja:v
**/

const axios = require('axios');
const { JSDOM } = require('jsdom'); // Menggunakan require untuk CommonJS

const id = [2672947, 2756566, 2756564]; // IDs sumber berita MLBB

function totext(gatau = '') {
    const dom = new JSDOM(`<body>${gatau}</body>`);
    return dom.window.document.body.textContent.trim();
}

function extract(gatau = '') {
    const dom = new JSDOM(`<body>${gatau}</body>`);
    const img = dom.window.document.querySelector('img');
    return img?.src || null;
}

async function fetchNews(sourceId) {
    try {
        const res = await axios.post(
            `https://api.gms.moontontech.com/api/gms/source/2669606/${sourceId}`,
            {
                pageIndex: 1,
                pageSize: 50,
                filters: [],
                sorts: [],
                object: [2667533]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-appid': '2669606',
                    'x-actid': '2669607',
                    'x-lang': 'id',
                    'origin': 'https://www.mobilelegends.com',
                    'referer': 'https://www.mobilelegends.com/'
                }
            }
        );
        return res.data?.data?.records?.map(record => {
            const d = record.data;
            const body = d.body || '';
            const thumbnail =
                extract(body) ||
                d.cover ||
                d.image ||
                null;
            return {
                title: totext(d.title || 'No Title'),
                author: d.author?.name || null,
                avatar: d.author?.avatar || null,
                thumbnail,
                date: new Date(d.start_time).toISOString(), // Format ISO untuk tanggal
                caption: totext(body),
                link: `https://www.mobilelegends.com/news/articleldetail?newsid=${record.id}`
            };
        }) || [];
    } catch (err) {
        console.error(`Error fetching news for sourceId ${sourceId}:`, err.message);
        return [];
    }
}

async function newsML() {
    const all = await Promise.all(id.map(fetchNews));
    const merged = all.flat();
    return {
        status: true,
        total: merged.length,
        result: merged
    };
}

// --- Handler Plugin Bot ---
let handler = async (m, { conn, usedPrefix, command }) => {
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

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const mlbbNews = await newsML();

        if (mlbbNews.status && mlbbNews.total > 0) {
            let message = `✨ *Berita MLBB Terbaru* ✨\nTotal: ${mlbbNews.total} berita ditemukan.\n\n`;
            
            // Ambil beberapa berita terbaru (misal 3 berita)
            const latestNews = mlbbNews.result.slice(0, 3); 

            for (const news of latestNews) {
                message += `*Judul:* ${news.title}\n`;
                if (news.author) message += `*Penulis:* ${news.author}\n`;
                if (news.date) message += `*Tanggal:* ${new Date(news.date).toLocaleString('id-ID', {day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'})}\n`;
                if (news.caption) message += `*Deskripsi:* ${news.caption.substring(0, 100)}...\n`; // Ambil 100 karakter pertama
                if (news.link) message += `*Baca Selengkapnya:* ${news.link}\n`;
                message += `\n──────────────────\n\n`;
            }

            // Ambil thumbnail dari berita pertama jika ada
            const thumbnail = latestNews[0]?.thumbnail || 'https://www.mobilelegends.com/static/images/logo.png';

            await conn.sendMessage(m.chat, {
                image: { url: thumbnail },
                caption: message,
                contextInfo: {
                    externalAdReply: {
                        title: 'MLBB News',
                        body: 'Berita terbaru dari Mobile Legends: Bang Bang',
                        thumbnailUrl: thumbnail,
                        sourceUrl: 'https://www.mobilelegends.com/news/',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: fkontak });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } else {
            await conn.reply(m.chat, 'Gagal mengambil berita MLBB atau tidak ada berita yang ditemukan.', fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }

    } catch (e) {
        console.error('Error di plugin MLBB News:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat mengambil berita MLBB: ${e.message}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['mlbbnews', 'mlnews'];
handler.tags = ['news','internet']; // Kategori berita atau game
handler.command = /^(mlbbnews|mlnews)$/i;
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;