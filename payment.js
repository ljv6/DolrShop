// بيانات الربط
const BOT_CONFIG = { 
    TOKEN: "8254444681:AAHYJz1CtqVTT1ovCVUOPCckj3AySLAs8UI", 
    CHAT_ID: "591768998" 
};
const CONFIG = { 
    MERCHANT_ID: "983c9669-9278-4dd1-950f-8b8fbb0a14d2", 
    MERCHANT_PASSWORD: "7ceb6437-92bc-411b-98fa-be054b39eaba", 
    API_URL: "https://api.edfapay.com/payment/initiate" 
};

// الدالة الأساسية
async function processPayment() {
    const payBtn = document.getElementById('payBtn');
    if (!payBtn) return;

    const phoneElement = document.getElementById('phone');
    const phone = phoneElement ? phoneElement.value.trim() : "";
    
    // محاولة جلب اسم المنتج وسعره من العناصر الموجودة
    const prodName = document.getElementById('modalProdName')?.innerText || "منتج غير محدد";
    const priceDisplay = document.getElementById('modalPriceDisplay')?.innerText || "0";
    let amountVal = parseFloat(priceDisplay.replace(/[^\d.]/g, '')).toFixed(2);

    if (phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح");
        return;
    }

    payBtn.disabled = true;
    payBtn.innerText = "جاري المعالجة...";

    try {
        // إرسال التليجرام
        const telegramMsg = `🚀 طلب جديد من Dolr Plus\n📱 الجوال: ${phone}\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR`;
        fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(telegramMsg)}&parse_mode=Markdown`).catch(()=>{});

        // إعداد بيانات الدفع
        const orderId = "DOLR-" + Date.now();
        const desc = "Order: " + prodName;

        // التشفير (نفس أسلوبك الأصلي - بدون أي مكتبات خارجية)
        const combinedString = (CONFIG.MERCHANT_PASSWORD + orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_ID).toUpperCase();
        
        // استخدام دوال التشفير المدمجة بالأسفل
        const md5Hash = getMD5(combinedString);
        const finalHash = getSHA1(md5Hash);

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
            alert("خطأ: " + (data.error_message || "فشل الطلب"));
            payBtn.disabled = false;
            payBtn.innerText = "إتمام الشراء";
        }
    } catch (err) {
        alert("حدث خطأ أثناء الاتصال");
        payBtn.disabled = false;
        payBtn.innerText = "إتمام الشراء";
    }
}

// --- دالة MD5 الصافية ---
function getMD5(s) {
    var k=[],i=0;for(;i<64;)k[i]=0|(Math.abs(Math.sin(++i))*4294967296);
    var b=[0x67452301,0xefcdab89,0x98badcfe,0x10325476],h=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,1,6,11,4,5,10,15,4,2,7,12,1,0,5,10,15,5,8,11,14,1,4,7,10,0,5,10,15,5,8,11,14,1,4,7,10,0,5,10,15,5,8,11,14,1,4,7,10],
    r=[7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
    s=unescape(encodeURIComponent(s));var m=s.length,n=m+8,v=new Array((n+(64-n%64))/4).fill(0);
    for(i=0;i<m;i++)v[i>>2]|=(s.charCodeAt(i)<<((i%4)*8));v[m>>2]|=0x80<<((m%4)*8);v[v.length-2]=m*8;
    for(var j=0;j<v.length;j+=16){var a=b.slice();for(i=0;i<64;i++){var f,g;if(i<16){f=(a[1]&a[2])|(~a[1]&a[3]);g=i;}else if(i<32){f=(a[3]&a[1])|(~a[3]&a[2]);g=(5*i+1)%16;}else if(i<48){f=a[1]^a[2]^a[3];g=(3*i+5)%16;}else{f=a[2]^(a[1]|~a[3]);g=(7*i)%16;}
    var t=a[3];a[3]=a[2];a[2]=a[1];a[1]=((a[1]+((f+a[0]+k[i]+v[j+g])<<(r[i])|(a[1]+f+a[0]+k[i]+v[j+g])>>>(32-r[i])))|0);a[0]=t;}for(i=0;i<4;i++)b[i]=(b[i]+a[i])|0;}
    return b.map(x=>('00000000'+(x>>>0).toString(16)).slice(-8).match(/../g).reverse().join('')).join('');
}

// --- دالة SHA1 الصافية ---
function getSHA1(s) {
    var r=(n,x)=>(x<<n)|(x>>>(32-n)),f=[(b,c,d)=>b&c|~b&d,(b,c,d)=>b^c^d,(b,c,d)=>(b&c)|(b&d)|(c&d),(b,c,d)=>b^c^d],k=[0x5a827999,0x6ed9eba1,0x8f1bbcdc,0xca62c1d6],m=unescape(encodeURIComponent(s)),n=m.length,a=[0x67452301,0xefcdab89,0x98badcfe,0x10325476,0xc3d2e1f0],w=[];
    for(var i=0;i<((n+8)>>6)+1;i++){w[i]=new Uint32Array(16);for(var j=0;j<64;j++)if(j<n)w[i][j>>2]|=m.charCodeAt(j)<<(24-(j%4)*8);else if(j==n)w[i][j>>2]|=0x80<<(24-(j%4)*8);w[i][15]=n*8;}
    for(var i=0;i<w.length;i++){var x=new Uint32Array(80);for(var j=0;j<16;j++)x[j]=w[i][j];for(var j=16;j<80;j++)x[j]=r(1,x[j-3]^x[j-8]^x[j-14]^x[j-16]);var h=a.slice();for(var j=0;j<80;j++){var t=(r(5,h[0])+f[0|j/20](h[1],h[2],h[3])+h[4]+k[0|j/20]+x[j])|0;h[4]=h[3];h[3]=h[2];h[2]=r(30,h[1]);h[1]=h[0];h[0]=t;}for(var j=0;j<5;j++)a[j]=(a[j]+h[j])|0;}
    return a.map(x=>('00000000'+(x>>>0).toString(16)).slice(-8)).join('');
}
