async function processPayment() {
    const btn = document.querySelector('#paymentModal button[onclick="processPayment()"]');
    const amountElement = document.getElementById('modalPriceDisplay'); 
    const phoneInput = document.getElementById('phone');
    const nameElement = document.getElementById('modalProdName');

    // 1. تنظيف السعر بدقة (إزالة العملة وأي مسافات)
    let amountVal = amountElement.innerText.replace(/[^\d.]/g, ''); 
    amountVal = parseFloat(amountVal).toFixed(2); // التأكد من صيغة 0.00
    
    const phone = phoneInput.value.trim();
    const prodName = nameElement.innerText;

    if(!phone || phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح");
        return;
    }

    btn.disabled = true;
    btn.innerText = "جاري التحويل...";

    // 2. إرسال تليجرام
    const msg = `🛒 طلب جديد: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 الجوال: ${phone}`;
    try {
        await fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(msg)}`);
    } catch(e) {}

    const orderId = "DOLR-" + Date.now();
    const desc = "Order " + prodName;

    // 3. التشفير (الترتيب الصحيح لـ Edfapay)
    // الترتيب: Password + OrderID + Amount + Currency + Description + MerchantID (كلها uppercase)
    const rawString = (CONFIG.MERCHANT_PASSWORD + orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_ID).toUpperCase();
    
    // ملاحظة: إذا كان الترتيب أعلاه لا يعمل، جرب الترتيب الأصلي في حسابك بتبديل السطر
    const md5Hash = md5(rawString);
    const finalHash = await sha1(md5Hash);

    // 4. إرسال الطلب
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
        
        console.log("الرد من البنك:", data); // مهم جداً لمراجعة الخطأ في المتصفح

        if (data.redirect_url) {
            window.location.href = data.redirect_url;
        } else {
            // سيظهر لك هنا نص الخطأ القادم من البنك
            alert("خطأ من البنك: " + (data.error_message || "الهاش غير صحيح"));
            btn.disabled = false;
            btn.innerText = "إتمام الشراء";
        }
    } catch (e) {
        alert("فشل في الاتصال ببوابة الدفع");
        btn.disabled = false;
    }
}
