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
    // جلب العناصر بناءً على التصميم الجديد
    const btn = document.querySelector('#paymentModal button[onclick="processPayment()"]');
    const amountElement = document.getElementById('modalPriceDisplay'); 
    const phoneInput = document.getElementById('phone');
    const nameElement = document.getElementById('modalProdName');

    // التحقق من وجود العناصر
    if(!amountElement || !phoneInput || !nameElement) {
        alert("خطأ في النظام: لم يتم العثور على بيانات المنتج");
        return;
    }

    // تنظيف السعر (أخذ الرقم فقط)
    const amountVal = amountElement.innerText.replace('SAR', '').replace('sar', '').trim();
    const phone = phoneInput.value.trim();
    const prodName = nameElement.innerText;

    if(!phone || phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح");
        return;
    }

    // تحديث حالة الزر
    btn.disabled = true;
    btn.innerText = "جاري التحويل للدفع الآمن...";

    // إرسال إشعار تليجرام
    const msg = `🛒 *طلب جديد من متجر Dolr Plus*\n\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 جوال العميل: ${phone}`;
    
    try {
        await fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`, {
            method: 'GET',
            keepalive: true 
        });
    } catch(e) { console.log("Telegram Error"); }

    const orderId = "DOLR-" + Date.now();
    const desc = "Order: " + prodName;

    // التشفير والحماية
    const md5Hash = md5((orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_PASSWORD).toUpperCase());
    const finalHash = await sha1(md5Hash);

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
            alert("خطأ: " + (data.error_message || "يرجى المحاولة مرة أخرى"));
            btn.disabled = false;
            btn.innerText = "إتمام الشراء";
        }
    } catch (e) {
        alert("فشل الاتصال ببوابة الدفع");
        btn.disabled = false;
        btn.innerText = "إتمام الشراء";
    }
}
