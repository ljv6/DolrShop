/**
 * Dolr Plus - Payment Handler
 * ربط بوابة الدفع Edfapay مع إشعارات Telegram
 */

const BOT_CONFIG = { 
    TOKEN: "8254444681:AAHYJz1CtqVTT1ovCVUOPCckj3AySLAs8UI", 
    CHAT_ID: "591768998" 
};

const CONFIG = { 
    MERCHANT_ID: "983c9669-9278-4dd1-950f-8b8fbb0a14d2", 
    MERCHANT_PASSWORD: "7ceb6437-92bc-411b-98fa-be054b39eaba", 
    API_URL: "https://api.edfapay.com/payment/initiate",
    FIXED_EMAIL: "maxmohamedmoon@gmail.com"
};

async function processPayment() {
    const btn = document.getElementById('payBtn');
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.trim();
    const prodName = document.getElementById('modalProdName').innerText;
    
    // التعديل المهم هنا: جلب السعر الصافي من الـ Attribute الذي أضفناه في الأندكس
    const amountVal = document.getElementById('modalPriceDisplay').getAttribute('data-raw-price');

    // التحقق من المدخلات
    if (!phone || phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح");
        return;
    }

    // تغيير حالة الزر لمنع التكرار
    btn.disabled = true;
    const originalBtnText = btn.innerText;
    btn.innerText = "جاري التحويل الآمن...";

    // 1. إرسال إشعار فوري للتليجرام
    const msg = `🛒 *طلب جديد من Dolr Plus*\n\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 الجوال: ${phone}\n\n⏳ يتم توجيه العميل الآن لصفحة الدفع...`;
    
    try {
        fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`);
    } catch (e) { console.error("Telegram Notify Fail"); }

    // 2. تجهيز بيانات الدفع
    const orderId = "DOLR-" + Date.now();
    const desc = "Order: " + prodName;

    // 3. نظام التشفير (Hash Generation) لـ Edfapay
    // القاعدة: MD5(ORDER_ID + AMOUNT + CURRENCY + DESC + PASSWORD) ثم SHA1 للنتيجة
    try {
        const combinedString = (orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_PASSWORD).toUpperCase();
        const md5Hash = md5(combinedString);
        const finalHash = await sha1(md5Hash);

        // 4. بناء طلب الدفع
        const formData = new FormData();
        formData.append("action", "SALE");
        formData.append("edfa_merchant_id", CONFIG.MERCHANT_ID);
        formData.append("order_id", orderId);
        formData.append("order_amount", amountVal);
        formData.append("order_currency", "SAR");
        formData.append("order_description", desc);
        formData.append("payer_first_name", "Dolr");
        formData.append("payer_last_name", "Customer");
        formData.append("payer_email", CONFIG.FIXED_EMAIL);
        formData.append("payer_phone", phone);
        formData.append("payer_country", "SA");
        formData.append("payer_city", "Riyadh");
        formData.append("payer_address", "Digital Service");
        formData.append("payer_zip", "11000");
        formData.append("payer_ip", "1.1.1.1");
        formData.append("term_url_3ds", window.location.href);
        formData.append("success_url", window.location.href);
        formData.append("failure_url", window.location.href);
        formData.append("hash", finalHash);

        // 5. الاتصال بالبوابة
        const response = await fetch(CONFIG.API_URL, { method: 'POST', body: formData });
        const data = await response.json();
        
        if (data.redirect_url) {
            window.location.href = data.redirect_url;
        } else {
            alert("خطأ في بوابة الدفع: " + (data.error_message || "تأكد من إعدادات التاجر"));
            btn.disabled = false;
            btn.innerText = originalBtnText;
        }
    } catch (e) {
        console.error("Payment Error:", e);
        alert("حدث خطأ أثناء المعالجة، يرجى المحاولة لاحقاً");
        btn.disabled = false;
        btn.innerText = originalBtnText;
    }
}

// --- توابع التشفير (MD5 & SHA1) ---
// (بقية كود التشفير الذي وضعته أنت في رسالتك يوضع هنا ولا يحتاج تعديل)
