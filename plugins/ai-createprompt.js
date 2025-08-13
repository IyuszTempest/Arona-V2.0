// *<>CREATEPROMPT , MEMBUAT PROMPT UNTUK GAMBAR<>*
// SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
// SUMBER SCRAPE: https://whatsapp.com/channel/0029VbB0oUvBlHpYbmFDsb3E/262
// DON'T DELETE THIS WM!
// HAPUS WM MANDUL 7 TURUNAN
// HAPUS WM=SDM RENDAH
// `BAGI YANG RECODE DAN YANG MENYESUAIKAN LAGI NI CODE, MOHON UNTUK JANGAN DIHAPUS WM PERTAMA, ATAU BERI CREDIT LINK CH YANG SHARE CODE INI!`
// "aku janji tidak akan hapus wm ini, karena amanah ini harus saya pegang!"
// MINGGU, 13 APRIL 2025 12:55

const axios = require('axios');

/** @type {import('../../lib/plugins').PluginType} */
let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `contoh penggunaan:\n${usedPrefix + command} tuliskan promptmu di sini`;

  try {
    let res = await createPrompt(text);

    if (!res || typeof res !== 'string') throw 'gagal';
    // https://whatsapp.com/channel/0029VbB0oUvBlHpYbmFDsb3E/262
    m.reply(res);
  } catch (e) {
    console.error(e);
    throw 'Terjadi kesalahan saat memproses prompt.';
  }
};

handler.help = ['createprompt <teks>'];
handler.tags = ['tools','ai'];
handler.command = /^createprompt|buatprompt$/i;

module.exports = handler;

// scrape by https://whatsapp.com/channel/0029VbB0oUvBlHpYbmFDsb3E/262
async function createPrompt(prompt) {
  const payload = {
    content: prompt,
    op: 'op-prompt',
  };

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/json',
    Origin: 'https://junia.ai',
    Referer: 'https://junia.ai/',
    Connection: 'keep-alive',
    'Sec-Fetch-Site': 'same-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Ch-Ua': '"Chromium";v="123", "Not:A-Brand";v="8"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
  };

  try {
    const response = await axios.post('https://api-v1.junia.ai/api/free-tools/generate', payload, { headers });

    if (response?.data?.result) {
      return response.data.result;
    } else if (typeof response.data === 'string') {
      return response.data;
    } else {
      throw new Error('Respons dari API tidak sesuai format.');
    }
  } catch (error) {
    console.error("Error during API request:", error);
    throw new Error('Terjadi kesalahan saat menghubungi API.');
  }
}

// *<>CREATEPROMPT , MEMBUAT PROMPT UNTUK GAMBAR<>*
// SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
// SUMBER SCRAPE: https://whatsapp.com/channel/0029VbB0oUvBlHpYbmFDsb3E/262
// DON'T DELETE THIS WM!
// HAPUS WM MANDUL