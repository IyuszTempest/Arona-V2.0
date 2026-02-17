/* plugins cewekjepang type cjs
  tqto pembuat api siputzx
   code  by ZIA ULHAQ
   *SUMBER*
https://chat.whatsapp.com/HY9PZ9ayAGD5j8CIphIXCg
 ai yang buat bang jadi gak kaku tangan ku coding😹
  */


const axios = require('axios');

let handler = async (m, { conn }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        // Fetch gambar dari API
        let response = await axios.get('https://api.siputzx.my.id/api/r/cecan/japan', {
            responseType: 'arraybuffer'
        });

        if (response.status !== 200) throw new Error("🚩 Gagal mendapatkan gambar.");

        console.log("✅ Gambar berhasil diperoleh.");

        // Kirim gambar ke WhatsApp
        await conn.sendMessage(m.chat, {
            image: Buffer.from(response.data),
            caption: "🇯🇵 Random Cewek Jepang"
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`🚩 Terjadi kesalahan:\n\n${e.message}`);
    }
};

handler.help = ['cewekjepang'];
handler.tags = ['anime'];
handler.command = /^cewekjepang$/i;
handler.premium = false;
module.exports = handler;
