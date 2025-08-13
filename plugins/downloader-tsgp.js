const fetch = require("node-fetch");

const randomEmoji = () => {
  const emojis = ["🚀", "⚡", "🎨", "📷", "🛠️", "✨", "📤", "✅", "🐦"];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

let handler = async (m, { conn, args }) => {
  if (!args[0]) throw `${randomEmoji()} Masukin URL tweet!\nContoh: .tsgp https://twitter.com/elonmusk/status/123456`;

  let tweetUrl = args[0];
  let steps = [
    "Menghubungi server...",
    "Memproses screenshot tweet...",
    "Menambahkan watermark transparan...",
    "Mengunggah hasil...",
    "Selesai!"
  ];

  for (let step of steps) {
    await conn.reply(m.chat, `${randomEmoji()} ${step}`, m);
  }

  try {
    const res = await fetch("https://api.orshot.com/v1/generate/images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 58a2ae628bd469e38f138bafc5b5c332"
      },
      body: JSON.stringify({
        templateId: "tweet-screenshot",
        response: { format: "png", type: "base64" },
        modifications: {
          tweetUrl: tweetUrl,
          theme: "dark",
          hideMedia: false,
          watermark: {
            text: "Hatsune Miku MD",
            position: "bottom-right",
            opacity: 0.5, // transparan 50%
            fontSize: 20,
            color: "#00bfff"
          }
        }
      })
    });

    const json = await res.json();
    if (!json.data) throw new Error("Gagal mengambil screenshot tweet");

    let buffer = Buffer.from(json.data, "base64");
    await conn.sendMessage(
      m.chat,
      { image: buffer, caption: `${randomEmoji()} Nih hasilnya bro` },
      { quoted: m }
    );

  } catch (err) {
    conn.reply(m.chat, `❌ Error: ${err.message}`, m);
  }
};

handler.help = ['tsgp <url-tweet>'];
handler.tags = ['tools'];
handler.command = /^tsgp$/i;
handler.limit = true;

module.exports = handler;