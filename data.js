const movieDatabase = [
    // --- SEEKSTREAM MOVIES ---
    {
        id: "inside_out_1",
        title: "Inside Out",
        genre: "Animation • 2015",
        duration: "1j 35m",
        rating: "8.1",
        poster: "https://i.ibb.co.com/YFjZHxkW/Inside-Out-2015-film-poster.jpg",
        url: "https://thmovie.embedseek.com/#kutep", // Ganti dengan URL seekstream valid jika ada
        source: "seekstream",
        status: "active"
    },
    {
        id: "spy_family_code_white",
        title: "SPY x FAMILY CODE: White",
        genre: "Animation • Action • 2023",
        duration: "1j 50m",
        rating: "8.0",
        poster: "https://i.ibb.co.com/fdYgkJgD/download.jpg",
        url: "https://thmovie.embedseek.com/#56uvh",
        source: "seekstream",
        status: "active"
    },

    // --- YOUTUBE MOVIES (Untuk Testing Sync) ---
    {
        id: "yt_sintel",
        title: "Sintel (4K)",
        genre: "Animation • Short • 2010",
        duration: "14m",
        rating: "8.8",
        poster: "https://i.ytimg.com/vi/eRsGyueVLvQ/hqdefault.jpg",
        url: "https://youtube.com/watch?v=eRsGyueVLvQ", 
        source: "youtube",
        status: "active"
    },
    {
        id: "yt_tears_of_steel",
        title: "Tears of Steel",
        genre: "Sci-Fi • Action • 2012",
        duration: "12m",
        rating: "7.9",
        poster: "https://i.ytimg.com/vi/R6MlUcmOul8/hqdefault.jpg",
        url: "https://youtube.com/watch?v=R6MlUcmOul8", 
        source: "youtube",
        status: "active"
    },

    // --- COMING SOON / PLACEHOLDER ---
    {
        id: "inside_out_2",
        title: "Inside Out 2",
        genre: "Animation • 2024",
        duration: "1j 36m",
        rating: "NEW",
        poster: "https://i.ibb.co.com/YFjZHxkW/Inside-Out-2015-film-poster.jpg",
        url: "",
        source: "none",
        status: "placeholder"
    },
    {
        id: "vina_7_hari",
        title: "Vina Sebelum 7 Hari",
        genre: "Horror • 2024",
        duration: "1j 48m",
        rating: "6.5",
        poster: "https://i.ibb.co.com/3Vhq3Xs/download.jpg",
        url: "",
        source: "none",
        status: "coming_soon"
    },
    { 
        id: "big_buck_bunny", 
        title: "Big Buck Bunny", 
        genre: "Animation • Comedy", 
        duration: "10m", 
        rating: "7.5", 
        poster: "https://images.unsplash.com/photo-1560167016-022b78a0258e?w=500", 
        url: "",
        source: "none",
        status: "coming_soon"
    }
];
