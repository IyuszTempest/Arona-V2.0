let handler = async (m, { conn, command, args }) => {
  if (!args.length) {
    return conn.reply(m.chat, 'Silakan masukkan kata kunci pencarian.', m); // Meminta pengguna untuk memasukkan kata kunci
  }

  const query = args.join(' '); // Menggabungkan argumen menjadi string untuk pencarian
  await conn.reply(m.chat, 'Mencari aplikasi di Play Store...', m); // Mengirim pesan menunggu

  try {
    const apiUrl = `https://api.vreden.web.id/api/playstore?query=${encodeURIComponent(query)}`; // URL API

    const response = await (await fetch(apiUrl)).json(); // Mengambil data dari API

    if (response.status === 200) {
      const appList = response.result; // Mengambil data aplikasi
      let message = 'Hasil pencarian aplikasi:\n\n'; // Pesan awal

      // Mengiterasi setiap aplikasi dan menambahkan informasi ke pesan
      appList.forEach(app => {
        message += `*Nama:* ${app.nama}\n`;
        message += `*Pengembang:* ${app.developer}\n`;
        message += `*Rating:* ${app.rate}\n`;
        message += `*Link Aplikasi:* ${app.link}\n`;
        message += `*Link Pengembang:* ${app.link_dev}\n`;
        message += `*Gambar:* ${app.img}\n\n`; // Menyertakan gambar
      });

      await conn.reply(m.chat, message, m); // Mengirim pesan hasil pencarian
    } else {
      await conn.reply(m.chat, 'Tidak ada aplikasi ditemukan.', m); // Jika tidak ada hasil
    }
  } catch (err) {
    console.error(err);
    throw "🚩 Terjadi kesalahan"; // Menangani kesalahan
  }
};

handler.command = handler.help = ['playstore', 'pstore'];
handler.tags = ['internet'];
handler.limit = true;
handler.premium = false;

module.exports = handler;