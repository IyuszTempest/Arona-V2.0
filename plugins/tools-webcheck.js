/*
Plugins CJS diconvert oleh IyuszTempest
Fitur By Anomaki Team
 • Created : xyzan code
 • WEBSITE CHECKER (SCRAPE)
 • Jangan Hapus Wm
 • Sumber Scraper: https://whatsapp.com/channel/0029Vaio4dYC1FuGr5kxfy2l
*/


const axios = require('axios');

async function webcheck(url) {
  const h = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
    'Referer': 'https://en.ryte.com/website-checker/'
  };
  
  try {
    const res = await axios.get(
      `https://website-checker-api.ryte.com/?url=${encodeURIComponent(url)}`, {
        headers: h,
        timeout: 15000
      });
    
    if (!res.data || res.data.status !== 'success' || !res.data.data) {
        throw new Error(res.data.message || 'Respons API tidak valid atau gagal.');
    }
    return res.data.data;
  }
  catch (e) {
    console.error('Error webcheck API:', e.message);
    if (e.response && e.response.data) {
        console.error('Webcheck API Response Error:', e.response.data.toString());
        throw new Error(`API Error: ${e.response.data.message || e.response.data.toString()}`);
    } else if (e.code === 'ECONNABORTED') {
        throw new Error('Permintaan timeout. Coba lagi nanti atau gunakan URL lain.');
    }
    throw new Error(`Terjadi kesalahan saat mengecek website: ${e.message}`);
  }
}

module.exports = webcheck;

let handler = async (m, { conn, text, usedPrefix, command }) => { 
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

    if (!text) {
        return conn.reply(m.chat, `Mau cek website apa, masbro? Contoh: *${usedPrefix + command}* https://www.google.com`, fkontak);
    }
    if (!text.startsWith('http://') && !text.startsWith('https://')) {
        text = 'https://' + text;
    }
    try {
        new URL(text);
    } catch {
        return conn.reply(m.chat, 'Link yang kamu berikan bukan format URL yang valid, masbro.', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const result = await webcheck(text);

        if (!result) {
            throw new Error('Tidak ada data yang berhasil diambil dari website checker.');
        }
        
        let statusEmoji = '❓';
        if (result.statusCode >= 200 && result.statusCode < 300) {
            statusEmoji = '✅'; 
        } else if (result.statusCode >= 400 && result.statusCode < 500) {
            statusEmoji = '⚠️';
        } else if (result.statusCode >= 500 && result.statusCode < 600) {
            statusEmoji = '❌'; 
        }

        let message = `🌐 *Website Checker Result* ${statusEmoji}\n\n`;
        message += `*URL:* ${result.url || '-'}\n`;
        message += `*Status Code:* ${result.statusCode || '-'}\n`;
        message += `*Response Time:* ${result.responseTime || '-'} ms\n`;
        message += `*Title:* ${result.title || '-'}\n`;
        message += `*Description:* ${result.description ? result.description.substring(0, 200) + '...' : '-'}\n`;
        message += `*Is Secure (HTTPS):* ${result.isSecure ? '✅ Ya' : '❌ Tidak'}\n`;
        
        if (result.loadTimeMetrics) {
            message += `\n*Load Time Metrics:*\n`;
            message += `  - Total Load Time: ${result.loadTimeMetrics.totalLoadTime || '-'} ms\n`;
            message += `  - First Contentful Paint: ${result.loadTimeMetrics.firstContentfulPaint || '-'} ms\n`;
        }
        
        message += `\n_Sumber: ryte.com_`;

        await conn.reply(m.chat, message, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin Website Checker:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mengecek website: ${e.message}. Pastikan URL valid dan bisa diakses.`, fkontak);
    }
};

handler.help = ['webcheck <url>'];
handler.tags = ['tools', 'internet'];
handler.command = /^(webcheck|websitecheck|checksite)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;
