// إعدادات بوت تليجرام
const BOT_CONFIG = { 
    TOKEN: "8254444681:AAHYJz1CtqVTT1ovCVUOPCckj3AySLAs8UI", 
    CHAT_ID: "591768998" 
};

/**
 * دالة إرسال إشعار تليجرام
 * @param {string} prodName - اسم المنتج
 * @param {string} amountVal - المبلغ
 * @param {string} phone - رقم الجوال
 */
function sendTelegramNotification(prodName, amountVal, phone) {
    const msg = `🛒 *طلب جديد من متجر Dolr Plus*\n\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 جوال العميل: ${phone}`;
    
    return fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`)
    .then(response => console.log("Telegram Notification Sent"))
    .catch(err => console.error("Telegram Error:", err));
}
