/**
  @ 🍀 sticker.ly Search & Detail
  @ 🍀 Source: https://whatsapp.com/channel/0029VbBDTFd6mYPDtnetTK1f
  @ 🍀 Scrape: https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/201
**/

const axios = require ('axios');

class StickerLy {
    async search(query) {
        if (!query) throw new Error('Query is required');

        const { data } = await axios.post('https://api.sticker.ly/v4/stickerPack/smartSearch',  {
            keyword: query,
            enabledKeywordSearch: true,
            filter: {
                extendSearchResult: false,
                sortBy: 'RECOMMENDED',
                languages: ['ALL'],
                minStickerCount: 5,
                searchBy: 'ALL',
                stickerType: 'ALL'
            }
        }, {
            headers: {
                'user-agent': 'androidapp.stickerly/3.17.0 (Redmi Note 4; U; Android 29; in-ID; id;)',
                'content-type': 'application/json',
                'accept-encoding': 'gzip'
            }
        });

        return data.result.stickerPacks.map(pack => ({
            name: pack.name,
            author: pack.authorName,
            stickerCount: pack.resourceFiles.length,
            viewCount: pack.viewCount,
            exportCount: pack.exportCount,
            isPaid: pack.isPaid,
            isAnimated: pack.isAnimated,
            thumbnailUrl: `${pack.resourceUrlPrefix}${pack.resourceFiles[pack.trayIndex]}`,
            url: pack.shareUrl
        }));
    }

    async detail(url) {
        const match = url.match(/\/s\/([^\/\?#]+)/);
        if (!match) throw new Error('URL pack tidak valid');

        const { data } = await axios.get(`https://api.sticker.ly/v4/stickerPack/${match[1]}?needRelation=true`, {
            headers: {
                'user-agent': 'androidapp.stickerly/3.17.0 (Redmi Note 4; U; Android 29; in-ID; id;)',
                'content-type': 'application/json',
                'accept-encoding': 'gzip'
            }
        });

        return {
            name: data.result.name,
            author: {
                name: data.result.user.displayName,
                username: data.result.user.userName
            },
            stickers: data.result.stickers.map(stick => ({
                fileName: stick.fileName,
                isAnimated: stick.isAnimated,
                imageUrl: `${data.result.resourceUrlPrefix}${stick.fileName}`
            })),
            stickerCount: data.result.stickers.length,
            isPaid: data.result.isPaid,
            url: data.result.shareUrl
        };
    }
}

let yeon = async (m, { conn, text, usedPrefix, command }) => {
    const stickerLy = new StickerLy();

    try {
        await conn.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        });

        if (command === 'stickerly') {
            if (!text) {
                return conn.sendMessage(m.chat, {
                    text: `🔍 *Senpai*, masukkan kata kunci untuk mencari pack stiker!  
Contoh: *${usedPrefix + command}* anime`
                });
            }

            const results = await stickerLy.search(text);

            if (!results.length) {
                return conn.sendMessage(m.chat, {
                    text: `😢 *Senpai*, tidak ada hasil ditemukan untuk "${text}".`
                });
            }

            let caption = `🖼️ *Hasil Pencarian Pack Stiker*  
📌 *Kata Kunci:* ${text}\n\n`;
            const mediaArray = [];

            for (const [i, pack] of results.entries()) {
                if (i === 0 && pack.thumbnailUrl) {
                    mediaArray.push({
                        image: { url: pack.thumbnailUrl },
                        caption: `🔹 *${i + 1}. ${pack.name}*  
🧑‍💻 Author: ${pack.author}  
🧩 Jumlah Stiker: ${pack.stickerCount}  
👀 Dilihat: ${pack.viewCount}x  
📦 Ekspor: ${pack.exportCount}x  
🔗 URL: ${pack.url}`
                    });
                } else {
                    caption += `🔹 *${i + 1}. ${pack.name}*  
🧑‍💻 Author: ${pack.author}  
🧩 Jumlah Stiker: ${pack.stickerCount}  
👀 Dilihat: ${pack.viewCount}x  
📦 Ekspor: ${pack.exportCount}x  
🔗 URL: ${pack.url}\n\n`;
                }
            }

            if (mediaArray.length) {
                await conn.sendMessage(m.chat, mediaArray[0]);
            }

            if (caption.trim().length > 0) {
                await conn.sendMessage(m.chat, {
                    text: caption
                });
            }

        } else if (command === 'stickerlydetail') {
            if (!text || !text.startsWith('https://sticker.ly/s/')) {
                return conn.sendMessage(m.chat, {
                    text: `📚 *Senpai*, masukkan URL pack stiker yang valid!  
Contoh: *${usedPrefix + command}* https://sticker.ly/s/anomali`
                });
            }

            const details = await stickerLy.detail(text);
            const { name, author, stickers } = details;

            let caption = `🎭 *Detail Pack Stiker*  
📌 *Nama Pack:* ${name}  
🧑‍💻 *Author:* ${author.name || author.username}  
🧩 *Jumlah Stiker:* ${stickers.length}\n\n`;

            const mediaArray = stickers.map(sticker => {
                const mediaType = sticker.isAnimated ? 'video' : 'image';
                return {
                    [mediaType]: { url: sticker.imageUrl },
                    caption: `🔹 *${mediaType === 'video' ? 'GIF Stiker' : 'Stiker'}*  
📦 Nama Pack: ${name}  
🧑‍💻 Author: ${author.name || author.username}  
📎 URL: ${text}`
                };
            });

            await conn.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

            for (const media of mediaArray) {
                await conn.sendMessage(m.chat, media);
                await new Promise(resolve => setTimeout(resolve, 2000)); // delay 2 detik ini yah..
            }

        }

    } catch (e) {
        console.error('Error:', e.message);
        await conn.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });
        await conn.sendMessage(m.chat, {
            text: `⚠️ *Ups, terjadi kesalahan, Senpai!*  
Fitur ini sedang gangguan, coba lagi nanti ya 😅`
        });
    }
};

yeon.help = ['stickerly <query>', 'stickerlydetail <url-pack>'];
yeon.tags = ['sticker'];
yeon.command = /^(stickerly|stickerlydetail)$/i;
yeon.register = true;
yeon.limit = true;
module.exports = yeon;