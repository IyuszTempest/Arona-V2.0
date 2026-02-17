const axios = require('axios');
const FormData = require('form-data');
class WaifuTagger {
constructor() {
this.api_url = 'https://smilingwolf-wd-tagger.hf.space/gradio_api';
this.file_url = 'https://smilingwolf-wd-tagger.hf.space/gradio_api/file=';
}
generateSession = function () {
return Math.random().toString(36).substring(2);
}
upload = async function (buffer) {
try {
const upload_id = this.generateSession();
const orig_name = `rynn_${Date.now()}.jpg`;
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
model = 'SmilingWolf/wd-swinv2-tagger-v3',
general_tags_threshold = 0.35,
general_mcut_threshold = false,
char_tags_threshold = 0.85,
char_mcut_threshold = false
} = options;
const _model = ['deepghs/idolsankaku-eva02-large-tagger-v1', 'deepghs/idolsankaku-swinv2-tagger-v1', 'SmilingWolf/wd-convnext-tagger-v3', 'SmilingWolf/wd-eva02-large-tagger-v3', 'SmilingWolf/wd-swinv2-tagger-v3', 'SmilingWolf/wd-v1-4-convnext-tagger-v2', 'SmilingWolf/wd-v1-4-convnextv2-tagger-v2', 'SmilingWolf/wd-v1-4-moat-tagger-v2', 'SmilingWolf/wd-v1-4-swinv2-tagger-v2', 'SmilingWolf/wd-v1-4-vit-tagger-v2', 'SmilingWolf/wd-vit-large-tagger-v3', 'SmilingWolf/wd-vit-tagger-v3']
if (!Buffer.isBuffer(buffer)) throw new Error('Image buffer is required');
if (!_model.includes(model)) throw new Error(`Available models: ${_model.join(', ')}`);
if (general_tags_threshold > 1 || char_tags_threshold > 1) throw new Error('Max tags threshold: 1');
if (typeof general_mcut_threshold !== 'boolean' || typeof char_mcut_threshold !== 'boolean') throw new Error('Mcut threshold must be boolean');
const image_url = await this.upload(buffer);
const session_hash = this.generateSession();
const d = await axios.post(`${this.api_url}/queue/join?`, {
data: [
{
path: image_url.path,
url: image_url.url,
orig_name: image_url.orig_name,
size: buffer.length,
mime_type: 'image/jpeg',
meta: {
_type: 'gradio.FileData'
}
},
model,
general_tags_threshold,
general_mcut_threshold,
char_tags_threshold,
char_mcut_threshold
],
event_data: null,
fn_index: 2,
trigger_id: 18,
session_hash: session_hash
});
const { data } = await axios.get(`${this.api_url}/queue/data?session_hash=${session_hash}`);
let result;
const lines = data.split('\n\n');
for (const line of lines) {
if (line.startsWith('data:')) {
const d = JSON.parse(line.substring(6));
if (d.msg === 'process_completed') result = d.output.data;
}
}
return {
prompt: result[0],
rating: result[1].confidences,
character: {
name: result[2]?.label,
confidences: result[2]?.confidences
},
tags: {
name: result[3].label,
confidences: result[3].confidences
}
};
} catch (error) {
throw new Error(error.message);
}
}
}
let handler = async (m) => {
try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''
if (!mime.startsWith('image/')) {
return conn.reply(m.chat, '⚠️ Kirim atau reply gambar untuk deteksi karakter!', m)
}
conn.reply(m.chat, '🔍 Menganalisis gambar...', m)
let imageBuffer = await q.download()
const waifuTagger = new WaifuTagger()
const result = await waifuTagger.process(imageBuffer)
let response = '🎭 *Character Detection Results*\n\n'
if (result.character.name) {
response += `👤 *Character:* ${result.character.name}\n`
response += `📊 *Confidence:* ${(result.character.confidences[0]?.confidence * 100).toFixed(2)}%\n\n`
}
if (result.prompt) {
response += `🏷️ *Generated Tags:*\n${result.prompt}\n\n`
}
if (result.rating && result.rating.length > 0) {
response += `🔞 *Content Rating:*\n`
result.rating.forEach(rating => {
response += `• ${rating.label}: ${(rating.confidence * 100).toFixed(1)}%\n`
})
response += '\n'
}
if (result.tags.confidences && result.tags.confidences.length > 0) {
response += `🏆 *Top Tags:*\n`
result.tags.confidences.slice(0, 10).forEach(tag => {
response += `• ${tag.label}: ${(tag.confidence * 100).toFixed(1)}%\n`
})
}
conn.reply(m.chat, response, m)
} catch (error) {
console.error('Character detector error:', error)
conn.reply(m.chat, `❌ Error: ${error.message}`, m)
}
}
handler.help = ['chardetect']
handler.tags = ['ai']
handler.command = /^(chardetect)$/i
handler.register = true
handler.limit = true
module.exports = handler
