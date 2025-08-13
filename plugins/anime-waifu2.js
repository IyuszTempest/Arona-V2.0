let handler = async (m, { conn, command }) => {
  await conn.reply(m.chat, 'Tunggu sebentar...', m); // Mengirim pesan menunggu
  try {
    if (command === 'waifu2') {
      const res = 'https://api.vreden.web.id/api/waifu'; // URL API untuk waifu
      await conn.sendFile(m.chat, res, 'waifu2.jpg', '', m); // Mengirim file waifu
    } else {
      // Tambahin penanganan kalau command bukan 'waifu2' (misal: command lain di handler yang sama)
      throw "🚩 Command tidak dikenali atau salah.";
    }
  } catch (err) {
    console.error(err);
    // Lebih spesifik ngasih tau errornya ke user
    await conn.reply(m.chat, "🚩 Terjadi kesalahan saat mengambil atau mengirim waifu. Coba lagi nanti ya!", m); 
  }
};

handler.command = handler.help = ['waifu2']; // Menambahkan 'waifu2' ke dalam daftar perintah
handler.tags = ['anime','image'];
handler.limit = true;
handler.premium = false;

module.exports = handler;
