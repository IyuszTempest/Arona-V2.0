/*`CEKPLN`
Weem :
https://whatsapp.com/channel/0029Vb9ZfML6GcGFm9aPgh0W
*/

const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `Contoh penggunaan:\n*${usedPrefix}${command} 520522604488*`, m);

    try {
        let res = await axios.get(`https://fastrestapis.fasturl.cloud/tool/checkpln?id=${text}`);
        let json = res.data;

        if (json.status !== 200 || !json.result) {
            return conn.reply(m.chat, `Gagal mendapatkan data, pastikan ID pelanggan benar.`, m);
        }

        const {
            customerNumber,
            customerName,
            tariffPower,
            month,
            meterReading,
            totalBill,
            adminFee,
            totalPayment,
            depositDeduction,
            status,
            billType
        } = json.result;

        let hasil = `
🔌 *CEK STATUS PLN*

*Jenis Tagihan:* ${billType}
*Status:* ${status}
*Bulan:* ${month}

*ID Pelanggan:* ${customerNumber}
*Nama:* ${customerName}
*Tarif/Daya:* ${tariffPower}
*Stand Meter:* ${meterReading}

💸 *Total Tagihan:* ${totalBill}
💰 *Biaya Admin:* ${adminFee}
🧾 *Total Bayar:* ${totalPayment}
➖ *Potongan Deposito:* ${depositDeduction}
        `.trim();

        conn.sendMessage(m.chat, { text: hasil }, { quoted: m });
    } catch (err) {
        console.error(err);
        conn.reply(m.chat, `Terjadi kesalahan saat memproses permintaan.`, m);
    }
};

handler.help = ['cekpln <id>'];
handler.tags = ['tools'];
handler.command = /^(cekpln)$/i;

module.exports = handler;