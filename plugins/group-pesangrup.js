/* Plugins CJS
Pesan grup 1 link/id
Sumber :https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
Author : F6F411
*/
let handler = async (m, { conn, args }) => {
 if (!args || args.length < 2) return m.reply('Format salah! Contoh:\n.pesangrup <link|id> pesan');

 let target = args[0];
 let pesan = args.slice(1).join(' ');

 let jid = '';

 if (target.startsWith('https://chat.whatsapp.com/')) {
 let inviteCode = target.split('https://chat.whatsapp.com/')[1];
 if (!inviteCode) return m.reply('Link grup tidak valid!');

 try {
 // Join grup dulu
 jid = await conn.groupAcceptInvite(inviteCode);
 } catch (e) {
 return m.reply('Gagal join grup: ' + e.message);
 }
 } else {
 if (!target.endsWith('@g.us')) {
 jid = target + '@g.us';
 } else {
 jid = target;
 }
 }

 try {
 await conn.sendMessage(jid, { text: pesan });
 m.reply('Pesan berhasil dikirim ke grup!');
 } catch (e) {
 m.reply('Gagal mengirim pesan ke grup: ' + e.message);
 }
};

handler.command = /^pesangrup$/i;
handler.tags = ['group'];
handler.help = ['pesangrup'];
handler.owner = true;

module.exports = handler;