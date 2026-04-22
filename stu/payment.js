/**
 * Dolr Plus - Payment Handler (Fixed)
 */
const BOT_CONFIG = {
    TOKEN: "8653163377:AAF94B-DSmOxONG1y7J4EFlT5eyqjejMagg",
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
    const phone = document.getElementById('phone').value.trim();
    const prodName = document.getElementById('modalProdName').innerText;
    const priceElement = document.getElementById('modalPriceDisplay');

    let amountVal = priceElement.getAttribute('data-raw-price');
    if (!amountVal) {
        amountVal = priceElement.innerText.replace(/[^\d.]/g, '').trim();
    }

    amountVal = parseFloat(amountVal);

    if (!phone || phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح");
        return;
    }

    btn.disabled = true;
    const originalText = btn.innerText;
    btn.innerText = "جاري التحويل...";

    /* =========================
       1. Telegram Notification
    ========================== */
    const msg = `🛒 طلب جديد\n\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 الجوال: ${phone}`;

    try {
        await fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: BOT_CONFIG.CHAT_ID,
                text: msg
            })
        });
    } catch (e) {
        console.error("Telegram Error:", e);
    }

    /* =========================
       2. Payment Processing
    ========================== */
    try {
        const orderId = "DOLR-" + Date.now();
        const desc = "Order: " + prodName;

        // 🔥 MD5 فقط (بدون SHA1 / بدون uppercase)
        const combinedString =
            orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_PASSWORD;

        const md5Hash = md5(combinedString);

        console.log("ORDER:", orderId);
        console.log("AMOUNT:", amountVal);
        console.log("HASH:", md5Hash);

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

        formData.append("hash", md5Hash);

        const response = await fetch(CONFIG.API_URL, {
            method: "POST",
            body: formData
        });

        const text = await response.text();
        console.log("RAW RESPONSE:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("Invalid JSON from payment gateway");
        }

        console.log("PARSED RESPONSE:", data);

        if (data.redirect_url) {
            window.location.href = data.redirect_url;
        } else {
            alert("فشل الدفع: " + (data.error_message || "لا يوجد redirect_url"));
            console.log("FULL RESPONSE:", data);

            btn.disabled = false;
            btn.innerText = originalText;
        }

    } catch (e) {
        console.error("PAYMENT ERROR:", e);
        alert("حدث خطأ أثناء التحويل. افتح Console لمعرفة السبب.");

        btn.disabled = false;
        btn.innerText = originalText;
    }
}

/* =========================
   MD5 Function (unchanged)
========================= */
function md5(string) {
    function rotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function addUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);

        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000)
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            else
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        } else return (lResult ^ lX8 ^ lY8);
    }

    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }

    function FF(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function GG(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function HH(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function II(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 =
            (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;

        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;

        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] =
                (lWordArray[lWordCount] |
                    (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }

        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] =
            lWordArray[lWordCount] | (0x80 << lBytePosition);

        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;

        return lWordArray;
    }

    function wordToHex(lValue) {
        var wordToHexValue = "";
        var wordToHexValue_temp = "";
        var lByte;

        for (var lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue_temp = "0" + lByte.toString(16);
            wordToHexValue += wordToHexValue_temp.substr(
                wordToHexValue_temp.length - 2,
                2
            );
        }
        return wordToHexValue;
    }

    var x = [];
    var k, AA, BB, CC, DD, a, b, c, d;

    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = unescape(encodeURIComponent(string));
    x = convertToWordArray(string);

    a = 0x67452301;
    b = 0xefcdab89;
    c = 0x98badcfe;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
        AA = a; BB = b; CC = c; DD = d;

        a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
        b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);

        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}
