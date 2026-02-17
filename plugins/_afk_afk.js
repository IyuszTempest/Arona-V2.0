/**
 * @ 💤 AFK Mode Enhanced
 * @ Description: Plugin AFK dengan gaya yang lebih estetik dan gaul.
 **/

let handler = async (m, { text, conn }) => {
  let user = global.db.data.users[m.sender];
  user.afk = +new Date();
  user.afkReason = text.trim();

  let senderName = m.pushName || m.sender.split('@')[0];

  // Fitur Quoted Message agar tampilan lebih profesional
  const fkontak = {
      key: {
          participants: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          fromMe: false,
          id: "AFK_NOTIFICATION"
      },
      message: {
          contactMessage: {
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Euphy;;;\nFN:Euphy Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
      },
      participant: "0@s.whatsapp.net"
  };

  let caption = `
╭─── 〔 *AFK* 〕 ───
│
│ 👤 *User:* ${senderName}
│ 🕒 *Waktu:* ${new Date().toLocaleTimeString('id-ID')} WIB
│ 📝 *Alasan:* ${text.trim() ? text.trim() : '_Tanpa alasan (mungkin lagi isekai)_'}
│
╰───────────────────

> *“Dia sedang menepi dari hiruk pikuk duniawi. Euphy akan menjaga chat ini dengan baik! Matane~”* 🌸
  `.trim();

  await conn.reply(m.chat, caption, fkontak);
};

handler.help = ['afk [alasan]'];
handler.tags = ['main'];
handler.command = /^afk$/i;

module.exports = handler;
