/*
Jangan Hapus Wm Bang 

*Tulis Anime  Plugins CJS*

Wes Apalah Namanya Terserah 

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Case Source]*

https://whatsapp.com/channel/0029VadfVP5ElagswfEltW0L/2435
*/

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const { Sticker } = require("wa-sticker-formatter");

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply("Masukkan teks untuk tulisan anime.");

  m.reply("Sedang diproses...");

  try {
    const imageUrl = "https://files.catbox.moe/wftnwc.jpg";
    const imagePath = path.join(__dirname, "gambar_anime.jpg");

    // Mengunduh gambar
    const response = await axios({ url: imageUrl, responseType: "arraybuffer" });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

    // Memuat gambar dan membuat canvas
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Menggambar gambar ke canvas
    ctx.drawImage(image, 0, 0);

    // Mengatur font dan warna teks
    ctx.font = "32px sans-serif";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Menentukan posisi teks
    const x = image.width / 2;
    const y = 750; // Sesuaikan posisi vertikal sesuai kebutuhan
    const maxWidth = 600;

    // Memotong teks jika terlalu panjang
    const words = text.split(" ");
    let line = "";
    const lines = [];

    for (let word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && line) {
        lines.push(line);
        line = word + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Menggambar teks ke canvas
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * 40); // Sesuaikan jarak antar baris
    });

    // Menyimpan hasil ke file
    const outputPath = path.join(__dirname, "hasil.png");
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    // Mengonversi gambar menjadi stiker
    const sticker = new Sticker(fs.readFileSync(outputPath), {
      pack: "Arona MD",
      author: "IyuszDeveloper",
      type: "image/png",
    });

    const stickerBuffer = await sticker.toBuffer();
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

    // Menghapus file sementara
    fs.unlinkSync(imagePath);
    fs.unlinkSync(outputPath);
  } catch (e) {
    console.error(e);
    m.reply("Terjadi kesalahan saat memproses stiker.");
  }
};

handler.help = ["tulisanime"];
handler.command = ["tulisanime"];
handler.tags = ["sticker"];

module.exports = handler;