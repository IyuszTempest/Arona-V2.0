const axios = require('axios');

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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    if (!text) {
        return conn.reply(m.chat, `Formatnya salah, pake pemisah | ya.\n\nContoh:\n*${usedPrefix + command}* jakarta | surabaya | 1kg`, fkontak);
    }
    const args = text.split('|');
    if (args.length !== 3) {
        return conn.reply(m.chat, `Input harus ada 3 bagian: asal, tujuan, dan berat.\n\nContoh:\n*${usedPrefix + command}* bandung | medan | 5kg`, fkontak);
    }
    const [asal, tujuan, berat] = args.map(arg => arg.trim());
    if (!asal || !tujuan || !berat) {
        return conn.reply(m.chat, `Kolom asal, tujuan, dan berat tidak boleh kosong ya.\n\nContoh:\n*${usedPrefix + command}* semarang | makassar | 200g`, fkontak);
    }

    try {
        await conn.reply(m.chat, `📦 Sabar, lagi ngecek ongkir dari *${asal}* ke *${tujuan}*...`, fkontak);

        const apiUrl = `https://api.zenzxz.my.id/tools/cekongkir?asal=${encodeURIComponent(asal)}&tujuan=${encodeURIComponent(tujuan)}&berat=${encodeURIComponent(berat)}`;
        const response = await axios.get(apiUrl);
        const result = response.data.result;

        if (!response.data.success || !result || !result.couriers || result.couriers.length === 0) {
            return conn.reply(m.chat, `❌ Ongkir tidak ditemukan. Pastikan nama kota asal dan tujuan sudah benar ya.`, fkontak);
        }

        let output = `📦 *Hasil Pengecekan Ongkos Kirim*\n\n`;
        output += `📍 *Dari:* ${result.route.dari}\n`;
        output += `➡️ *Ke:* ${result.route.menuju}\n`;
        output += `⚖️ *Berat:* ${result.route.berat}\n`;
        output += `\n================================\n\n`;

        result.couriers.forEach(courier => {
            output += `🚚 *${courier.name}*\n`;
            if (courier.services && courier.services.length > 0) {
                courier.services.forEach(service => {
                    output += `  › *Layanan:* ${service.service} (${service.desc})\n`;
                    output += `    💰 *Harga:* ${service.price}\n`;
                    if (service.estimate) {
                        output += `    🕒 *Estimasi:* ${service.estimate}\n`;
                    }
                    output += `\n`;
                });
            } else {
                output += `  - Tidak ada layanan yang tersedia -\n\n`;
            }
        });

        await conn.reply(m.chat, output.trim(), fkontak);

    } catch (error) {
        console.error("Error fetching ongkir:", error);
        await conn.reply(m.chat, 'Gagal cek ongkirnya nih. Kayaknya server API lagi error atau nama kota tidak valid. Coba lagi nanti.', fkontak);
    }
};

handler.help = ['cekongkir <asal>|<tujuan>|<berat>'];
handler.tags = ['tools'];
handler.command = ['cekongkir'];

module.exports = handler;