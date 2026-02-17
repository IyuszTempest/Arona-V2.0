/* EUPHY AI MUSIC GENERATOR (CJS)
   Updated: Added Available Tags Menu
*/

const axios = require('axios');
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Daftar tags yang tersedia/populer untuk memudahkan user
const availableTags = [
    'Pop', 'Rock', 'Hip Hop', 'Jazz', 'EDM', 'Lofi', 'Country', 'Metal', 
    'Reggae', 'Blues', 'Acoustic', 'Orchestral', 'Cinematic', 'Phonk',
    'Anime', 'Kawaii Future Bass', 'Japanese City Pop', 'Piano Solo'
].join(', ');

async function aimusic(prompt, { tags = 'pop, romantic' } = {}) {
    try {
        if (!prompt) throw new Error('Prompt is required');
        
        const systemPrompt = `You are a master-level poetic architect and lyricist. Your task is to craft evocative song lyrics using high-level linguistic devices, internal rhyme schemes, and sensory-driven imagery.

STRICT STRUCTURAL RULES:
1. Use only the following tags for structure: [verse], [chorus], [bridge], [inst].
2. Tags must be exactly as specified: no numbering, no multipliers.
3. Provide ONLY the lyric sheet. No titles, no genre labels, no commentary.

LYRICAL GUIDELINES:
- Prioritize "Show, Don't Tell".
- Maintain a consistent rhythmic cadence.
- Ensure a logical emotional arc.`;

        const { data: lyricApiRes } = await axios.get('https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat', {
            params: {
                query: JSON.stringify([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ]),
                link: 'writecream.com'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://writecream.com/'
            }
        });

        const generatedLyrics = lyricApiRes.response_content;
        if (!generatedLyrics) throw new Error('Gagal meracik lirik puitis.');

        const session_hash = Math.random().toString(36).substring(2);
        
        await axios.post(`https://ace-step-ace-step.hf.space/gradio_api/queue/join?`, {
            data: [240, tags, generatedLyrics, 60, 15, 'euler', 'apg', 10, '', 0.5, 0, 3, true, false, true, '', 0, 0, false, 0.5, null, 'none'],
            event_data: null,
            fn_index: 11,
            trigger_id: 45,
            session_hash: session_hash
        });

        let resultMusicUrl;
        let pollingAttempts = 0;
        const maxPollingAttempts = 150;

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
                        throw new Error(`Sistem sibuk (${d.msg}). Coba lagi nanti.`);
                    }
                }
            }
            if (!resultMusicUrl) {
                pollingAttempts++;
                await delay(2000);
            }
        }

        if (!resultMusicUrl) throw new Error('Timeout: Antrean terlalu lama, Sensei.');
        return { musicUrl: resultMusicUrl, lyrics: generatedLyrics };

    } catch (error) {
        throw new Error(error.message);
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const fkontak = {
        key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "EUPHY_MUSIC" },
        message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Euphy;;;\nFN:Euphy Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } },
        participant: "0@s.whatsapp.net"
    };

    if (!text) {
        let helpText = `
*───〔 EUPHY MUSIC GENERATOR 〕───*

Mau buat lagu apa hari ini?

*Format:* ${usedPrefix + command} <tema>|<tags>

*Contoh:* ${usedPrefix + command} perjalanan di musim dingin|anime, emotional, piano

*🏷️ Tags Tersedia:*
_${availableTags}_

_Note: Gunakan "|" sebagai pemisah antara tema dan tags._
`.trim();
        return conn.reply(m.chat, helpText, fkontak);
    }

    const [prompt, tagsRaw] = text.split('|').map(s => s.trim());
    const tags = tagsRaw || 'pop, romantic';

    await conn.sendMessage(m.chat, { react: { text: '🎶', key: m.key } });
    
    try {
        await conn.reply(m.chat, `*Euphy sedang merangkai lirik puitis & menggubah musik untukmu...* ✍️🎨`, m);
        
        const result = await aimusic(prompt, { tags });
        
        await conn.sendMessage(m.chat, {
            audio: { url: result.musicUrl },
            mimetype: 'audio/mpeg',
            fileName: `euphy_${Date.now()}.mp3`,
            caption: `✅ *Berhasil Dibuat!*\n\n📝 *Preview Lirik:* \n"${result.lyrics.split('\n').slice(0, 4).join('\n')}..."\n\n🎵 *Style:* ${tags}\n\n> *“Semoga lagunya sesuai dengan perasaanmu, Sensei~”* 🌸`,
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ *Error:* ${e.message}`, fkontak);
    }
};

handler.help = ['sunoai <prompt>|[tags]'];
handler.tags = ['ai', 'premium'];
handler.command = /^(sunoai)$/i;
handler.limit = true;
handler.premium = true;

module.exports = handler;
