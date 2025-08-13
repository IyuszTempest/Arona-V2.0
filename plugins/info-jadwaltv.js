const axios = require('axios');
const cheerio = require('cheerio');

async function jadwal(tv) {
    try {
        let { data } = await axios.get(`https://www.jadwaltv.net/channel/${tv}`);
        let $ = cheerio.load(data);

        let hasil = [];

        $('table.table-bordered tbody tr').each((i, el) => {
            let jam = $(el).find('td').eq(0).text().trim();
            let acara = $(el).find('td').eq(1).text().trim();

            if (jam && acara) {
                hasil.push({ jam, acara });
            }
        });

        return hasil;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

async function handler(m, { args }) {
    if (!args[0]) return m.reply("❌ Masukkan nama channel TV! Contoh: .jadwaltv gtv");

    const tv = args[0].toLowerCase();
    const jadwalTv = await jadwal(tv);

    if (!jadwalTv || jadwalTv.length === 0) {
        return m.reply(`⚠️ Jadwal untuk channel *${tv.toUpperCase()}* tidak ditemukan atau sedang tidak tersedia.`);
    }

    const jadwalList = jadwalTv
        .map(item => `🕒 *${item.jam}*: ${item.acara}`)
        .join('\n');

    const response = `
📺 *Jadwal TV ${tv.toUpperCase()}*

${jadwalList}

🌐 Sumber: https://www.jadwaltv.net/channel/${tv}
    `.trim();

    m.reply(response);
}

handler.command = ['jadwaltv'];
handler.tags = ['info'];
handler.help = ['jadwaltv <channel>'];
module.exports = handler;