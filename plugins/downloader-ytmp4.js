const axios = require('axios');
const FormData = require('form-data');
class Success {
constructor(data) {
this.success = true;
this.data = data;
}
}
class ErrorResponse {
constructor(error) {
this.success = false;
this.error = error;
}
}
const ytdl = async (url, quality = "720") => {
try {
if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
return new ErrorResponse({
message: "URL YouTube tidak valid!"
});
}
const validQuality = {
"480": 480,
"1080": 1080,
"720": 720,
"360": 360,
"audio": "mp3",
};
if (!Object.keys(validQuality).includes(quality)) {
return new ErrorResponse({
message: "Quality tidak valid!",
availableQuality: Object.keys(validQuality)
});
}
const qualitys = validQuality[quality];
const { data: firstRequest } = await axios.get(
`https://p.oceansaver.in/ajax/download.php?button=1&start=1&end=1&format=${qualitys}&iframe_source=https://allinonetools.com/&url=${encodeURIComponent(url)}`,
{
timeout: 30000,
headers: {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
}
);
if (!firstRequest || !firstRequest.progress_url) {
return new ErrorResponse({
message: "Gagal memulai proses download"
});
}
const { progress_url } = firstRequest;
let metadata = {
image: firstRequest.info?.image || "",
title: firstRequest.info?.title || "Unknown Title",
downloadUrl: "",
quality: quality,
type: quality === "audio" ? "mp3" : "mp4"
};
let datas;
let attempts = 0;
const maxAttempts = 40;
do {
if (attempts >= maxAttempts) {
return new ErrorResponse({
message: "Timeout: Proses download terlalu lama, coba lagi"
});
}
await new Promise(resolve => setTimeout(resolve, 3000));
try {
const { data } = await axios.get(progress_url, {
timeout: 15000,
headers: {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
});
datas = data;
} catch (pollError) {
console.log(`Polling attempt ${attempts + 1} failed, retrying...`);
}
attempts++;
} while (!datas?.download_url);
if (!datas.download_url) {
return new ErrorResponse({
message: "Gagal mendapatkan URL download"
});
}
metadata.downloadUrl = datas.download_url;
return new Success(metadata);
} catch (error) {
if (error.code === 'ECONNABORTED') {
return new ErrorResponse({
message: "Request timeout, coba lagi nanti"
});
}
return new ErrorResponse({
message: error.response?.data?.message || error.message || "Gagal download video"
});
}
};
async function handler(m, { text, conn }) {
if (!text) return m.reply("📌 *Contoh penggunaan:*\n.ytmp4 <url> [resolusi]\nContoh: .ytmp4 https://youtu.be/abc123 720");
const args = text.split(" ");
const url = args[0];
const quality = args[1]?.replace(/p$/, '') || "480";
const isValidUrl = url.startsWith("http") && (url.includes("youtube.com") || url.includes("youtu.be"));
if (!isValidUrl) return m.reply("❌ *Masukkan URL YouTube yang valid.*");
const maxResolution = 1080;
if (parseInt(quality) > maxResolution) {
return m.reply(`⚠️ *Resolusi maksimal yang diperbolehkan adalah ${maxResolution}p.*`);
}
const validQualities = ["360", "480", "720", "1080"];
if (!validQualities.includes(quality)) {
return m.reply(`❌ *Resolusi tidak valid. Gunakan: ${validQualities.join(", ")}*`);
}
try {
m.reply("⏳ *Mengambil data, mohon tunggu...*");
const result = await ytdl(url, quality);
if (!result.success) {
return m.reply(`❌ *${result.error.message}*`);
}
const { title, image, downloadUrl } = result.data;
const caption = `
🎬 *Judul:* ${title}
📥 *Resolusi:* ${quality}p
`.trim();
if (image) {
await conn.sendMessage(m.chat, {
image: { url: image },
caption,
mentions: [m.sender]
}, { quoted: m });
}
m.reply(`📥 *Mengunduh video dalam resolusi ${quality}p...*`);
await conn.sendMessage(m.chat, {
video: { url: downloadUrl, mimetype: 'video/mp4' },
caption,
mentions: [m.sender]
}, { quoted: m });
} catch (err) {
m.reply("❌ *Terjadi kesalahan saat mengambil data.*");
}
}
handler.command = /^(ytmp4)$/i;
handler.help = ["ytmp4 *<url>* *[resolusi]*"];
handler.tags = ["downloader"];
handler.limit = true;
handler.premium = false;
module.exports = handler;
