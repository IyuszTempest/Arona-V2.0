const axios = require('axios');
const { v4: uuidv4 } = require('uuid'); // Menggunakan require untuk CommonJS

async function upstageai(question, { reasoning = false, web_search = false } = {}) {
    try {
        if (!question) throw new Error('Question is required');
        if (typeof reasoning !== 'boolean') throw new Error('Reasoning must be a boolean (true/false)');
        if (typeof web_search !== 'boolean') throw new Error('Web search must be a boolean (true/false)');
        
        // --- Step 1: Ambil Token ---
        // Header ini SANGAT SPESIFIK dan RENTAN BERUBAH jika Upstage.ai update
        const tokenHeaders = {
            'next-action': 'c2741d382a9e142748374f0428fe8f06e9befe8a', // SANGAT RENTAN BERUBAH
            'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22(frame)%22%2C%7B%22children%22%3A%5B%22playground%22%2C%7B%22children%22%3A%5B%22(llm)%22%2C%7B%22children%22%3A%5B%22chat%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2Fplayground%2Fchat%22%2C%22refresh%22%5D%7D%5D%7D%5D%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D', // SANGAT RENTAN BERUBAH
            referer: 'https://console.upstage.ai/playground/chat',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            'connection': 'keep-alive'
        };

        let tokenResponse;
        try {
            tokenResponse = await axios.post('https://console.upstage.ai/playground/chat', [], { headers: tokenHeaders });
        } catch (tokenError) {
            console.error('Error fetching Upstage token API:', tokenError.message);
            if (tokenError.response) console.error('Token API Response:', tokenError.response.data.toString());
            throw new Error(`Gagal mendapatkan token Upstage AI. Status: ${tokenError.response?.status || 'N/A'}`);
        }
        
        const tokenLine = tokenResponse.data.split('\n').filter(l => l.trim().startsWith('1:'))[0];
        if (!tokenLine) throw new Error('Format respons token tidak valid.');
        const token = JSON.parse(tokenLine.split('1:')[1]).token;
        if (!token) throw new Error('Token tidak ditemukan dalam respons.');
        
        // --- Step 2: Chat Completion ---
        const chatHeaders = {
            'x-csrf-token': token, // Token yang didapat
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
            'referer': 'https://console.upstage.ai/playground/chat',
            'origin': 'https://console.upstage.ai'
        };

        const chatPayload = {
            conversation_id: uuidv4(),
            stream: false, // Kita tidak streaming, jadi false
            log_enabled: false,
            messages: [{
                role: 'user',
                content: question,
                ...(web_search && { mode: ['search'] }) // Tambah mode search jika web_search true
            }],
            model: 'solar-pro2',
            reasoning_effort: reasoning ? 'high' : 'low'
        };

        const chatParams = {};
        if (reasoning) { // Tambah parameter ini jika reasoning true
            chatParams.include_think = true;
        }

        let chatResponse;
        try {
            chatResponse = await axios.post('https://ap-northeast-2.apistage.ai/v1/web/demo/chat/completions', chatPayload, {
                headers: chatHeaders,
                params: chatParams,
                responseType: 'text' // Penting untuk SSE parsing
            });
        } catch (chatError) {
            console.error('Error calling Upstage chat API:', chatError.message);
            if (chatError.response) console.error('Chat API Response:', chatError.response.data.toString());
            throw new Error(`Gagal berkomunikasi dengan Upstage AI: ${chatError.message}`);
        }
        
        let result = { think: '', text: '', search: [] };
        let fullText = '';
        const lines = chatResponse.data.split('\n\n'); // Gunakan chatResponse.data
        for (const line of lines) {
            if (line.startsWith('data:') && !line.includes('[DONE]')) {
                try {
                    const d = JSON.parse(line.substring(6));
                    if (d?.choices) fullText += d?.choices?.[0]?.delta?.content || ''; // Pastikan content ada
                    if (d.search?.status?.action === 'search_finish' && d.search.search_queries && d.search.search_queries[0]?.results) {
                        result.search = d.search.search_queries[0].results;
                    }
                } catch (e) {
                    // console.warn('Warning: Gagal parsing baris streaming Upstage AI:', e.message);
                }
            }
        }
        
        // Ekstraksi think tag dan teks akhir
        const thinkMatch = fullText.match(/<think>([\s\S]*?)<\/think>/); // Regex lebih akurat untuk menangkap konten dalam <think>
        result.think = thinkMatch ? thinkMatch[1].trim() : '';
        result.text = fullText.replace(/<think>[\s\S]*?<\/think>/, '').trim();
        
        if (!result.text && !result.think && result.search.length === 0) {
            throw new Error('Tidak ada respons yang berarti dari Upstage AI.');
        }

        return result;
    } catch (error) {
        console.error('Error in Upstage AI plugin function:', error.message);
        throw new Error(`Terjadi kesalahan fatal di Upstage AI: ${error.message}`);
    }
}

// --- Handler Plugin Bot ---
let handler = async (m, { conn, text, usedPrefix, command }) => { // Tambahkan usedPrefix
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
        return conn.reply(m.chat, `Mau tanya apa, masbro? Contoh: *${usedPrefix + command}* siapa presiden Indonesia?\n\n` +
                          `Format: *${usedPrefix + command}* <pertanyaan>|[reasoning true/false]|[search true/false]\n\n` +
                          `*Pilihan (opsional):*\n` +
                          `  - *reasoning:* true/false (default false) - Tampilkan proses berpikir AI.\n` +
                          `  - *search:* true/false (default false) - Gunakan pencarian web.\n\n` +
                          `*Contoh:* \n` +
                          `  *${usedPrefix + command}* berita terbaru tentang AI|true|true`, fkontak);
    }

    const args = text.split('|').map(s => s.trim());
    const question = args[0];
    const reasoningParam = args[1] ? (args[1].toLowerCase() === 'true') : false;
    const webSearchParam = args[2] ? (args[2].toLowerCase() === 'true') : false;

    if (!question) {
        return conn.reply(m.chat, 'Pertanyaan tidak boleh kosong, masbro!', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const result = await upstageai(question, { reasoning: reasoningParam, web_search: webSearchParam });

        let responseText = `✨ *Upstage AI Menjawab:*\n\n`;
        if (result.think) {
            responseText += `💭 *Proses Berpikir:*\n\`\`\`${result.think.substring(0, 500)}...\`\`\`\n\n`; // Potong think jika terlalu panjang
        }
        responseText += `${result.text || 'Tidak ada jawaban.'}`;
        
        if (result.search && result.search.length > 0) {
            responseText += `\n\n🔎 *Hasil Pencarian:*\n`;
            result.search.forEach((item, index) => {
                if (item.title && item.url) {
                    responseText += `*${index + 1}.* ${item.title}\n`;
                    responseText += `🔗 ${item.url}\n`;
                }
            });
        }

        await conn.reply(m.chat, responseText, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin Upstage AI:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
        conn.reply(m.chat, `❌ Terjadi kesalahan saat berkomunikasi dengan Upstage AI: ${e.message}.`, fkontak);
    }
};

handler.help = ['upstageai <pertanyaan>|[reasoning]|[search]'];
handler.tags = ['ai'];
handler.command = /^(upstageai|upstage|upst)$/i; // Tambah alias command
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;