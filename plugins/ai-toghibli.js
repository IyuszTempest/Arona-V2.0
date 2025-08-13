let handler = async (m, { conn }) => {
const axios = (await import('axios')).default;
const { randomUUID, randomBytes } = await import('crypto');
const FormData = (await import('form-data')).default;
if (!m.quoted || !m.quoted.fileSha256) return m.reply('Mane gambarnye, bray?');
const uuid = randomUUID();
const buffer = await m.quoted.download?.();
if (!buffer) return m.reply('Gagal download media, bray!');
const mimetype = m.quoted.mimetype || 'image/jpeg';
const ext = '.' + mimetype.split('/')[1];
const filename = `Fiony_${randomBytes(4).toString('hex')}${ext}`;
const form = new FormData();
form.append('file', buffer, { filename, contentType: mimetype });
const headers = {
...form.getHeaders(),
authorization: 'Bearer',
'x-device-language': 'en',
'x-device-platform': 'web',
'x-device-uuid': uuid,
'x-device-version': '1.0.44'
};
try {
m.reply('⏳ Processing image to Ghibli style...');
const uploadRes = await axios.post(
'https://widget-api.overchat.ai/v1/chat/upload',
form,
{ headers }
);
const { link, croppedImageLink, chatId } = uploadRes.data;
const prompt = m.text || 'Ghibli Studio style, charming hand-drawn anime-style illustration.';
const payload = {
chatId,
prompt,
model: 'gpt-image-1',
personaId: 'image-to-image',
metadata: {
files: [{ path: filename, link, croppedImageLink }]
}
};
const jsonHeaders = {
...headers,
'content-type': 'application/json'
};
const genRes = await axios.post(
'https://widget-api.overchat.ai/v1/images/generations',
payload,
{ headers: jsonHeaders }
);
if (genRes.data && genRes.data.data && genRes.data.data[0] && genRes.data.data[0].url) {
const imageUrl = genRes.data.data[0].url;
await conn.sendFile(m.chat, imageUrl, 'ghibli-result.png', '✨ *Ghibli Style Generated!*', m);
} else {
m.reply('❌ Gagal generate gambar: ' + JSON.stringify(genRes.data, null, 2));
}
} catch (err) {
const detail = err.response?.data || err.message;
m.reply('❌ Error: ' + JSON.stringify(detail, null, 2));
}
}
handler.help = ['toghibli'];
handler.tags = ['ai','premium'];
handler.command = /^(toghibli)$/i;
handler.premium = true;
module.exports = handler;