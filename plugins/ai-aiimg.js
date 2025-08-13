// Plugins Open Ai Vision
// Source: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C

const axios = require('axios');
const uploadImage = require('../lib/uploadImage.js');

const apiKeyList = [
  '662413cf9b2e4a09b8175abf38853f1c',
  'e7956e69c5634672982005bde27e9223',
  '077cf44364ac4c32b8263482ef4371f1',
  '53f034d6af90448eb08b9fd57306ca15',
  '99fca1d1f66c49f19ff5d62a06c5469c',
  'ac21b13204694f70b66ba9241cbb1af1',
  '5cdd70a6fb774a598dec30f739aa7532',
  '002c22a49f5b44aa833a84d5953b48fe',
  '271124eea23d48608c5eabfee5b670ae',
  '662413cf9b2e4a09b8175abf38853f1c'
];

const pickRandom = list => list[Math.floor(Math.random() * list.length)];

async function openAIVision(prompt, image) {
  try {
    const response = await axios.post('https://api.aimlapi.com/chat/completions', {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: image }
            }
          ]
        }
      ],
      max_tokens: 300
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + pickRandom(apiKeyList)
      }
    });

    const mes = response.data.choices[0].message.content;
    return {
      status: true,
      creator: 'SaaOfc',
      message: mes
    };

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return {
      status: false,
      message: 'Gagal memproses gambar. ' + (error.response?.data?.error?.message || error.message)
    };
  }
}

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('Masukkan prompt teks!\nContoh: .ai gambar apa ini?');

  let qmsg = (m.quoted && m.quoted.mimetype) ? m.quoted : m;
  let mime = (qmsg.msg || qmsg).mimetype || '';
  if (!mime.startsWith('image/')) return m.reply('Kirim atau reply gambar dengan caption!\nContoh: .ai gambar apa ini?');

  await conn.sendMessage(m.chat, { react: { text: '🧸', key: m.key } });

  let media = await qmsg.download();
  if (!media) return m.reply('Gagal mengunduh gambar.');

  let imageUrl = await uploadImage(media);
  if (!imageUrl) return m.reply('Gagal mengunggah gambar.');

  let result = await openAIVision(text, imageUrl);
  m.reply(result.message);
};

handler.command = /^aiimg$/i;
handler.tags = ['ai'];
handler.help = ['aiimg <prompt>'];


module.exports = handler;