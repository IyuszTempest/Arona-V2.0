/* Plugin: Spotify Downloader (Spotdown Edition)
   Source: spotdown.org
   Feature: Search & Download with Full Metadata
*/

const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. CEK INPUT
    if (!text) throw `Mau cari lagu apa di Spotify?\nContoh: *${usedPrefix + command} Kawaikute Gomen*`

    // Fast React biar makin kece
    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } });

    try {
        // 2. JALANKAN LOGIKA SPOTIFY (Gue rapihin dari script lu)
        const result = await spotifyDl(text);
        const { metadata, audio } = result;

        // 3. KIRIM INFORMASI LAGU (Aesthetic Style)
        await conn.sendMessage(m.chat, {
            text: `🎵 *${metadata.title}* - ${metadata.artist}\n⌛ _Sedang mengirim audio..._`,
            contextInfo: {
                externalAdReply: {
                    title: metadata.title,
                    body: `Artist: ${metadata.artist}`,
                    thumbnailUrl: metadata.cover,
                    sourceUrl: metadata.url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        // 4. KIRIM AUDIO BUFFER
        await conn.sendMessage(m.chat, { 
            audio: Buffer.from(audio), 
            mimetype: 'audio/mpeg',
            fileName: `${metadata.title}.mp3`
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        m.reply(`Gomen Yus, ada masalah: ${e.message}`);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}

/** * LOGIKA DOWNLOADER LU (Gue jadiin fungsi internal biar rapi)
 */
async function spotifyDl(input) {
    const commonHeaders = {
        'origin': 'https://spotdown.org',
        'referer': 'https://spotdown.org/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };

    // Step 1: Search / Get Details
    const { data: searchResult } = await axios.get(`https://spotdown.org/api/song-details?url=${encodeURIComponent(input)}`, {
        headers: commonHeaders
    });

    const song = searchResult.songs?.[0];
    if (!song) throw new Error('Lagu tidak ditemukan. Coba judul lain ya.');

    // Step 2: Download Audio as Buffer
    const { data: audioData } = await axios.post('https://spotdown.org/api/download', { url: song.url }, {
        headers: commonHeaders,
        responseType: 'arraybuffer'
    });

    return {
        metadata: {
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            cover: song.thumbnail,
            url: song.url
        },
        audio: audioData
    };
}

handler.help = ['spotify', 'spotdl']
handler.tags = ['downloader']
handler.command = /^(spotify|spotifydl|spotdl)$/i
handler.limit = true

module.exports = handler;
