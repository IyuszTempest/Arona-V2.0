// PLUGIN STICKER TO MP4
const fetch = require('node-fetch');
const FormData = require('form-data');
const cheerio = require('cheerio');

/** @type {import('../../lib/plugins').Handler} */
let handler = async (m, { conn, text, usedPrefix, command }) => {
 let [atas, bawah] = text.split('|');
 // Limitnya cekak, gabisa deh~
 if (db.data.users[m.sender].limit < 1) return m.reply(mess.limit);
 // Harus reply sticker ya!
 if (!m.quoted) return m.reply('Reply Sticker dong~');
 // Pastiin itu sticker webp
 if (!/webp/.test(m.quoted.mimetype)) return m.reply(`Reply sticker pake caption *${usedPrefix + command}* ya!`);

 let media = await m.quoted.download();
 let smp4 = await webp2mp4(media);
 conn.sendFile(m.chat, smp4, '', '', m);
}

handler.help = ['tovideo', 'tovid', 'tomp4']
handler.tags = ['tools']
handler.command = /^(tovideo|tovid|tomp4)$/i

module.exports = handler

async function webp2mp4(source) {
 let form = new FormData();
 let isUrl = typeof source === 'string' && /https?:\/\//.test(source);
 form.append('new-image-url', isUrl ? source : '');
 form.append('new-image', isUrl ? '' : source, 'image.webp');
 let res = await fetch('https://ezgif.com/webp-to-mp4', {
 method: 'POST',
 body: form
 });
 let html = await res.text();
 let $ = cheerio.load(html);
 let form2 = new FormData();
 let obj = {};
 $('form input[name]').each((_, el) => {
 obj[$(el).attr('name')] = $(el).val();
 form2.append($(el).attr('name'), $(el).val());
 });
 let res2 = await fetch('https://ezgif.com/webp-to-mp4/' + obj.file, {
 method: 'POST',
 body: form2
 });
 let html2 = await res2.text();
 let $2 = cheerio.load(html2);
 return new URL($2('div#output > p.outfile > video > source').attr('src'), res2.url).toString();
}