/*
Plugins CJS 
Spotify Play
https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
*/

const axios = require('axios');

async function searchSpotify(query) {
    const apiUrl = `https://ytdlpyton.nvlgroup.my.id/spotify/search?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);
    
    if (!data.results || data.results.length === 0) {
        throw new Error(`Lagu "${query}" tidak ditemukan.`);
    }
    
    return data.results[0].spotify_url;
}

async function downloadSpotify(url) {
    
    const apiUrl = `https://api.zenzxz.my.id/downloader/spotify?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);
        
    if (!data.result || !data.result.downloadUrl) {
        throw new Error('Gagal mendapatkan link download dari Zenz API.');
    }
    return data.result;
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
            return conn.reply(m.chat, 'Mau cari lagu apa, contoh: *gradation hanatan*', fkontak);
        }

        const query = args.join(' ');
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        await conn.reply(m.chat, `Mencari lagu "${query}"...`, fkontak);

        const spotifyUrl = await searchSpotify(query);
        await conn.reply(m.chat, `Lagu ditemukan! Otw download dulu`, fkontak);
        
        const downloadResult = await downloadSpotify(spotifyUrl);
        const finalTitle = downloadResult.title || "Judul Tidak Diketahui";
        const finalArtists = downloadResult.artist || "Artis Tidak Diketahui";
        const finalThumbnail = downloadResult.thumbnail || 'https://telegra.ph/file/9914d35122605f2479f60.jpg';
        const audioUrl = downloadResult.downloadUrl;

        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${finalTitle}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: finalTitle,
                    body: `Artis: ${finalArtists}`,
                    thumbnailUrl: finalThumbnail,
                    sourceUrl: downloadResult.spotifyUrl || spotifyUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

    } catch (error) {
        console.error("Error di plugin Spotify:", error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        conn.reply(m.chat, `Terjadi kesalahan saat memproses permintaan: ${error.message}. Coba lagi nanti.`, fkontak);
    }
}

handler.help = ["spotify <judul lagu>"];
handler.command = ["spotify", "splay"];
handler.tags = ['downloader'];
handler.limit = true;

module.exports = handler;
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

handler.help = ["spotify2 <judul lagu>"];
handler.command = ["spotify2", "splay2"];
handler.tags = ['downloader'];
handler.limit = true;
handler.premium = false;

module.exports = handler;
