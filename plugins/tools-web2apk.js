const axios = require('axios');
class web2apk {
constructor() {
this.baseURL = 'https://standalone-app-api.appmaker.xyz';
}
async startBuild(url, email) {
try {
console.log('📡 Memulai build request...');
const res = await axios.post(`${this.baseURL}/webapp/build`, { url, email });
console.log('✅ Build request berhasil, App ID:', res.data?.body?.appId);
return res.data?.body?.appId;
} catch (err) {
console.error('❌ Error saat startBuild:', err.message);
throw new Error('Build gagal: ' + err.message);
}
}
async buildConfig(url, appID, appName) {
try {
console.log('⚙️ Memulai konfigurasi build...');
const logo = 'https://logo.clearbit.com/' + url.replace('https://', '');
const config = {
appId: appID,
appIcon: logo,
appName: appName,
isPaymentInProgress: false,
enableShowToolBar: false,
toolbarColor: '#03A9F4',
toolbarTitleColor: '#FFFFFF',
splashIcon: logo
};
const res = await axios.post(`${this.baseURL}/webapp/build/build`, config);
console.log('✅ Konfigurasi build berhasil');
return res.data;
} catch (err) {
console.error('❌ Error saat buildConfig:', err.message);
throw new Error('Build Config gagal: ' + err.message);
}
}
async getStatus(appID) {
try {
console.log('🔍 Memulai monitoring status build...');
while (true) {
const res = await axios.get(`${this.baseURL}/webapp/build/status?appId=${appID}`);
if (res.data?.body?.status === 'success') {
console.log('🎉 Build berhasil selesai!');
return true;
}
console.log('⏳ Status masih dalam proses, menunggu 5 detik...');
await this.delay(5000);
}
} catch (err) {
console.error('❌ Error saat getStatus:', err.message);
throw new Error('Gagal cek status: ' + err.message);
}
}
async getDownload(appID) {
try {
console.log('📥 Mengambil link download...');
const res = await axios.get(`${this.baseURL}/webapp/complete/download?appId=${appID}`);
console.log('✅ Download link berhasil didapat');
return res.data;
} catch (err) {
console.error('❌ Error saat getDownload:', err.message);
throw new Error('Gagal mengambil link download: ' + err.message);
}
}
async build(url, email, appName) {
try {
console.log('🚀 Memulai proses build lengkap...');
const appID = await this.startBuild(url, email);
await this.buildConfig(url, appID, appName);
await this.getStatus(appID);
const link = await this.getDownload(appID);
console.log('🎉 PROSES BUILD LENGKAP BERHASIL!');
return link;
} catch (err) {
console.error('💥 ERROR DALAM PROSES BUILD:', err.message);
throw err;
}
}
async delay(ms) {
return new Promise(res => setTimeout(res, ms));
}
}
let handler = async (m, { conn, text, usedPrefix, command }) => {
conn.web2apk = conn.web2apk ? conn.web2apk : {};
let id = m.chat;
if (!text) {
return m.reply(`*🔧 Web to APK Builder*\n\n*Penggunaan:*\n${usedPrefix + command} <url> | <email> | <nama_app>\n\n*Contoh:*\n${usedPrefix + command} https://google.com | [email protected] | Google App\n\n*Note:* Proses build membutuhkan waktu beberapa menit`);
}
let [url, email, appName] = text.split('|').map(item => item.trim());
if (!url || !email || !appName) {
return m.reply(`*❌ Input tidak lengkap!*\n\nFormat: ${usedPrefix + command} <url> | <email> | <nama_app>\n\nContoh:\n${usedPrefix + command} https://google.com | [email protected] | Google App`);
}
if (!url.startsWith('http://') && !url.startsWith('https://')) {
url = 'https://' + url;
}
if (!email.includes('@') || !email.includes('.')) {
return m.reply('❌ Format email tidak valid!');
}
if (id in conn.web2apk) {
return m.reply('⏳ Masih ada proses build yang sedang berjalan. Harap tunggu sampai selesai.');
}
try {
conn.web2apk[id] = true;
await m.reply('🔄 *Memulai proses build APK...*\n\n📱 *URL:* ' + url + '\n📧 *Email:* ' + email + '\n📦 *Nama App:* ' + appName + '\n\n⏳ *Proses ini membutuhkan waktu beberapa menit, mohon tunggu...*');
const builder = new web2apk();
const result = await builder.build(url, email, appName);
let downloadUrl = null;
if (result && result.body) {
if (result.body.buildFile) {
downloadUrl = result.body.buildFile;
console.log('✅ Found buildFile:', downloadUrl);
} else if (result.body.downloadUrl) {
downloadUrl = result.body.downloadUrl;
console.log('✅ Found downloadUrl:', downloadUrl);
} else if (result.body.keyFile) {
downloadUrl = result.body.keyFile;
console.log('✅ Found keyFile:', downloadUrl);
}
}
if (downloadUrl) {
console.log('✅ Build berhasil dengan download URL:', downloadUrl);
await m.reply(`✅ *APK berhasil dibuat!*\n\n📱 *Nama App:* ${appName}\n🌐 *URL Website:* ${url}\n⬇️ *Link Download:* ${downloadUrl}\n\n*Note:* Link download berlaku selama 24 jam`);
} else {
console.log('❌ Build gagal: Tidak dapat mengambil link download');
await m.reply('❌ *Build gagal!* Tidak dapat mengambil link download. Silakan coba lagi.');
}
} catch (error) {
console.error('💥 Error building APK:', error.message);
await m.reply(`❌ *Error saat build APK:*\n\n${error.message}\n\n*Kemungkinan penyebab:*\n• URL tidak valid atau tidak dapat diakses\n• Server builder sedang down\n• Website tidak support untuk dikonversi\n\nSilakan coba lagi dengan URL yang berbeda.`);
} finally {
delete conn.web2apk[id];
}
}
handler.help = ['web2apk'];
handler.tags = ['tools', 'premium'];
handler.command = /^(web2apk|buatapk|webapk)$/i;
handler.limit = true;
handler.premium = true;
module.exports = handler;