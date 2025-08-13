/*Plugins CJS 
Kartu Nikah Generator
*/
const fetch = require('node-fetch');
const uploader = require('../lib/uploadFile'); // Asumsi ada fungsi uploadFile.js

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Definisi fkontak
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
    
    if (!text || !text.includes('|')) {
        return conn.reply(m.chat, `Format teks salah, masbro. Pastikan semua data dipisah dengan simbol '|'!\n\n*Contoh:* *${usedPrefix + command}* Tahu|Tempe|11 Agustus 2025|Wakanda|Wakanda Forever|XXXX/XXXX/VI/2025`, fkontak);
    }

    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }

        await conn.reply(m.chat, global.wait, fkontak);

        let [suami, istri, tgl, kec, prov, akta] = text.split('|');
        
        // Menggunakan placeholder yang lebih reliabel
        let ppsuami = 'https://i.ibb.co/6P6X72X/suami.jpg';
        let ppistri = 'https://i.ibb.co/Jz4F4wM/istri.jpg';
        let qrcode = 'https://i.ibb.co/y4L2V4n/qrcode.jpg';

        const apiUrl = `https://api.lolhuman.xyz/api/kartunikah?apikey=${global.lolkey}&ppsuami=${encodeURIComponent(ppsuami)}&ppistri=${encodeURIComponent(ppistri)}&qrcode=${encodeURIComponent(qrcode)}&suami=${encodeURIComponent(suami)}&istri=${encodeURIComponent(istri)}&tgl=${encodeURIComponent(tgl)}&kec=${encodeURIComponent(kec)}&prov=${encodeURIComponent(prov)}&akta=${encodeURIComponent(akta)}`;

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const buffer = await response.buffer();
        
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: '💍 Selamat menempuh hidup baru!'
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['kartunikah <suami>|<istri>|<tgl>|<kec>|<prov>|<akta>'];
handler.tags = ['maker', 'premium'];
handler.command = /^(kartunikah|nikah)$/i;
handler.limit = true;
handler.premium = true;

module.exports = handler;