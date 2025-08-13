const fetch = require("node-fetch");

let handler = async (m, { conn, text }) => {
    if (!text) throw 'Masukkan query pencarian!';

    await conn.reply(m.chat, 'Fetching data from Wikipedia...', m);

    try {
        // Mengambil data dari API Wikipedia
        let response = await fetch(`https://api.siputzx.my.id/api/s/wikipedia?query=${encodeURIComponent(text)}`);
        let data = await response.json();

        // Memeriksa apakah data berhasil diambil
        if (data && data.status) {
            let wikiData = data.data;

            // Menyusun pesan untuk dikirim
            let result = `**Judul:** ${text}\n\n` +
                         `${wikiData.wiki}\n\n` +
                         `![Thumbnail](${wikiData.thumb})`;

            // Mengirimkan hasil ke pengguna
            await conn.sendMessage(m.chat, {
                text: result,
                caption: 'Informasi dari Wikipedia'
            }, { quoted: m });
        } else {
            await conn.reply(m.chat, 'Tidak ada hasil yang ditemukan.', m);
        }
    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, 'Terjadi kesalahan saat mengambil data dari Wikipedia.', m);
    }
};

handler.help = ['wiki <query>'];
handler.command = ['wiki'];
handler.tags = ['internet'];
handler.premium = false;
handler.limit = true;

module.exports = handler;