const axios = require('axios'); // Menggunakan require untuk CommonJS

class Nakanime {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://anime.nakanime.my.id/api/anime',
            headers: {
                accept: 'application/json, text/plain, */*',
                'accept-encoding': 'gzip',
                'user-agent': 'okhttp/4.9.2'
            }
        });
    }
    
    async get(order = 'latest', page = 1) {
        try {
            const _order = ['title', 'latest', 'popular', 'rating', 'update', 'titlereverse'];
            if (!_order.includes(order)) throw new Error(`Available orders: ${_order.join(', ')}`);
            
            const { data } = await this.client('/all/', {
                params: {
                    order,
                    page
                }
            });
            if (!data || !data.data || data.data.length === 0) throw new Error('No data found for this order/page.');
            return data; // Mengembalikan objek data lengkap (termasuk status, message, dll.)
        } catch (error) {
            console.error('Error fetching Nakanime get:', error.message);
            throw new Error(`Gagal mengambil data anime: ${error.message}`);
        }
    }
    
    async genre(genre = 'action', page = 1) {
        try {
            const { data: g } = await this.client('/genre');
            if (!g || !g.data || g.data.length === 0) throw new Error('Failed to fetch available genres.');
            
            const _genre = g.data.map(c => c.slug);
            if (!_genre.includes(genre)) throw new Error(`Available genres: ${_genre.join(', ')}`);
            
            const { data } = await this.client('/bygenres/', {
                params: {
                    genre,
                    page
                }
            });
            if (!data || !data.data || data.data.length === 0) throw new Error('No anime found for this genre/page.');
            return data;
        } catch (error) {
            console.error('Error fetching Nakanime genre:', error.message);
            throw new Error(`Gagal mengambil data genre: ${error.message}`);
        }
    }
    
    async search(query) {
        try {
            if (!query) throw new Error('Query is required');
            
            const { data } = await this.client('/search/', {
                params: {
                    keyword: query
                }
            });
            if (!data || !data.data || data.data.length === 0) throw new Error('No anime found for this query.');
            return data;
        } catch (error) {
            console.error('Error searching Nakanime:', error.message);
            throw new Error(`Gagal mencari anime: ${error.message}`);
        }
    }
    
    async getDetail(url) { // Mengambil detail berdasarkan URL API yang lengkap
        try {
            // URL yang masuk ke sini seharusnya sudah lengkap dari hasil search/get
            // Contoh: https://anime.nakanime.my.id/api/anime/konosuba-gods-blessing-on-this-wonderful-world
            const { data } = await axios.get(url, { // Menggunakan axios langsung karena url sudah lengkap
                headers: this.client.defaults.headers.common // Gunakan header default client
            });
            
            if (!data || !data.data) throw new Error('No detail found for this anime.');
            return data;
        } catch (error) {
            console.error('Error fetching Nakanime detail:', error.message);
            throw new Error(`Gagal mengambil detail anime: ${error.message}`);
        }
    }
    
    async getData(url) { // Mengambil data episode (stream links)
        try {
            // URL yang masuk ke sini seharusnya sudah lengkap dari hasil detail
            // Contoh: https://anime.nakanime.my.id/api/anime/konosuba-gods-blessing-on-this-wonderful-world/episode-1
            const { data } = await axios.get(url, { // Menggunakan axios langsung karena url sudah lengkap
                headers: this.client.defaults.headers.common // Gunakan header default client
            });
            
            if (!data || !data.data || data.data.length === 0) throw new Error('No stream links found for this episode.');
            return data;
        } catch (error) {
            console.error('Error fetching Nakanime episode data:', error.message);
            throw new Error(`Gagal mengambil data episode: ${error.message}`);
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

    const nakanime = new Nakanime();
    const availableOrders = ['title', 'latest', 'popular', 'rating', 'update', 'titlereverse'];
    
    // Fetch genres once for validation and display
    let availableGenres = [];
    try {
        const { data: g } = await nakanime.client('/genre');
        if (g && g.data) {
            availableGenres = g.data.map(c => c.slug);
        }
    } catch (e) {
        console.error('Failed to fetch Nakanime genres:', e.message);
        // Fallback or inform user if genres cannot be fetched
    }

    switch (command) {
        case 'nakanimeget':
            const [orderType = 'latest', pageGet = 1] = text ? text.split('|').map(s => s.trim()) : [];
            if (!availableOrders.includes(orderType.toLowerCase())) {
                return conn.reply(m.chat, `Order type *${orderType}* tidak valid. Gunakan salah satu: ${availableOrders.join(', ')}`, fkontak);
            }
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            try {
                const animeData = await nakanime.get(orderType.toLowerCase(), parseInt(pageGet));
                let message = `✨ *Nakanime Top Anime (${orderType.toUpperCase()} - Page ${pageGet})* ✨\n\n`;
                if (animeData.data && animeData.data.length > 0) {
                    animeData.data.slice(0, 5).forEach((anime, index) => {
                        message += `${index + 1}. *${anime.title}*\n`;
                        message += `   Type: ${anime.type || '-'}\n`;
                        message += `   Status: ${anime.status || '-'}\n`;
                        message += `   Rating: ${anime.rating || '-'}\n`;
                        message += `   Detail Link: \`${anime.url}\`\n\n`; // Ini adalah URL untuk detail API
                    });
                } else {
                    message += 'Tidak ada anime ditemukan.\n';
                }
                await conn.reply(m.chat, message, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) {
                console.error('Error nakanimeget:', e);
                await conn.reply(m.chat, `Gagal mengambil data anime: ${e.message}`, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }
            break;

        case 'nakanimegenre':
            if (!text) {
                return conn.reply(m.chat, `Mau cari genre apa, masbro? Contoh: ${usedPrefix + command} action\n\nAvailable genres: ${availableGenres.join(', ')}`, fkontak);
            }
            const [genreSlug, pageGenre = 1] = text.split('|').map(s => s.trim());
            if (!availableGenres.includes(genreSlug.toLowerCase())) {
                return conn.reply(m.chat, `Genre *${genreSlug}* tidak tersedia. Available genres: ${availableGenres.join(', ')}`, fkontak);
            }
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            try {
                const genreData = await nakanime.genre(genreSlug.toLowerCase(), parseInt(pageGenre));
                let message = `✨ *Nakanime Genre: ${genreSlug.toUpperCase()} (Page ${pageGenre})* ✨\n\n`;
                if (genreData.data && genreData.data.length > 0) {
                    genreData.data.slice(0, 5).forEach((anime, index) => {
                        message += `${index + 1}. *${anime.title}*\n`;
                        message += `   Type: ${anime.type || '-'}\n`;
                        message += `   Status: ${anime.status || '-'}\n`;
                        message += `   Rating: ${anime.rating || '-'}\n`;
                        message += `   Detail Link: \`${anime.url}\`\n\n`;
                    });
                } else {
                    message += 'Tidak ada anime ditemukan untuk genre ini.\n';
                }
                await conn.reply(m.chat, message, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) {
                console.error('Error nakanimegenre:', e);
                await conn.reply(m.chat, `Gagal mengambil data genre Animob: ${e.message}`, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }
            break;

        case 'nakanimesearch':
            if (!text) {
                return conn.reply(m.chat, `Mau cari anime apa, masbro? Contoh: ${usedPrefix + command} Konosuba`, fkontak);
            }
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            try {
                const searchData = await nakanime.search(text);
                let message = `✨ *Nakanime Search: "${text}"* ✨\n\n`;
                if (searchData.data && searchData.data.length > 0) {
                    searchData.data.slice(0, 5).forEach((anime, index) => {
                        message += `${index + 1}. *${anime.title}*\n`;
                        message += `   Type: ${anime.type || '-'}\n`;
                        message += `   Status: ${anime.status || '-'}\n`;
                        message += `   Rating: ${anime.rating || '-'}\n`;
                        message += `   Detail Link: \`${anime.url}\`\n\n`;
                    });
                } else {
                    message += 'Tidak ada anime ditemukan dengan query ini.\n';
                }
                await conn.reply(m.chat, message, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) {
                console.error('Error nakanimesearch:', e);
                await conn.reply(m.chat, `Gagal mencari anime di Nakanime: ${e.message}`, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }
            break;

        case 'nakanimedetail':
            if (!text) {
                return conn.reply(m.chat, `Masukin URL detail anime-nya dong, masbro! (Dapat dari .nakanimesearch atau .nakanimeget)\nContoh: ${usedPrefix + command} https://anime.nakanime.my.id/api/anime/konosuba-gods-blessing-on-this-wonderful-world`, fkontak);
            }
            // Validasi URL detail
            if (!text.startsWith('https://anime.nakanime.my.id/api/anime/')) {
                return conn.reply(m.chat, 'URL detail tidak valid. Pastikan dari hasil pencarian Nakanime.', fkontak);
            }
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            try {
                const detailData = await nakanime.getDetail(text);
                let message = `✨ *Detail Anime: ${detailData.data.title}* ✨\n\n`;
                message += `*Judul:* ${detailData.data.title || '-'}\n`;
                message += `*Tipe:* ${detailData.data.type || '-'}\n`;
                message += `*Status:* ${detailData.data.status || '-'}\n`;
                message += `*Rating:* ${detailData.data.rating || '-'}\n`;
                message += `*Rilis:* ${detailData.data.releaseDate || '-'}\n`;
                message += `*Durasi:* ${detailData.data.duration || '-'}\n`;
                message += `*Sinopsis:* ${detailData.data.description || '-'}\n\n`;
                message += `*Genres:* ${detailData.data.genres.map(g => g.genre).join(', ') || '-'}\n`;
                message += `*Jumlah Episode:* ${detailData.data.episodes?.length || 0}\n`;
                
                if (detailData.data.episodes && detailData.data.episodes.length > 0) {
                    message += `\n*Beberapa Episode:*\n`;
                    detailData.data.episodes.slice(0, 5).forEach(ep => {
                        message += `  - Ep ${ep.episode} (Link: \`${ep.url}\`)\n`; // URL untuk getData
                    });
                    message += `\nUntuk download episode, gunakan command:\n*${usedPrefix}nakanimeepisode <episode_api_url>*`;
                }

                await conn.sendMessage(m.chat, {
                    image: { url: detailData.data.poster || 'https://via.placeholder.com/200' },
                    caption: message,
                    contextInfo: {
                        externalAdReply: {
                            title: detailData.data.title,
                            body: detailData.data.description.substring(0, 50) + '...',
                            thumbnailUrl: detailData.data.poster || 'https://via.placeholder.com/200',
                            sourceUrl: text, // URL API detail
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: fkontak });
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) {
                console.error('Error nakanimedetail:', e);
                await conn.reply(m.chat, `Gagal mengambil detail anime: ${e.message}`, fkontak);
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }
            break;

        case 'nakanimeepisode':
            if (!text) {
                return conn.reply(m.chat, `Masukin URL API episode-nya dong, masbro! (Dapat dari .nakanimedetail)\nContoh: ${usedPrefix + command} https://anime.nakanime.my.id/api/anime/konosuba-gods-blessing-on-this-wonderful-world/episode-1`, fkontak);
            }
            // Validasi URL episode
            if (!text.startsWith('https://anime.nakanime.my.id/api/anime/')) {
                return conn.reply(m.chat, 'URL episode tidak valid. Pastikan dari hasil detail Nakanime.', fkontak);
            }
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            try {
                const episodeData = await nakanime.getData(text);
                let message = `✨ *Link Download Episode* ✨\n\n`;
                if (episodeData.data && episodeData.data.length > 0) {
                    episodeData.data.forEach(link => {
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
                console.error('Error nakanimeepisode:', e);
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
    'nakanimeget [order]|[page]',
    'nakanimegenre <genre>|[page]',
    'nakanimesearch <query>',
    'nakanimedetail <anime_api_url>',
    'nakanimeepisode <episode_api_url>'
];
handler.tags = ['anime', 'downloader'];
handler.command = /^(nakanimeget|nakanimegenre|nakanimesearch|nakanimedetail|nakanimeepisode)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;