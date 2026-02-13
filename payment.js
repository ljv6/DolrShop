/**
 * payment.js - النسخة المحسنة
 */

const BOT_CONFIG = { 
    TOKEN: "8254444681:AAHYJz1CtqVTT1ovCVUOPCckj3AySLAs8UI", 
    CHAT_ID: "591768998" 
};
const CONFIG = { 
    MERCHANT_ID: "983c9669-9278-4dd1-950f-8b8fbb0a14d2", 
    MERCHANT_PASSWORD: "7ceb6437-92bc-411b-98fa-be054b39eaba", 
    API_URL: "https://api.edfapay.com/payment/initiate" 
};

async function processPayment() {
    const payBtn = document.getElementById('payBtn');
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const prodName = document.getElementById('modalProdName').innerText;
    let priceText = document.getElementById('modalPriceDisplay').innerText;
    
    // تنسيق المبلغ رقمياً
    let amountVal = parseFloat(priceText.replace(/[^\d.]/g, '')).toFixed(2);

    if (phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح");
        return;
    }

    // تعطيل الزر لمنع التكرار
    if(payBtn) {
        payBtn.disabled = true;
        payBtn.innerText = "جاري المعالجة...";
    }

    try {
        // 1. إرسال بيانات الطلب للتليجرام أولاً لضمان وصول التنبيه لك
        const telegramMsg = `طلب جديد 🛒\nمتجر Dolr Plus\n\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 جوال العميل: ${phone}`;
        
        // استخدام التحميل في الخلفية لسرعة التحويل للبوابة
        fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(telegramMsg)}`).catch(e => console.log("Telegram Error"));

        // 2. إعدادات البوابة
        const orderId = "DOLR-" + Date.now();
        const desc = "Order " + prodName;
        
        // بناء سلسلة الهاش حسب طلب Edfapay
        const combinedString = (CONFIG.MERCHANT_PASSWORD + orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_ID).toUpperCase();
        
        // التحقق من وجود مكتبة التشفير
        if (typeof CryptoJS === 'undefined') {
            throw new Error("Missing CryptoJS library");
        }

        const md5Hash = CryptoJS.MD5(combinedString).toString().toUpperCase();
        const finalHash = await calculateSHA1(md5Hash);

        const formData = new FormData();
        formData.append("action", "SALE");
        formData.append("edfa_merchant_id", CONFIG.MERCHANT_ID);
        formData.append("order_id", orderId);
        formData.append("order_amount", amountVal);
        formData.append("order_currency", "SAR");
        formData.append("order_description", desc);
        formData.append("payer_first_name", "Customer");
        formData.append("payer_last_name", "User");
        formData.append("payer_email", "customer@dolrplus.com");
        formData.append("payer_phone", phone);
        formData.append("payer_country", "SA");
        formData.append("payer_city", "Riyadh");
        formData.append("payer_address", "Digital");
        formData.append("payer_zip", "11000");
        formData.append("payer_ip", "1.1.1.1");
        formData.append("term_url_3ds", window.location.origin);
        formData.append("success_url", window.location.origin);
        formData.append("failure_url", window.location.origin);
        formData.append("hash", finalHash);

        const response = await fetch(CONFIG.API_URL, { method: 'POST', body: formData });
        const data = await response.json();

        if (data.redirect_url) {
            window.location.href = data.redirect_url;
        } else {
            alert("بوابة الدفع: " + (data.error_message || "هناك مشكلة في البيانات"));
            if(payBtn) { payBtn.disabled = false; payBtn.innerText = "إتمام الشراء"; }
        }
    } catch (e) {
        console.error(e);
        alert("حدث خطأ تقني: " + e.message);
        if(payBtn) { payBtn.disabled = false; payBtn.innerText = "إتمام الشراء"; }
    }
}

async function calculateSHA1(str) {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
