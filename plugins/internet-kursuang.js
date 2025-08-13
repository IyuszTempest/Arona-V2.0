/*Plugins CJS 
Currency Converter
sumber: https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
*/
const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
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

    if (args.length !== 3) {
        return conn.reply(m.chat, `Format salah. Gunakan: *${usedPrefix + command}* <jumlah> <dari> <ke>\n\n*Contoh:* *${usedPrefix + command}* 10 USD IDR`, fkontak);
    }
    
    let amount = parseFloat(args[0]);
    let from = args[1].toUpperCase();
    let to = args[2].toUpperCase();

    if (isNaN(amount) || amount <= 0) {
        return conn.reply(m.chat, 'Jumlah yang dimasukkan tidak valid.', fkontak);
    }

    await conn.reply(m.chat, global.wait, fkontak);

    try {
        const apiUrl = `https://api.siputzx.my.id/api/currency/convert?amount=${amount}&from=${from}&to=${to}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json();
        
        if (!data.status || !data.data) {
            return conn.reply(m.chat, 'Gagal melakukan konversi. Mungkin kode mata uang tidak valid.', fkontak);
        }

        const result = data.data;
        
        let message = `*📊 Konversi Mata Uang* 📊\n\n`;
        message += `*Jumlah Awal:* ${result.amount} ${result.from}\n`;
        message += `*Jumlah Akhir:* ${result.result.toFixed(2)} ${result.to}\n\n`;
        message += `*Kurs Hari Ini:* 1 ${result.from} = ${result.rate} ${result.to}\n`;
        
        await conn.reply(m.chat, message.trim(), fkontak);
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['kurs <jumlah> <dari> <ke>'];
handler.tags = ['tools', 'internet'];
handler.command = /^(kurs)$/i;
handler.limit = true;

module.exports = handler;
