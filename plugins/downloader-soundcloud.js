
const axios = require('axios');

const fetchSoundCloudData = async (query) => {
    try {
        const response = await axios.get(`https://apii-kurumi.biz.id/api/soundcloud?q=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching SoundCloud data:', error);
        return null;
    }
};

const handler = async (m, { text, conn }) => {
    if (!text) {
        return m.reply('Silakan masukkan kata kunci pencarian.');
    }

    const data = await fetchSoundCloudData(text);
    if (data && data.status === 200) {
        let responseMessage = 'Hasil Pencarian:\n\n';
        data.result.forEach((item, index) => {
            responseMessage += `${index + 1}. ${item.title}\nLink: ${item.link}\n\n`;
        });
        await conn.sendMessage(m.chat, { text: responseMessage }, { quoted: m });
    } else {
        m.reply('Tidak ada hasil ditemukan atau terjadi kesalahan.');
    }
};

handler.help = ['soundcloud <kata kunci>'];
handler.tags = ['downloader'];
handler.command = /^soundcloud/i;
handler.limit = 2;

module.exports = handler;