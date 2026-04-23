// ملف تعريف المنتجات المحدث - خدمات الطلاب Dolr Plus
const products = [
    { 
        id: 1, 
        name: "حل واجب", 
        price: "30.00", 
        img: "IMG_1196.png",
        desc: "حل كامل للواجبات المدرسية والجامعية بشكل احترافي وسريع."
    },
    { 
        id: 2, 
        name: "بحث", 
        price: "60.00", 
        img: "IMG_1198.png",
        desc: "إعداد بحث أكاديمي متكامل مع تنسيق ومراجع حسب الطلب."
    },
    { 
        id: 3, 
        name: "عرض تقديمي", 
        price: "150.00", 
        img: "IMG_PPT.png",
        desc: "تصميم عرض تقديمي احترافي (PowerPoint) مع تنسيق جذاب ومحتوى مرتب."
    },
    { 
        id: 4, 
        name: "تلخيص درس", 
        price: "25.00", 
        img: "IMG_1201.png",
        desc: "تلخيص أي درس أو مادة بطريقة سهلة ومختصرة للمذاكرة."
    },
    { 
        id: 5, 
        name: "حل اختبار", 
        price: "80.00", 
        img: "IMG_TEST.png",
        desc: "مساعدة في حل الاختبارات ."
    }
];

if (typeof module !== 'undefined') {
    module.exports = products;
}
