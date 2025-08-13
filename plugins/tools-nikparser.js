// plugins/nikparser.js

const axios = require('axios');

async function nikParse(nik) {
    try {
        const provincesRes = await axios.get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
        const provinces = Object.fromEntries(provincesRes.data.map(p => [p.id, p.name.toUpperCase()]));
        
        // Pastikan NIK adalah string dan validasi panjang
        nik = String(nik); 
        if (nik.length !== 16) throw new Error('NIK tidak valid: panjang harus 16 digit.');
        if (!/^\d+$/.test(nik)) throw new Error('NIK tidak valid: harus terdiri dari angka.');
        
        const provinceId = nik.slice(0, 2);
        if (!provinces[provinceId]) throw new Error(`NIK tidak valid: kode provinsi (${provinceId}) tidak ditemukan.`);
        
        const regenciesRes = await axios.get(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
        const regencies = Object.fromEntries(regenciesRes.data.map(r => [r.id, r.name.toUpperCase()]));
        
        const regencyId = nik.slice(0, 4);
        if (!regencies[regencyId]) throw new Error(`NIK tidak valid: kode kabupaten/kota (${regencyId}) tidak ditemukan untuk provinsi ini.`);
        
        const districtsRes = await axios.get(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regencyId}.json`);
        const districts = Object.fromEntries(districtsRes.data.map(d => [d.id.slice(0, -1), `${d.name.toUpperCase()}`])); // Perhatikan slice(-1) untuk ID kecamatan
        
        const districtIdFromNIK = nik.slice(0, 6);
        if (!districts[districtIdFromNIK]) throw new Error(`NIK tidak valid: kode kecamatan (${districtIdFromNIK}) tidak ditemukan untuk kabupaten/kota ini.`);
        
        const province = provinces[provinceId];
        const city = regencies[regencyId];
        const subdistrict = districts[districtIdFromNIK]; // Menggunakan districtIdFromNIK
        
        const day = parseInt(nik.slice(6, 8));
        const month = parseInt(nik.slice(8, 10));
        const yearCode = nik.slice(10, 12);
        const uniqCode = nik.slice(12, 16);
        
        const gender = day > 40 ? 'PEREMPUAN' : 'LAKI-LAKI';
        const birthDay = day > 40 ? (day - 40).toString().padStart(2, '0') : day.toString().padStart(2, '0');
        
        // Menentukan tahun kelahiran (perlu logic lebih kuat untuk tahun 1900-an vs 2000-an)
        const currentYearTwoDigits = new Date().getFullYear() % 100;
        const birthYear = parseInt(yearCode) <= currentYearTwoDigits ? `20${yearCode}` : `19${yearCode}`;
        
        const birthDate = `${birthDay}/${month.toString().padStart(2, '0')}/${birthYear}`;
        const birth = new Date(parseInt(birthYear), month - 1, parseInt(birthDay));
        
        if (isNaN(birth.getTime()) || birth.getFullYear() != parseInt(birthYear) || birth.getMonth() != (month - 1) || birth.getDate() != parseInt(birthDay)) {
            throw new Error('Tanggal lahir tidak valid atau di luar rentang.');
        }
        
        const today = new Date();
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let remainingDays = today.getDate() - birth.getDate();
        
        if (remainingDays < 0) {
            months--;
            // Dapatkan jumlah hari di bulan sebelumnya dari tanggal hari ini
            remainingDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); 
        }
        if (months < 0) {
            months += 12;
            years--;
        }
        const age = `${years} Tahun ${months} Bulan ${remainingDays} Hari`;
        
        let ageCategory = '';
        if (years < 12) ageCategory = 'Anak-anak';
        else if (years < 18) ageCategory = 'Remaja';
        else if (years < 60) ageCategory = 'Dewasa';
        else ageCategory = 'Lansia';
        
        // Perhitungan ulang untuk nextBirthday dan birthdayCountdown agar lebih akurat
        let nextBirthdayYear = today.getFullYear();
        if (today.getMonth() > month - 1 || (today.getMonth() === month - 1 && today.getDate() > parseInt(birthDay))) {
            nextBirthdayYear++;
        }
        const nextBirthday = new Date(nextBirthdayYear, month - 1, parseInt(birthDay));
        
        const timeDiffNextBirthday = nextBirthday.getTime() - today.getTime();
        const daysLeftNextBirthday = Math.ceil(timeDiffNextBirthday / (1000 * 60 * 60 * 24)); // Gunakan ceil untuk pembulatan ke atas
        
        let birthdayCountdown = '';
        if (daysLeftNextBirthday <= 0) { // Jika sudah lewat atau hari H
            birthdayCountdown = 'Hari Ini!';
        } else {
            const monthsLeft = Math.floor(daysLeftNextBirthday / 30.4375); // Rata-rata hari per bulan
            const remainingDaysAfterMonths = Math.floor(daysLeftNextBirthday % 30.4375);
            birthdayCountdown = `${monthsLeft} Bulan ${remainingDaysAfterMonths} Hari Lagi`;
        }

        // Perhitungan Pasaran Jawa (sedikit disesuaikan)
        // Tanggal 1 Januari 1970 adalah Kamis Pon
        const EPOCH_DATE = new Date(1970, 0, 1); 
        const diffMillis = birth.getTime() - EPOCH_DATE.getTime();
        const daysFromEpoch = Math.floor(diffMillis / (1000 * 60 * 60 * 24));
        
        const pasaranNames = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon']; // Urutan pasaran
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']; // Urutan hari

        const dayOfWeekIndex = birth.getDay(); // 0 (Minggu) - 6 (Sabtu)
        const pasaranIndex = (daysFromEpoch % 5 + 5) % 5; // Modulo 5 untuk pasaran

        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const birthDateFull = `${birthDay} ${monthNames[month - 1]} ${birthYear}`;
        const pasaran = `${dayNames[dayOfWeekIndex]} ${pasaranNames[pasaranIndex]}, ${birthDateFull}`;
        
        let zodiac = '';
        if ((month === 1 && parseInt(birthDay) >= 20) || (month === 2 && parseInt(birthDay) < 19)) zodiac = 'Aquarius';
        else if ((month === 2 && parseInt(birthDay) >= 19) || (month === 3 && parseInt(birthDay) < 21)) zodiac = 'Pisces';
        else if ((month === 3 && parseInt(birthDay) >= 21) || (month === 4 && parseInt(birthDay) < 20)) zodiac = 'Aries';
        else if ((month === 4 && parseInt(birthDay) >= 20) || (month === 5 && parseInt(birthDay) < 21)) zodiac = 'Taurus';
        else if ((month === 5 && parseInt(birthDay) >= 21) || (month === 6 && parseInt(birthDay) < 22)) zodiac = 'Gemini';
        else if ((month === 6 && parseInt(birthDay) >= 21) || (month === 7 && parseInt(birthDay) < 23)) zodiac = 'Cancer';
        else if ((month === 7 && parseInt(birthDay) >= 23) || (month === 8 && parseInt(birthDay) < 23)) zodiac = 'Leo';
        else if ((month === 8 && parseInt(birthDay) >= 23) || (month === 9 && parseInt(birthDay) < 23)) zodiac = 'Virgo';
        else if ((month === 9 && parseInt(birthDay) >= 23) || (month === 10 && parseInt(birthDay) < 24)) zodiac = 'Libra';
        else if ((month === 10 && parseInt(birthDay) >= 24) || (month === 11 && parseInt(birthDay) < 23)) zodiac = 'Scorpio';
        else if ((month === 11 && parseInt(birthDay) >= 23) || (month === 12 && parseInt(birthDay) < 22)) zodiac = 'Sagitarius';
        else if ((month === 12 && parseInt(birthDay) >= 22) || (month === 1 && parseInt(birthDay) < 20)) zodiac = 'Capricorn';
        
        const regencyType = city.includes('KOTA') ? 'Kota' : 'Kabupaten';
        const areaCode = `${provinceId}.${regencyId.slice(2)}.${nik.slice(4, 6)}`;
        
        return {
            nik,
            kelamin: gender,
            lahir: birthDate,
            lahir_lengkap: birthDateFull,
            provinsi: {
                kode: provinceId,
                nama: province
            },
            kotakab: {
                kode: regencyId,
                nama: city,
                jenis: regencyType
            },
            kecamatan: {
                kode: districtIdFromNIK, // Menggunakan districtIdFromNIK
                nama: subdistrict
            },
            kode_wilayah: areaCode,
            nomor_urut: uniqCode,
            tambahan: {
                pasaran,
                usia: age,
                kategori_usia: ageCategory,
                ultah: birthdayCountdown,
                zodiak: zodiac
            }
        };
    } catch (error) {
        console.error('Error in nikParse function:', error.message);
        throw new Error(`Gagal parse NIK: ${error.message}`);
    }
}

// Handler untuk bot
async function handler(m, { conn, text, command }) {
    if (!text) {
        return conn.reply(m.chat, `Masbro, masukin NIK yang mau dicek dong!\nContoh: *${command} 327xxxxxxxxx0001*`, m);
    }

    if (!/^\d{16}$/.test(text)) {
        return conn.reply(m.chat, 'NIK harus 16 digit angka ya masbro. Coba cek lagi.', m);
    }

    await conn.reply(m.chat, 'Oke, gw lagi proses NIKnya nih, sabar ya masbro...', m);

    try {
        const result = await nikParse(text);

        let caption = `📊 *Informasi NIK Ditemukan!* 📊\n\n`;
        caption += `*NIK:* ${result.nik}\n`;
        caption += `*Jenis Kelamin:* ${result.kelamin}\n`;
        caption += `*Tanggal Lahir:* ${result.lahir_lengkap} (${result.tambahan.usia})\n`;
        caption += `*Usia Kategori:* ${result.tambahan.kategori_usia}\n`;
        caption += `*Zodiak:* ${result.tambahan.zodiak}\n`;
        caption += `*Hari Pasaran:* ${result.tambahan.pasaran}\n\n`;
        caption += `*Provinsi:* ${result.provinsi.nama}\n`;
        caption += `*${result.kotakab.jenis}:* ${result.kotakab.nama}\n`;
        caption += `*Kecamatan:* ${result.kecamatan.nama}\n\n`;
        caption += `*Kode Wilayah:* ${result.kode_wilayah}\n`;
        caption += `*Nomor Urut:* ${result.nomor_urut}\n\n`;
        caption += `*Ulang Tahun:* ${result.tambahan.ultah}`;
        
        await conn.reply(m.chat, caption, m);

    } catch (e) {
        console.error('Error di handler (nikparser.js):', e);
        await conn.reply(m.chat, `Maaf masbro, ada error nih pas parse NIK: ${e.message}. Pastikan NIKnya valid ya.`, m);
    }
}

handler.help = ['nikparse <nik>'];
handler.tags = ['tools','premium'];
handler.premium = true;
handler.command = /^(nikparse|nikinfo|cekktp)$/i;

module.exports = handler;