/*PLUGINS CJS 
Pixeldrain Downloader
*Versi ESMnya:* _https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X/308_
*Sumber:* _https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X_
*/

const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function formatDate(dateStr) {
  let d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

let handler = async (m, { conn, args }) => {
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    if (!args[0]) {
        return conn.reply(m.chat, 'Linknya mana, masbro?\nContoh: .pixeldrain https://pixeldrain.com/u/xxxxx', fkontak);
    }

    let url = args[0];
    let match = url.match(/pixeldrain\.com\/u\/([a-zA-Z0-9]+)/);
    if (!match) {
        return conn.reply(m.chat, 'Link tidak valid. Contoh: https://pixeldrain.com/u/xxxxx', fkontak);
    }

    let fileID = match[1];

    try {
        await conn.sendMessage(m.chat, { react: { text: '📦', key: m.key } });
        
        let html = await fetch(url).then(res => res.text());
        let dom = new JSDOM(html);
        let script = [...dom.window.document.querySelectorAll('script')]
          .find(s => s.textContent.includes('window.viewer_data'))?.textContent;

        let jsonMatch = script?.match(/window\.viewer_data\s*=\s*(\{.+?\});/s);
        if (!jsonMatch) {
            return conn.reply(m.chat, 'Gagal mengambil data file. Coba link lain.', fkontak);
        }

        let data = JSON.parse(jsonMatch[1]).api_response;

        let downloadUrl = `https://pixeldrain.com/api/file/${fileID}`;
        let fileRes = await fetch(downloadUrl);
        if (!fileRes.ok) {
            return conn.reply(m.chat, 'Gagal mengunduh file. Link mungkin sudah kadaluarsa.', fkontak);
        }

        let fileBuffer = await fileRes.buffer();
        let mime = fileRes.headers.get('content-type') || 'application/octet-stream';

        await conn.sendMessage(m.chat, {
          document: fileBuffer,
          mimetype: mime,
          fileName: data.name,
          caption: `
📁 *${data.name}*
📦 Ukuran: *${formatBytes(data.size)}*
⬇️ Unduhan: *${data.downloads.toLocaleString()}*
👀 Dilihat: *${data.views.toLocaleString()}*
🗓️ Diunggah: *${formatDate(data.date_upload)}*
🔗 https://pixeldrain.com/u/${fileID}
`.trim()
        }, { quoted: fkontak });

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, 'Gagal kirim file:\n' + (e.message || e), fkontak);
    }
};

handler.help = ['pixeldrain2 <url>'];
handler.tags = ['downloader'];
handler.command = /^pixeldrain2$/i;

module.exports = handler;
