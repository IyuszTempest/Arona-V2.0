const uploadImage = require('../lib/uploadImage.js');

function runtime(seconds) {
  seconds = Number(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

const handler = async (m, { conn, text }) => {
  await conn.sendMessage(m.chat, { react: { text: '🎀', key: m.key } });

  const contentText = text?.trim();
  const bannedWords = ['bokep', 'jual', 'promo', 'discount', 'diskon', 'top up', 'topup', 'cheat', 'casino', 'slot'];

  if (bannedWords.some(word => contentText?.toLowerCase().includes(word))) {
    m.reply('Pesan diblokir karena mengandung kata terlarang.');
    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    } catch {
      m.reply('Gagal kick user, cek izin bot.');
    }
    return;
  }

  const idsal = '120363260084721539@newsletter';
  const ppuser = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://files.catbox.moe/tsiugh.jpg');
  const thumb = await uploadImage(await (await conn.getFile(ppuser)).data).catch(() => null);

  const ctx = {
    mentionedJid: [m.sender],
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: idsal,
      serverMessageId: 20,
      newsletterName: 'Arona Chan. Community'
    },
    externalAdReply: {
      title: m.pushName,
      body: `Info runtime: ${runtime(process.uptime())}`,
      thumbnailUrl: thumb,
      mediaType: 1,
      sourceUrl: 'https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c'
    }
  };

  const quoted = m.quoted || {};
  const mime = quoted.mimetype || m.mimetype || '';
  let media = null;

  try {
    if (quoted && quoted.download) {
      media = await quoted.download();
    } else if (m.download) {
      media = await m.download();
    }
  } catch {}

  if (media) {
    if (/image/.test(mime)) {
      const url = await uploadImage(media).catch(() => null);
      if (!url) return m.reply('Gagal upload gambar.');
      await conn.sendMessage(idsal, { image: { url }, caption: contentText || '', contextInfo: ctx });
    } else if (/video/.test(mime)) {
      await conn.sendMessage(idsal, { video: media, caption: contentText || '', contextInfo: ctx });
    } else if (/audio/.test(mime)) {
      await conn.sendMessage(idsal, { audio: media, mimetype: 'audio/mp4', ptt: true, contextInfo: ctx });
    } else if (/sticker/.test(mime)) {
      await conn.sendMessage(idsal, { sticker: media, contextInfo: ctx });
    } else if (/application/.test(mime)) {
      await conn.sendMessage(idsal, { document: media, mimetype: mime, fileName: 'File.pdf', contextInfo: ctx });
    } else {
      return m.reply('Format media tidak didukung.');
    }
  } else if (contentText) {
    await conn.sendMessage(idsal, { text: contentText, contextInfo: ctx });
  } else {
    return m.reply('Kirim teks atau media (gambar, video, dll).');
  }

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

handler.command = ['upch']
handler.help = ['upch']
handler.tags = ['owner']
handler.owner = true;

module.exports = handler;