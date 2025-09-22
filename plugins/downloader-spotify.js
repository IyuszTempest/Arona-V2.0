/*Plugins CJS 
Spotify Play Fix, code sebelumnya error
*Sumber*: _https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X_
*/

const axios = require('axios');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98'; 

async function searchSpotify(query) {
    //Fix Api ini
    const apiUrl = `https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);
    
    if (!data.status || !data.data || data.data.length === 0) {
        throw new Error('Tidak ada hasil yang ditemukan dari API search yang baru.');
    }
    
    return data.data[0].track_url;
}

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
                'x-rapidapi-key': RAPIDAPI_KEY
            }
        });
        
        if (data.status === 'fail' || !data.medias || data.medias.length === 0) {
            throw new Error(data.msg || 'Gagal mengambil data dari API, mungkin link tidak didukung atau key salah.');
        }

        return data;
    } catch (error) {
        console.error('Error in aio function:', error.message);
        throw new Error(`Terjadi kesalahan saat mengakses API: ${error.message}`);
    }
}

let handler = async (m, { conn, args }) => {
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot Arona;;;\nFN:Bot Arona\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    try {
        if (!args[0]) {
            return conn.reply(m.chat, 'Mau cari lagu apa, masbro? Tinggal ketik judul lagunya!', fkontak);
        }

        const query = args.join(' ');
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const spotifyUrl = await searchSpotify(query);
        const downloadResult = await aio(spotifyUrl);
        const audio = downloadResult.medias.find(media => media.type === 'audio');

        if (!audio) {
            return conn.reply(m.chat, 'Tidak ditemukan file audio dari link Spotify tersebut. Coba cari lagu lain.', fkontak);
        }

        const caption = `${downloadResult.title || 'Judul tidak diketahui'}\nFrom Spotify\n${downloadResult.source || 'Sumber tidak diketahui'}`;

        await conn.sendMessage(m.chat, {
            audio: { url: audio.url },
            mimetype: audio.mimeType || 'audio/mp4',
            fileName: `${downloadResult.title || 'audio'}.${audio.ext || 'mp3'}`,
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: downloadResult.title || 'Downloaded Audio',
                    body: `Dari ${downloadResult.source || 'Link'}`,
                    thumbnailUrl: downloadResult.thumbnail || 'https://i.ibb.co/37456Ym/download.png',
                    sourceUrl: spotifyUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error("Error di plugin Spotify:", error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        conn.reply(m.chat, `Terjadi kesalahan saat memproses permintaan: ${error.message}. Coba lagi nanti.`, fkontak);
    }
}

handler.help = ["spotify <judul lagu>"];
handler.command = ["spotify", "splay"];
handler.tags = ['internet', 'downloader', 'tools'];
handler.limit = true;
handler.premium = false;

module.exports = handler;
