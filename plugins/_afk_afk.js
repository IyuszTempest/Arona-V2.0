/**
 * @ 💤 AFK Mode
 * @ Description: Plugin ini mengaktifkan mode AFK (Away From Keyboard)
 * untuk user yang sedang tidak aktif, dengan custom quoted message.
 **/

let handler = async (m, { text, conn }) => {
  let user = global.db.data.users[m.sender];
  user.afk = +new Date();
  user.afkReason = text.trim();

  let senderName = m.pushName || m.sender.split('@')[0];

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

  let replyText = `
💤 *Mode AFK Diaktifkan* 💤

Sensei *${senderName}* sekarang sedang istirahat sebentar.
Aku akan menjaga semuanya selagi Sensei pergi!

${text.trim() ? `📝 *Alasan:* ${text.trim()}` : '🤔 *Alasan:* _Tidak disebutkan_'}

Sampai jumpa lagi nanti, Sensei! 👋
  `.trim();

  await conn.reply(m.chat, replyText, fkontak);
};

handler.help = ['afk [alasan opsional]'];
handler.tags = ['main'];
handler.command = /^afk$/i;

module.exports = handler;
