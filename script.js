// Elementos do DOM
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const progressFill = document.querySelector('.progress-fill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const soundWaves = document.querySelector('.sound-waves');

// YouTube Player
let youtubePlayer = null;
let youtubePlayerReady = false;

// Estado do player
let isPlaying = false;
let isDragging = false;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar evento de carregamento da página
    setTimeout(addLoadingEffect, 1000);
    
    // Configurar player de música
    setupMusicPlayer();
    
    // Adicionar animações aos corações
    animateHearts();
    
    // Configurar interações
    setupInteractions();
    
    // Inicializar YouTube Player
    initYouTubePlayer();
});

// Função chamada quando a API do YouTube está pronta
function onYouTubeIframeAPIReady() {
    youtubePlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: 'a7fzkqLozwA', // I Like Me Better - Lauv
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1,
            'playlist': 'a7fzkqLozwA'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    youtubePlayerReady = true;
    console.log('YouTube player pronto!');
    // Definir duração da música
    durationEl.textContent = "3:38";
    useSimulation = false; // Usar YouTube em vez de simulação
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && youtubePlayerReady) {
        isPlaying = true;
        updatePlayPauseButton();
        updateSoundWaves();
        startProgressTracking();
    } else if (event.data == YT.PlayerState.PAUSED) {
        isPlaying = false;
        updatePlayPauseButton();
        updateSoundWaves();
        stopProgressTracking();
    }
}

// Controle de progresso do YouTube
let progressInterval = null;

function startProgressTracking() {
    if (progressInterval) clearInterval(progressInterval);
    
    progressInterval = setInterval(() => {
        if (youtubePlayer && youtubePlayerReady && isPlaying) {
            const currentTime = youtubePlayer.getCurrentTime();
            const duration = youtubePlayer.getDuration();
            
            if (duration > 0) {
                updateTimeDisplay(currentTime, duration);
                updateProgressBar(currentTime / duration);
            }
        }
    }, 1000);
}

function stopProgressTracking() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function initYouTubePlayer() {
    // A API será carregada automaticamente
    console.log('Inicializando YouTube Player...');
}

// Configurar player de música
function setupMusicPlayer() {
    // Evento de clique no botão play/pause
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Eventos do audio
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayPauseButton();
        updateSoundWaves();
    });
    
    // Eventos de erro
    audioPlayer.addEventListener('error', () => {
        console.log('Erro no áudio, usando simulação');
        // Se não conseguir carregar áudio real, usar simulação
        setupSimulatedPlayer();
    });
    
    // Clique na barra de progresso
    document.querySelector('.progress-bar').addEventListener('click', seekAudio);
    
    // Configurar simulação como fallback
    setupSimulatedPlayer();
}

// Variáveis para simulação
let simulationInterval = null;
let useSimulation = true;

// Configurar player simulado
function setupSimulatedPlayer() {
    useSimulation = true;
    // Definir duração fixa para "I Like Me Better"
    durationEl.textContent = "3:38";
    currentTimeEl.textContent = "0:00";
}

// Alternar entre play e pause
function togglePlayPause() {
    if (youtubePlayerReady && youtubePlayer) {
        // Usar YouTube Player
        if (isPlaying) {
            youtubePlayer.pauseVideo();
        } else {
            youtubePlayer.playVideo();
        }
    } else {
        // Fallback para simulação
        if (isPlaying) {
            if (simulationInterval) {
                clearInterval(simulationInterval);
                simulationInterval = null;
            }
            isPlaying = false;
        } else {
            startSimulatedPlayback();
            isPlaying = true;
        }
        
        updatePlayPauseButton();
        updateSoundWaves();
    }
}

// Simular reprodução de áudio com progresso realista
function startSimulatedPlayback() {
    let currentTime = 0;
    const duration = 218; // 3:38 em segundos
    
    // Limpar intervalo anterior se existir
    if (simulationInterval) {
        clearInterval(simulationInterval);
    }
    
    simulationInterval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(simulationInterval);
            simulationInterval = null;
            return;
        }
        
        currentTime += 1;
        updateTimeDisplay(currentTime, duration);
        updateProgressBar(currentTime / duration);
        
        // Reiniciar quando chegar ao fim (loop)
        if (currentTime >= duration) {
            currentTime = 0;
        }
    }, 1000);
}

// Atualizar botão play/pause
function updatePlayPauseButton() {
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
    } else {
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
    }
}

// Atualizar animação das ondas sonoras
function updateSoundWaves() {
    if (isPlaying) {
        soundWaves.classList.add('playing');
        soundWaves.classList.remove('paused');
    } else {
        soundWaves.classList.add('paused');
        soundWaves.classList.remove('playing');
    }
}

// Atualizar duração
function updateDuration() {
    const duration = audioPlayer.duration;
    if (!isNaN(duration)) {
        durationEl.textContent = formatTime(duration);
    }
}

// Atualizar progresso
function updateProgress() {
    if (!isDragging) {
        const progress = audioPlayer.currentTime / audioPlayer.duration;
        updateProgressBar(progress);
        updateTimeDisplay(audioPlayer.currentTime, audioPlayer.duration);
    }
}

// Atualizar barra de progresso
function updateProgressBar(progress) {
    progressFill.style.width = (progress * 100) + '%';
}

// Atualizar display de tempo
function updateTimeDisplay(current, duration) {
    currentTimeEl.textContent = formatTime(current);
    if (duration) {
        durationEl.textContent = formatTime(duration);
    }
}

// Buscar posição no áudio
function seekAudio(e) {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    
    if (youtubePlayerReady && youtubePlayer) {
        // YouTube Player
        const duration = youtubePlayer.getDuration();
        const newTime = percent * duration;
        youtubePlayer.seekTo(newTime, true);
    } else {
        // Simulação
        const duration = 218; // 3:38 em segundos
        const newTime = percent * duration;
        updateTimeDisplay(newTime, duration);
        updateProgressBar(percent);
    }
}

// Formatar tempo
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// Tentar reproduzir áudio real (fallback para simulação)
function tryRealAudio() {
    audioPlayer.play().then(() => {
        useSimulation = false;
        isPlaying = true;
        updatePlayPauseButton();
        updateSoundWaves();
    }).catch(() => {
        // Usar simulação se áudio real falhar
        useSimulation = true;
        console.log('Usando player simulado');
    });
}

// Função para mostrar surpresa
function showSurprise() {
    const surpriseElement = document.getElementById('surprise-message');
    surpriseElement.classList.remove('surprise-hidden');
    surpriseElement.classList.add('surprise-visible');
    
    // Adicionar confete ou sparkles
    createSparkles();
    
    // Esconder botão de surpresa
    document.querySelector('.surprise-btn').style.display = 'none';
}

// Criar efeito de tubarões caindo
function createSparkles() {
    const sharkCount = 15;
    const container = document.body;
    
    // Array de emojis de tubarão e relacionados
    const sharkEmojis = ['🦈', '🦈', '🦈', '🐟', '🌊'];
    
    for (let i = 0; i < sharkCount; i++) {
        const shark = document.createElement('div');
        // Escolher emoji aleatório do array
        shark.innerHTML = sharkEmojis[Math.floor(Math.random() * sharkEmojis.length)];
        shark.style.position = 'fixed';
        shark.style.left = Math.random() * 100 + '%';
        shark.style.top = Math.random() * 100 + '%';
        shark.style.fontSize = Math.random() * 25 + 20 + 'px';
        shark.style.zIndex = '1000';
        shark.style.pointerEvents = 'none';
        shark.style.animation = 'shark-swim 4s ease-out forwards';
        
        container.appendChild(shark);
        
        // Remover tubarão após animação
        setTimeout(() => {
            if (shark.parentNode) {
                shark.parentNode.removeChild(shark);
            }
        }, 4000);
    }
}

// Adicionar CSS para animação dos tubarões
const sparkleCSS = `
@keyframes shark-swim {
    0% {
        opacity: 1;
        transform: translateY(-20px) rotate(0deg) translateX(0px);
    }
    25% {
        transform: translateY(25vh) rotate(5deg) translateX(10px);
    }
    50% {
        transform: translateY(50vh) rotate(-5deg) translateX(-10px);
    }
    75% {
        transform: translateY(75vh) rotate(3deg) translateX(15px);
    }
    100% {
        opacity: 0;
        transform: translateY(100vh) rotate(0deg) translateX(0px);
    }
}
`;

// Adicionar CSS dinamicamente
const styleSheet = document.createElement('style');
styleSheet.textContent = sparkleCSS;
document.head.appendChild(styleSheet);

// Animar corações de fundo
function animateHearts() {
    const hearts = document.querySelectorAll('.heart');
    
    hearts.forEach((heart, index) => {
        // Adicionar movimento aleatório aos corações
        setInterval(() => {
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            
            heart.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${Math.random() * 10 - 5}deg)`;
        }, 3000 + index * 500);
    });
}

// Configurar interações
function setupInteractions() {
    // Efeito de hover na foto polaroid
    const polaroid = document.querySelector('.polaroid');
    if (polaroid) {
        polaroid.addEventListener('mouseenter', () => {
            polaroid.style.transform = 'rotate(0deg) scale(1.05)';
        });
        
        polaroid.addEventListener('mouseleave', () => {
            polaroid.style.transform = 'rotate(-2deg) scale(1)';
        });
    }
    
    // Efeito de clique nos corações
    document.addEventListener('click', function(e) {
        if (Math.random() < 0.3) { // 30% de chance
            createClickHeart(e.clientX, e.clientY);
        }
    });
}

// Criar coração no clique
function createClickHeart(x, y) {
    const heart = document.createElement('div');
    // Array de corações azuis para variar
    const blueHearts = ['💙', '🤍', '💎'];
    heart.innerHTML = blueHearts[Math.floor(Math.random() * blueHearts.length)];
    heart.style.position = 'fixed';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.fontSize = '20px';
    heart.style.zIndex = '1000';
    heart.style.pointerEvents = 'none';
    heart.style.animation = 'heart-float 2s ease-out forwards';
    
    document.body.appendChild(heart);
    
    // Remover após animação
    setTimeout(() => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
        }
    }, 2000);
}

// Adicionar CSS para animação do coração de clique
const heartClickCSS = `
@keyframes heart-float {
    0% {
        opacity: 1;
        transform: translateY(0px) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateY(-50px) scale(0.5);
    }
}
`;

// Adicionar mais CSS dinamicamente
const heartStyleSheet = document.createElement('style');
heartStyleSheet.textContent = heartClickCSS;
document.head.appendChild(heartStyleSheet);

// Efeito de carregamento
function addLoadingEffect() {
    const elements = document.querySelectorAll('.main-content > *');
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease-out';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0px)';
        }, index * 200);
    });
}

// Detectar se é dispositivo móvel
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Ajustar para dispositivos móveis
if (isMobile()) {
    // Ajustes específicos para mobile
    document.addEventListener('touchstart', function() {
        // Permitir reprodução de áudio em dispositivos móveis
        if (audioPlayer.paused && !isPlaying) {
            // Preparar áudio para reprodução
            audioPlayer.load();
        }
    }, { once: true });
}

// Prevenir zoom no mobile ao fazer double tap
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (this.lastTouchEnd && now - this.lastTouchEnd < 300) {
        event.preventDefault();
    }
    this.lastTouchEnd = now;
}, false); 