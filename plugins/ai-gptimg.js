const gpt1image = async (yourImagination) => {
const headers = {
"content-type": "application/json",
"referer": "https://gpt1image.exomlapi.com/",
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
}
const body = JSON.stringify({
"prompt": yourImagination,
"n": 1,
"size": "1024x1024",
"is_enhance": true,
"response_format": "url"
})
const response = await fetch("https://gpt1image.exomlapi.com/v1/images/generations", {
headers,
body,
"method": "POST"
});
if (!response.ok) throw Error(`fetch gagal di alamat ${response.url} ${response.status} ${response.statusText}.`)
const json = await response.json()
const url = json?.data?.[0]?.url
if (!url) throw Error("fetch berhasil tapi url result nya kosong" + (json.error ? ", error dari server : " + json.error : "."))
return url
}
async function handler(m, { conn, text }) {
if (!text) return m.reply('Kasih Deks Gmabr ny\n\nExample : .gptimage long haired anime girl with blue eyes')
m.reply('Wait...')
try {
const imageUrl = await gpt1image(text)
await conn.sendMessage(m.chat, {
image: { url: imageUrl },
}, { quoted: m })
} catch (error) {
m.reply(`${error.message}`)
}
}
handler.help = ['gptimg']
handler.command = ['gptimg', 'generateimage']
handler.tags = ['ai','premium']
handler.premium = true;
module.exports = handler