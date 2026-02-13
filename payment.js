// إعدادات الخصوصية والاتصال
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

async function processPayment() {
    // 1. جلب العناصر من النافذة الجديدة
    const btn = document.querySelector('#paymentModal button[onclick="processPayment()"]');
    const amountElement = document.getElementById('modalPriceDisplay'); // المعرف الجديد للسعر
    const phoneInput = document.getElementById('phone');
    const nameElement = document.getElementById('modalProdName');

    if(!amountElement || !phoneInput || !nameElement) {
        console.error("تعذر العثور على عناصر النافذة");
        return;
    }

    const amountVal = amountElement.innerText.replace(' SAR', '').trim();
    const phone = phoneInput.value.trim();
    const prodName = nameElement.innerText;

    // 2. التحقق من البيانات
    if(!phone || phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح للمتابعة");
        return;
    }

    // تغيير حالة الزر
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "جاري تحويلك للدفع الآمن...";

    // 3. إرسال إشعار تليجرام
    const msg = `🛒 *طلب جديد من متجر Dolr Plus*\n\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 جوال العميل: ${phone}`;
    
    try {
        await fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`, {
            method: 'GET',
            keepalive: true 
        });
    } catch(e) { console.log("Telegram Notification Failed"); }

    const orderId = "DOLR-" + Date.now();
    const desc = "Order: " + prodName;

    // 4. التشفير (نفس منطقك الأصلي)
    const md5Hash = md5((orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_PASSWORD).toUpperCase());
    const finalHash = await sha1(md5Hash);

    // 5. تجهيز بيانات الدفع بوابة Edfapay
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
            alert("عذراً، حدث خطأ في عملية الدفع: " + (data.error_message || "تأكد من بيانات البطاقة"));
            btn.disabled = false;
            btn.innerText = originalText;
        }
    } catch (e) {
        alert("فشل الاتصال بخادم البنك، يرجى المحاولة لاحقاً");
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

// الدوال المساعدة (MD5 & SHA1) تبقى كما هي في كودك...
