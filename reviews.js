const reviews = [
    {
        stars: "⭐⭐⭐⭐⭐",
        text: "خدمة سريعة جداً والدعم فني متعاون لأبعد درجة، أنصح بالتعامل معهم وبقوة!",
        initials: "أ ش",
        name: "أحمد الشمري",
        color: "bg-blue-100 text-blue-600"
    },
    {
        stars: "⭐⭐⭐⭐⭐",
        text: "أفضل متجر شحن جربته، السعر منافس والتنفيذ فوري.",
        initials: "س ع",
        name: "سارة علي",
        color: "bg-pink-100 text-pink-600"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('reviews-container');
    if (container) {
        container.innerHTML = reviews.map(rev => `
            <div class="min-w-[280px] md:min-w-[350px] bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl snap-center shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="flex text-yellow-400 mb-3 text-sm">${rev.stars}</div>
                <p class="text-sm font-medium mb-4 italic text-gray-600 dark:text-gray-300">"${rev.text}"</p>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 ${rev.color} rounded-full flex items-center justify-center font-bold text-xs">${rev.initials}</div>
                    <div>
                        <h4 class="text-xs font-bold dark:text-white">${rev.name}</h4>
                        <p class="text-[10px] text-gray-400">عميل موثق ✅</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
});
