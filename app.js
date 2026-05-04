// ========== APP LOGIC ==========

// --- RENDER FUNCTIONS ---
function renderMovies() {
    const grid = document.getElementById('movie-grid');
    if(!grid) return;
    
    grid.innerHTML = movieDatabase.map(m => {
        let statusBadge = '';
        let overlayHtml = '';
        let disabledClass = '';
        let clickAction = `onclick="selectMovie('${m.id}')"`;
        
        if (m.status === 'coming_soon') {
            statusBadge = '<span class="status-badge coming-soon">Coming Soon</span>';
            overlayHtml = `<div class="movie-status-overlay"><div style="font-size:2rem;margin-bottom:10px;">🔒</div><div style="font-weight:bold;">Segera Hadir</div></div>`;
            disabledClass = 'disabled';
            clickAction = '';
        } else {
            statusBadge = m.rating === 'NEW' 
                ? '<span class="badge-rating" style="background:var(--accent-gold); color:#000;">NEW</span>' 
                : `<span class="badge-rating">★ ${m.rating}</span>`;
        }

        return `
        <div class="movie-card ${disabledClass}" ${clickAction}>
            <img class="movie-poster" src="${m.poster}" alt="${m.title}" loading="lazy">
            ${statusBadge}
            ${overlayHtml}
            ${m.status === 'active' ? `
            <div class="movie-overlay">
                <div class="movie-info">
                    <h3 class="movie-title-card">${m.title}</h3>
                    <p class="movie-meta-card">${m.genre} • ${m.duration}</p>
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();createRoomFromMovie('${m.id}')">Tonton Sekarang</button>
                </div>
            </div>` : ''}
        </div>
    `}).join('');
}

function selectMovie(id) {
    const movie = movieDatabase.find(m => m.id === id);
    if (movie && movie.status === 'active') {
        selectedMovie = movie;
        showToast('Film dipilih: ' + selectedMovie.title, 'success');
    }
}

function createRoomFromMovie(id) {
    const movie = movieDatabase.find(m => m.id === id);
    if (!movie || movie.status !== 'active') return;
    
    selectedMovie = movie;
    // Simpan embed code ke input hidden
    verifiedEmbedData = movie.embedCode;

    const displayEl = document.getElementById('selected-movie-display');
    if(displayEl) {
        displayEl.value = movie.title;
        displayEl.style.fontWeight = 'bold';
    }
    
    const embedInput = document.getElementById('room-embed-code');
    if(embedInput) embedInput.value = verifiedEmbedData;

    const preview = document.getElementById('video-preview');
    if(preview) preview.classList.add('active');
    
    const thumb = document.getElementById('preview-thumb');
    const titleEl = document.getElementById('preview-title');
    const channel = document.getElementById('preview-channel');

    if(thumb) thumb.src = movie.poster;
    if(titleEl) titleEl.textContent = movie.title;
    if(channel) channel.textContent = 'Premium Embed';

    showPage('create');
}

// --- LOKET SYSTEM (UPDATED COLORS) ---
async function fetchOccupiedRooms() {
    if (!db) return;
    try {
        const snap = await db.ref('rooms').once('value');
        occupiedRooms = {};
        if (snap.exists()) {
            snap.forEach(child => {
                const r = child.val();
                if (r && r.globalRoomNum) {
                    occupiedRooms[r.globalRoomNum] = child.val();
                }
            });
        }
    } catch(e) {
        console.error('Fetch occupied error:', e);
    }
}

async function renderLoket() {
    await fetchOccupiedRooms();
    const grid = document.getElementById('loket-grid');
    if(!grid) return;
    let html = '';

    for (let l = 1; l <= TOTAL_LOKET; l++) {
        let roomsHtml = '';
        let occupiedCount = 0;
        const startGlobal = (l - 1) * ROOMS_PER_LOKET + 1;

        for (let r = 1; r <= ROOMS_PER_LOKET; r++) {
            const globalNum = startGlobal + r - 1;
            const roomInfo = occupiedRooms[globalNum];
            
            let statusClass = 'available'; // Default Abu-abu
            let title = `Room ${r} - Kosong`;
            let clickAction = `onclick="event.stopPropagation();clickRoomFromLoket(${l},${r})"`;

            if (roomInfo && roomInfo.phase !== 'ended') {
                occupiedCount++;
                // LOGIKA WARNA BARU
                if (roomInfo.visibility === 'private') {
                    statusClass = 'occupied-private'; // MERAH (Locked)
                    title = 'Private Room (Locked)';
                    clickAction = `onclick="joinRoomFromLoket('${roomInfo.roomId}')"`;
                } else {
                    statusClass = 'occupied-public'; // HIJAU (Public)
                    title = 'Public Room (Open)';
                    clickAction = `onclick="joinRoomFromLoket('${roomInfo.roomId}')"`;
                }
            }

            roomsHtml += `<div class="room-mini ${statusClass}" ${clickAction} title="${title}">${r}</div>`;
        }

        const available = ROOMS_PER_LOKET - occupiedCount;
        html += `
            <div class="loket-card" onclick="openLoketDetail(${l})">
                <div class="loket-card-header">
                    <div class="loket-number">LOKET ${l}</div>
                    <div class="loket-status"><span class="status-dot"></span>${available > 0 ? available + ' Kursi Kosong' : 'FULL HOUSE'}</div>
                </div>
                <div class="loket-desc">Studio ${startGlobal} s/d ${startGlobal + ROOMS_PER_LOKET - 1}</div>
                <div class="loket-rooms-label">SEAT MAP</div>
                <div class="room-grid-mini">${roomsHtml}</div>
            </div>
        `;
    }
    grid.innerHTML = html;
}

function joinRoomFromLoket(roomId) {
    if (!db) return;
    let room = null;
    Object.values(occupiedRooms).forEach(r => {
        if(r.roomId === roomId) room = r;
    });

    if (!room) {
        db.ref('rooms/' + roomId).once('value').then(snap => {
             if(snap.exists()) checkJoinLogic(snap.val(), roomId);
        });
    } else {
        checkJoinLogic(room, roomId);
    }
}

function checkJoinLogic(room, roomId) {
    if (!room) return;
    if(room.phase === 'ended') {
        showToast('Room ini sudah selesai.', 'error');
        return;
    }
    myUsername = "User_" + Math.floor(Math.random() * 9000 + 1000);
    enterCinema(roomId, room, false);
    showToast('Berhasil bergabung! Menunggu Host...', 'success');
}

function clickRoomFromLoket(loket, room) {
    const globalNum = loketRoomToGlobal(loket, room);
    if (occupiedRooms[globalNum]) {
        showToast('Room ini sudah terisi!', 'error');
        return;
    }
    openCreateRoom(loket, room);
}

function openLoketDetail(loket) { /* Placeholder for future expansion */ }

// --- CREATE ROOM & BOOKING ---
function openCreateRoom(preLoket, preRoom) {
    if (!verifiedEmbedData) {
        selectedMovie = null;
        verifiedEmbedData = null;
        const displayEl = document.getElementById('selected-movie-display');
        if(displayEl) {
            displayEl.value = '';
            displayEl.dataset.preLoket = '';
            displayEl.dataset.preRoom = '';
        }
    }
    
    const embedInput = document.getElementById('room-embed-code');
    if(embedInput) embedInput.value = '';
    
    const preview = document.getElementById('video-preview');
    if(preview) preview.classList.remove('active');
    
    const timeInput = document.getElementById('room-time');
    if(timeInput) timeInput.value = '';
    
    const publicRadio = document.querySelector('input[name="roomVisibility"][value="public"]');
    if(publicRadio) publicRadio.checked = true;
    
    togglePasswordInput();
    setupDateTimeMin();
    updateQuota();

    if (preLoket && preRoom) {
        const displayEl = document.getElementById('selected-movie-display');
        if(displayEl) {
            displayEl.placeholder = `Loket ${preLoket} • Room ${preRoom}`;
            displayEl.dataset.preLoket = preLoket;
            displayEl.dataset.preRoom = preRoom;
        }
    }

    showPage('create');
}

function togglePasswordInput() {
    const isPrivate = document.querySelector('input[name="roomVisibility"]:checked').value === 'private';
    const passGroup = document.getElementById('password-group');
    if (passGroup) {
        if (isPrivate) {
            passGroup.classList.remove('hidden');
            document.getElementById('room-password').focus();
        } else {
            passGroup.classList.add('hidden');
            document.getElementById('room-password').value = '';
        }
    }
}

function setQuickTime(offsetMinutes) {
    const timeInput = document.getElementById('room-time');
    if(!timeInput) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + offsetMinutes);
    const pad = (n) => String(n).padStart(2, '0');
    timeInput.value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function setupDateTimeMin() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const timeInput = document.getElementById('room-time');
    if(timeInput) timeInput.min = now.toISOString().slice(0, 16);
}

function updateQuota() {
    const q = randomQuota();
    const quotaDisplay = document.getElementById('quota-display');
    if(quotaDisplay) quotaDisplay.textContent = q;
    return q;
}

function findAvailableRoom() {
    const candidates = [];
    for (let l = 1; l <= TOTAL_LOKET; l++) {
        for (let r = 1; r <= ROOMS_PER_LOKET; r++) {
            const g = loketRoomToGlobal(l, r);
            if (!occupiedRooms[g]) candidates.push({ loket: l, room: r });
        }
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function triggerBookingAd() {
    // Placeholder: Trigger Adsterra scripts that play video or popups
    // Since we can't control external JS execution perfectly, we ensure the scripts are loaded in HTML
    // Here we might want to simulate a waiting time or simply proceed as the scripts are auto-loaded.
    console.log("Ad Triggered via Booking Action");
}

function processBooking() {
    const timeInput = document.getElementById('room-time');
    if(!timeInput) return;
    const timeValue = timeInput.value;
    
    if (!verifiedEmbedData || !selectedMovie) {
        showToast('Pilih film dari halaman utama terlebih dahulu!', 'error');
        return;
    }

    const videoTitle = selectedMovie.title;

    if (!timeValue) { showToast('Pilih jadwal tayang!', 'error'); return; }
    const scheduleTime = new Date(timeValue).getTime();
    const now = Date.now();
    if (scheduleTime <= now) { showToast('Jadwal harus > 1 menit dari sekarang!', 'error'); return; }

    const quotaDisplay = document.getElementById('quota-display');
    const quota = quotaDisplay ? parseInt(quotaDisplay.textContent) : randomQuota();
    
    const visibilityInput = document.querySelector('input[name="roomVisibility"]:checked');
    const visibility = visibilityInput ? visibilityInput.value : 'public';
    
    let password = null;
    if (visibility === 'private') {
        const passInput = document.getElementById('room-password');
        const passValue = passInput ? passInput.value.trim() : '';
        if (!passValue) { showToast('Masukkan password!', 'error'); return; }
        password = passValue;
    }

    // TRIGGER IKLAN DISINI (Saat user klik confirm)
    triggerBookingAd();

    let loket, room;
    const displayEl = document.getElementById('selected-movie-display');
    const preLoket = displayEl && displayEl.dataset.preLoket ? parseInt(displayEl.dataset.preLoket) : 0;
    const preRoom = displayEl && displayEl.dataset.preRoom ? parseInt(displayEl.dataset.preRoom) : 0;

    if (preLoket && preRoom) {
        const globalNum = loketRoomToGlobal(preLoket, preRoom);
        if (occupiedRooms[globalNum]) {
            showToast('Room ini sudah diambil orang lain!', 'error');
            renderLoket();
            return;
        }
        loket = preLoket;
        room = preRoom;
    } else {
        const result = findAvailableRoom();
        if (!result) { showToast('Semua room penuh!', 'error'); return; }
        loket = result.loket;
        room = result.room;
    }

    const globalNum = loketRoomToGlobal(loket, room);
    const newRef = db.ref('rooms').push();
    
    const roomObj = {
        loket: loket,
        room: room,
        globalRoomNum: globalNum,
        embedCode: verifiedEmbedData, // Simpan Embed Code ke Firebase
        videoTitle: videoTitle,
        capacity: quota,
        scheduleTime: scheduleTime,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        phase: 'waiting',
        hostUsername: myUsername,
        visibility: visibility,
        password: password,
        roomId: newRef.key
    };

    newRef.set(roomObj).then(() => {
        showPrinterAnimation(loket, room, quota, newRef.key, roomObj);
    }).catch(err => {
        showToast('Gagal membuat room: ' + err.message, 'error');
    });
}

function showPrinterAnimation(loket, room, quota, roomId, roomObj) {
    const overlay = document.getElementById('printer-overlay');
    const container = document.getElementById('ticket-animation-container');
    if(overlay) overlay.classList.add('active');
    if(container) {
        container.innerHTML = `
            <div class="ticket-printing">
                <div style="font-size:.7rem;margin-bottom:6px;opacity:.7">ThMOvie PREMIERE</div>
                <div style="font-size:1.4rem;margin-bottom:4px">LOKET ${loket}</div>
                <div style="font-size:1.1rem">ROOM ${room}</div>
                <div style="font-size:.65rem;margin-top:8px;border-top:1px dashed rgba(212,175,55,0.3);padding-top:6px;">
                    Kapasitas: ${quota}<br>
                    Film: ${roomObj.videoTitle}
                </div>
            </div>
        `;
    }
    setTimeout(() => {
        if(overlay) overlay.classList.remove('active');
        enterCinema(roomId, roomObj, true);
    }, 2500);
}

// --- CINEMA & EMBED PLAYER ---
function enterCinema(roomId, room, hostStatus) {
    cleanupCinema();
    currentRoomId = roomId;
    roomData = room;
    isHost = hostStatus;
    
    dbRoomRef = db.ref('rooms/' + roomId);
    dbChatRef = db.ref('rooms/' + roomId + '/chat');
    dbPresenceRef = db.ref('rooms/' + roomId + '/presence/' + myUsername);

    const endOverlay = document.getElementById('end-screen-overlay');
    if(endOverlay) endOverlay.classList.remove('active');

    const badge = document.getElementById('cinema-badge');
    if(badge) badge.textContent = 'LOKET ' + room.loket + ' | ROOM ' + room.room;
    
    const title = document.getElementById('cinema-movie-title');
    if(title) title.textContent = room.videoTitle;
    
    const countInfo = document.getElementById('countdown-room-info');
    if(countInfo) countInfo.innerHTML = 'Loket <strong>' + room.loket + '</strong> • Room <strong>' + room.room + '</strong>';

    const cinemaView = document.getElementById('cinema-view');
    if(cinemaView) cinemaView.classList.add('active');
    
    const loading = document.getElementById('cinema-loading');
    if(loading) loading.style.display = 'flex';
    
    const hostControls = document.getElementById('host-controls');
    if(hostControls) hostControls.style.display = isHost ? 'flex' : 'none';

    updateURL(roomId);

    if(dbPresenceRef) {
        dbPresenceRef.set({
            username: myUsername,
            joinedAt: firebase.database.ServerValue.TIMESTAMP,
            isHost: isHost
        });
        dbPresenceRef.onDisconnect().remove();
    }

    presenceCleanup = setTimeout(() => {
        if (dbPresenceRef) dbPresenceRef.remove();
    }, 86400000);

    setupChat();
    setupPresenceListener();
    dbRoomRef.on('value', handleRoomUpdate);

    if (room.phase === 'waiting') {
        startCountdown();
        // Jangan load embed saat waiting, biar save data
    } else if (room.phase === 'playing') {
        const countdownOverlay = document.getElementById('countdown-overlay');
        if(countdownOverlay) countdownOverlay.style.display = 'none';
        loadEmbedPlayer(room.embedCode);
    }
}

function cleanupCinema() {
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
    
    if (dbRoomRef) { dbRoomRef.off(); dbRoomRef = null; }
    if (dbChatRef) { dbChatRef.off(); dbChatRef = null; }
    if (dbPresenceRef) { dbPresenceRef.remove(); dbPresenceRef = null; }
    
    const cinemaView = document.getElementById('cinema-view');
    if(cinemaView) cinemaView.classList.remove('active');
    
    const countdownOverlay = document.getElementById('countdown-overlay');
    if(countdownOverlay) countdownOverlay.style.display = 'flex';
    
    const loading = document.getElementById('cinema-loading');
    if(loading) loading.style.display = 'none';
    
    const hostControls = document.getElementById('host-controls');
    if(hostControls) hostControls.style.display = 'none';
    
    const endOverlay = document.getElementById('end-screen-overlay');
    if(endOverlay) endOverlay.classList.remove('active');
    
    const chatBox = document.getElementById('chat-messages');
    if(chatBox) chatBox.innerHTML = '';
    
    const usersBar = document.getElementById('online-users-bar');
    if(usersBar) usersBar.innerHTML = '';
    
    // Clear Player
    const playerContainer = document.getElementById('player-container');
    if(playerContainer) playerContainer.innerHTML = '';
}

// --- EMBED PLAYER LOADER ---
function loadEmbedPlayer(embedHtml) {
    const loading = document.getElementById('cinema-loading');
    if(loading) loading.style.display = 'flex';
    
    const container = document.getElementById('player-container');
    if(container) {
        container.innerHTML = embedHtml;
        setTimeout(() => {
             if(loading) loading.style.display = 'none';
        }, 1500); // Fake buffer time
    }
}

// --- HOST CONTROLS ---
function forceStartPlayback() {
    if (!isHost) return;
    dbRoomRef.update({ phase: 'playing' });
    showToast('Memulai film untuk semua...', 'success');
}

function resetRoom() {
    if (!isHost) return;
    const container = document.getElementById('player-container');
    container.innerHTML = ''; // Stop video by removing DOM
    dbRoomRef.update({ phase: 'waiting' });
    location.reload(); // Simple reset
}

// --- COUNTDOWN ---
function startCountdown() {
    const timerEl = document.getElementById('countdown-timer');
    const overlay = document.getElementById('countdown-overlay');
    if(!timerEl || !overlay) return;

    overlay.style.display = 'flex';
    if (countdownInterval) clearInterval(countdownInterval);

    function tick() {
        if (!roomData) return;
        const diff = roomData.scheduleTime - Date.now();
        
        if (diff <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            overlay.style.display = 'none';
            
            if (isHost) {
                dbRoomRef.update({ phase: 'playing' });
            }
            return;
        }
        
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        timerEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    tick();
    countdownInterval = setInterval(tick, 1000);
}

// --- HANDLE ROOM UPDATE (SYNC LOGIC) ---
function handleRoomUpdate(snapshot) {
    const data = snapshot.val();
    if (!data) {
        showToast('Room dihapus', 'error');
        cleanupCinema();
        showPage('home');
        return;
    }

    const prevPhase = roomData ? roomData.phase : null;
    roomData = data;

    // Logic Start Film (Waiting -> Playing)
    if (prevPhase === 'waiting' && data.phase === 'playing') {
        const overlay = document.getElementById('countdown-overlay');
        if(overlay) overlay.style.display = 'none';
        
        // LOAD EMBED
        loadEmbedPlayer(data.embedCode);
        
        if (!isHost) showToast('Host memulai film...', 'success');
    }
    
    // Logic End Film
    if (data.phase === 'ended' && prevPhase !== 'ended') {
        const endOverlay = document.getElementById('end-screen-overlay');
        if(endOverlay) endOverlay.classList.add('active');
        
        const container = document.getElementById('player-container');
        if(container) container.innerHTML = ''; // Stop playback
        
        addChatMessage('system', 'Room berakhir.');
    }
}

// --- JOIN LOGIC ---
function joinRoomById(roomId) {
    if (!db) { showToast('Firebase Error', 'error'); return; }
    pendingJoinRoomId = roomId;

    db.ref('rooms/' + roomId).once('value').then(snap => {
        if (!snap.exists()) {
            showToast('Room tidak ditemukan!', 'error');
            pendingJoinRoomId = null;
            return;
        }
        const room = snap.val();
        if (room.phase === 'ended') {
            showToast('Room sudah selesai.', 'error');
            pendingJoinRoomId = null;
            return;
        }

        let passwordHtml = '';
        if (room.visibility === 'private') {
            passwordHtml = `
                <div class="form-group">
                    <label class="form-label">Password Room</label>
                    <input type="password" id="join-password" class="form-input" placeholder="Password...">
                </div>
            `;
        }

        const modalBody = document.getElementById('join-modal-body');
        if(modalBody) {
            modalBody.innerHTML = `
                <div class="join-room-info">
                    <div class="room-id">LOKET ${room.loket} | ROOM ${room.room}</div>
                    <div class="room-detail" style="font-size:1.1rem; font-weight:bold; margin-top:5px;">${room.videoTitle || 'Unknown'}</div>
                    <div class="room-detail">Status: ${room.visibility === 'private' ? 'PRIVATE' : 'PUBLIC'}</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Nama Anda</label>
                    <input type="text" id="join-username" class="form-input" placeholder="Nama..." value="${myUsername}" maxlength="20">
                </div>
                ${passwordHtml}
            `;
        }
        const modal = document.getElementById('join-modal');
        if(modal) modal.classList.add('active');
    }).catch(err => {
        showToast('Gagal join: ' + err.message, 'error');
        pendingJoinRoomId = null;
    });
}

function confirmJoinRoom() {
    const nameInput = document.getElementById('join-username');
    if (nameInput && nameInput.value.trim()) {
        myUsername = nameInput.value.trim().slice(0, 20);
    }

    if (pendingJoinRoomId) {
        db.ref('rooms/' + pendingJoinRoomId).once('value').then(snap => {
             const room = snap.val();
             if (!room) return;
             
             if (room.visibility === 'private') {
                const passInput = document.getElementById('join-password');
                if (!passInput || passInput.value !== room.password) {
                    showToast('Password salah!', 'error');
                    return;
                }
            }
            
            closeJoinModal();
            enterCinema(pendingJoinRoomId, room, false);
            pendingJoinRoomId = null;
        });
    }
}

// --- UTILS ---
function showPage(page) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.getElementById('cinema-view').classList.remove('active');

    const pageMap = { home:'home-page', loket:'loket-page', create:'create-page' };
    if (pageMap[page]) {
        const el = document.getElementById(pageMap[page]);
        if(el) el.classList.add('active');
    }

    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.page === page);
    });

    currentPage = page;
    window.scrollTo(0, 0);
}

function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || '');
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    toast.innerHTML = '<span>' + icon + '</span><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function updateURL(roomId) {
    if (!roomId) return;
    const url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set('room', roomId);
    window.history.replaceState({}, '', url.toString());
}

function copyRoomUrl() {
    if (!currentRoomId) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showToast('URL disalin!', 'success');
    }).catch(() => {
        showToast('Gagal menyalin', 'error');
    });
}

// Modals
function confirmExit() {
    const modal = document.getElementById('exit-modal');
    if(modal) modal.classList.add('active');
}
function closeExitModal(e) {
    if (!e || e.target.id === 'exit-modal') {
        const modal = document.getElementById('exit-modal');
        if(modal) modal.classList.remove('active');
    }
}
function doExit() {
    closeExitModal();
    cleanupCinema();
    showPage('home');
    const url = new URL(window.location.href.split('?')[0]);
    window.history.replaceState({}, '', url.toString());
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
}

function showRules() {
    document.getElementById('rules-modal').classList.add('active');
}
function closeRules(e) {
    if (!e || e.target.id === 'rules-modal' || e.target.tagName === 'BUTTON') {
        document.getElementById('rules-modal').classList.remove('active');
    }
}
function closeJoinModal(e) {
    if (!e || e.target.id === 'join-modal') {
        document.getElementById('join-modal').classList.remove('active');
    }
}

// --- CHAT ---
function setupChat() {
    const box = document.getElementById('chat-messages');
    if(!box) return;
    box.innerHTML = '';
    addChatMessage('system', 'Selamat datang di Studio.');
    if(isHost) {
        addChatMessage('system', 'Anda adalah HOST.');
    }

    dbChatRef.orderByChild('timestamp').limitToLast(50).on('child_added', snap => {
        const msg = snap.val();
        if (!msg) return;
        addChatMessage('other', msg.text, msg.sender);
    });
}

function addChatMessage(type, text, sender) {
    const box = document.getElementById('chat-messages');
    if(!box) return;
    
    const div = document.createElement('div');
    div.className = 'chat-message ' + type;
    const safeText = (text || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    
    if (type === 'system') {
        div.innerHTML = `<div class="chat-bubble">${safeText}</div>`;
    } else {
        div.innerHTML = `<div class="chat-sender">${sender}</div><div class="chat-bubble">${safeText}</div>`;
    }
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function sendChat() {
    const input = document.getElementById('chat-input');
    const text = input ? input.value.trim() : '';
    if (!text || !dbChatRef) return;
    dbChatRef.push({
        sender: myUsername,
        text: text.slice(0, 500),
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    addChatMessage('own', text, myUsername);
    if(input) input.value = '';
}

function setupPresenceListener() {
    if(!currentRoomId) return;
    db.ref('rooms/' + currentRoomId + '/presence').on('value', snap => {
        const bar = document.getElementById('online-users-bar');
        const usersEl = document.getElementById('chat-users');
        if(!bar || !usersEl) return;
        
        let count = 0;
        let html = '';
        if (snap.exists()) {
            snap.forEach(child => {
                const u = child.val();
                count++;
                const initial = (u.username || '?')[0].toUpperCase();
                const isMe = child.key === myUsername;
                html += '<div class="online-avatar" style="' + (isMe ? 'border-color:var(--accent-gold);color:var(--accent-gold)' : '') + '" title="' + (u.username || '?') + (u.isHost ? ' (Host)' : '') + '">' + initial + '</div>';
            });
        }
        bar.innerHTML = html;
        usersEl.textContent = count + ' online';
    });
}

// --- MAIN INIT ---
window.onload = function() {
    renderMovies();
    renderLoket();
    setupDateTimeMin();
    handleURLRoute();

    window.addEventListener('scroll', () => {
        const nav = document.getElementById('nav-header');
        if(nav) nav.classList.toggle('scrolled', window.scrollY > 20);
    });
};

function handleURLRoute() {
    const params = new URLSearchParams(window.location.search);
    const rid = params.get('room');
    if (rid && rid.length > 5) {
        showToast('Membuka room dari link...');
        joinRoomById(rid);
    }
}

// --- CRON JOBS ---
setInterval(() => {
    if (!db) return;
    const now = Date.now();
    db.ref('rooms').once('value').then(snap => {
        if (!snap.exists()) return;
        const updates = {};
        snap.forEach(child => {
            const room = child.val();
            const key = child.key;
            if (room.phase === 'waiting' && room.scheduleTime && now >= room.scheduleTime) {
                updates[key + '/phase'] = 'playing';
            }
            if (room.phase === 'playing' && room.scheduleTime && (now - room.scheduleTime > 5 * 60 * 60 * 1000)) {
                updates[key + '/phase'] = 'ended';
            }
        });
        if (Object.keys(updates).length > 0) db.ref('rooms').update(updates);
    }).catch(() => {});
}, 5000);

setInterval(() => {
    if (currentPage === 'loket') {
        fetchOccupiedRooms().then(() => renderLoket());
    }
}, 15000);
