/**
 * @ 🎉 TikTok Downloader ( TMate )
 * @ 🎉 Source: https://whatsapp.com/channel/0029VbBDTFd6mYPDtnetTK1f
 * @ 🎉 Scrape: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C/3793
**/

const axios = require('axios'); // Menggunakan require untuk CommonJS
// Import komponen Baileys yang diperlukan untuk carousel
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@adiwajshing/baileys"); 

async function getTokenAndCookie() {
  const res = await axios.get('https://tmate.cc/id', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const cookie = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
  const tokenMatch = res.data.match(/<input[^>]+name="token"[^>]+value="([^"]+)"/i);
  const token = tokenMatch?.[1];
  if (!token) throw new Error('Gagal mendapatkan token keamanan dari TMate.');
  return { token, cookie };
}

async function downloadTikTok(tiktokUrl) {
  const { token, cookie } = await getTokenAndCookie();
  const params = new URLSearchParams();
  params.append('url', tiktokUrl);
  params.append('token', token);

  const res = await axios.post('https://tmate.cc/action', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://tmate.cc/id',
      'Origin': 'https://tmate.cc',
      'Cookie': cookie
    }
  });

  const html = res.data?.data;
  if (!html) throw new Error('Tidak ada data yang diterima dari TMate.');

  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const title = titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Tanpa Judul';

  const matches = [...html.matchAll(/<a[^>]+href="(https:\/\/[^"]+)"[^>]*>\s*<span>\s*<span>([^<]*)<\/span><\/span><\/a>/gi)];
  const seen = new Set();
  const links = matches
    .map(([_, href, label]) => ({ href, label: label.trim() }))
    .filter(({ href }) => !href.includes('play.google.com') && !seen.has(href) && seen.add(href));

  const mp4Links = links.filter(v => /download without watermark/i.test(v.label));
  const mp3Link = links.find(v => /download mp3 audio/i.test(v.label));

  if (mp4Links.length > 0) {
    return { type: 'video', title, mp4Links, mp3Link, originalUrl: tiktokUrl }; // Tambah originalUrl
  }

  const imageMatches = [...html.matchAll(/<img[^>]+src="(https:\/\/tikcdn\.app\/a\/images\/[^"]+)"/gi)];
  const imageLinks = [...new Set(imageMatches.map(m => m[1]))];

  if (imageLinks.length > 0) {
    return { type: 'image', title, images: imageLinks, mp3Link, originalUrl: tiktokUrl }; // Tambah originalUrl
  }

  throw new Error('Tidak ada respon yang valid atau link salah.');
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Definisi fkontak di sini untuk plugin ini
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

    if (!text) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, `😕 *Senpai*, tautan TikTok-nya mana? \nContoh: *${usedPrefix + command}* https://vt.tiktok.com/abcd/`, fkontak);
    }

    // Validasi link TikTok
    if (!text.match(/(tiktok\.com|vt\.tiktok\.com)/i)) {
        return conn.reply(m.chat, 'Link yang kamu berikan bukan link TikTok yang valid, Senpai.', fkontak);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } }); // Reaksi menunggu
        const result = await downloadTikTok(text);

        if (result.type === 'video') {
            await conn.sendMessage(m.chat, {
                video: { url: result.mp4Links[0].href },
                caption: `🎬 *Tiktok Video Downloader*\n🎧 *Judul:* ${result.title}\n🔗 *Link Asli:* ${result.originalUrl}`,
                mimetype: 'video/mp4',
                fileName: `${result.title}.mp4`
            }, { quoted: fkontak });
        } else if (result.type === 'image') {
            // --- LOGIKA UNTUK GAMBAR SLIDE (CAROUSEL) ---
            const carouselCards = [];
            const maxImageCards = Math.min(result.images.length, 10); // Batasi maksimal 10 gambar di carousel

            for (let i = 0; i < maxImageCards; i++) {
                const imageUrl = result.images[i];
                try {
                    // Unduh gambar ke buffer dulu, mirip Pinterest fix
                    const imageBuffer = (await axios.get(imageUrl, {
                        responseType: 'arraybuffer',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Referer': 'https://www.tiktok.com/' // Referer TikTok
                        }
                    })).data;

                    const imageMedia = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });

                    carouselCards.push({
                        body: proto.Message.InteractiveMessage.Body.fromObject({
                            text: `🖼️ *Slide Gambar TikTok #${i + 1}*\n\nJudul: ${result.title}`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.fromObject({
                            text: `Dari TikTok`
                        }),
                        header: proto.Message.InteractiveMessage.Header.fromObject({
                            title: `TikTok Slide: ${result.title.substring(0, 25)}...`,
                            subtitle: `Slide ke-${i + 1}`,
                            hasMediaAttachment: true,
                            imageMessage: imageMedia.imageMessage
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [
                                {
                                    name: "cta_url",
                                    buttonParamsJson: `{"display_text":"Lihat Gambar Asli","url":"${imageUrl}"}`
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: `{"display_text":"Kunjungi TikTok","url":"${result.originalUrl}"}`
                                }
                            ]
                        })
                    });
                } catch (imgError) {
                    console.error(`Gagal memproses gambar slide ke-${i + 1} (${imageUrl}):`, imgError);
                    if (imgError.response) {
                        console.error(`  Status: ${imgError.response.status}, Data: ${imgError.response.data.toString()}`);
                    }
                }
            }

            if (carouselCards.length > 0) {
                const carouselMessage = generateWAMessageFromContent(m.chat, {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `*Gambar Slide TikTok Ditemukan!* Geser untuk melihat semua gambar.`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `Judul: ${result.title}`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: `🖼️ TikTok Slideshow`,
                            hasMediaAttachment: false
                        }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                            cards: carouselCards,
                            messageVersion: 1
                        })
                    })
                }, { userJid: conn.user.id, quoted: fkontak });

                await conn.relayMessage(m.chat, carouselMessage.message, { messageId: carouselMessage.key.id });
            } else {
                await conn.reply(m.chat, `Gagal menampilkan semua gambar slide dari TikTok. Mungkin ada masalah dengan gambar-gambarnya.`, fkontak);
            }
            // --- AKHIR LOGIKA GAMBAR SLIDE ---
        }

        if (result.mp3Link) {
            await conn.sendMessage(m.chat, {
                document: { url: result.mp3Link.href },
                fileName: `${result.title}.mp3`,
                mimetype: 'audio/mpeg'
            }, { quoted: fkontak });
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('Error di plugin TikTok Downloader (TMate):', e);
        await conn.sendMessage(m.chat, { react: { text: "⛔️", key: m.key } });
        await conn.reply(m.chat, `😔 Yah, gagal download dari TikTok nih, Senpai...\n> \`${e.message}\`\nCoba kirim ulang link-nya yaa~`, fkontak);
    }
}

handler.help = ['tt2 <url>'];
handler.tags = ['downloader'];
handler.command = /^(tt2|ttslide2|tiktok2)$/i;
handler.limit = true;
handler.register = true;

module.exports = handler;