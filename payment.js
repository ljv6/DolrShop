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
    
    // 1. تنظيف المبلغ وتحويله لصيغة رقمية (مثلاً 50.00)
    let amountVal = parseFloat(priceText.replace(/[^\d.]/g, '')).toFixed(2);

    // 2. التحقق من البيانات
    if (!phone || phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح");
        return;
    }

    if (isNaN(amountVal) || amountVal <= 0) {
        alert("خطأ في قراءة سعر المنتج");
        return;
    }

    // 3. تغيير حالة الزر لمنع التكرار
    payBtn.disabled = true;
    payBtn.innerText = "جاري المعالجة...";

    try {
        // 4. إرسال إشعار التليجرام
        const telegramMsg = `طلب جديد 🛒\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 الجوال: ${phone}`;
        fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(telegramMsg)}`).catch(e => console.log("Telegram Error"));

        // 5. إعداد بيانات الدفع والهاش
        const orderId = "DOLR-" + Date.now();
        const desc = "Order " + prodName;
        
        // ترتيب السلسلة النصية للتشفير حسب متطلبات بوابة Edfapay
        const combinedString = (CONFIG.MERCHANT_PASSWORD + orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_ID).toUpperCase();
        
        // التشفير باستخدام CryptoJS (الحل الأكيد لمشكلة Pattern)
        if (typeof CryptoJS === 'undefined') {
            throw new Error("مكتبة التشفير غير موجودة في ملف HTML");
        }

        const md5Hash = CryptoJS.MD5(combinedString).toString().toUpperCase();
        const finalHash = CryptoJS.SHA1(md5Hash).toString(); 

        // 6. تجهيز FormData للإرسال
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
        formData.append("payer_ip", "1.1.1.1"); // في الإنتاج يفضل جلب IP العميل الحقيقي
        formData.append("term_url_3ds", window.location.origin);
        formData.append("success_url", window.location.origin);
        formData.append("failure_url", window.location.origin);
        formData.append("hash", finalHash);

        // 7. إرسال الطلب للبوابة
        const response = await fetch(CONFIG.API_URL, { 
            method: 'POST', 
            body: formData 
        });
        
        const data = await response.json();

        // 8. التوجيه لصفحة الدفع أو عرض الخطأ
        if (data.redirect_url) {
            window.location.href = data.redirect_url;
        } else {
            alert("بوابة الدفع: " + (data.error_message || "فشل إنشاء عملية الدفع"));
            payBtn.disabled = false;
            payBtn.innerText = "إتمام الشراء";
        }

    } catch (e) {
        console.error("Payment Error:", e);
        alert("حدث خطأ تقني: " + e.message);
        payBtn.disabled = false;
        payBtn.innerText = "إتمام الشراء";
    }
}
