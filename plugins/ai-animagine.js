/*
- Animagine (Txt2Anime)
- ⁠Created By Yeonelle
- ⁠Source : https://whatsapp.com/channel/0029VbBDTFd6mYPDtnetTK1f
- ⁠Scrape : https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/178
- ⁠Note : Style Nya Bisa Diubah Sendiri Yaa..
*/

const axios = require('axios');

let yeon = async (m, { conn, text, usedPrefix, command }) => {
    const validRatios = ['1:1', '9:7', '7:9', '19:13', '13:19', '7:4', '4:7', '12:5', '5:12'];
    
    const args = text?.trim().split(/\s*\|\s*/);
    if (!text || !args || args.length < 2) {
        await conn.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });
        let caption = `🎨 *Animagine AI Image Generator*  
📌 *Contoh Penggunaan:*  
*${usedPrefix + command}* 1girl, solo, school uniform|1:1\n\n`;
        
        caption += `📐 *Available Rasio:*  
${validRatios.join(', ')}\n\n`;
        
        caption += `📝 *Catatan:*  
• Prompt harus detail (misal: karakter, latar, mood)  
• Rasio mengatur ukuran gambar  
• Jika tidak diisi, rasio default adalah "1:1"`;

        return conn.sendMessage(m.chat, {
            text: caption
        });
    }

    const [prompt, rawRatio] = args;
    const aspect_ratio = rawRatio.toLowerCase();

    if (!validRatios.includes(aspect_ratio)) {
        await conn.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });
        return conn.sendMessage(m.chat, {
            text: `📐 *Senpai*, rasio tidak valid!  
Gunakan salah satu dari: ${validRatios.join(', ')}.  
Contoh: *${usedPrefix + command}* 1girl, cute, school|1:1`
        });
    }

    try {
        await conn.sendMessage(m.chat, {
            react: { text: "⏳", key: m.key }
        });

        const generateImage = async (prompt, aspect_ratio) => {
            const session_hash = Math.random().toString(36).substring(2);
            const url = `https://asahina2k-animagine-xl-4-0.hf.space/queue/join?`;
            
            const conf = {
                samplers: ['Euler a'],
                ratios: {
                    '1:1': '1024 x 1024',
                    '9:7': '1152 x 896',
                    '7:9': '896 x 1152',
                    '19:13': '1216 x 832',
                    '13:19': '832 x 1216',
                    '7:4': '1344 x 768',
                    '4:7': '768 x 1344',
                    '12:5': '1536 x 640',
                    '5:12': '640 x 1536'
                },
                styles: ['Anim4gine']
            };

            const payload = {
                data: [
                    prompt, // prompt
                    'lowres, bad anatomy, bad hands, text, error, missing finger, extra digits, fewer digits, cropped, worst quality, low quality, low score, worst score, average score, signature, watermark, username, blurry', // negative_prompt
                    Math.floor(Math.random() * 2147483648), // seed
                    1024, // width
                    1024, // height
                    5, // guidance_scale
                    28, // numInference_steps
                    'Euler a', // sampler
                    conf.ratios[aspect_ratio], // dimensi
                    conf.styles[0], // style_preset
                    false, // use_upscaler
                    0.55, // strength
                    1.5, // upscale_by
                    true // add_quality_tags
                ],
                event_data: null,
                fn_index: 5,
                trigger_id: 43,
                session_hash: session_hash
            };

            await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            let resultUrl = null;
            let attempts = 0;
            while (!resultUrl && attempts < 20) {
                const res = await axios.get(`https://asahina2k-animagine-xl-4-0.hf.space/queue/data?session_hash=${session_hash}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0'
                    }
                });

                const lines = res.data.split('\n\n');
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const d = JSON.parse(line.substring(6));
                        if (d.msg === 'process_completed') {
                            resultUrl = d.output.data[0][0].image.url;
                            break;
                        }
                    }
                }
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            if (!resultUrl) {
                throw new Error('Tidak ada hasil diterima dalam waktu 1 menit. Coba lagi nanti.');
            }

            return resultUrl;
        };

        const imageUrl = await generateImage(prompt, aspect_ratio);

        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: `✨ *Gambar Berhasil Dibuat, Senpai!*  
📌 *Prompt:* _${prompt}_  
📐 *Rasio:* ${aspect_ratio}  
🖼️ *URL:* ${imageUrl}`
        });

        await conn.sendMessage(m.chat, {
            react: { text: "✅", key: m.key }
        });

    } catch (e) {
        console.error('Error:', e.message);
        await conn.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });
        await conn.sendMessage(m.chat, {
            text: `⚠️ *Ups, terjadi kesalahan, Senpai!*  
Fitur ini sedang gangguan, coba lagi nanti ya 😅`
        });
    }
};

yeon.help = ['animagine <prompt>|<rasio>'];
yeon.tags = ['ai'];
yeon.command = /^animagine$/i;
yeon.register = true;
yeon.limit = true;

module.exports = yeon;