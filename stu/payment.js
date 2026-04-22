/**
 * Dolr Plus - Payment Handler
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
    const phone = document.getElementById('phone').value.trim();
    const prodName = document.getElementById('modalProdName').innerText;
    const priceElement = document.getElementById('modalPriceDisplay');
    
    let amountVal = priceElement.getAttribute('data-raw-price');
    if (!amountVal) {
        amountVal = priceElement.innerText.replace(/[^\d.]/g, '').trim();
    }

    if (!phone || phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح");
        return;
    }

    btn.disabled = true;
    const originalText = btn.innerText;
    btn.innerText = "جاري التحويل الآمن...";

    // ✅ التليجرام (مضمون أكثر)
    const msg = `🛒 *طلب جديد من Dolr Plus*\n\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 الجوال: ${phone}\n\n⏳ يتم توجيه العميل الآن...`;

    try {
        await fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: BOT_CONFIG.CHAT_ID,
                text: msg,
                parse_mode: "Markdown"
            })
        });
    } catch (e) {
        console.error("Telegram Error", e);
    }

    try {
        const orderId = "DOLR-" + Date.now();
        const desc = "Order: " + prodName;

        // 🔐 التشفير (بدون أي تغيير)
        const combinedString = (orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_PASSWORD).toUpperCase();
        const md5Hash = md5(combinedString);
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

        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: formData,
            redirect: 'follow'
        });

        const text = await response.text();

        let data = null;

        try {
            data = JSON.parse(text);
        } catch (e) {
            data = null;
        }

        if (data && data.redirect_url) {
            window.location.href = data.redirect_url;
            return;
        }

        const match = text.match(/https?:\/\/[^\s"]+/);

        if (match) {
            window.location.href = match[0];
        } else {
            console.log("EDFAPAY RESPONSE:", text);
            alert("لم يتم العثور على رابط التحويل من بوابة الدفع");
            btn.disabled = false;
            btn.innerText = originalText;
        }

    } catch (e) {
        console.error("Critical Error:", e);
        alert("حدث خطأ أثناء المعالجة");
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

/* ===== التشفير بدون أي تعديل ===== */

async function sha1(str) {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function md5(string) {
    function rotateLeft(lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); }
    function addUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000); lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000); lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        } else return (lResult ^ lX8 ^ lY8);
    }
    function F(x,y,z){return(x&y)|((~x)&z);}
    function G(x,y,z){return(x&z)|(y&(~z));}
    function H(x,y,z){return(x^y^z);}
    function I(x,y,z){return(y^(x|(~z)));}
    function FF(a,b,c,d,x,s,ac){a=addUnsigned(a,addUnsigned(addUnsigned(F(b,c,d),x),ac));return addUnsigned(rotateLeft(a,s),b);}
    function GG(a,b,c,d,x,s,ac){a=addUnsigned(a,addUnsigned(addUnsigned(G(b,c,d),x),ac));return addUnsigned(rotateLeft(a,s),b);}
    function HH(a,b,c,d,x,s,ac){a=addUnsigned(a,addUnsigned(addUnsigned(H(b,c,d),x),ac));return addUnsigned(rotateLeft(a,s),b);}
    function II(a,b,c,d,x,s,ac){a=addUnsigned(a,addUnsigned(addUnsigned(I(b,c,d),x),ac));return addUnsigned(rotateLeft(a,s),b);}
    function convertToWordArray(string){
        var lMessageLength=string.length;
        var lNumberOfWords_temp1=lMessageLength+8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1%64))/64;
        var lNumberOfWords=(lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition=0;
        var lByteCount=0;
        while(lByteCount<lMessageLength){
            var lWordCount=(lByteCount-(lByteCount%4))/4;
            lBytePosition=(lByteCount%4)*8;
            lWordArray[lWordCount]=(lWordArray[lWordCount]|(string.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        return lWordArray;
    }
    function wordToHex(lValue){
        var wordToHexValue="",lByte;
        for(var lCount=0;lCount<=3;lCount++){
            lByte=(lValue>>>(lCount*8))&255;
            wordToHexValue+=("0"+lByte.toString(16)).slice(-2);
        }
        return wordToHexValue;
    }

    var x=Array(),a=0x67452301,b=0xEFCDAB89,c=0x98BADCFE,d=0x10325476;

    string=unescape(encodeURIComponent(string));
    x=convertToWordArray(string);

    for(var k=0;k<x.length;k+=16){
        var AA=a,BB=b,CC=c,DD=d;
        a=addUnsigned(a,AA);b=addUnsigned(b,BB);c=addUnsigned(c,CC);d=addUnsigned(d,DD);
    }

    return (wordToHex(a)+wordToHex(b)+wordToHex(c)+wordToHex(d)).toLowerCase();
}
