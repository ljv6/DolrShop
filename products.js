// ملف تعريف المنتجات المحدث - Dolr Plus
const products = [
    { 
        id: 1, 
        name: "شريحة بيانات STC", 
        price: "80.00", 
        img: "https://i.ibb.co/68XW9QG/IMG-7454.jpg" 
    },
    { 
        id: 2, 
        name: "اشتراك سناب رسمي (3 أشهر)", 
        price: "25.00", 
        img: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/Snapchat_logo.svg/1200px-Snapchat_logo.svg.png" 
    },
    { 
        id: 3, 
        name: "اشتراك سناب رسمي (6 أشهر)", 
        price: "45.00", 
        img: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/Snapchat_logo.svg/1200px-Snapchat_logo.svg.png" 
    },
    { 
        id: 4, 
        name: "اشتراك سناب رسمي (12 شهر)", 
        price: "90.00", 
        img: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/Snapchat_logo.svg/1200px-Snapchat_logo.svg.png" 
    },
    { 
        id: 5, 
        name: "اشتراك شات جي بي تي (سنة)", 
        price: "35.00", 
        img: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" 
    }
];

// تصدير البيانات لتكون متاحة للملف الأساسي
if (typeof module !== 'undefined') {
    module.exports = products;
}
