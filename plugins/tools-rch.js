/**
@credit Tio
@Tixo MD
@Whatsapp Bot
@Support dengan Donasi ✨
wa.me/6282285357346
**/

const xStr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ' '];
const yStr = Object.freeze({
  1: ['🅐','🅑','🅒','🅓','🅔','🅕','🅖','🅗','🅘','🅙','🅚','🅛','🅜','🅝','🅞','🅟','🅠','🅡','🅢','🅣','🅤','🅥','🅦','🅧','🅨','🅩','1','2','3','4','5','6','7','8','9','0','➖'],
});

async function style(text, style = 1) {
  const replacer = [];
  xStr.map((v, i) => replacer.push({
    original: v,
    convert: yStr[style][i]
  }));
  const str = text.toLowerCase().split('');
  const output = [];
  str.map(v => {
    const find = replacer.find(x => x.original == v);
    find ? output.push(find.convert) : output.push(v);
  });
  return output.join('');
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("Contoh penggunaan: .rch https://whatsapp.com/channel/xxx Hai");

  let args = text.split(" ");
  if (args.length < 2) return m.reply("Format salah! Contoh: .rch https://whatsapp.com/channel/xxx Hai");

  let url = args[0];
  let rawText = args.slice(1).join(" ");
  let emoji = await style(rawText);

  let result = url.split('https://whatsapp.com/channel/')[1];
  let [id, kode] = result.split("/");
  let res = await conn.newsletterMetadata("invite", id);

  try {
    await conn.newsletterReactMessage(res.id, kode, emoji);
    m.reply(`Reaksi berhasil dikirim ke ${res.name} dengan kode ${kode} dan emoji: ${emoji}`);
  } catch (error) {
    m.reply(`Gagal mengirim reaksi: ${error.message}`);
  }
};

handler.help = ['rch'];
handler.command = ['rch'];
handler.tags = ['tools'];

module.exports = handler;