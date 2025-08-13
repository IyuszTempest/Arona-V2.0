/*
*[ Plugin Cek Id Channel ]*
*[ Sumber ]*
https://whatsapp.com/channel/0029Vafs40K4dTnIXMqfQa2Q
*[ Created by ]*
OwnBlox
*/

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply('Silakan masukkan link channel WhatsApp.\nContoh: .cekidch https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c');
  }

  try {
    let channelId;
    
    if (text.includes('whatsapp.com/channel/')) {
      channelId = text.split('whatsapp.com/channel/')[1].split('/')[0];
    } else if (text.includes('wa.me/channel/')) {
      channelId = text.split('wa.me/channel/')[1].split('/')[0];
    } else {
      channelId = text;
    }
    
    try {
      const idNewsletter = await conn.newsletterMetadata('invite', channelId);
      return m.reply(`📛 *Name:* ${idNewsletter.name}\n\n🪪 *ID Channel:* ${idNewsletter.id}`);
    } catch (err) {
      return m.reply(`❌ *Error:* ID channel tidak valid atau channel tidak ditemukan.\n\nID yang digunakan: ${channelId}`);
    }
  } catch (err) {
    return m.reply(`❌ *Error:* ${err.message || 'Terjadi kesalahan saat memeriksa channel'}`);
  }
}

handler.command = ['cekidch'];
handler.owner = true;

module.exports = handler;