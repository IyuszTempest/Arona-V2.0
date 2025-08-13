/*`CHANGE MEDIA TO VIEWONCE`
Req by : +62 856-...-0202
Note : gatau guna apa nggak
Weem :
https://whatsapp.com/channel/0029Vb9ZfML6GcGFm9aPgh0W
*/

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!mime) return conn.reply(m.chat, `Balas media (audio/gambar/video) dengan perintah *${usedPrefix}${command}*`, m);

    let media = await q.download();

    let type;
    if (/image/.test(mime)) type = 'image';
    else if (/video/.test(mime)) type = 'video';
    else if (/audio/.test(mime)) type = 'audio';
    else return conn.reply(m.chat, `Media tidak didukung! Hanya gambar, video, atau audio.`, m);

    let msgContent = {};
    msgContent[type] = media;
    msgContent.caption = `Berikut media ${type} dalam format viewOnce`;
    msgContent.viewOnce = true;

    await conn.sendMessage(m.chat, msgContent, { quoted: m });
};

handler.help = ['viewonce'];
handler.tags = ['tools'];
handler.command = /^viewonce$/i;

module.exports = handler;