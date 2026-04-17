const movieDatabase = [
    {
        id: "inside_out_1",
        title: "Inside Out",
        genre: "Animation • 2015",
        duration: "1j 35m",
        rating: "8.1",
        poster: "https://i.ibb.co.com/YFjZHxkW/Inside-Out-2015-film-poster.jpg",
        url: "https://thmovie.embedseek.com/#kutep",
        source: "seekstream", // New property
        status: "active" // New property: 'active', 'placeholder', 'coming_soon'
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
    {
        id: "inside_out_2",
        title: "Inside Out 2",
        genre: "Animation • 2024",
        duration: "1j 36m",
        rating: "NEW",
        poster: "https://i.ibb.co.com/YFjZHxkW/Inside-Out-2015-film-poster.jpg",
        url: "", // Empty because downloading
        source: "none",
        status: "placeholder" // Special status
    },
    // Moved to Coming Soon
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
        id: "spiderverse",
        title: "Spider-Man: Across the Spider-Verse",
        genre: "Animation • Action • 2023",
        duration: "2j 20m",
        rating: "8.7",
        poster: "https://i.ibb.co.com/GQgWK7mt/MV5-BNThi-Zj-A3-Mj-It-ZGY5-Ni00-Zm-Jh-LWEw-N2-Et-OTBl-YTA4-Y2-E0-M2-Zm-Xk-Ey-Xk-Fqc-Gc-V1.jpg",
        url: "",
        source: "none",
        status: "coming_soon"
    },
    {
        id: "siksa_kubur",
        title: "Siksa Kubur",
        genre: "Horror • 2024",
        duration: "1j 50m",
        rating: "7.2",
        poster: "https://i.ibb.co.com/G307T8x4/download.jpg",
        url: "",
        source: "none",
        status: "coming_soon"
    },
    { 
        id: "midnight_cinema", 
        title: "The Midnight Cinema", 
        genre: "Horror • Mystery", 
        duration: "1j 45m", 
        rating: "8.5", 
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500", 
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
