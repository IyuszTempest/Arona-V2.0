/**
    @ ✨ Scrape Colorify AI (Text to Sketch & Image to Sketch)
    @ Base: https://colorifyai.art/
**/

const ws = require('ws'); // Menggunakan require untuk CommonJS

class ColorifyAI {
    _createSocket(endpoint, data) {
        return new Promise((resolve, reject) => {
            const sessionHash = Math.random().toString(36).substring(2);
            // fn_index ini perlu dicek secara berkala di base URL jika ada perubahan
            // Untuk text2sketch (demo-colorify-text2img), fn_index biasanya 0
            // Untuk image2sketch (demo-colorify-img2img), fn_index biasanya 1
            const fn_index = endpoint === 'demo-colorify-text2img' ? 0 : 1; 

            const socket = new ws(`wss://colorifyai.art/${endpoint}/queue/join`);
            
            socket.on('open', () => {
                // console.log('WebSocket connected:', endpoint);
            });

            socket.on('message', (msg) => {
                const d = JSON.parse(msg.toString('utf8'));
                
                switch (d.msg) {
                    case 'send_hash':
                        socket.send(JSON.stringify({ fn_index: fn_index, session_hash: sessionHash }));
                        break;
                    case 'send_data':
                        socket.send(JSON.stringify({ data: [fn_index === 0 ? data.prompt : data.source_image, data.aspect_ratio || null, data.style || null, data.request_from || 10] })); // Mengirim data sesuai fn_index
                        break;
                    case 'process_completed':
                        socket.close();
                        if (d.output && d.output.result && d.output.result[0]) {
                            resolve(d.output.result[0]); // URL gambar hasil
                        } else {
                            reject(new Error('Output tidak valid dari Colorify AI.'));
                        }
                        break;
                    case 'estimation':
                    case 'process_starts':
                        // console.log(`Processing... Estimated time: ${d.avg_dur}`);
                        break;
                    case 'queue_full':
                        socket.close();
                        reject(new Error('Antrean Colorify AI penuh, coba lagi nanti.'));
                        break;
                    case 'close_stream':
                        socket.close();
                        break;
                    default:
                        // console.log(`Unexpected message: ${msg.toString('utf8')}`);
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
                reject(new Error('Request Colorify AI timeout setelah 120 detik.'));
            }, 120 * 1000); // Timeout 120 detik (2 menit)
        });
    }

    text2sketch = async (prompt, options = {}) => {
        const _ratio = ['1:1', '3:4', '4:3', '9:16', '16:9', '2:3', '3:2'];
        const _style = ['default', 'sci-fi', 'pixel', 'chibi', 'graffiti', 'minimalist', 'anime'];
        
        const { ratio = '1:1', style = 'default' } = options;
        
        if (!prompt) throw new Error('Prompt is required');
        if (!_ratio.includes(ratio)) throw new Error(`Available ratios: ${_ratio.join(', ')}`);
        if (!_style.includes(style)) throw new Error(`Available styles: ${_style.join(', ')}`);
        
        // Data yang dikirim ke socket harus sesuai fn_index
        return this._createSocket('demo-colorify-text2img', {
            prompt,
            aspect_ratio: ratio,
            style,
            request_from: 10 // Ini nilai default di websitenya
        });
    }
    
    image2sketch = async (buffer) => {
        if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('Image buffer is required');
        
        // Untuk image2sketch, payload-nya langsung base64
        const result = await this._createSocket('demo-colorify-img2img', {
            source_image: `data:image/jpeg;base64,${buffer.toString('base64')}`, // Asumsi JPEG
            request_from: 10
        });
        return `https://temp.colorifyai.art/${result}`; // URL hasil dari API
    }
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

    const colorifyAI = new ColorifyAI();
    const availableRatios = ['1:1', '3:4', '4:3', '9:16', '16:9', '2:3', '3:2'];
    const availableStyles = ['default', 'sci-fi', 'pixel', 'chibi', 'graffiti', 'minimalist', 'anime'];

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (command === 'text2sketch') {
        if (!text) {
            let exampleText = `Gunakan format: ${usedPrefix + command} <prompt>|<ratio>|<style>\n\n` +
                              `*Prompt:* Deskripsi sketsa.\n` +
                              `*Ratio (opsional):* ${availableRatios.join(', ')} (default: 1:1).\n` +
                              `*Style (opsional):* ${availableStyles.join(', ')} (default: default).\n\n` +
                              `*Contoh:* ${usedPrefix + command} a futuristic city|16:9|sci-fi`;
            return conn.reply(m.chat, exampleText, fkontak);
        }

        const args = text.split('|').map(arg => arg.trim());
        const prompt = args[0];
        const ratio = args[1] || '1:1';
        const style = args[2] || 'default';

        if (!prompt) {
            return conn.reply(m.chat, "Prompt tidak boleh kosong, masbro!", fkontak);
        }
        if (!availableRatios.includes(ratio)) {
            return conn.reply(m.chat, `Rasio *${ratio}* tidak didukung. Pilih salah satu: ${availableRatios.join(', ')}`, fkontak);
        }
        if (!availableStyles.includes(style)) {
            return conn.reply(m.chat, `Gaya *${style}* tidak didukung. Pilih salah satu: ${availableStyles.join(', ')}`, fkontak);
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            const imageUrl = await colorifyAI.text2sketch(prompt, { ratio, style });

            if (imageUrl) {
                await conn.sendMessage(m.chat, {
                    image: { url: imageUrl },
                    caption: `✨ *Colorify AI (Text to Sketch)* ✨\n*Prompt:* ${prompt}\n*Ratio:* ${ratio}\n*Style:* ${style}`,
                    contextInfo: {
                        externalAdReply: {
                            title: 'Colorify AI - Text to Sketch',
                            body: `Generated by Arona-BOT`,
                            thumbnailUrl: imageUrl,
                            sourceUrl: 'https://colorifyai.art/',
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: fkontak });
                await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            } else {
                throw new Error('Gagal mendapatkan URL gambar dari Colorify AI.');
            }
        } catch (e) {
            console.error('Error in Colorify AI (Text2Sketch):', e);
            await conn.reply(m.chat, `Terjadi kesalahan saat membuat sketsa: ${e.message}. Coba lagi nanti ya.`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        }

    } else if (command === 'img2sketch') {
        if (!mime || !mime.startsWith('image/')) {
            return conn.reply(m.chat, `Reply gambar dengan caption ${usedPrefix + command} untuk mengubahnya menjadi sketsa.`, fkontak);
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            let buffer = await q.download(); // Download gambar yang di-reply
            const imageUrl = await colorifyAI.image2sketch(buffer);

            if (imageUrl) {
                await conn.sendMessage(m.chat, {
                    image: { url: imageUrl },
                    caption: `✨ *Colorify AI (Image to Sketch)* ✨\nDari gambar yang kamu berikan.`,
                    contextInfo: {
                        externalAdReply: {
                            title: 'Colorify AI - Image to Sketch',
                            body: `Generated by Arona-BOT`,
                            thumbnailUrl: imageUrl,
                            sourceUrl: 'https://colorifyai.art/',
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: fkontak });
                await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            } else {
                throw new Error('Gagal mendapatkan URL gambar sketsa dari Colorify AI.');
            }
        } catch (e) {
            console.error('Error in Colorify AI (Image2Sketch):', e);
            await conn.reply(m.chat, `Terjadi kesalahan saat mengubah gambar jadi sketsa: ${e.message}. Coba lagi nanti ya.`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        }
    }
};

handler.help = ['textsketch <prompt>|<ratio>|<style>', 'img2sketch'];
handler.tags = ['ai', 'image','premium'];
handler.command = /^(textsketch|img2sketch)$/i;
handler.limit = true;
handler.premium = true;

module.exports = handler;
