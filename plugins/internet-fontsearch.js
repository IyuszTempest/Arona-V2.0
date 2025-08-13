/* font search 
Untuk cari font
Cjs
Scrape hann
*/
const axios = require('axios');
const cheerio = require('cheerio');

async function fontSearch(teks) {
    try {
        const { data } = await axios.get('https://font.download/search?q=' + encodeURIComponent(teks));
        const $ = cheerio.load(data);
        const fonts = [];

        $('#font-list .font-list-item').each((index, element) => {
            const title = $(element).find('.title h5 a').text().trim();
            const addedBy = $(element).find('.title p').text().trim();
            const downloadLink = $(element).find('.buttons a').attr('href');
            const imageUrl = $(element).find('.image img').attr('src');

            fonts.push({
                title,
                addedBy,
                downloadLink,
                imageUrl
            });
        });

        return fonts;
    } catch (error) {
        return { error: error.message };
    }
}

const handler = async (m, { text, args, command }) => {
    try {
        if (command === 'fontsearch') {
            if (!text) return m.reply('Masukkan kata kunci pencarian font! Contoh: .fontsearch serif');

            const fonts = await fontSearch(text);
            if (!fonts || fonts.length === 0) return m.reply(`Tidak ditemukan font dengan kata kunci "${text}".`);

            let result = `🔍 Hasil Pencarian Font untuk "${text}":\n\n`;
            fonts.forEach((font, i) => {
                result += `${i + 1}. ${font.title}\n   👤 Dibuat oleh: ${font.addedBy}\n   🔗 Download: ${font.downloadLink}\n   ![Image](${font.imageUrl})\n\n`;
            });
            m.reply(result.trim());
        }
    } catch (error) {
        console.error(error);
        m.reply('Terjadi kesalahan.');
    }
};

handler.command = ['fontsearch'];
handler.tags = ['internet'];
handler.limit = true;

module.exports = handler;