let handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply("Fitur ini hanya dapat digunakan dalam grup.");
  if (!(isAdmin || isOwner)) return m.reply("Maaf, fitur ini hanya dapat digunakan oleh admin grup.");

  global.db.data.chats = global.db.data.chats || {};
  global.db.data.users = global.db.data.users || {};

  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {};
  }

  if (!args[0]) return m.reply("Silakan gunakan: .antitoxic *on/off*");

  if (args[0] === "on") {
    if (global.db.data.chats[m.chat].antitoxic) return m.reply("Fitur Anti Toxic sudah aktif di grup ini.");
    global.db.data.chats[m.chat].antitoxic = true;
    return m.reply("*Anti Toxic* berhasil diaktifkan dalam grup ini.");
  } else if (args[0] === "off") {
    if (!global.db.data.chats[m.chat].antitoxic) return m.reply("Fitur Anti Toxic sudah nonaktif di grup ini.");
    global.db.data.chats[m.chat].antitoxic = false;
    return m.reply("*Anti Toxic* berhasil dinonaktifkan dalam grup ini.");
  } else {
    return m.reply("Mohon pilih opsi yang valid: *on/off*");
  }
};

// Daftar kata toxic contoh (bisa kamu tambah sendiri)
const toxicWords = [
  'anjing', 'babi', 'goblok', 'bajingan',
  'fuck', 'shit', 'bitch', 'asshole', 'kontol', 'kntl', 'anj', 'asu', 'pepek', 'memek', 'lonte', 'bego', 'bodoh', 'tolol', 'buajigan',
];

handler.before = async (m, { conn, isBotAdmin, isAdmin }) => {
  global.db.data.chats = global.db.data.chats || {};
  global.db.data.users = global.db.data.users || {};

  if (!m.isGroup) return;
  if (!global.db.data.chats[m.chat]?.antitoxic) return;

  let text = '';
  if (m.message.conversation) text = m.message.conversation;
  else if (m.message.extendedTextMessage) text = m.message.extendedTextMessage.text;
  else if (m.message.imageMessage && m.message.imageMessage.caption) text = m.message.imageMessage.caption;
  else if (m.message.videoMessage && m.message.videoMessage.caption) text = m.message.videoMessage.caption;
  else return;

  const lowerText = text.toLowerCase();
  const isToxic = toxicWords.some(word => lowerText.includes(word));
  if (!isToxic) return;

  const userId = m.sender;

  global.db.data.users[userId] = global.db.data.users[userId] || {};
  global.db.data.users[userId].toxicCount = (global.db.data.users[userId].toxicCount || 0) + 1;

  const warnCount = global.db.data.users[userId].toxicCount;

  await conn.sendMessage(m.chat, {
    text: `@${userId.split("@")[0]} jangan toxic ya! Ini peringatan ke-${warnCount} ✅`,
    mentions: [userId]
  }, { quoted: m });

  if (warnCount >= 3) {
    if (isBotAdmin && isAdmin) {
      await conn.groupMuteUser(m.chat, userId, 3600); // mute 1 jam
      await conn.sendMessage(m.chat, {
        text: `@${userId.split("@")[0]} sudah di-mute karena toxic berulang! ❌`,
        mentions: [userId]
      });
      global.db.data.users[userId].toxicCount = 0; // reset count
    } else {
      await conn.sendMessage(m.chat, {
        text: `@${userId.split("@")[0]}, tolong jangan toxic ya! Bot perlu jadi admin untuk mute.`,
        mentions: [userId]
      });
    }
  }
};

handler.command = ['antitoxic'];
handler.help = ['antitoxic *on/off*'];
handler.tags = ['group'];
handler.group = true;
handler.admin = true;

module.exports = handler;