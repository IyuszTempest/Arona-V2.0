/*
📌 Nama Fitur: Info Gempa
🏷️ Type : Plugin CJS
🔗 Sumber : https://whatsapp.com/channel/0029Vb91Rbi2phHGLOfyPd3N
🔗 Api : https://api.siputzx.my.id/api/info/bmkg
✍️ Convert By Arona AI 
*/

const fetch = require('node-fetch');

let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://api.siputzx.my.id/api/info/bmkg');
    if (!res.ok) throw 'Gagal mengambil data dari API.';
    
    let json = await res.json();
    if (!json.status) throw 'Data tidak ditemukan.';

    const gempa = json.data.auto.Infogempa.gempa;

    let teks = `*Info Gempa BMKG Terkini*\n\n` +
      `*Tanggal:* ${gempa.Tanggal}\n` +
      `*Jam:* ${gempa.Jam}\n` +
      `*Magnitudo:* ${gempa.Magnitude}\n` +
      `*Kedalaman:* ${gempa.Kedalaman}\n` +
      `*Lokasi:* ${gempa.Wilayah}\n` +
      `*Koordinat:* ${gempa.Coordinates} (${gempa.Lintang}, ${gempa.Bujur})\n` +
      `*Potensi:* ${gempa.Potensi}\n` +
      `*Dirasakan:* ${gempa.Dirasakan}`;

    await conn.sendMessage(m.chat, {
      text: teks,
      contextInfo: {
        externalAdReply: {
          title: 'BMKG - Info Gempa Terkini',
          body: `Magnitude ${gempa.Magnitude} | ${gempa.Wilayah}`,
          thumbnailUrl: `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`,
          sourceUrl: 'https://bmkg.go.id',
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: m });
  } catch (e) {
    console.error(e);
    m.reply('Aduh, kayaknya ada yang salah nih pas ambil data gempa! Coba lagi nanti ya~');
  }
};

handler.command = ['infogempa'];
handler.tags = ['info'];
handler.help = ['infogempa'];

module.exports = handler;