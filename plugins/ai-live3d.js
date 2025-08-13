/**
    @ ✨ Scrape Live3D Image Generator (Support Nsfw)
    @ Base: https://live3d.io/ai-chibi-generator#ai-chibi-generator
**/

const ws = require('ws'); // Menggunakan require untuk CommonJS

async function aiart(prompt, options = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            const {
                style = 'Anime',
                negativePrompt = '(worst quality, low quality:1.4), (greyscale, monochrome:1.1), cropped, lowres , username, blurry, trademark, watermark, title, multiple view, Reference sheet, curvy, plump, fat, strabismus, clothing cutout, side slit,worst hand, (ugly face:1.2), extra leg, extra arm, bad foot, text, name',
                scale = 7
            } = options;
            
            const _style = ['Anime', 'Realistic'];
            
            if (!prompt) throw new Error('Prompt is required');
            if (!_style.includes(style)) throw new Error(`Available styles: ${_style.join(', ')}`);
            
            const session_hash = Math.random().toString(36).substring(2);
            const socket = new ws('wss://app.yimeta.ai/ai-art-generator/queue/join');
            
            socket.on('open', () => {
                // console.log('WebSocket connected.');
            });

            socket.on('message', (data) => {
                const d = JSON.parse(data.toString('utf8'));
                switch (d.msg) {
                    case 'send_hash':
                        socket.send(JSON.stringify({
                            fn_index: 31,
                            session_hash,
                        }));
                        break;
                    
                    case 'send_data':
                        socket.send(JSON.stringify({
                            fn_index: 31,
                            session_hash,
                            data: [style, prompt, negativePrompt, scale, ''], // data: [style, prompt, negativePrompt, scale, seed(optional)]
                        }));
                        break;
                    
                    case 'estimation':
                    case 'process_starts':
                        // console.log(`Processing... Estimated time: ${d.avg_dur}`);
                        break;
                    
                    case 'process_completed':
                        socket.close();
                        if (d.output && d.output.data && d.output.data[0] && d.output.data[0][0] && d.output.data[0][0].name) {
                            resolve(d.output.data[0][0].name); // URL gambar
                        } else {
                            reject(new Error('Output data tidak valid dari Live3D AI.'));
                        }
                        break;
                    
                    case 'process_generating': // Tambahan jika ada pesan generating
                        // console.log(`Generating: ${d.progress}`);
                        break;

                    case 'queue_full':
                        socket.close();
                        reject(new Error('Antrean Live3D AI penuh, coba lagi nanti.'));
                        break;

                    case 'close_stream':
                        // console.log('Stream closed by server.');
                        socket.close();
                        break;
                        
                    default:
                        // console.log(`Unexpected message type: ${data.toString('utf8')}`);
                        break;
                }
            });

            socket.on('error', (err) => {
                console.error('WebSocket error:', err);
                socket.close();
                reject(new Error(`WebSocket error: ${err.message}`));
            });

            socket.on('close', () => {
                // console.log('WebSocket closed.');
            });

            // Set timeout jika proses terlalu lama
            setTimeout(() => {
                if (socket.readyState === ws.OPEN) {
                    socket.close();
                }
                reject(new Error('Request Live3D AI timeout setelah 120 detik.'));
            }, 120 * 1000); // Timeout 120 detik (2 menit)

        } catch (error) {
            reject(new Error(error.message));
        }
    });
}

// --- Handler Plugin Bot ---
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
        let exampleText = `Gunakan format: ${usedPrefix + command} <prompt>|<style>\n\n` +
                          `*Prompt:* Deskripsi gambar yang diinginkan (bahasa Inggris).\n` +
                          `*Style (opsional):* Anime, Realistic (default: Anime).\n\n` +
                          `*Contoh:* ${usedPrefix + command} a cute girl in a fantasy world|Realistic\n` +
                          `*Contoh NSFW:* ${usedPrefix + command} naked sexy girl in bed|Realistic (gunakan dengan bijak!)`;
        return conn.reply(m.chat, exampleText, fkontak);
    }

    const args = text.split('|').map(arg => arg.trim());
    const prompt = args[0];
    const style = args[1] || 'Anime';
    
    const supportedStyles = ['Anime', 'Realistic'];

    if (!prompt) {
        return conn.reply(m.chat, "Prompt tidak boleh kosong, masbro!", fkontak);
    }

    if (!supportedStyles.includes(style)) {
        return conn.reply(m.chat, `Gaya *${style}* tidak didukung. Pilih salah satu: ${supportedStyles.join(', ')}`, fkontak);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } }); // Reaksi menunggu

        const imageUrl = await aiart(prompt, { style: style });

        if (imageUrl) {
            await conn.sendMessage(m.chat, {
                image: { url: imageUrl },
                caption: `✨ *Live3D AI Art* ✨\n*Prompt:* ${prompt}\n*Style:* ${style}`,
                contextInfo: {
                    externalAdReply: {
                        title: 'Live3D AI Image Generator',
                        body: `Generated by Arona-BOT`,
                        thumbnailUrl: imageUrl, // Pakai gambar yang sama sebagai thumbnail
                        sourceUrl: 'https://live3d.io/ai-chibi-generator',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: fkontak }); // Pakai fkontak sebagai quoted

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } }); // Reaksi berhasil
        } else {
            throw new Error('Gagal mendapatkan URL gambar dari Live3D AI.');
        }

    } catch (e) {
        console.error('Error in Live3D AI Art Generator:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat membuat gambar: ${e.message}. Coba lagi nanti ya.`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }); // Reaksi error
    }
};

handler.help = ['live3d <prompt>|<style>'];
handler.tags = ['ai', 'premium','nsfw'];
handler.command = /^(live3d|live3dai|chibi)$/i;
handler.limit = true; // Tambahkan jika perlu limitasi
handler.premium = true; // Ganti jadi true jika command premium

module.exports = handler;