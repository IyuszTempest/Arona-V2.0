/*

Plugins : Text To Speech ondoku
Note : Dengan 700+ voice character ☠️
Type : CommonJs
Code by : Chatgpt

- *Sumber* :
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
   
 */

const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

async function ondoku(text, { voice = 'en-US-AdamMultilingualNeural', speed = 1, pitch = 0} = {}) {
  if (!text) throw new Error('⚠️ Teks tidak boleh kosong.');

  const { data: voices} = await axios.get('https://raw.githubusercontent.com/rynn-k/idk/refs/heads/main/json/ondoku-voice.json');
  if (!voices.includes(voice)) {
    throw new Error(`⚠️ Voice *${voice}* tidak tersedia.\n✅ Voice yang tersedia:\n${voices.join(', ')}`);
}
  if (speed < 0.3 || speed> 4) throw new Error('⚠️ Speed minimal 0.3 dan maksimal 4.');
  if (pitch < -20 || pitch> 20) throw new Error('⚠️ Pitch minimal -20 dan maksimal 20.');

  const rynn = await axios.post('https://ondoku3.com/en');
  const $ = cheerio.load(rynn.data);
  const token = $('input[name="csrfmiddlewaretoken"]').attr('value');

  const form = new FormData();
  form.append('text', text);
  form.append('voice', voice);
  form.append('speed', speed.toString());
  form.append('pitch', pitch.toString());

  const { data} = await axios.post('https://ondoku3.com/en/text_to_speech/', form, {
    headers: {
      cookie: rynn.headers['set-cookie'].join('; '),
      origin: 'https://ondoku3.com',
      referer: 'https://ondoku3.com/en/',
      'x-csrftoken': token,
      'x-requested-with': 'XMLHttpRequest',
...form.getHeaders()
}
});

  return data;
}

let handler = async (m, { conn, args, command}) => {
  const input = args.join(' ');
  const voiceListURL = 'https://raw.githubusercontent.com/rynn-k/idk/refs/heads/main/json/ondoku-voice.json';

  if (!input.includes('|')) {
    const { data: voices} = await axios.get(voiceListURL);
    return m.reply(`⚠️ Format salah.\n✅ Format yang benar:\n.${command} <teks>|<voice>\n\n🗣️ Voice yang tersedia:\n${voices.join(', ')}`);
}

  const [text, voice] = input.split('|').map(v => v.trim());
  if (!text ||!voice) {
    const { data: voices} = await axios.get(voiceListURL);
    return m.reply(`⚠️ Teks dan voice harus diisi.\n✅ Format yang benar:\n.${command} <teks>|<voice>\n\n🗣️ Voice yang tersedia:\n${voices.join(', ')}`);
}

  try {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key}});
    const result = await ondoku(text, {
      voice,
      speed: 1,
      pitch: 0
});

    if (!result ||!result.url) return m.reply('❌ Gagal mendapatkan audio.');

    await conn.sendMessage(m.chat, {
      audio: { url: result.url },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })
    conn.sendMessage(m.chat, { react: { text: '✅', key: m.key}});
} catch (err) {
    m.reply(`❌ Error: ${err.message}`);
}
};

handler.command = ['ondoku'];
handler.help = ['ondoku <teks>|<voice>'];
handler.tags = ['tools'];

module.exports = handler;