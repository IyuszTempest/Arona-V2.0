/**
    @ ✨ Scrape Animob (Anime Info & Episode Downloader)
    @ Base: https://aniwatch-api-2-animob.vercel.app/api/v2 & https://animob-api-v4.vercel.app/api
**/

const axios = require('axios'); // Menggunakan require untuk CommonJS

class Animob {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://aniwatch-api-2-animob.vercel.app/api/v2',
            headers: {
                'accept-encoding': 'gzip',
                'user-agent': 'okhttp/4.9.2'
            }
        });
        this._client = axios.create({
            baseURL: 'https://animob-api-v4.vercel.app/api',
            headers: {
                'accept-encoding': 'gzip',
                'user-agent': 'okhttp/4.9.2'
            }
        });
    }
    
    async home() {
        try {
            const { data } = await this.client('/hianime/home');
            if (!data.data) throw new Error('No data found for home.');
            return data.data;
        } catch (error) {
            console.error('Error fetching Animob home:', error.message);
            throw new Error(`Gagal mengambil data home: ${error.message}`);
        }
    }
    
    async genre(genre = 'action', page = 1) {
        try {
            const _genre = ['action', 'adventure', 'cars', 'comedy', 'dementia', 'demons', 'drama', 'ecchi', 'fantasy', 'game', 'harem', 'historical', 'horror', 'isekai', 'josei', 'kids', 'magic', 'martial-arts', 'mecha', 'military', 'music', 'mystery', 'parody', 'police', 'psychological', 'romance', 'samurai', 'school', 'sci-fi', 'seinen', 'shoujo', 'shoujo-ai', 'shounen', 'shounen-ai', 'slice-of-life', 'space', 'sports', 'super-power', 'supernatural', 'thriller', 'vampire'];
            if (!_genre.includes(genre)) throw new Error(`Available genres: ${_genre.join(', ')}`);
            
            const { data } = await this.client(`/hianime/genre/${genre}`, {
                params: {
                    page: page
                }
            });
            if (!data.data) throw new Error('No data found for genre.');
            return data.data;
        } catch (error) {
            console.error('Error fetching Animob genre:', error.message);
            throw new Error(`Gagal mengambil data genre: ${error.message}`);
        }
    }
    
    async search(query, page = 1) {
        try {
            if (!query) throw new Error('Query is required');
            
            const { data } = await this.client('/hianime/search', {
                params: {
                    q: query,
                    page: page
                }
            });
            if (!data.data) throw new Error('No data found for search.');
            return data.data;
        } catch (error) {
            console.error('Error searching Animob:', error.message);
            throw new Error(`Gagal mencari anime: ${error.message}`);
        }
    }
    
    async detail(id) {
        try {
            if (!id) throw new Error('Id is required');
            
            const { data } = await this.client(`/hianime/anime/${id}`);
            const { data: ep } = await this.client(`/hianime/anime/${id}/episodes`);
            
            if (!data.data || !data.data.anime) throw new Error('No anime detail found.');
            if (!ep.data) throw new Error('No episodes found for anime.');

            return {
                ...data.data.anime,
                episodes: ep.data
            };
        } catch (error) {
            console.error('Error fetching Animob detail:', error.message);
            throw new Error(`Gagal mengambil detail anime: ${error.message}`);
        }
    }
    
    async episode(episodeId, server = 'HD-1') {
        try {
            if (!episodeId || !episodeId.includes('?ep=')) throw new Error('Invalid episode id (must contain "?ep=").');
            
            const { data: sv } = await this._client(`/servers/${episodeId}`);
            const _server = sv.results.map(s => s.serverName);
            
            if (!_server.includes(server)) throw new Error(`Available servers: ${_server.join(', ')}`);
            
            const { data } = await this._client(`/stream`, {
                params: {
                    id: episodeId,
                    server: server,
                    type: sv.results.find(s => s.serverName === server).type
                }
            });
            if (!data.results || data.results.length === 0) throw new Error('No stream links found.');
            
            return data.results;
        } catch (error) {
            console.error('Error fetching Animob episode stream:', error.message);
            throw new Error(`Gagal mengambil link episode: ${error.message}`);
        }
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

    const animob = new Animob();
    const availableGenres = ['action', 'adventure', 'cars', 'comedy', 'dementia', 'demons', 'drama', 'ecchi', 'fantasy', 'game', 'harem', 'historical', 'horror', 'isekai', 'josei', 'kids', 'magic', 'martial-arts', 'mecha', 'military', 'music', 'mystery', 'parody', 'police', 'psychological', 'romance', 'samurai', 'school', 'sci-fi', 'seinen', 'shoujo', 'shoujo-ai', 'shounen', 'shounen-ai', 'slice-of-life', 'space', 'sports', 'super-power', 'supernatural', 'thriller', 'vampire'];

    switch (command) {
        case 'animobhome':
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            try {
                const homeData = await animob.home();
                let message = `✨ *Animob Home (Trending Anime)* ✨\n\n`;
                // Ambil beberapa anime trending (misal 5)
                const trending = homeData.trending.slice(0, 5); 
                trending.forEach((anime, index) => {
                    message += `${index + 1}. *${anime.name}*\n`;
                    message += `   ID: \`${anime.id}\`\n`;
                    message += `   Tipe: ${anime.type}\n`;
                    message += `   Rating: ${anime.rating}\n`;
                    message += `   Link: ${anime.link}\n\n`;
                });
                await conn.reply(m.chat, message, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) {
                console.error('Error animobhome:', e);
                await conn.reply(m.chat, `Gagal mengambil data home Animob: ${e.message}`, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }
            break;

        case 'animobgenre':
            if (!text) {
                return conn.reply(m.chat, `Mau cari genre apa, masbro? Contoh: ${usedPrefix + command} action\n\nAvailable genres: ${availableGenres.join(', ')}`, fkontak);
            }
            const [genreName, pageNum = 1] = text.split('|').map(s => s.trim());
            if (!availableGenres.includes(genreName.toLowerCase())) {
                return conn.reply(m.chat, `Genre *${genreName}* tidak tersedia. Available genres: ${availableGenres.join(', ')}`, fkontak);
            }
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            try {
                const genreData = await animob.genre(genreName.toLowerCase(), parseInt(pageNum));
                let message = `✨ *Animob Genre: ${genreName.toUpperCase()} (Page ${pageNum})* ✨\n\n`;
                if (genreData.animes && genreData.animes.length > 0) {
                    genreData.animes.slice(0, 5).forEach((anime, index) => { // Ambil 5 anime
                        message += `${index + 1}. *${anime.name}*\n`;
                        message += `   ID: \`${anime.id}\`\n`;
                        message += `   Tipe: ${anime.type}\n`;
                        message += `   Rating: ${anime.rating}\n`;
                        message += `   Link: ${anime.link}\n\n`;
                    });
                } else {
                    message += 'Tidak ada anime ditemukan untuk genre ini.\n';
                }
                await conn.reply(m.chat, message, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) {
                console.error('Error animobgenre:', e);
                await conn.reply(m.chat, `Gagal mengambil data genre Animob: ${e.message}`, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }
            break;

        case 'animobsearch':
            if (!text) {
                return conn.reply(m.chat, `Mau cari anime apa, masbro? Contoh: ${usedPrefix + command} One Piece`, fkontak);
            }
            const [searchQuery, searchPageNum = 1] = text.split('|').map(s => s.trim());
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            try {
                const searchData = await animob.search(searchQuery, parseInt(searchPageNum));
                let message = `✨ *Animob Search: "${searchQuery}" (Page ${searchPageNum})* ✨\n\n`;
                if (searchData.animes && searchData.animes.length > 0) {
                    searchData.animes.slice(0, 5).forEach((anime, index) => { // Ambil 5 anime
                        message += `${index + 1}. *${anime.name}*\n`;
                        message += `   ID: \`${anime.id}\`\n`;
                        message += `   Tipe: ${anime.type}\n`;
                        message += `   Rating: ${anime.rating}\n`;
                        message += `   Link: ${anime.link}\n\n`;
                    });
                } else {
                    message += 'Tidak ada anime ditemukan dengan query ini.\n';
                }
                await conn.reply(m.chat, message, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) {
                console.error('Error animobsearch:', e);
                await conn.reply(m.chat, `Gagal mencari anime di Animob: ${e.message}`, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }
            break;

        case 'animobdetail':
            if (!text) {
                return conn.reply(m.chat, `Masukin ID anime-nya dong, masbro! (Dapat dari .animobsearch atau .animobhome)\nContoh: ${usedPrefix + command} one-piece-100`, fkontak);
            }
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            try {
                const detailData = await animob.detail(text);
                let message = `✨ *Detail Anime: ${detailData.name}* ✨\n\n`;
                message += `*ID:* \`${detailData.id}\`\n`;
                message += `*Tipe:* ${detailData.type}\n`;
                message += `*Status:* ${detailData.status}\n`;
                message += `*Rating:* ${detailData.rating}\n`;
                message += `*Rilis:* ${detailData.releaseDate}\n`;
                message += `*Durasi:* ${detailData.duration}\n`;
                message += `*Sinopsis:* ${detailData.description}\n\n`;
                message += `*Genres:* ${detailData.genres.map(g => g.name).join(', ')}\n`;
                message += `*Jumlah Episode:* ${detailData.episodes?.length || 0}\n`;
                
                // Tampilkan beberapa episode pertama
                if (detailData.episodes && detailData.episodes.length > 0) {
                    message += `*Beberapa Episode:*\n`;
                    detailData.episodes.slice(0, 5).forEach(ep => {
                        message += `  - Ep ${ep.name} (ID: \`${ep.id}\`)\n`;
                    });
                    message += `\nUntuk download episode, gunakan command:\n*${usedPrefix}animobepisode <episode_id>|<server>*`;
                }

                await conn.sendMessage(m.chat, {
                    image: { url: detailData.poster },
                    caption: message,
                    contextInfo: {
                        externalAdReply: {
                            title: detailData.name,
                            body: detailData.description.substring(0, 50) + '...',
                            thumbnailUrl: detailData.poster,
                            sourceUrl: detailData.link,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: fkontak });
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) {
                console.error('Error animobdetail:', e);
                await conn.reply(m.chat, `Gagal mengambil detail anime: ${e.message}`, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }
            break;

        case 'animobepisode':
            if (!text) {
                return conn.reply(m.chat, `Masukin ID episode-nya dong, masbro! (Dapat dari .animobdetail)\nContoh: ${usedPrefix + command} please-put-them-on-takamine-san-uncensored-19640?ep=1|HD-1`, fkontak);
            }
            const [episodeId, serverName = 'HD-1'] = text.split('|').map(s => s.trim());
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            try {
                const streamLinks = await animob.episode(episodeId, serverName);
                if (streamLinks && streamLinks.length > 0) {
                    let message = `✨ *Link Download Episode* ✨\n\n`;
                    streamLinks.forEach(link => {
                        message += `*Kualitas:* ${link.quality}\n`;
                        message += `*Link:* ${link.url}\n\n`;
                    });
                    message += `_Pilih kualitas terbaik ya, masbro!_`;
                    await conn.reply(m.chat, message, fkontak);
                } else {
                    throw new Error('Tidak ada link streaming ditemukan untuk episode ini.');
                }
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) {
                console.error('Error animobepisode:', e);
                await conn.reply(m.chat, `Gagal mengambil link episode: ${e.message}`, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }
            break;

        default:
            // Ini jika command tidak dikenal, seharusnya tidak terjadi jika handler.command sudah benar
            break;
    }
};

handler.help = [
    'animobhome',
    'animobgenre <genre>|[page]',
    'animobsearch <query>|[page]',
    'animobdetail <anime_id>',
    'animobepisode <episode_id>|[server]'
];
handler.tags = ['anime', 'downloader'];
handler.command = /^(animobhome|animobgenre|animobsearch|animobdetail|animobepisode)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;