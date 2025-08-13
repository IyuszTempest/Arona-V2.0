/*Plugins CJS
MyAnimeList info [jikan]
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
*/

const axios = require('axios');
async function searchAnimeFull(keyword = 'one piece', limit = 3) {
    try {
        const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(keyword)}&limit=${limit}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (!data || !data.data || data.data.length === 0) {
            throw new Error('Tidak ada anime ditemukan untuk keyword ini.');
        }
        return data.data.map(anime => ({
            title: anime.title || 'N/A',
            japanese: anime.title_japanese || 'N/A',
            type: anime.type || 'N/A',
            status: anime.status || 'N/A',
            episodes: anime.episodes || 'N/A',
            score: anime.score || 'N/A',
            season: anime.season || 'N/A',
            year: anime.year || 'N/A',
            rating: anime.rating || 'N/A',
            duration: anime.duration || 'N/A',
            aired: anime.aired?.string || 'N/A',
            synopsis: anime.synopsis || 'N/A',
            genres: anime.genres.map(g => g.name).join(', ') || 'N/A',
            studios: anime.studios.map(s => s.name).join(', ') || 'N/A',
            trailer: anime.trailer?.url || null,
            image: anime.images?.jpg?.large_image_url || null,
            url: anime.url || 'N/A'
        }));
    } catch (error) {
        console.error('Error searchAnimeFull (Jikan API):', error.message);
        if (error.response && error.response.data) {
            console.error('Jikan API Response:', JSON.stringify(error.response.data));
        }
        throw new Error(`Gagal mencari anime: ${error.message}`);
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
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
        return conn.reply(m.chat, `Mau cari anime apa, masbro? Contoh: *${usedPrefix + command}* Jujutsu Kaisen`, fkontak);
    }
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        const results = await searchAnimeFull(text);

        if (!results || results.length === 0) {
            await conn.reply(m.chat, `Tidak ditemukan anime untuk keyword "${text}".`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        const anime = results[0]; 
        let caption = `✨ *Detail Anime: ${anime.title}* ✨\n\n`;
        caption += `*Judul Jepang:* ${anime.japanese}\n`;
        caption += `*Tipe:* ${anime.type}\n`;
        caption += `*Status:* ${anime.status}\n`;
        caption += `*Episode:* ${anime.episodes}\n`;
        caption += `*Skor:* ${anime.score}\n`;
        caption += `*Musim:* ${anime.season} (${anime.year})\n`;
        caption += `*Rating:* ${anime.rating}\n`;
        caption += `*Durasi Per Ep:* ${anime.duration}\n`;
        caption += `*Tayang:* ${anime.aired}\n`;
        caption += `*Genre:* ${anime.genres}\n`;
        caption += `*Studio:* ${anime.studios}\n\n`;
        caption += `*Sinopsis:* ${anime.synopsis.substring(0, 500)}... (lanjutkan membaca di link)\n\n`;
        
        if (anime.trailer) {
            caption += `*Trailer:* ${anime.trailer}\n`;
        }
        caption += `*Link MyAnimeList:* ${anime.url}\n\n`;
        caption += `_Sumber: Jikan API (MyAnimeList)_`;
        await conn.sendMessage(m.chat, {
            image: { url: anime.image || 'https://via.placeholder.com/200?text=No+Image' },
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: `Anime: ${anime.title}`,
                    body: `${anime.type} | Score: ${anime.score}`,
                    thumbnailUrl: anime.image || 'https://via.placeholder.com/200?text=No+Image',
                    sourceUrl: anime.url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error('Error di plugin Jikan Anime:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mencari anime: ${e.message}. Coba lagi nanti.`, fkontak);
    }
};

handler.help = ['jikan <keyword>'];
handler.tags = ['anime', 'info', 'internet'];
handler.command = /^(malinfo|jikan)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;