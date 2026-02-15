const reviews = [
    {
        stars: "⭐⭐⭐⭐⭐",
        text: "خدمة سريعة جداً والدعم فني متعاون لأبعد درجة، أنصح بالتعامل معهم وبقوة!",
        initials: "أ ش",
        name: "أحمد الشمري",
        color: "bg-blue-900/50 text-blue-400" // عدلت الألوان لتناسب الثيم الليلي
    },
    {
        stars: "⭐⭐⭐⭐⭐",
        text: "أفضل متجر شحن جربته، السعر منافس والتنفيذ فوري.",
        initials: "س ع",
        name: "سارة علي",
        color: "bg-pink-900/50 text-pink-400"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('reviews-container');
    if (container) {
        container.innerHTML = reviews.map(rev => `
            <div class="min-w-[280px] md:min-w-[350px] bg-gray-800 p-6 rounded-3xl snap-center border border-gray-700 shadow-xl">
                <div class="flex text-yellow-400 mb-3 text-sm">${rev.stars}</div>
                <p class="text-sm font-medium mb-4 italic text-gray-300">"${rev.text}"</p>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 ${rev.color} rounded-full flex items-center justify-center font-bold text-xs border border-white/10">${rev.initials}</div>
                    <div>
                        <h4 class="text-xs font-bold text-white">${rev.name}</h4>
                        <p class="text-[10px] text-gray-500">عميل موثق ✅</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
});
