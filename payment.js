/**
 * payment.js - النسخة المصلحة 100%
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
    
    // --- تعديل استخراج السعر (حل المشكلة) ---
    // هذا السطر يسحب الأرقام فقط ويتجاهل "SAR" أو أي رموز أخرى
    let cleanPrice = priceText.replace(/[^\d.]/g, ''); 
    let amountVal = parseFloat(cleanPrice).toFixed(2);

    if (isNaN(amountVal) || amountVal <= 0) {
        alert("خطأ: تعذر تحديد سعر المنتج بشكل صحيح");
        return;
    }

    if (phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح");
        return;
    }

    // تعطيل الزر
    payBtn.disabled = true;
    payBtn.innerText = "جاري المعالجة...";

    try {
        // 1. إرسال التليجرام
        const telegramMsg = `طلب جديد 🛒\nمتجر Dolr Plus\n\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 جوال: ${phone}`;
        fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(telegramMsg)}`).catch(() => {});

        // 2. حساب الهاش وبوابة الدفع
        const orderId = "DOLR-" + Date.now();
        const desc = "Order " + prodName;
        
        // بناء سلسلة الهاش (يجب أن يكون بالترتيب الصحيح لـ Edfapay)
        const combinedString = (CONFIG.MERCHANT_PASSWORD + orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_ID).toUpperCase();
        
        // التحقق من مكتبة التشفير
        if (typeof CryptoJS === 'undefined') {
            alert("خطأ: مكتبة التشفير غير محملة في صفحة HTML");
            payBtn.disabled = false;
            payBtn.innerText = "إتمام الشراء";
            return;
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
            alert("بوابة الدفع: " + (data.error_message || "فشل الطلب"));
            payBtn.disabled = false;
            payBtn.innerText = "إتمام الشراء";
        }
    } catch (e) {
        console.error(e);
        alert("حدث خطأ تقني: " + e.message);
        payBtn.disabled = false;
        payBtn.innerText = "إتمام الشراء";
    }
}

async function calculateSHA1(str) {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
