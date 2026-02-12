const BOT_CONFIG = { 
    TOKEN: "8254444681:AAHYJz1CtqVTT1ovCVUOPCckj3AySLAs8UI", 
    CHAT_ID: "591768998" 
};

async function sendTelegramNotification(prodName, amountVal, phone) {
    const msg = `🛒 *طلب جديد من متجر Dolr Plus*\n\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 جوال العميل: ${phone}`;
    const url = `https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`;

    try {
        // استخدام keepalive يضمن وصول الرسالة حتى بعد تحويل الصفحة
        await fetch(url, { method: 'GET', keepalive: true });
        console.log("Telegram Notification Sent Successfully");
    } catch (err) {
        console.log("Telegram Error: ", err);
    }
}
