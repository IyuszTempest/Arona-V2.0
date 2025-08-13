let handler = m => m;

handler.before = async m => { 
  let user = global.db.data.users[m.sender];

  // --- TAMBAH FILTER DI SINI ---
  // Pastikan ini adalah pesan teks, gambar, video, atau audio yang punya body/caption
  if (!m.text && !m.message && !m.msg) return true; // ABAIKAN JIKA BUKAN PESAN DENGAN KONTEN
  // Tambahan: Lo bisa juga cek m.mtype
  // if (m.mtype === 'reactionMessage' || m.mtype === 'protocolMessage' || m.mtype === 'senderKeyDistributionMessage') return true;
  // --- AKHIR FILTER ---

  const fkontak = {
      key: {
          participants: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          fromMe: false,
          id: "Halo"
      },
      message: {
          contactMessage: {
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
      },
      participant: "0@s.whatsapp.net"
  };

  if (user.afk > -1) {
    let afkDuration = new Date() - user.afk;
    await m.reply(`
🎉 *Selamat Datang Kembali!* 🎉

Lu telah berhenti dari mode AFK${user.afkReason ? ` setelah:\n📝 *Alasan:* "${user.afkReason}"` : '.'}
😴 *Total Durasi AFK:* ${clockString(afkDuration)}

Semoga hari mu senin terus! ✨
`.trim(), null, { quoted: fkontak });
    user.afk = -1;
    user.afkReason = '';
  }

  let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];
  if (jids.length > 0) {
    for (let jid of jids) {
      if (jid === m.sender) continue;
      let mentionedUser = global.db.data.users[jid];
      if (!mentionedUser || mentionedUser.afk < 0) continue;

      let afkTime = mentionedUser.afk;
      let reason = mentionedUser.afkReason || '';
      let afkDuration = new Date() - afkTime;

      let mentionedUserName = conn.getName(jid); // Pastikan 'conn' di-pass ke handler.before

      await m.reply(`
🤫 *Sssstt... Jangan Ganggu!* 🤫

Pengguna *${mentionedUserName}* (@${jid.replace(/@.+/, '')}) sedang dalam mode AFK.
${reason ? `💬 *Alasan:* "${reason}"` : '🚫 *Tanpa alasan khusus.*'}

⏳ *Sudah AFK Selama:* ${clockString(afkDuration)}

Jangan di tag, sampai kembali aktif ya! 🙏
`.trim(), null, { quoted: fkontak });
    }
  }
  return true;
};

module.exports = handler;

function clockString(ms) {
  if (isNaN(ms) || ms < 0) return 'sebentar tadi';
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;

  let H = h.toString().padStart(2, '0');
  let M = m.toString().padStart(2, '0');
  let S = s.toString().padStart(2, '0');

  if (h > 0) {
    return `${H} jam ${M} menit ${S} detik`;
  } else if (m > 0) {
    return `${M} menit ${S} detik`;
  } else {
    return `${S} detik`;
  }
}
