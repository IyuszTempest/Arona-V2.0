const axios = require('axios');

const handler = async (m, { conn, text }) => {
  try {
    const query = `
      query($search: String) {
        Page(page: 1, perPage: 50) {
          characters(search: $search) {
            name { full }
            media { nodes { title { romaji } } }
            dateOfBirth { day month }
            image { large }
          }
        }
      }
    `;

    const variables = text ? { search: text.trim() } : {};
    
    const response = await axios({
      url: 'https://graphql.anilist.co',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      data: { query, variables },
      timeout: 10000,
    });

    const { data } = response.data;
    const characters = data?.Page?.characters || [];

    if (characters.length === 0) {
      return conn.reply(m.chat, `😢 Yah, gak ada karakter yang ditemukan${text ? ` untuk "${text}"` : ''}, Senpai! Coba lagi nanti ya.`, m);
    }

    const randomChar = characters[Math.floor(Math.random() * characters.length)];

    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const charData = {
      name: randomChar.name.full,
      anime: randomChar.media.nodes[0]?.title.romaji || 'Unknown',
      birthday: randomChar.dateOfBirth?.day && randomChar.dateOfBirth?.month 
        ? `${randomChar.dateOfBirth.day} ${months[randomChar.dateOfBirth.month - 1]}` 
        : 'Tidak diketahui',
      imageUrl: randomChar.image?.large || 'https://via.placeholder.com/150?text=No+Image',
    };

    await conn.sendMessage(m.chat, {
      image: { url: charData.imageUrl },
      caption:
        `🎯 *Karakter Anime${text ? ` dari "${text}"` : ' Birthday'}!*\n\n` +
        `🧑‍🦰 *Nama:* ${charData.name}\n` +
        `🎬 *Anime:* ${charData.anime}\n` +
        `📅 *Tanggal Lahir:* ${charData.birthday}\n` +
        `🖼️ *Gambar:* ${charData.imageUrl}\n` +
        `> command lain\n> /birthdayanime uzumaki naruto`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    conn.reply(m.chat, `⚠️ Gagal mengambil data dari AniList.\n\n📝 Error: ${error.message}`, m);
  }
};

handler.help = ['birthdayanime', 'ultahanime <nama anime>'];
handler.tags = ['anime'];
handler.command = /^(ultahanime|birthdayanime)$/i;
handler.limit = true;
handler.register = true;

module.exports = handler;