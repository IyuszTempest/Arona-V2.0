/*Plugins CJS 
Background Remover
*Sumber:* _https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635_
*/
const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

class BgBye {
    constructor() {
        this.url = 'https://bgbye2.fyrean.com';
        this.method = ['bria', 'inspyrenet', 'u2net', 'tracer', 'basnet', 'deeplab', 'u2net_human_seg', 'ormbg', 'isnet-general-use', 'isnet-anime'];
    }
    
    image = async function (buffer, { method = 'bria' } = {}) {
        try {
            if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('Image buffer is required');
            if (!this.method.includes(method)) throw new Error(`Available methods: ${this.method.join(', ')}`);
            
            const { mime } = await fromBuffer(buffer);
            if (!/image/.test(mime)) throw new Error('Input must be an image');
            
            const form = new FormData();
            form.append('file', buffer, `${Date.now()}_rynn.jpg`);
            form.append('method', method)
            const { data } = await axios.post(`${this.url}/remove_background/`, form, {
                headers: form.getHeaders(),
                responseType: 'arraybuffer'
            });
            
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    video = async function (buffer, { method = 'bria' } = {}) {
        try {
            if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('Video buffer is required');
            if (!this.method.includes(method)) throw new Error(`Available methods: ${this.method.join(', ')}`);
            
            const { mime } = await fromBuffer(buffer);
            if (!/video/.test(mime)) throw new Error('Input must be a video');
            
            const form = new FormData();
            form.append('file', buffer, `${Date.now()}_rynn.mp4`);
            form.append('method', method)
            const { data: task } = await axios.post(`${this.url}/remove_background_video/`, form, {
                headers: form.getHeaders()
            });
            
            while (true) {
                const { data: poll } = await axios.get(`${this.url}/status/${task.video_id}`);
                
                if (poll?.status !== 'processing' || !poll.status) {
                    const { data } = await axios.get(`${this.url}/status/${task.video_id}`, { responseType: 'arraybuffer' });
                    return data;
                }
                await new Promise(res => setTimeout(res, 1000));
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    try {
        const bgbye = new BgBye();
        const availableMethods = bgbye.method.join(', ');
        
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        if (!mime) {
            return conn.reply(m.chat, `Reply gambar/video dengan caption *${usedPrefix + command}* [metode]\n\nMetode yang tersedia:\n${availableMethods}`, fkontak);
        }
        
        let method = text && bgbye.method.includes(text.toLowerCase()) ? text.toLowerCase() : 'bria';

        await conn.reply(m.chat, `Sedang memproses...`, fkontak);

        let buffer = await q.download();
        let resultBuffer;

        if (/image/.test(mime)) {
            resultBuffer = await bgbye.image(buffer, { method });
            await conn.sendMessage(m.chat, { image: resultBuffer, caption: '✅ Background berhasil dihapus!' }, { quoted: fkontak });
        } else if (/video/.test(mime)) {
            resultBuffer = await bgbye.video(buffer, { method });
            await conn.sendMessage(m.chat, { video: resultBuffer, caption: '✅ Background berhasil dihapus!' }, { quoted: fkontak });
        } else {
            return conn.reply(m.chat, 'Hanya support gambar dan video!', fkontak);
        }
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error di plugin nobg:", e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `Terjadi kesalahan: ${e.message}`, fkontak);
    }
};

handler.help = ['nobg [metode]'];
handler.tags = ['tools'];
handler.command = ['nobg'];
handler.limit = true;

module.exports = handler;
