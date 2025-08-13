const axios = require('axios');
const FormData = require('form-data');
class RVCHoloID {
constructor() {
this.api_url = 'https://kit-lemonfoot-vtuber-rvc-models.hf.space';
this.file_url = 'https://kit-lemonfoot-vtuber-rvc-models.hf.space/file=';
this.models = {
moona: {
fn: 44,
file: ['Moona Hoshinova', 'weights/hololive-id/Moona/Moona_Megaaziib.pth', 'weights/hololive-id/Moona/added_IVF1259_Flat_nprobe_1_v2_mbkm.index', '']
},
lofi: {
fn: 45,
file: ['Airani Iofifteen', 'weights/hololive-id/Iofi/Iofi_KitLemonfoot.pth', 'weights/hololive-id/Iofi/added_IVF256_Flat_nprobe_1_AiraniIofifteen_Speaking_V2_v2.index', '']
},
risu: {
fn: 46,
file: ['Ayunda Risu', 'weights/hololive-id/Risu/Risu_Megaaziib.pth', 'weights/hololive-id/Risu/added_IVF2090_Flat_nprobe_1_v2_mbkm.index', '']
},
ollie: {
fn: 47,
file: ['Kureiji Ollie', 'weights/hololive-id/Ollie/Ollie_Dacoolkid.pth', 'weights/hololive-id/Ollie/added_IVF2227_Flat_nprobe_1_ollie_v2_mbkm.index', '']
},
anya: {
fn: 48,
file: ['Anya Melfissa', 'weights/hololive-id/Anya/Anya_Megaaziib.pth', 'weights/hololive-id/Anya/added_IVF910_Flat_nprobe_1_anyav2_v2_mbkm.index', '']
},
reine: {
fn: 49,
file: ['Pavolia Reine', 'weights/hololive-id/Reine/Reine_KitLemonfoot.pth', 'weights/hololive-id/Reine/added_IVF256_Flat_nprobe_1_PavoliaReine_Speaking_KitLemonfoot_v2.index', '']
},
zeta: {
fn: 50,
file: ['Vestia Zeta', 'weights/hololive-id/Zeta/Zeta_Megaaziib.pth', 'weights/hololive-id/Zeta/added_IVF462_Flat_nprobe_1_zetav2_v2.index', '']
},
kaela: {
fn: 51,
file: ['Kaela Kovalskia', 'weights/hololive-id/Kaela/Kaela_Megaaziib.pth', 'weights/hololive-id/Kaela/added_IVF265_Flat_nprobe_1_kaelaV2_v2.index', '']
},
kobo: {
fn: 52,
file: ['Kobo Kanaeru', 'weights/hololive-id/Kobo/Kobo_Megaaziib.pth', 'weights/hololive-id/Kobo/added_IVF454_Flat_nprobe_1_kobov2_v2.index', '']
}
};
}
generateSession = function () {
return Math.random().toString(36).substring(2);
}
upload = async function (buffer) {
try {
const upload_id = this.generateSession();
const orig_name = `rynn_${Date.now()}.mp3`;
const form = new FormData();
form.append('files', buffer, orig_name);
const { data } = await axios.post(`${this.api_url}/upload?upload_id=${upload_id}`, form, {
headers: {
...form.getHeaders()
}
});
return {
orig_name,
path: data[0],
url: `${this.file_url}${data[0]}`
};
} catch (error) {
throw new Error(error.message);
}
}
process = async function (buffer, options = {}) {
try {
const {
model = 'moona',
transpose = 0
} = options;
if (!Buffer.isBuffer(buffer)) throw new Error('Audio buffer is required');
if (!Object.keys(this.models).includes(model)) throw new Error(`Available models: ${Object.keys(this.models).join(', ')}`);
const audio_url = await this.upload(buffer);
const session_hash = this.generateSession();
const d = await axios.post(`${this.api_url}/queue/join?`, {
data: [
...this.models[model].file,
{
path: audio_url.path,
url: audio_url.url,
orig_name: audio_url.orig_name,
size: buffer.length,
mime_type: 'audio/mpeg',
meta: {
_type: 'gradio.FileData'
}
},
'',
'English-Ana (Female)',
transpose,
'pm',
0.4,
1,
0,
1,
0.23
],
event_data: null,
fn_index: this.models[model].fn,
trigger_id: 620,
session_hash: session_hash
});
const { data } = await axios.get(`${this.api_url}/queue/data?session_hash=${session_hash}`);
let result;
const lines = data.split('\n\n');
for (const line of lines) {
if (line.startsWith('data:')) {
const d = JSON.parse(line.substring(6));
if (d.msg === 'process_completed') result = d.output.data[1].url;
}
}
return result;
} catch (error) {
throw new Error(error.message);
}
}
}
let handler = async (m, { conn, args, text }) => {
try {
if (!m.quoted || !m.quoted.mtype || !m.quoted.mtype.includes('audio')) {
return m.reply('Reply sebuah voice note dengan command .vchanger [model] [transpose]\n\nModel tersedia: moona, lofi, risu, ollie, anya, reine, zeta, kaela, kobo\nTranspose: angka untuk mengubah pitch (-12 sampai 12)');
}
const rvc = new RVCHoloID();
const availableModels = Object.keys(rvc.models);
const model = args[0] || 'moona';
const transpose = parseInt(args[1]) || 0;
if (!availableModels.includes(model)) {
return m.reply(`Model tidak tersedia!\nModel tersedia: ${availableModels.join(', ')}`);
}
if (transpose < -12 || transpose > 12) {
return m.reply('Transpose harus antara -12 sampai 12');
}
m.reply('🎵 Sedang memproses voice changer, mohon tunggu...');
const audioBuffer = await m.quoted.download();
const result = await rvc.process(audioBuffer, {
model: model,
transpose: transpose
});
if (!result) {
return m.reply('❌ Gagal memproses audio. Silakan coba lagi.');
}
const audioResponse = await axios.get(result, { responseType: 'arraybuffer' });
const processedAudio = Buffer.from(audioResponse.data);
await conn.sendMessage(m.chat, {
audio: processedAudio,
mimetype: 'audio/mpeg',
ptt: true
}, { quoted: m });
m.reply(`✅ Voice berhasil diubah menggunakan model: ${model}${transpose !== 0 ? ` dengan transpose: ${transpose}` : ''}`);
} catch (error) {
console.error('Voice changer error:', error);
m.reply('❌ Terjadi kesalahan saat memproses voice changer. Silakan coba lagi.');
}
}
handler.help = ['vchanger'];
handler.tags = ['ai'];
handler.command = /^(vchanger)$/i;
handler.register = true;
handler.limit = true;
module.exports = handler;