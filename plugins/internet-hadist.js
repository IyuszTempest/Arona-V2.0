const axios = require('axios');
const cheerio = require('cheerio');

async function searchHadith(keyword) {
    try {
        const { data } = await axios.get(`https://www.hadits.id/tentang/${keyword}`);
        const $ = cheerio.load(data);

        let hasil = [];

        $('section').each((i, el) => {
            let judul = $(el).find('a').text().trim();
            let link = `https://www.hadits.id${$(el).find('a').attr('href')}`;
            let perawi = $(el).find('.perawi').text().trim();
            let kitab = $(el).find('cite').text().replace(perawi, '').trim();
            let teks = $(el).find('p').text().trim();

            if (judul && link && teks) {
                hasil.push({ judul, link, perawi, kitab, teks });
            }
        });

        return hasil;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

async function handler(m, { args }) {
    if (!args[0]) return m.reply(" Masukkan kata kunci pencarian hadits! Contoh: .hadist shalat");

    const keyword = args.join(' ').toLowerCase();
    const hasilHadith = await searchHadith(keyword);

    if (!hasilHadith || hasilHadith.length === 0) {
        return m.reply(` Hadits dengan kata kunci *${keyword}* tidak ditemukan atau sedang tidak tersedia.`);
    }

    const hadithList = hasilHadith
        .map(
            (item, i) =>
                `📖 *${item.judul}*\n🔗 Link: ${item.link}\n👤 Perawi: ${item.perawi}\n📚 Kitab: ${item.kitab}\n📝 Teks: ${item.teks}\n`
        )
        .join('\n\n');

    const response = `
📚 *Hasil Pencarian Hadits dengan Kata Kunci: ${keyword.toUpperCase()}*

${hadithList}

🌐 Sumber: https://www.hadits.id/tentang/${keyword}
    `.trim();

    m.reply(response);
}

handler.command = ['hadistsearch'];
handler.tags = ['islam'];
handler.help = ['hadist <kata kunci>'];
module.exports = handler;