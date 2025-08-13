/*`CEKRESI, SORRY TADI SALAH`
Weem :
https://whatsapp.com/channel/0029Vb9ZfML6GcGFm9aPgh0W
*/

const fetch = require('node-fetch');
const moment = require('moment-timezone');

async function handler(m, { args }) {
    if (args.length < 2) {
        return m.reply("📌 *Contoh penggunaan:*\n!cekresi <nomor resi> <kurir>\n\n" +
            "Contoh:\n!cekresi 1234567890 jne\n\n" +
            "📌 *Kurir yang tersedia:*\nJNE, JNT, SiCepat, AnterAja, Wahana, RPX, IDExpress, JDL, Lion, TIKI, Ninja, SAP, POS");
    }

    let trackingNumber = args[0];
    let courier = args[1].toLowerCase();

    let validCouriers = ["jne", "jnt", "sicepat", "anteraja", "wahana", "rpx", "idexpress", "jdl", "lion", "tiki", "ninja", "sap", "pos"];

    if (!validCouriers.includes(courier)) {
        return m.reply("❌ *Kurir tidak valid!*\nGunakan salah satu dari: JNE, JNT, SiCepat, AnterAja, Wahana, RPX, IDExpress, JDL, Lion, TIKI, Ninja, SAP, POS.");
    }

    let apiUrl = `https://fastrestapis.fasturl.cloud/search/trackingshipment?trackingNumber=${encodeURIComponent(trackingNumber)}&courier=${encodeURIComponent(courier)}`;

    try {
        let response = await fetch(apiUrl);
        let result = await response.json();

        if (result.status !== 200 || !result.result || !result.result.success) {
            return m.reply("❌ *Gagal melacak resi. Pastikan nomor resi dan kurir sudah benar.*");
        }

        let trackingInfo = result.result;
        let waybill = trackingInfo.waybillId || "Tidak tersedia";
        let origin = trackingInfo.origin?.contactName || "Tidak tersedia";
        let originAddress = trackingInfo.origin?.address || "Tidak tersedia";
        let destination = trackingInfo.destination?.contactName || "Tidak tersedia";
        let destinationAddress = trackingInfo.destination?.address || "Tidak tersedia";
        let deliveryStatus = trackingInfo.status?.replace("_", " ").toUpperCase() || "Tidak diketahui";
        
        let history = trackingInfo.history?.map((h) => {
            let formattedTime = moment(h.updatedAt).tz("Asia/Jakarta").format("DD-MM-YYYY HH:mm") + " WIB";
            return `📅 *${formattedTime}*\n📍 *Status:* ${h.status.replace("_", " ").toUpperCase()}\n🔹 ${h.note}`;
        }).join("\n\n") || "🚫 Tidak ada riwayat pengiriman.";

        let message = `
✅ *Cek Resi Berhasil!*
🚛 *Kurir:* ${courier.toUpperCase()}
📦 *Nomor Resi:* ${waybill}
📍 *Asal:* ${origin}
🏠 *Alamat Asal:* ${originAddress}
🎯 *Tujuan:* ${destination}
🏠 *Alamat Tujuan:* ${destinationAddress}
📢 *Status Pengiriman:* ${deliveryStatus}

📜 *Riwayat Pengiriman:*
${history}
        `.trim();

        m.reply(message);
    } catch (err) {
        console.error("❌ Error:", err);
        m.reply("❌ *Terjadi kesalahan saat melacak resi. Coba lagi nanti.*");
    }
}

handler.command = /^(cekresi)$/i;
handler.help = ["cekresi *<nomor_resi> <kurir>*"];
handler.tags = ["tools"];
handler.limit = true;

module.exports = handler;