const moment = require('moment-timezone'); // Pastikan 'moment-timezone' terinstal
const PhoneNum = require('awesome-phonenumber'); // Pastikan 'awesome-phonenumber' terinstal
const regionNames = new Intl.DisplayNames(['id'], { type: 'region' });

// ✅ Versi terbaru: Deteksi operator lengkap dan fix prefix
function detectOperator(num) {
  // Pastikan num sudah dalam format internasional (misal +62812...)
  const prefix = num.replace(/^\+62/, '').slice(0, 3); // Hapus +62 lalu ambil 3 digit pertama

  if (/^(811|812|813|821|822|823|851|852|853|858)$/.test(prefix)) return 'Telkomsel';
  if (/^(814|815|816|855|856|857|859|895|896|897|898|899)$/.test(prefix)) return 'Indosat / Tri'; // Tri (3) juga masuk di sini
  if (/^(817|818|819|877|878)$/.test(prefix)) return 'XL Axiata';
  if (/^(831|832|833|838)$/.test(prefix)) return 'AXIS'; // AXIS juga masuk di sini
  if (/^(881|882|883|884|885|886|887|888|889)$/.test(prefix)) return 'Smartfren';
  if (/^(810|819|820|824|825|826|827|828|829|830|834|835|836|837|839|840|841|842|843|844|845|846|847|848|849|860|861|862|863|864|865|866|867|868|869|870|871|872|873|874|875|876|879|880|890|891|892|893|894)$/.test(prefix)) return 'Tidak diketahui (Indonesia Lain)'; // Rentang prefix Indonesia lain yang mungkin belum teridentifikasi
  
  return 'Tidak diketahui'; // Untuk prefix non-Indonesia atau yang tidak terdaftar
}

let handler = async (m, { conn, text, usedPrefix, command }) => { // Tambahkan usedPrefix, command
  // Definisi fkontak di sini untuk plugin ini
  const fkontak = {
      key: {
          participants: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          fromMe: false,
          id: "Halo"
      },
      message: {
          contactMessage: {
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
      },
      participant: "0@s.whatsapp.net"
  };

  let num = m.quoted?.sender || m.mentionedJid?.[0] || text;
  
  if (!num) return conn.reply(m.chat, `🌸 Gomen senpai~ siapa nih yang mau Arona stalk?\n\nContoh:\n*${usedPrefix + command}* @tag atau *${usedPrefix + command}* 628xxxxx`, fkontak); // Pakai fkontak

  // Normalize nomor
  num = num.replace(/\D/g, ''); // Hapus semua non-digit
  if (!num.startsWith('62')) { // Tambahkan prefix +62 jika tidak ada
      num = '62' + num;
  }
  num = num + '@s.whatsapp.net'; // Ubah ke JID lengkap

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

  try {
    let exists = await conn.onWhatsApp(num).catch(() => [{exists: false}]); // Pastikan array exists punya setidaknya satu objek
    if (!exists[0]?.exists) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
        return conn.reply(m.chat, `🚫 Maaf Senpai, nomor itu (${num.split('@')[0]}) tidak terdaftar di WhatsApp~`, fkontak); // Pakai fkontak
    }

    let img = await conn.profilePictureUrl(num, 'image').catch(() => null);
    let bio = await conn.fetchStatus(num).catch(() => null);
    let business = await conn.getBusinessProfile(num).catch(() => null);

    let name;
    try {
      name = await conn.getName(num);
    } catch (e) {
      console.error("Error getting name for WASTALK:", e);
      name = 'Tidak diketahui';
    }

    const nomorIntl = `+${num.split('@')[0]}`;
    const format = new PhoneNum(nomorIntl);
    const countryCode = format.getRegionCode('international');
    const country = countryCode ? regionNames.of(countryCode) : 'Tidak diketahui';
    const jenisNomor = format.getType() || 'Tidak diketahui';
    const operator = nomorIntl.startsWith('+62') ? detectOperator(nomorIntl) : 'Tidak diketahui (bukan Indo)';

    // Set locale moment ke id
    moment.locale('id'); 

    let waInfo = `📱 *Stalking WhatsApp Senpai~*\n\n` +
      `👤 *Nama:* ${name}\n` +
      `📞 *Nomor:* ${format.getNumber('international')}\n` +
      `🌍 *Negara:* ${country.toUpperCase()}\n` +
      `📡 *Jenis Nomor:* ${jenisNomor}\n` +
      `📶 *Operator:* ${operator}\n` +
      `🔗 *Link WA:* https://wa.me/${num.split('@')[0]}\n` +
      `🗣️ *Sebutan:* @${num.split('@')[0]}\n` +
      `📝 *Status:* ${bio?.status || '-'}\n` +
      `📅 *Diperbarui:* ${bio?.setAt ? moment(bio.setAt).format('LLLL') : '-'}`; // Menggunakan moment

    if (business && Object.keys(business).length > 0) { // Cek jika objek business tidak kosong
      waInfo += `\n\n🏢 *Akun Bisnis~*\n` +
        `✅ *Verified:* ${business.verified_name ? 'Ya (Centang Hijau~)' : 'Tidak'}\n` +
        `🆔 *Business ID:* ${business.wid || '-'}\n` +
        `🌐 *Website:* ${business.website || '-'}\n` +
        `📧 *Email:* ${business.email || '-'}\n` +
        `🏬 *Kategori:* ${business.category || '-'}\n` +
        `📍 *Alamat:* ${business.address || '-'}\n` +
        `🕰️ *Zona Waktu:* ${business.business_hours?.timezone || '-'}\n` +
        `📋 *Deskripsi:* ${business.description || '-'}`;
    } else {
      waInfo += `\n\n💬 *Akun WhatsApp Biasa~*`;
    }

    try {
      if (img) {
        await conn.sendMessage(m.chat, { image: { url: img }, caption: waInfo, mentions: [num] }, { quoted: fkontak }); // Pakai fkontak
      } else {
        await conn.sendMessage(m.chat, { text: waInfo, mentions: [num] }, { quoted: fkontak }); // Pakai fkontak
      }
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses
    } catch (e) {
      console.error('[WASTALK] Error sending message with image/text:', e);
      // Fallback jika pengiriman gambar gagal
      await conn.sendMessage(m.chat, { text: waInfo, mentions: [num] }, { quoted: fkontak }); // Pakai fkontak
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } }); // Reaksi warning
    }
  } catch (err) {
    console.error('[WASTALK] General Error:', err);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
    await conn.reply(m.chat, `🚫 Terjadi kesalahan saat stalking WhatsApp: ${err.message || 'Tidak diketahui'}.`, fkontak); // Pakai fkontak
  }
};

handler.help = ['wastalk <tag/nomor>'];
handler.tags = ['stalk','tools']; // Tambah tag 'tools'
handler.command = /^(wa|whatsapp)stalk$/i;
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;