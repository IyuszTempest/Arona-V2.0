/*
 *<>AUTO MENGIRIM STIKER KETIKA MENGTAG NOMOR BOT<>*
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
DON'T DELETE THIS WM!
HAPUS WM MANDUL 7 TURUNAN 
HAPUS WM=SDM RENDAH 
*BAGI YANG RECODE DAN YANG MENYESUAIKAN LAGI NI CODE, MOHON UNTUK JANGAN DIHAPUS WM PERTAMA, ATAU BERI CREDIT LINK CH YANG SHARE CODE INI!*
"aku janji tidak akan hapus wm ini"
JUM'AT, 09 MEI 2025 17:00
*/
const fetch = require('node-fetch');

const handler = async (m, { conn }) => {
  if (!m.mentionedJid?.includes(conn.user.jid)) return;
//jangan dihapus kang https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
  let res = await fetch('https://files.catbox.moe/zgryz7.webp');
  let buffer = await res.buffer();

  conn.sendFile(m.chat, buffer, 'tag.webp', '', m, { asSticker: true });
};

handler.customPrefix = /@/i;
handler.command = new RegExp;
handler.group = true;

module.exports = handler;
/*
 *<>AUTO MENGIRIM STIKER KETIKA MENGTAG NOMOR BOT<>*
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
DON'T DELETE THIS WM!
HAPUS WM MANDUL 7 TURUNAN 
HAPUS WM=SDM RENDAH 
*BAGI YANG RECODE DAN YANG MENYESUAIKAN LAGI NI CODE, MOHON UNTUK JANGAN DIHAPUS WM PERTAMA, ATAU BERI CREDIT LINK CH YANG SHARE CODE INI!*
"aku janji tidak akan hapus wm ini"
JUM'AT, 09 MEI 2025 17:00
*/