let handler  = async (m, { conn, text, usedPrefix }) => {
  function msToDate(ms) {
		temp = ms
		days = Math.floor(ms / (24*60*60*1000));
		daysms = ms % (24*60*60*1000);
		hours = Math.floor((daysms)/(60*60*1000));
		hoursms = ms % (60*60*1000);
		minutes = Math.floor((hoursms)/(60*1000));
		minutesms = ms % (60*1000);
		sec = Math.floor((minutesms)/(1000));
		// Perbaikan di sini, biar gak ada "0 Hari" kalau cuma jam/menit
		let result = [];
		if (days > 0) result.push(`${days} Hari`);
		if (hours > 0) result.push(`${hours} Jam`);
		if (minutes > 0) result.push(`${minutes} Menit`);
		if (result.length === 0) return "Kurang dari 1 Menit"; // Handle jika sisa waktu sangat sedikit
		return result.join(" ");
  }

	let users = global.db.data.users
	// let { registered, name } = global.db.data.users[m.sender] // Ini tidak dipakai di sini, bisa dihapus kalau memang tidak dibutuhkan

  var responseText = "" // Ganti nama variabel biar gak bentrok sama parameter 'text'
  var i = 1
  let mentionedJids = [];

  for (let jid in users){
    if (users[jid].premium){
      let userData = users[jid];
      let now = new Date() * 1;
      let sisaWaktu = userData.premiumTime - now; // Hitung sisa waktu

      // Pastikan sisa waktu positif (belum kadaluarsa)
      if (sisaWaktu > 0) {
        responseText += `\n**${i}. @${jid.replace(/@.+/, '')}**\n   Sisa: ${msToDate(sisaWaktu)}\n`;
        mentionedJids.push(jid);
        i += 1;
      } else {
        // Kalau premiumnya udah kadaluarsa, mungkin bisa diabaikan atau ditandai
        // Asumsi `handler.before` sudah menghapus status premiumnya
        // Jadi user dengan sisaWaktu <= 0 seharusnya premium: false
      }
    }
  }

  if (i === 1) { // Jika tidak ada user premium yang ditemukan
      return conn.reply(m.chat,`*『 L I S T P R E M I U M 』*\n\nNggak ada user premium nih, masbro.`, m);
  }

  return conn.reply(m.chat,`*『 L I S T P R E M I U M 』*\n\n❏ Total Premium : ${i-1} user\n❏ Ingin Upgrade Ke Premium?\nKetik *${usedPrefix}owner*\n${responseText}`, m, { contextInfo: { mentionedJid: mentionedJids }})
}

handler.help = ['listpremium']
handler.tags = ['info']
handler.command = /^(listpremium|premiumlist|listprem|premlist)$/i
handler.limit = true
module.exports = handler