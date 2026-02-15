const socialMedia = {
    whatsapp: "966595234388",
    instagram: "dolr_plus"
};

document.addEventListener('DOMContentLoaded', () => {
    // قمت بتغيير المعرف هنا ليتطابق مع الانديكس (social-container)
    const container = document.getElementById('social-container');
    
    if (container) {
        container.innerHTML = `
            <a href="https://wa.me/${socialMedia.whatsapp}" target="_blank" class="flex items-center gap-2 bg-green-500/10 text-green-500 px-6 py-3 rounded-2xl border border-green-500/20 hover:bg-green-500 hover:text-white transition-all duration-300 group">
                <span class="text-2xl">💬</span>
                <span class="text-sm font-black">واتساب</span>
            </a>
            
            <a href="https://instagram.com/${socialMedia.instagram}" target="_blank" class="flex items-center gap-2 bg-pink-500/10 text-pink-500 px-6 py-3 rounded-2xl border border-pink-500/20 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-500 hover:text-white transition-all duration-300">
                <span class="text-2xl">📸</span>
                <span class="text-sm font-black">إنستقرام</span>
            </a>
        `;
    }
});
