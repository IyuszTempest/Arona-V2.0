/*
 * Plugins CJs
 * Spotify Play (Vreden Search + aio Downloader)
 */

const axios = require('axios');

// API Key untuk downloader, diambil dari environment atau fallback
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98';

// --- FUNGSI PENCARI LAGU (MENGGUNAKAN API BARU DARI VREDEN) ---
async function searchSpotify(query) {
    const apiUrl = https://api.vreden.my.id/api/v1/search/spotify?query=${encodeURIComponent(query)}&limit=1;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result || !data.result.search_data || data.result.search_data.length === 0) {
        throw new Error(Lagu "${query}" tidak ditemukan (Vreden).);
    }

    // Mengembalikan objek hasil pertama yang berisi title, artist, dll.
    return data.result.search_data[0];
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
        throw new Error(Terjadi kesalahan saat mengakses API downloader: ${error.message});
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
                vcard: BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD
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
        await conn.reply(m.chat, Mencari lagu "${query}"..., fkontak);

        const searchResult = await searchSpotify(query);
        const spotifyUrl = searchResult.song_link;
        
        const downloadResult = await aio(spotifyUrl);
        const audio = downloadResult.medias.find(media => media.type === 'audio');

        if (!audio) {
            return conn.reply(m.chat, 'Tidak ditemukan file audio dari link Spotify tersebut. Coba cari lagu lain.', fkontak);
        }
        
        await conn.reply(m.chat, Audio ditemukan, mengunduh file...\n*Judul:* ${searchResult.title}, fkontak);

        const audioBuffer = await axios.get(audio.url, {
            responseType: 'arraybuffer'
        }).then(res => res.data);
       
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: ${searchResult.title}.mp3,
            contextInfo: {
                externalAdReply: {
                    title: ${searchResult.title} - ${searchResult.artist},
                    body: Album: ${searchResult.album},
                    thumbnailUrl: searchResult.cover_img,
                    sourceUrl: spotifyUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

    } catch (error) {
        console.error("Error di plugin Spotify:", error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        conn.reply(m.chat, Gomenasai, terjadi kesalahan: ${error.message}. Coba lagi nanti., fkontak);
    }
}

handler.help = ["spotify2 <judul lagu>"];
handler.command = ["spotify2", "splay2"];
handler.tags = ['downloader'];
handler.limit = true;

module.exports = handler;
