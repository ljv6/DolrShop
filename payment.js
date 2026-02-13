// --- الإعدادات الثابتة ---
const FIXED_EMAIL = "maxmohamedmoon@gmail.com";
const BOT_CONFIG = { 
    TOKEN: "8254444681:AAHYJz1CtqVTT1ovCVUOPCckj3AySLAs8UI", 
    CHAT_ID: "591768998" 
};
const CONFIG = { 
    MERCHANT_ID: "983c9669-9278-4dd1-950f-8b8fbb0a14d2", 
    MERCHANT_PASSWORD: "7ceb6437-92bc-411b-98fa-be054b39eaba", 
    API_URL: "https://api.edfapay.com/payment/initiate" 
};

// --- الدالة الأساسية لإتمام الدفع ---
async function processPayment() {
    const btn = document.querySelector('#paymentModal button[onclick="processPayment()"]');
    const amountElement = document.getElementById('modalPriceDisplay'); 
    const phoneInput = document.getElementById('phone');
    const nameElement = document.getElementById('modalProdName');

    if (!amountElement || !phoneInput) return;

    let amountVal = amountElement.innerText.replace(/[^\d.]/g, ''); 
    amountVal = parseFloat(amountVal).toFixed(2);
    
    const phone = phoneInput.value.trim();
    const prodName = nameElement.innerText;

    if(!phone || phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح");
        return;
    }

    btn.disabled = true;
    btn.innerText = "جاري التحويل...";

    // 1. إرسال التليجرام
    const msg = `🛒 طلب جديد: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 الجوال: ${phone}`;
    try {
        await fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(msg)}`);
    } catch(e) { console.error("Telegram Error"); }

    const orderId = "DOLR-" + Date.now();
    const desc = "Order " + prodName;

    // 2. التشفير (الهاش)
    const rawString = (CONFIG.MERCHANT_PASSWORD + orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_ID).toUpperCase();
    const md5Hash = md5(rawString);
    const finalHash = await sha1(md5Hash);

    // 3. تجهيز بيانات Edfapay
    const formData = new FormData();
    formData.append("action", "SALE");
    formData.append("edfa_merchant_id", CONFIG.MERCHANT_ID);
    formData.append("order_id", orderId);
    formData.append("order_amount", amountVal);
    formData.append("order_currency", "SAR");
    formData.append("order_description", desc);
    formData.append("payer_first_name", "Dolr");
    formData.append("payer_last_name", "Customer");
    formData.append("payer_email", FIXED_EMAIL);
    formData.append("payer_phone", phone);
    formData.append("payer_country", "SA");
    formData.append("payer_city", "Riyadh");
    formData.append("payer_address", "Digital");
    formData.append("payer_zip", "11000");
    formData.append("payer_ip", "1.1.1.1");
    formData.append("term_url_3ds", window.location.href);
    formData.append("success_url", window.location.href);
    formData.append("failure_url", window.location.href);
    formData.append("hash", finalHash);

    try {
        const response = await fetch(CONFIG.API_URL, { method: 'POST', body: formData });
        const data = await response.json();
        
        if (data.redirect_url) {
            window.location.href = data.redirect_url;
        } else {
            alert("خطأ من البنك: " + (data.error_message || "الهاش غير صحيح"));
            btn.disabled = false;
            btn.innerText = "إتمام الشراء";
        }
    } catch (e) {
        alert("فشل في الاتصال ببوابة الدفع");
        btn.disabled = false;
        btn.innerText = "إتمام الشراء";
    }
}

// --- دوال مساعدة للتشفير (ضرورية للهاش) ---
function md5(string) {
    // خوارزمية MD5 (تأكد من وجود المكتبة أو وضع الكود الكامل هنا)
    return CryptoJS.MD5(string).toString(); 
}

async function sha1(m){
    const b = new TextEncoder().encode(m);
    const h = await crypto.subtle.digest('SHA-1', b);
    return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
}
