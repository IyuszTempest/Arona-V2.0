const axios = require('axios');
const { proto, generateWAMessageFromContent } = require("@adiwajshing/baileys"); // Tambahkan proto untuk manipulasi pesan

let handler = async (m, { conn, text, usedPrefix, command }) => {
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

  // Filter grup yang valid (bukan read-only atau announce)
  let groups = Object.entries(conn.chats).filter(([jid, chat]) => 
    jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce
  ).map(v => v[0]);

  let broadcastText = text ? text : (m.quoted ? m.quoted.text : '');
  if (!broadcastText) {
      return conn.reply(m.chat, `Mana teks broadcastnya, masbro?\n\nContoh: *${usedPrefix + command}* Halo semua!`, fkontak);
  }
  
  // --- PERBAIKAN: Hapus `readMore` dari teks broadcast ---
  const formattedBroadcastText = `「 *BROADCAST ALL GROUP* 」\n` +
                                 `${broadcastText}\n\n` +
                                 `_Pesan ini dikirim oleh bot ${global.botname || 'Arona AI'}_\n` +
                                 `${randomID(32)}`;
  // --- AKHIR PERBAIKAN ---

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

  let successCount = 0;
  let failedCount = 0;

  await conn.reply(m.chat, `_Mengirim pesan broadcast ke ${groups.length} grup..._\n\n*Pesan tidak bisa dihapus oleh admin grup.*`, fkontak);

  for (let id of groups) {
    try {
      let fakeMessage = generateWAMessageFromContent(id, {
          extendedTextMessage: {
              text: formattedBroadcastText,
              contextInfo: {
                  externalAdReply: {
                      title: "Pesan Broadcast",
                      body: "Penting! Harap diperhatikan.",
                      thumbnailUrl: global.bcgc, // Atau thumbnail bot lo
                      sourceUrl: global.gc, // Link channel lo
                      mediaType: 1
                  }
              }
          }
      }, {
          userJid: conn.user.id,
          quoted: m,
          ephemeralExpiration: 86400
      });

      fakeMessage.key.fromMe = false;
      fakeMessage.key.id = 'BROADCAST_' + randomID(16);
      fakeMessage.key.participant = '0@s.whatsapp.net';

      await conn.relayMessage(id, fakeMessage.message, { messageId: fakeMessage.key.id });

      successCount++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      console.error(`Gagal broadcast ke grup ${id}:`, e);
      failedCount++;
    }
  }

  let reportMessage = `✅ *Selesai Broadcast All Group!*\n\n`;
  reportMessage += `*Total Grup:* ${groups.length}\n`;
  reportMessage += `*Berhasil:* ${successCount} grup\n`;
  reportMessage += `*Gagal:* ${failedCount} grup`;

  await conn.reply(m.chat, reportMessage, fkontak);
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

handler.help = ['broadcastgroup <teks>', 'bcgc <teks>'];
handler.tags = ['owner'];
handler.command = /^(broadcast|bc)(group|grup|gc)$/i;

handler.owner = true;

module.exports = handler;

// Helper functions (sudah ada di kode lo)
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

const randomID = length => require('crypto').randomBytes(Math.ceil(length * .5)).toString('hex').slice(0, length);
