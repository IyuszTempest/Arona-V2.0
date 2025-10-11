/*
 * Nama Fitur : Cek Plugin Error
 * Type       : Plugin CJS
 * Author     : Alfat.syah
 */

const fs = require('fs')
const path = require('path')

let handler = async (m, { conn }) => {
  const fkontak = {
      key: {
          participants: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          fromMe: false,
          id: "Halo"
      },
      message: {
          contactMessage: {
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
      },
      participant: "0@s.whatsapp.net"
  };
  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

  let dir = path.join(__dirname);
  let files = fs.readdirSync(dir).filter(v => v.endsWith('.js'));
  let errorPlugins = [];

  for (let file of files) {
    try {
      const filePath = path.join(dir, file);
      delete require.cache[require.resolve(filePath)];
      require(filePath);
    } catch (err) {
      errorPlugins.push({
        file: file,
        error: err.stack || err.message
      });
    }
  }

  if (errorPlugins.length === 0) {
    let successMsg = `Halo Sensei! ✨\n\nAku sudah periksa semua plugin dan semuanya aman terkendali! Tidak ada error yang ditemukan.\n\n✅ *Total Plugin Diperiksa:* ${files.length}`;
    await conn.reply(m.chat, successMsg, fkontak);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } else {
    let errorMsg = `🚩 *Waduh, Sensei! Aku menemukan ${errorPlugins.length} plugin yang error:*\n\n`;
    errorPlugins.forEach(plugin => {
      errorMsg += `╭─「 *${plugin.file}* 」\n`;
      errorMsg += `│ 🐞 *Error:* ${plugin.error.split('\n')[0]}\n`; // Hanya baris pertama error
      errorMsg += `╰─────────────\n\n`;
    });
    errorMsg += `Sensei, tolong diperbaiki ya biar Bot bisa bekerja dengan baik lagi! 🙏`;
    await conn.reply(m.chat, errorMsg, fkontak);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
}

handler.command = /^(cekplugin|checkplugin|cpe)$/i
handler.owner = true

module.exports = handler;
