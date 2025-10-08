/*
 * Plugins CJs
 * Spotify Play (siputzx Search + aio Downloader)
 */

const axios = require('axios');

// API Key untuk downloader, diambil dari environment atau fallback
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98';

// --- FUNGSI PENCARI LAGU (DIGANTI KEMBALI KE SIPUTZX SESUAI PERMINTAAN) ---
async function searchSpotify(query) {
    const apiUrl = `https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);
    
    if (!data.status || !data.data || data.data.length === 0) {
        throw new Error('Tidak ada hasil yang ditemukan dari API search (siputzx).');
    }
    
    // Mengembalikan link Spotify dari hasil pertama
    return data.data[0].track_url;
}


// --- FUNGSI DOWNLOADER (TETAP PAKAI AIO) ---
async function aio(url) {
    try {
        if (!url || !url.startsWith('http')) {
            throw new Error('URL tidak valid, harus dimulai dengan http(s)://');
        }

        const { data } = await axios.post('https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink', {
            url: url
        }, {
            headers: {
                'accept-encoding': 'gzip',
                'content-type': 'application/json; charset=utf-8',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
                'x-rapidapi-host': 'auto-download-all-in-one.p.rapidapi.com',
                'x-rapidapi-key': RAPIDAPI_KEY
            }
        });

        if (data.status === 'fail' || !data.medias || data.medias.length === 0) {
            throw new Error(data.msg || 'Gagal mengambil data dari API, mungkin link tidak didukung atau API key salah.');
        }

        return data;
    } catch (error) {
        console.error('Error in aio function:', error.message);
        throw new Error(`Terjadi kesalahan saat mengakses API downloader: ${error.message}`);
    }
}

// --- HANDLER UTAMA ---
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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    try {
        if (!args[0]) {
            return conn.reply(m.chat, 'Mau cari lagu apa? Tinggal ketik judul lagunya!\nContoh: gradation hanatan', fkontak);
        }

        const query = args.join(' ');
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        const spotifyUrl = await searchSpotify(query);
        const downloadResult = await aio(spotifyUrl);
        const audio = downloadResult.medias.find(media => media.type === 'audio');

        if (!audio) {
            return conn.reply(m.chat, 'Tidak ditemukan file audio dari link Spotify tersebut. Coba cari lagu lain.', fkontak);
        }
        

        const audioBuffer = await axios.get(audio.url, {
            responseType: 'arraybuffer'
        }).then(res => res.data);
       
        await conn.sendMessage(m.chat, {
            audio: audioBuffer, 
            mimetype: 'audio/mpeg',
            fileName: `${downloadResult.title || 'audio'}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: downloadResult.title || 'Downloaded Audio',
                    body: `Dari: ${downloadResult.source || 'Link'}`,
                    thumbnailUrl: downloadResult.thumbnail || 'https://telegra.ph/file/9914d35122605f2479f60.jpg',
                    sourceUrl: spotifyUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

    } catch (error) {
        console.error("Error di plugin Spotify:", error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        conn.reply(m.chat, `Gomenasai, terjadi kesalahan: ${error.message}. Coba lagi nanti.`, fkontak);
    }
}

handler.help = ["spotify <judul lagu>"];
handler.command = ["spotify", "splay"];
handler.tags = ['downloader'];
handler.limit = true;

module.exports = handler;
