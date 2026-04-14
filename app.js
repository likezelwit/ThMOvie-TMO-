function onPlayerStateChange(event) {
    // 1. Cek apakah video sudah selesai
    if (event.data == YT.PlayerState.ENDED) {
        // Ambil ID video yang baru saja selesai
        let currentVideoId = player.getVideoData().video_id;

        // Jika yang selesai adalah Intro VowViw, langsung gas ke Film
        if (currentVideoId === '9v1atEBmUIc') {
            player.loadVideoById(movieId); // movieId ini ID dari link user
        }
    }

    // 2. Proteksi Anti-Pause
    if (event.data == YT.PlayerState.PAUSED) {
        player.playVideo(); // Kalau di-pause paksa, dia bakal play lagi otomatis
    }
}
