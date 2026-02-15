const socialMedia = {
    whatsapp: "966595234388",
    instagram: "dolr_plus"
};

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('social-links');
    if (container) {
        container.innerHTML = `
            <a href="https://wa.me/${socialMedia.whatsapp}" target="_blank" class="flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full hover:bg-green-500 hover:text-white transition-all duration-300">
                <span class="text-sm font-bold">واتساب</span>
            </a>
            <a href="https://instagram.com/${socialMedia.instagram}" target="_blank" class="flex items-center gap-2 bg-gradient-to-tr from-purple-600 to-pink-500 text-white px-4 py-2 rounded-full hover:scale-105 transition-all duration-300">
                <span class="text-sm font-bold">إنستقرام</span>
            </a>
        `;
    }
});
