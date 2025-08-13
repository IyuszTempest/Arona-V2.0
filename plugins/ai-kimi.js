const axios = require('axios'); // Menggunakan require untuk CommonJS

class Kimi {
    constructor() {
        this.id = String(Date.now()) + Math.floor(Math.random() * 1e3);
        this.headers = {
            'content-type': 'application/json',
            'x-language': 'zh-CN',
            'x-msh-device-id': this.id,
            'x-msh-platform': 'web',
            'x-msh-session-id': String(Date.now()) + Math.floor(Math.random() * 1e3),
            'x-traffic-id': this.id,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' // Tambah User-Agent
        };
    }

    async register() {
        try {
            const reg = await axios.post('https://www.kimi.com/api/device/register', {}, {
                headers: this.headers
            });
            if (!reg.data || !reg.data.access_token || !reg.headers['set-cookie']) {
                throw new Error('Gagal mendapatkan token akses atau cookie dari Kimi AI.');
            }
            return {
                auth: `Bearer ${reg.data.access_token}`,
                cookie: reg.headers['set-cookie'].join('; ')
            };
        } catch (error) {
            console.error('Error Kimi AI register:', error.message);
            if (error.response && error.response.data) {
                console.error('Kimi Register API Response:', JSON.stringify(error.response.data));
            }
            throw new Error(`Gagal registrasi perangkat di Kimi AI: ${error.message}`);
        }
    }

    async chat(question, { model = 'k2', search = true, deep_research = false } = {}) {
        if (!question) throw new Error('Pertanyaan kosong, Senpai~');
        
        try {
            const reg = await this.register();

            const { data: session } = await axios.post('https://www.kimi.com/api/chat', {
                name: '未命名会话', // Unnamed session
                born_from: 'home',
                kimiplus_id: 'kimi',
                is_example: false,
                source: 'web',
                tags: []
            }, {
                headers: {
                    authorization: reg.auth,
                    cookie: reg.cookie,
                    ...this.headers
                }
            });
            if (!session.id) throw new Error('Gagal membuat sesi chat Kimi AI.');

            const { data } = await axios.post(`https://www.kimi.com/api/chat/${session.id}/completion/stream`, {
                kimiplus_id: 'kimi',
                extend: { sidebar: true },
                model, use_search: search,
                messages: [{ role: 'user', content: question }],
                refs: [], history: [],
                scene_labels: [],
                use_semantic_memory: false,
                use_deep_research: deep_research
            }, {
                headers: {
                    authorization: reg.auth,
                    cookie: reg.cookie,
                    ...this.headers
                },
                responseType: 'text' // Penting untuk menerima sebagai teks agar bisa di-split
            });

            const result = { text: '', search_by: [], sources: [], citations: [] };
            const lines = String(data).split('\n\n'); // Pastikan data adalah string
            for (const line of lines) {
                if (!line.startsWith('data:')) continue;
                try {
                    const d = JSON.parse(line.slice(6));
                    if (d.event === 'cmpl' && d.text) result.text += d.text;
                    if (d.event === 'search_plus' && d.msg?.type === 'target') result.search_by = d.msg.targets;
                    if (d.event === 'search_plus' && d.type === 'get_res') result.sources.push(d.msg);
                    if (d.event === 'search_citation') result.citations = Object.values(d.values);
                } catch (e) {
                    // console.warn('Warning: Gagal parse baris streaming Kimi AI:', e.message);
                }
            }
            return result;
        } catch (error) {
            console.error('Error Kimi AI chat:', error.message);
            if (error.response && error.response.data) {
                console.error('Kimi Chat API Response:', JSON.stringify(error.response.data));
            }
            throw new Error(`Gagal berkomunikasi dengan Kimi AI: ${error.message}`);
        }
    }
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
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return conn.reply(m.chat, `😅 *Senpai*, Cara Pakainya Gini Nih~\n\`${usedPrefix + command} <pertanyaan>\`\nContoh: \`${usedPrefix + command} Apa itu ChatGPT?\`\n\n*Pilihan (opsional):* |model|search|deep`, fkontak);
    }
    
    const args = text.split('|').map(s => s.trim());
    const question = args[0];
    const model = args[1] || 'k2'; // Default model
    let search = true; // Default search true
    let deep_research = false; // Default deep_research false

    if (args[2]) {
        if (args[2].toLowerCase() === 'nosearch') search = false;
        if (args[2].toLowerCase() === 'deep') deep_research = true;
    }
    if (args[3]) { // Jika ada argumen keempat
        if (args[3].toLowerCase() === 'nosearch') search = false;
        if (args[3].toLowerCase() === 'deep') deep_research = true;
    }


    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const k = new Kimi();
        const res = await k.chat(question, { model, search, deep_research });

        let msg = `✨ *Kimi Menjawab:* _"${question}"_\n\n`;
        msg += `${res.text.trim() || 'Tidak ada jawaban, Senpai 😢'}`;

        if (res.citations && res.citations.length > 0) {
            msg += `\n\n📚 *Referensi Ditemukan:*`;
            res.citations.forEach((r, i) => {
                if (r.title && r.url) { // Pastikan title dan url ada
                    msg += `\n> ${i + 1}. ${r.title}\n> ${r.url}`;
                }
            });
        }
        
        if (res.search_by && res.search_by.length > 0) {
            msg += `\n\n🔎 *Pencarian Digunakan:* ${res.search_by.join(', ')}`;
        }
        
        // Asumsi `res.sources` berisi detail sumber pencarian, bisa ditambahkan juga
        // if (res.sources && res.sources.length > 0) {
        //     msg += `\n\n🌐 *Sumber Pencarian:*`;
        //     res.sources.forEach((s, i) => {
        //         if (s.title && s.url) {
        //             msg += `\n> ${i + 1}. ${s.title}\n> ${s.url}`;
        //         }
        //     });
        // }


        await conn.reply(m.chat, msg.trim(), fkontak);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error('Error di plugin Kimi AI:', e);
        await conn.sendMessage(m.chat, { react: { text: '⛔️', key: m.key } });
        await conn.reply(m.chat, `😞 Yah, Fiturnya Error Nih Senpai..\n> \`${e.message}\`\nMungkin Kimi-nya lagi overthinking... 😔`, fkontak);
    }
};

handler.help = ['kimi <teks>|model|search|deep']; // Update help
handler.tags = ['ai'];
handler.command = /^kimi$/i;
handler.register = true;
handler.limit = true;

module.exports = handler;