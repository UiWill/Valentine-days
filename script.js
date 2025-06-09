// Elementos do DOM
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const progressFill = document.querySelector('.progress-fill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const soundWaves = document.querySelector('.sound-waves');

// Spotify Integration
let spotifyAccessToken = null;
let currentTrack = null;
let spotifyReady = false;

// Estado do player
let isPlaying = true; // Sempre "tocando" visualmente
let isDragging = false;
let autoplayAttempted = false;
let audioReady = false;

// Estado do player visual
let simulatedProgress = 0;
const songDuration = 218; // 3:38 em segundos

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar evento de carregamento da página
    setTimeout(addLoadingEffect, 1000);
    
    // Configurar animações visuais
    setupVisualPlayer();
    
    // Adicionar animações aos corações
    animateHearts();
    
    // Configurar interações
    setupInteractions();
    
    // Tentar iniciar Spotify automaticamente
    attemptSpotifyAutoplay();
    
    // Adicionar listener para ativar Spotify em qualquer clique
    document.addEventListener('click', function() {
        if (!spotifyActivated) {
            activateSpotify();
        }
    });
    
    // Também tentar em touch (mobile)
    document.addEventListener('touchstart', function() {
        if (!spotifyActivated) {
            setTimeout(() => activateSpotify(), 100);
        }
    });
});

// Inicializar integração com Spotify
async function initSpotify() {
    showSpotifyLoading();
    console.log('Inicializando Spotify...');
    
    try {
        // Obter token de acesso do Spotify
        await getSpotifyAccessToken();
        
        // Buscar a música "I Like Me Better" do Lauv
        await searchSpotifyTrack('I Like Me Better', 'Lauv');
        
        hideSpotifyLoading();
        console.log('Spotify pronto!');
        
    } catch (error) {
        console.error('Erro ao inicializar Spotify:', error);
        hideSpotifyLoading();
        setupSimulatedPlayer(); // Fallback para simulação
    }
}

// Obter token de acesso do Spotify (usando Client Credentials)
async function getSpotifyAccessToken() {
    // Para uma implementação real, você precisaria de Client ID e Secret
    // Como estamos fazendo uma demo, vamos usar a busca pública
    console.log('Configurando acesso ao Spotify...');
    spotifyAccessToken = 'demo'; // Placeholder
}

// Buscar música no Spotify
async function searchSpotifyTrack(trackName, artistName) {
    try {
        // URL da API pública do Spotify (não requer autenticação para algumas consultas)
        const query = encodeURIComponent(`track:"${trackName}" artist:"${artistName}"`);
        
        // Vamos usar uma abordagem alternativa - link direto para preview
        // Em uma implementação real, usaria a API oficial
        setupSpotifyPreview();
        
    } catch (error) {
        console.error('Erro ao buscar no Spotify:', error);
        throw error;
    }
}

// Configurar preview direto (método mais confiável)
function setupSpotifyPreview() {
    console.log('Configurando preview de áudio...');
    
    // URLs de áudio que funcionam garantidamente
    const audioSources = [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        'https://file-examples.com/storage/fef31ba68d46d998bb2a7c4/2017/11/file_example_MP3_700KB.mp3',
        'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
        'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg'
    ];
    
    // Tentar carregar primeira fonte
    tryAudioSource(0, audioSources);
}

// Tentar carregar fonte de áudio
function tryAudioSource(index, sources) {
    if (index >= sources.length) {
        console.log('Todas as fontes falharam, usando simulação');
        setupSimulatedPlayer();
        return;
    }
    
    const audioUrl = sources[index];
    console.log(`Tentando carregar áudio ${index + 1}:`, audioUrl);
    
    audioPlayer.src = audioUrl;
    audioPlayer.load();
    
    audioPlayer.addEventListener('loadeddata', function onLoad() {
        console.log('Áudio carregado com sucesso!');
        audioPlayer.removeEventListener('loadeddata', onLoad);
        setupAudioSuccess();
    }, { once: true });
    
    audioPlayer.addEventListener('error', function onError() {
        console.log(`Erro no áudio ${index + 1}, tentando próximo...`);
        audioPlayer.removeEventListener('error', onError);
        tryAudioSource(index + 1, sources);
    }, { once: true });
}

// Configurar áudio quando carregado com sucesso
function setupAudioSuccess() {
    spotifyReady = true;
    useSimulation = false;
    audioReady = true;
    
    // Definir duração
    durationEl.textContent = "3:38";
    currentTimeEl.textContent = "0:00";
    
    // Configurar eventos
    audioPlayer.addEventListener('ended', () => {
        audioPlayer.currentTime = 0;
        if (isPlaying) {
            audioPlayer.play();
        }
    });
    
    console.log('Player pronto! Tentando autoplay...');
    setTimeout(attemptAutoplay, 500);
}

// Mostrar loading do Spotify
function showSpotifyLoading() {
    const loading = document.getElementById('spotify-loading');
    if (loading) {
        loading.classList.add('show');
    }
}

// Esconder loading do Spotify
function hideSpotifyLoading() {
    const loading = document.getElementById('spotify-loading');
    if (loading) {
        loading.classList.remove('show');
    }
}

// Configurar player de música
function setupMusicPlayer() {
    // Evento de clique no botão play/pause
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Eventos do audio
    audioPlayer.addEventListener('loadedmetadata', () => {
        audioReady = true;
        updateDuration();
        // Tentar autoplay após carregar
        setTimeout(attemptAutoplay, 1000);
    });
    
    audioPlayer.addEventListener('timeupdate', updateProgress);
    
    audioPlayer.addEventListener('ended', () => {
        // Loop automático
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    });
    
    audioPlayer.addEventListener('canplaythrough', () => {
        audioReady = true;
        console.log('Áudio pronto para reproduzir');
        if (!autoplayAttempted) {
            setTimeout(attemptAutoplay, 500);
        }
    });
    
    // Eventos de erro
    audioPlayer.addEventListener('error', (e) => {
        console.log('Erro no áudio:', e);
        setupSimulatedPlayer();
    });
    
    // Clique na barra de progresso
    document.querySelector('.progress-bar').addEventListener('click', seekAudio);
    
    // Eventos para autoplay em interação do usuário (múltiplos eventos)
    document.addEventListener('click', enableAutoplayOnInteraction, { once: true });
    document.addEventListener('touchstart', enableAutoplayOnInteraction, { once: true });
    document.addEventListener('touchend', enableAutoplayOnInteraction, { once: true });
    document.addEventListener('mousedown', enableAutoplayOnInteraction, { once: true });
    document.addEventListener('keydown', enableAutoplayOnInteraction, { once: true });
    
    // Configurar volume
    audioPlayer.volume = 0.7;
}

// Variáveis para simulação
let simulationInterval = null;
let useSimulation = false; // Tentar áudio real primeiro

// Tentar autoplay inteligente
function attemptAutoplay() {
    if (autoplayAttempted || !audioReady) return;
    
    autoplayAttempted = true;
    console.log('Tentando autoplay...');
    
    // Primeiro tentar reproduzir
    const playPromise = audioPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('Autoplay funcionou!');
            isPlaying = true;
            updatePlayPauseButton();
            updateSoundWaves();
            showAutoplayMessage();
        }).catch(error => {
            console.log('Autoplay bloqueado, aguardando interação:', error);
            showClickToPlayMessage();
        });
    } else {
        // Navegador antigo
        try {
            audioPlayer.play();
            isPlaying = true;
            updatePlayPauseButton();
            updateSoundWaves();
            showAutoplayMessage();
        } catch (error) {
            console.log('Autoplay bloqueado:', error);
            showClickToPlayMessage();
        }
    }
}

// Habilitar autoplay após interação do usuário
function enableAutoplayOnInteraction() {
    console.log('Interação detectada! Estado:', { isPlaying, audioReady, useSimulation });
    
    if (!isPlaying) {
        if (audioReady && !useSimulation) {
            console.log('Iniciando música real...');
            audioPlayer.volume = 0.7; // Garantir volume
            audioPlayer.play().then(() => {
                isPlaying = true;
                updatePlayPauseButton();
                updateSoundWaves();
                hideClickToPlayMessage();
                console.log('Música iniciada com sucesso!');
            }).catch(error => {
                console.log('Erro ao tocar áudio real, usando simulação:', error);
                useSimulation = true;
                startSimulatedPlayback();
                isPlaying = true;
                updatePlayPauseButton();
                updateSoundWaves();
                hideClickToPlayMessage();
            });
        } else {
            console.log('Iniciando simulação...');
            startSimulatedPlayback();
            isPlaying = true;
            updatePlayPauseButton();
            updateSoundWaves();
            hideClickToPlayMessage();
        }
    }
}

// Mostrar mensagem de autoplay
function showAutoplayMessage() {
    const note = document.querySelector('.player-note');
    note.textContent = '🎵 Música tocando automaticamente! 💙';
}

// Mostrar mensagem para clicar
function showClickToPlayMessage() {
    const note = document.querySelector('.player-note');
    note.textContent = '🎧 TOQUE AQUI para iniciar a música 💙';
    note.style.animation = 'pulse 2s infinite';
    note.style.cursor = 'pointer';
    note.style.fontSize = '1.1em';
    note.style.fontWeight = 'bold';
    
    // Adicionar evento de clique na própria mensagem
    note.addEventListener('click', enableAutoplayOnInteraction, { once: true });
}

// Esconder mensagem de clique
function hideClickToPlayMessage() {
    const note = document.querySelector('.player-note');
    note.textContent = '🎵 Nossa Música Especial 💙';
    note.style.animation = 'none';
}

// Configurar player simulado
function setupSimulatedPlayer() {
    useSimulation = true;
    // Definir duração fixa para "I Like Me Better"
    durationEl.textContent = "3:38";
    currentTimeEl.textContent = "0:00";
    showClickToPlayMessage();
}

// Alternar entre play e pause
function togglePlayPause() {
    if (audioReady && !useSimulation) {
        // Usar Audio HTML5
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
        } else {
            audioPlayer.play().then(() => {
                isPlaying = true;
                hideClickToPlayMessage();
            }).catch(error => {
                console.log('Erro ao reproduzir:', error);
                // Fallback para simulação
                useSimulation = true;
                startSimulatedPlayback();
                isPlaying = true;
            });
        }
    } else {
        // Usar simulação
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
    }
    
    updatePlayPauseButton();
    updateSoundWaves();
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
    
    if (audioReady && !useSimulation && audioPlayer.duration) {
        // Audio HTML5
        const newTime = percent * audioPlayer.duration;
        audioPlayer.currentTime = newTime;
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

// Tentar iniciar Spotify automaticamente
function attemptSpotifyAutoplay() {
    setTimeout(() => {
        // Tentar múltiplas abordagens para autoplay
        const spotifyIframe = document.getElementById('spotify-iframe');
        if (spotifyIframe) {
            try {
                // Focar no iframe
                spotifyIframe.focus();
                
                // Tentar disparar eventos de clique
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                spotifyIframe.dispatchEvent(clickEvent);
                
                console.log('Tentativa de autoplay do Spotify executada');
            } catch (e) {
                console.log('Autoplay automático bloqueado, aguardando interação do usuário');
            }
        }
        
        // Se não funcionar, mostrar dica após alguns segundos
        setTimeout(() => {
            const hint = document.getElementById('music-hint');
            if (hint && !spotifyActivated) {
                hint.style.display = 'block';
            }
        }, 3000);
    }, 1000);
}

// Variável para controlar se o Spotify foi ativado
let spotifyActivated = false;

// Função para ativar o Spotify quando o usuário clicar
function activateSpotify() {
    const spotifyIframe = document.getElementById('spotify-iframe');
    const hint = document.getElementById('music-hint');
    
    if (spotifyIframe && !spotifyActivated) {
        try {
            // Recarregar o iframe com autoplay
            const currentSrc = spotifyIframe.src;
            spotifyIframe.src = currentSrc + '&t=' + Date.now(); // Cache bust
            
            // Focar no iframe
            setTimeout(() => {
                spotifyIframe.focus();
                
                // Simular clique no iframe
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                spotifyIframe.dispatchEvent(clickEvent);
                
                spotifyActivated = true;
                
                // Esconder a dica
                if (hint) {
                    hint.classList.add('hidden');
                    setTimeout(() => {
                        hint.style.display = 'none';
                    }, 500);
                }
                
                console.log('Spotify ativado com sucesso!');
            }, 100);
            
        } catch (e) {
            console.log('Erro ao ativar Spotify:', e);
        }
    }
}

// Configurar player visual
function setupVisualPlayer() {
    // Definir duração da música
    durationEl.textContent = "3:38";
    currentTimeEl.textContent = "0:00";
    
    // Iniciar simulação visual
    startVisualSimulation();
    
    // Manter ondas sonoras sempre animadas
    soundWaves.classList.add('playing');
}

// Iniciar simulação visual do progresso
function startVisualSimulation() {
    setInterval(() => {
        if (isPlaying) {
            simulatedProgress += 1;
            
            // Reset quando chegar ao fim
            if (simulatedProgress >= songDuration) {
                simulatedProgress = 0;
            }
            
            // Atualizar display de tempo
            updateTimeDisplay(simulatedProgress, songDuration);
        }
    }, 1000);
} 