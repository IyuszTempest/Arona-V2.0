/*

Plugins : Info-krl
Type : CommonJs
Code by : Chatgpt

- *Sumber* :
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
   
 */


const axios = require('axios');

const API_URL = 'https://api-partner.krl.co.id';
const API_TOKEN = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMDYzNWIyOGMzYzg3YTY3ZTRjYWE4YTI0MjYxZGYwYzIxNjYzODA4NWM2NWU4ZjhiYzQ4OGNlM2JiZThmYWNmODU4YzY0YmI0MjgyM2EwOTUiLCJpYXQiOjE3MjI2MTc1MTQsIm5iZiI6MTcyMjYxNzUxNCwiZXhwIjoxNzU0MTUzNTE0LCJzdWIiOiI1Iiwic2NvcGVzIjpbXX0.Jz_sedcMtaZJ4dj0eWVc4_pr_wUQ3s1-UgpopFGhEmJt_iGzj6BdnOEEhcDDdIz-gydQL5ek0S_36v5h6P_X3OQyII3JmHp1SEDJMwrcy4FCY63-jGnhPBb4sprqUFruDRFSEIs1cNQ-3rv3qRDzJtGYc_bAkl2MfgZj85bvt2DDwBWPraZuCCkwz2fJvox-6qz6P7iK9YdQq8AjJfuNdl7t_1hMHixmtDG0KooVnfBV7PoChxvcWvs8FOmtYRdqD7RSEIoOXym2kcwqK-rmbWf9VuPQCN5gjLPimL4t2TbifBg5RWNIAAuHLcYzea48i3okbhkqGGlYTk3iVMU6Hf_Jruns1WJr3A961bd4rny62lNXyGPgNLRJJKedCs5lmtUTr4gZRec4Pz_MqDzlEYC3QzRAOZv0Ergp8-W1Vrv5gYyYNr-YQNdZ01mc7JH72N2dpU9G00K5kYxlcXDNVh8520-R-MrxYbmiFGVlNF2BzEH8qq6Ko9m0jT0NiKEOjetwegrbNdNq_oN4KmHvw2sHkGWY06rUeciYJMhBF1JZuRjj3JTwBUBVXcYZMFtwUAoikVByzKuaZZeTo1AtCiSjejSHNdpLxyKk_SFUzog5MOkUN1ktAhFnBFoz6SlWAJBJIS-lHYsdFLSug2YNiaNllkOUsDbYkiDtmPc9XWc'; // gunakan token asli kamu di sini

const HEADERS = {
  'Authorization': API_TOKEN,
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
};

async function getAllStations() {
  try {
    const response = await axios.get(`${API_URL}/krl-webs/v1/krl-station`, { headers: HEADERS});
    return response.data.data || [];
} catch (error) {
    return [];
}
}

async function getStationId(name) {
  const stations = await getAllStations();
  return stations.find(s => s.sta_name.toLowerCase().includes(name.toLowerCase())) || null;
}

async function getFare(from, to) {
  const [origin, destination] = await Promise.all([
    getStationId(from),
    getStationId(to)
  ]);

  if (!origin ||!destination) return `❌ Stasiun tidak ditemukan: ${!origin? from: ''} ${!destination? to: ''}`;

  const res = await axios.get(`${API_URL}/krl-webs/v1/fare?stationfrom=${origin.sta_id}&stationto=${destination.sta_id}`, { headers: HEADERS});
  const data = res.data.data?.[0];

  if (!data) return 'ℹ️ Tarif tidak tersedia untuk rute tersebut.';
  return `💰 Tarif dari *${origin.sta_name}* ke *${destination.sta_name}*:\n- Harga: Rp ${data.fare}\n- Jarak: ${data.distance} km`;
}

async function getSchedule(stationName, start, end) {
  const station = await getStationId(stationName);
  if (!station) return '❌ Stasiun tidak ditemukan.';

  const res = await axios.get(`${API_URL}/krl-webs/v1/schedule?stationid=${station.sta_id}&timefrom=${start}&timeto=${end}`, { headers: HEADERS});
  const list = res.data.data;

  if (!list?.length) return 'ℹ️ Tidak ada jadwal pada rentang waktu tersebut.';

  let output = `🚆 Jadwal KRL di *${station.sta_name}* antara ${start} - ${end}:\n`;
  list.forEach((sch, i) => {
    output += `\n${i + 1}. *${sch.ka_name}* → ${sch.dest}\n   🕒 ${sch.time_est} → ${sch.dest_time}`;
});
  return output;
}

async function getStationsList() {
  const stations = await getAllStations();
  if (!stations.length) return '⚠️ Tidak ada stasiun ditemukan.';
  return `🚉 Daftar Stasiun KRL:\n` + stations.map((s, i) => `${i + 1}. ${s.sta_name}`).join('\n');
}

const handler = async (m, { command, args}) => {
  switch (command) {
    case 'krlroute':
      return m.reply(await getStationsList());

    case 'krlfare':
      if (args.length < 2) return m.reply('Gunakan format:.krlfare <asal> <tujuan>');
      return m.reply(await getFare(args[0], args[1]));

    case 'krlschedule':
      if (args.length < 3) return m.reply('Gunakan format:.krlschedule <stasiun> <jam_mulai> <jam_selesai>');
      return m.reply(await getSchedule(args[0], args[1], args[2]));

    default:
      return m.reply('❌ Perintah tidak dikenali.');
}
};

handler.help = ['krlroute', 'krlfare <asal> <tujuan>', 'krlschedule <stasiun> <dari> <sampai>'];
handler.tags = ['info'];
handler.command = /^krlroute|krlfare|krlschedule$/i;
 
module.exports = handler;