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

// --- الدالة الأساسية لإتمام العملية ---
async function processPayment() {
    const payBtn = document.getElementById('payBtn');
    const phoneInput = document.getElementById('phone');
    const amountElement = document.getElementById('modalPriceDisplay');
    const nameElement = document.getElementById('modalProdName');

    // 1. التحقق من المدخلات
    if (!phoneInput || !amountElement) return;

    const phone = phoneInput.value.trim();
    const prodName = nameElement.innerText;
    
    // استخراج الرقم فقط من نص السعر (مثلاً 100 SAR تصبح 100.00)
    let amountVal = amountElement.innerText.replace(/[^\d.]/g, ''); 
    amountVal = parseFloat(amountVal).toFixed(2);

    if (phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح يبدأ بـ 966");
        return;
    }

    // تعطيل الزر لمنع التكرار
    payBtn.disabled = true;
    payBtn.innerText = "جاري المعالجة...";

    // 2. إرسال التنبيه للتليجرام (قبل التحويل للبنك)
    const msg = `🛒 طلب جديد:\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 الجوال: ${phone}`;
    try {
        await fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(msg)}`);
    } catch (e) {
        console.error("Telegram error:", e);
    }

    // 3. تجهيز بيانات الهاش والطلب
    const orderId = "DOLR-" + Date.now();
    const desc = "Order " + prodName;

    // حساب الهاش (MD5 ثم SHA1) كما تطلب بوابة Edfapay
    // rawString = password + order_id + amount + currency + description + merchant_id
    const rawString = (CONFIG.MERCHANT_PASSWORD + orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_ID).toUpperCase();
    
    // استخدام مكتبة CryptoJS التي أضفناها في الانديكس
    const md5Hash = CryptoJS.MD5(rawString).toString().toUpperCase();
    const finalHash = await calculateSHA1(md5Hash);

    // 4. إرسال البيانات للبوابة
    const formData = new FormData();
    formData.append("action", "SALE");
    formData.append("edfa_merchant_id", CONFIG.MERCHANT_ID);
    formData.append("order_id", orderId);
    formData.append("order_amount", amountVal);
    formData.append("order_currency", "SAR");
    formData.append("order_description", desc);
    formData.append("payer_first_name", "Customer");
    formData.append("payer_last_name", "User");
    formData.append("payer_email", FIXED_EMAIL);
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

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.redirect_url) {
            window.location.href = data.redirect_url;
        } else {
            alert("خطأ من بوابة الدفع: " + (data.error_message || "يرجى المحاولة لاحقاً"));
            payBtn.disabled = false;
            payBtn.innerText = "إتمام الشراء";
        }
    } catch (e) {
        alert("حدث خطأ في الاتصال بالبنك");
        payBtn.disabled = false;
        payBtn.innerText = "إتمام الشراء";
    }
}

// دالة مساعدة لحساب SHA1
async function calculateSHA1(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
