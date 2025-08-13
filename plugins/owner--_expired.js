// Plugin ini akan berjalan untuk setiap pesan di grup untuk mengecek masa sewa
// Bot lo (melalui handler.js) harus me-load dan menjalankan fungsi 'all(m)' ini untuk setiap pesan.

module.exports = {
    async all(m) { // `this` di sini diharapkan adalah objek `conn`
        if (!m.isGroup) return // Hanya berlaku untuk grup

        let chats = global.db.data.chats[m.chat];

        // Jika data chat atau properti expired tidak ada, atau masa sewa belum diatur/sudah nol, abaikan
        if (!chats || typeof chats.expired === 'undefined' || chats.expired <= 0) return // Menggunakan <=0 untuk memastikan tidak nol

        // Jika masa sewa sudah berakhir
        if (+new Date() > chats.expired) {
            // Menggunakan 'this' sebagai 'conn' untuk fungsi reply, delay, dan groupLeave
            // Reaksi dan fkontak akan otomatis dari setup simple.js / conn.reply lo
            await this.reply(m.chat, `⏰ *Masa sewa untuk grup ini telah habis!* ⏰\n\nTerima kasih telah menggunakan layanan *${this.user.name}*. Sampai jumpa lagi! 👋`, m);
            
            // Beri waktu 5 detik sebelum keluar
            await this.delay(5000); 

            // Hapus data sewa grup dari database (opsional, tapi disarankan)
            delete chats.expired;
            
            // Tinggalkan grup
            await this.groupLeave(m.chat);
        }
    }
}