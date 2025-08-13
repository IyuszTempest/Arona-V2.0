/**
══ ✨ 「 *Yeonelle ID* 」 ✨ ══
 @ *Name:* Plugins CJS Liputan 6 Search & Detail
 @ *Author:* Yeonelle
 @ *Source Code:* https://whatsapp.com/channel/0029VbBDTFd6mYPDtnetTK1f
 @ *Source Scrape:* https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C/3470
═══════════════
**/

const axios = require('axios');
const cheerio = require('cheerio');

const BASE = 'https://www.liputan6.com'; 

async function getHomeNews() {
    const { data } = await axios.get(BASE);
    const $ = cheerio.load(data);
    const articles = [];

    $('.articles--iridescent-list--text-item').each((_, el) => {
        const title = $(el).find('.articles--iridescent-list--text-item__title-link').text().trim();
        const link = $(el).find('.articles--iridescent-list--text-item__title-link').attr('href');
        const thumb = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
        const summary = $(el).find('.articles--iridescent-list--text-item__summary').text().trim();

        if (title && link) {
            articles.push({
                title,
                link: link.startsWith('http') ? link : BASE + link,
                thumb,
                summary,
                author: 'saaoffc'
            });
        }
    });

    return articles;
}

async function searchNews(query) {
    const { data } = await axios.get(`${BASE}/search?q=${encodeURIComponent(query)}`);
    const $ = cheerio.load(data);
    const results = [];

    $('.articles--iridescent-list--text-item').each((_, el) => {
        const a = $(el).find('.articles--iridescent-list--text-item__title-link');
        const title = a.text().trim();
        const href = a.attr('href');
        const link = href?.startsWith('http') ? href : BASE + href;

        if (title && link && title.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                title,
                link,
                author: 'saaoffc'
            });
        }
    });

    return results;
}

async function getNewsDetail(url) {
    let currentPage = 1;
    let fullHtml = '';
    const baseUrl = url.split('?')[0];
    let hasNextPage = true;

    while (hasNextPage) {
        const pageUrl = currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`;
        const { data } = await axios.get(pageUrl);
        fullHtml += data;

        const $ = cheerio.load(data);
        hasNextPage = $('.paging__link--next').length > 0;
        currentPage++;
    }

    const $ = cheerio.load(fullHtml);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const image = $('meta[property="og:image"]').attr('content');
    const published = $('meta[property="article:published_time"]').attr('content') || $('time').text();
    const author = $('meta[name="author"]').attr('content') || $('a[href*="/penulis/"]').text().trim();

    const content = [];
    $('.article-content-body__item-page p').each((_, el) => {
        const text = $(el).text().trim();
        if (text) content.push(text);
    });

    return {
        title,
        description,
        image,
        published,
        author,
        content: content.join('\n\n'),
        scraper_by: 'saaoffc'
    };
}

let yeon = async (m, { conn, text, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, {
            react: { text: "⏳", key: m.key }
        });

        if (command === 'liputan6') {
            const news = await getHomeNews();
            if (!news.length) {
                await conn.sendMessage(m.chat, {
                    react: { text: "❌", key: m.key }
                });
                return conn.sendMessage(m.chat, {
                    text: `😢 *Senpai*, tidak ada berita ditemukan di Liputan6.`
                });
            }

            let caption = `📰 *Berita Terbaru dari Liputan6*:\n`;
            for (const [i, article] of news.entries()) {
                caption += `\n🔹 *${i + 1}. ${article.title}*\n`;
                caption += `📝 ${article.summary}\n`;
                caption += `🔗 ${article.link}\n`;
            }

            if (news[0]?.thumb) {
                await conn.sendMessage(m.chat, {
                    image: { url: news[0].thumb },
                    caption
                });
            } else {
                await conn.sendMessage(m.chat, { text: caption });
            }

            await conn.sendMessage(m.chat, {
                react: { text: "✅", key: m.key }
            });

        } else if (command === 'liputan6search') {
            if (!text) {
                await conn.sendMessage(m.chat, {
                    react: { text: "❌", key: m.key }
                });
                return conn.sendMessage(m.chat, {
                    text: `🔍 *Senpai*, masukkan kata kunci pencarian!  
Contoh: *${usedPrefix + command}* politik`
                });
            }

            const results = await searchNews(text);
            if (!results.length) {
                await conn.sendMessage(m.chat, {
                    react: { text: "❌", key: m.key }
                });
                return conn.sendMessage(m.chat, {
                    text: `😢 *Senpai*, tidak ada hasil ditemukan untuk "${text}".`
                });
            }

            let caption = `🔍 *Hasil Pencarian untuk "${text}"*:\n`;
            for (const [i, result] of results.entries()) {
                caption += `\n🔹 *${i + 1}. ${result.title}*\n`;
                caption += `🔗 ${result.link}\n`;
            }

            await conn.sendMessage(m.chat, { text: caption });
            await conn.sendMessage(m.chat, {
                react: { text: "✅", key: m.key }
            });

        } else if (command === 'liputan6detail') {
            if (!text || !text.startsWith('http')) {
                await conn.sendMessage(m.chat, {
                    react: { text: "❌", key: m.key }
                });
                return conn.sendMessage(m.chat, {
                    text: `📚 *Senpai*, masukkan URL berita valid!  
Contoh: *${usedPrefix + command}* https://www.liputan6.com/news/read/...` 
                });
            }

            const detail = await getNewsDetail(text);
            let caption = `✨ *${detail.title}*\n`;
            caption += `🖋️ *Penulis:* ${detail.author || 'Tidak diketahui'}\n`;
            caption += `⏰ *Tanggal:* ${detail.published || 'Tidak diketahui'}\n`;
            caption += `📌 *Deskripsi:* ${detail.description || 'Tidak tersedia'}\n\n`;
            caption += `📄 *Isi Berita:*\n${detail.content}`;

            if (detail.image) {
                await conn.sendMessage(m.chat, {
                    image: { url: detail.image },
                    caption
                });
            } else {
                await conn.sendMessage(m.chat, { text: caption });
            }

            await conn.sendMessage(m.chat, {
                react: { text: "✅", key: m.key }
            });

        }

    } catch (e) {
        console.error('Error:', e.message);
        await conn.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });
        await conn.sendMessage(m.chat, {
            text: `⚠️ *Ups, terjadi kesalahan, Senpai!*  
Fitur ini sedang gangguan, coba lagi nanti ya 😅`
        });
    }
};

yeon.help = ['liputan6', 'liputan6search <kata kunci>', 'liputan6detail <url>'];
yeon.tags = ['internet','news'];
yeon.command = /^(liputan6|liputan6search|liputan6detail)$/i;
yeon.register = true;
yeon.limit = false;

module.exports = yeon;