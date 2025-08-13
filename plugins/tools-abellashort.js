const axios = require('axios');

let yeon = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      react: { text: "❌", key: m.key }
    });
    return conn.sendMessage(m.chat, {
      text: `🔗 *Senpai*, masukkan URL yang ingin dipendekkan!\nContoh: *${usedPrefix + command}* https://google.com`
    });
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    });

    const { data } = await axios.post(
      'https://short.abella.icu/api/shorten',
      { url: text },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
          'Referer': 'https://short.abella.icu/'
        }
      }
    );

    if (!data.shortUrl) {
      await conn.sendMessage(m.chat, {
        react: { text: "⛔️", key: m.key }
      });
      return conn.sendMessage(m.chat, {
        text: `😞 *Senpai*, Kana tidak bisa memendekkan URL ini~`
      });
    }

    await conn.sendMessage(m.chat, {
      react: { text: "✨", key: m.key }
    });

    return conn.sendMessage(m.chat, {
      text: `🔗 *URL Shortener*\n\n▸ *Original:* ${text}\n▸ *Shortened:* ${data.shortUrl}`,
      footer: "Yeonelle ID",
      buttons: [
        {
          buttonId: `${usedPrefix}abellashort ${text}`,
          buttonText: { displayText: "🔄 Buat Lagi" }
        }
      ],
      headerType: 4
    }, { quoted: m });

  } catch (e) {
    await conn.sendMessage(m.chat, {
      react: { text: "⛔️", key: m.key }
    });
    return conn.sendMessage(m.chat, {
      text: `😞 *Maaf, Senpai!* Kana kesulitan memendekkan URL ini..\nMungkin server sedang sibuk atau URL tidak valid~`
    });
  }
};

yeon.help = ['abellashort <url>'];
yeon.tags = ['tools'];
yeon.command = /^(abellashort|shortabella)$/i;
yeon.register = true;
yeon.limit = true;
module.exports = yeon;