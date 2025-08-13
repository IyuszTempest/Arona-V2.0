/*Plugins CJS 
Shopee Product Search
*/
const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
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

    if (!args[0]) {
        return conn.reply(m.chat, `Mau cari produk apa di Shopee, masbro?\n\n*Contoh:* *${usedPrefix + command}* tas selempang pria`, fkontak);
    }
    
    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const query = args.join(' ');
        const apiUrl = `https://api.lolhuman.xyz/api/shopee?apikey=${global.lolkey}&query=${encodeURIComponent(query)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const data = await response.json();
        
        if (!data || !data.result || data.result.length === 0) {
            return conn.reply(m.chat, 'Tidak ada produk yang ditemukan untuk pencarian itu.', fkontak);
        }

        let resultText = `*🛍️ Hasil Pencarian Shopee untuk "${query}"*:\n\n`;
        const products = data.result.slice(0, 5); // Ambil 5 produk pertama
        
        products.forEach((product, index) => {
            resultText += `*${index + 1}.* *${product.name}*\n`;
            resultText += `_Harga:_ ${product.price}\n`;
            resultText += `_Toko:_ ${product.shop_name}\n`;
            resultText += `_Link:_ ${product.link}\n\n`;
        });
        
        await conn.reply(m.chat, resultText.trim(), fkontak);
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['shopee <query>'];
handler.tags = ['internet'];
handler.command = /^(shopee|shopeesearch)$/i;
handler.limit = true;

module.exports = handler;