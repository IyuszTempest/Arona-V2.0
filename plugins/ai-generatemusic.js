/*Plugins CJS
Ai Generate Music
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
*/

const axios = require('axios');
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function aimusic(prompt, { tags = 'pop, romantic' } = {}) {
    try {
        if (!prompt) throw new Error('Prompt is required');
        const { data: lyricApiRes } = await axios.get('https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat', {
            params: {
                query: JSON.stringify([
                    {
                        role: 'system',
                        content: 'You are a professional lyricist AI trained to write poetic and rhythmic song lyrics. Respond with lyrics only, using [verse], [chorus], [bridge], and [instrumental] or [inst] tags to structure the song. Use only the tag (e.g., [verse]) without any numbering or extra text (e.g., do not write [verse 1], [chorus x2], etc). Do not add explanations, titles, or any other text outside of the lyrics. Focus on vivid imagery, emotional flow, and strong lyrical rhythm. Refrain from labeling genre or giving commentary. Respond in clean plain text, exactly as if it were a song lyric sheet.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]),
                link: 'writecream.com'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://writecream.com/'
            }
        });
        const generatedLyrics = lyricApiRes.response_content;
        if (!generatedLyrics) throw new Error('Gagal mendapatkan lirik dari AI.');
        const session_hash = Math.random().toString(36).substring(2);
        await axios.post(`https://ace-step-ace-step.hf.space/gradio_api/queue/join?`, {
            data: [
                240, // Durasi (seconds)
                tags, // Tags
                generatedLyrics, // Lirik yang digenerate
                60, // Param: BPM?
                15, // Param: Key?
                'euler', // Param: Sampler?
                'apg', // Param: Guidance?
                10, // Param: Iterations?
                '', // Param: Seed?
                0.5, // Param: Volume?
                0, // Param: Pan?
                3, // Param: Reverb?
                true, // Param: Vibe?
                false, // Param: Chorus?
                true, // Param: Melody?
                '', // Param: Melody prompt?
                0, // Param: Tempo?
                0, // Param: Mood?
                false, // Param: Voice clone?
                0.5, // Param: Voice strength?
                null, // Param: Input audio
                'none' // Param: Vocoder?
            ],
            event_data: null,
            fn_index: 11,
            trigger_id: 45,
            session_hash: session_hash
        });
        let resultMusicUrl;
        let pollingAttempts = 0;
        const maxPollingAttempts = 120;
        const pollingInterval = 1000;
        while (!resultMusicUrl && pollingAttempts < maxPollingAttempts) {
            const { data } = await axios.get(`https://ace-step-ace-step.hf.space/gradio_api/queue/data?session_hash=${session_hash}`);
            const lines = data.split('\n\n');
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const d = JSON.parse(line.substring(6));
                    if (d.msg === 'process_completed' && d.output?.data?.[0]?.url) {
                        resultMusicUrl = d.output.data[0].url;
                        break;
                    } else if (d.msg === 'queue_full' || d.msg === 'process_failed') {
                        throw new Error(`Kondisi HF Space: ${d.msg}. Gagal memproses musik AI.`);
                    }
                }
            }
            if (!resultMusicUrl) {
                pollingAttempts++;
                await delay(pollingInterval);
            }
        }
        if (!resultMusicUrl) throw new Error('Timeout: Gagal mendapatkan URL musik AI.');
        return resultMusicUrl;
    } catch (error) {
        console.error('Error in aimusic generator:', error.message);
        if (error.response && error.response.data) {
            console.error('API Response Error:', error.response.data.toString());
        }
        throw new Error(`Gagal membuat musik AI: ${error.message}`);
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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
    if (!text) {
        return conn.reply(m.chat, `Mau buat musik AI tentang apa, masbro? Contoh: *${usedPrefix + command}* lagu tentang cinta dan perpisahan\n\n*Format:* <prompt>|[tags]\n*Tags (opsional):* Pop, Romantic, Rock (default: pop, romantic)`, fkontak);
    }
    const args = text.split('|').map(s => s.trim());
    const prompt = args[0];
    const tags = args[1] || 'pop, romantic';
    if (!prompt) {
        return conn.reply(m.chat, 'Prompt tidak boleh kosong, masbro!', fkontak);
    }
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        const musicUrl = await aimusic(prompt, { tags });
        if (!musicUrl) {
            throw new Error('Tidak ada URL musik AI yang dihasilkan.');
        }
        await conn.sendMessage(m.chat, {
            audio: { url: musicUrl },
            mimetype: 'audio/mpeg',
            fileName: `aimusic_${Date.now()}.mp3`,
            caption: `🎶 *Musik AI Dibuat!* 🎶\n\n*Prompt:* ${prompt}\n*Tags:* ${tags}\n\n_Sumber: ace-step-ace-step.hf.space_`,
        }, { quoted: fkontak });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error('Error di plugin AI Music:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat membuat musik AI: ${e.message}. Coba lagi nanti ya.`, fkontak);
    }
};

handler.help = ['generatemusic <prompt>|[tags]'];
handler.tags = ['ai', 'tools','premium'];
handler.command = /^(aimusic|generatemusic|tomusic)$/i;
handler.limit = true;
handler.premium = true;

module.exports = handler;
