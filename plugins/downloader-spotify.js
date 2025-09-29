/*
 * Spotify Play Plugin
 * Searches for a song, gets the Spotify link, and downloads the audio.
 */

const axios = require('axios');

// Ambil API key dari environment variable, atau gunakan fallback jika tidak ada.
// Sebaiknya selalu atur di environment variable untuk keamanan.
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98';

/**
 * Mencari lagu di Spotify dan mengembalikan URL-nya.
 * @param {string} query - Judul lagu yang akan dicari.
 * @returns {Promise<string>} URL lagu di Spotify.
 */
async function searchSpotify(query) {
    const apiUrl = `https://ytdlpyton.nvlgroup.my.id/spotify/search?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.results || data.results.length === 0) {
        throw new Error(`Lagu "${query}" tidak ditemukan.`);
    }

    // Mengembalikan link Spotify dari hasil pertama
    return data.results[0].spotify_url;
}

/**
 * Mengunduh media dari berbagai platform menggunakan API All-In-One.
 * @param {string} url - URL media yang akan diunduh.
 * @returns {Promise<object>} Objek data hasil unduhan.
 */
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
        // Melempar error yang lebih spesifik untuk ditangkap oleh handler utama
        throw new Error(`Terjadi kesalahan saat mengakses API downloader: ${error.message}`);
    }
}

// --- Handler Utama untuk Perintah Bot ---
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
            return conn.reply(m.chat, 'Mau cari lagu apa? Tinggal ketik judul lagunya!\nContoh: *gradation hanatan*', fkontak);
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
            mimetype: 'audio/mpeg', // Langsung set ke mpeg untuk kompatibilitas
            fileName: `${downloadResult.title || 'audio'}.mp3`,
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: downloadResult.title || 'Downloaded Audio',
                    body: `Dari: ${downloadResult.source || 'Link'}`,
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
        conn.reply(m.chat, `Gomenasai, terjadi kesalahan: ${error.message}. Coba lagi nanti.`, fkontak);
    }
}

handler.help = ["spotify <judul lagu>"];
handler.command = ["spotify", "splay"];
handler.tags = ['downloader'];
handler.limit = true;
handler.premium = false;

module.exports = handler;
