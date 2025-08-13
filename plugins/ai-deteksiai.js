/*
 • Fitur By Anomaki Team
 • Created : xyzan code
 • Detector Teks Ai
 • Jangan Hapus Wm
 • https://whatsapp.com/channel/0029Vaio4dYC1FuGr5kxfy2l
 
 - Rest Api Gratis
 https://www.apis-anomaki.zone.id/
*/
const fetch = require ('node-fetch')

const handler = async (m, {
    conn,
    text
}) => {
    const isi = text || m.quoted?.text
    if (!isi) return conn.reply(m.chat, 'Send/Reply Teksnya', m)

    const res = await fetch(`https://www.apis-anomaki.zone.id/ai/ai-detectortext?text=${encodeURIComponent(isi)}`)
    const json = await res.json()
    if (!json?.status || !json?.result?.success) return conn.reply(m.chat, 'Gagal mendeteksi teks.', m)

    const hasil = json.result.data
    const desk = hasil.explanation

    const trs = await fetch(`https://www.apis-anomaki.zone.id/tools/translate?word=${encodeURIComponent(desk)}&to=id&from=en`)
    const tjson = await trs.json()
    const translated = tjson?.result?.translated || explanation

    const teks = `- *Deteksi Teks AI*\n\n*Persentase AI:* ${hasil.persentase}\n\n- *Penjelasan:*\n${translated}`
    conn.reply(m.chat, teks, m)
}

handler.help = ['deteksiteks']
handler.tags = ['ai']
handler.command = /^deteksiteks$/i
handler.limit = true

module.exports = handler;