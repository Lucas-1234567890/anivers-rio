document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       Cursor Customizado
       ========================================================================== */
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Adiciona faíscas no canvas sob o mouse
        if (createMouseSparkle) {
            createMouseSparkle(mouseX, mouseY);
        }
    });

    // Suavização do cursor (Lerp)
    function animateCursor() {
        const xp = 0.15; // Velocidade de acompanhamento do círculo externo
        const dp = 0.3;  // Velocidade de acompanhamento do ponto interno
        
        cursorX += (mouseX - cursorX) * xp;
        cursorY += (mouseY - cursorY) * xp;
        
        dotX += (mouseX - dotX) * dp;
        dotY += (mouseY - dotY) * dp;
        
        if (cursor) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
        }
        if (cursorDot) {
            cursorDot.style.left = dotX + 'px';
            cursorDot.style.top = dotY + 'px';
        }
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Efeito de hover nos elementos clicáveis
    const hoverables = document.querySelectorAll('a, button, .gift-box-inner, .organizer-card');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
        });
    });


    /* ==========================================================================
       Controle de Áudio
       ========================================================================== */
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const iconPlaying = musicToggle.querySelector('.icon-playing');
    const iconMuted = musicToggle.querySelector('.icon-muted');
    let isMuted = false;

    // Define volume inicial suave
    bgMusic.volume = 0.35;

    function toggleMusic() {
        if (isMuted) {
            bgMusic.play().catch(err => console.log("Erro ao dar play na música:", err));
            iconPlaying.classList.remove('hidden');
            iconMuted.classList.add('hidden');
            musicToggle.querySelector('.music-notes').style.display = 'block';
        } else {
            bgMusic.pause();
            iconPlaying.classList.add('hidden');
            iconMuted.classList.remove('hidden');
            musicToggle.querySelector('.music-notes').style.display = 'none';
        }
        isMuted = !isMuted;
    }

    musicToggle.addEventListener('click', toggleMusic);


    /* ==========================================================================
       Loader Inicial com Contagem (0 a 22)
       ========================================================================== */
    const loader = document.getElementById('loader');
    const loaderNumber = document.querySelector('.loader-number');
    const progressCircle = document.querySelector('.progress-circle');
    const loaderMessages = document.querySelectorAll('.loader-msg');
    const btnEntrar = document.getElementById('btn-entrar');
    
    let currentCount = 0;
    const targetCount = 22;
    const duration = 2800; // Tempo total da contagem em ms
    const intervalTime = duration / targetCount;
    
    // Animação de mensagens rotativas
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
        loaderMessages[msgIndex].classList.remove('active');
        msgIndex = (msgIndex + 1) % loaderMessages.length;
        loaderMessages[msgIndex].classList.add('active');
    }, 700);

    // Contagem progressiva
    const counterInterval = setInterval(() => {
        currentCount++;
        loaderNumber.textContent = currentCount;
        
        // Atualiza o círculo de progresso do SVG (283 é o stroke-dasharray para raio 45)
        const offset = 283 - (currentCount / targetCount) * 283;
        progressCircle.style.strokeDashoffset = offset;
        
        if (currentCount >= targetCount) {
            clearInterval(counterInterval);
            clearInterval(msgInterval);
            
            // Ativa o botão de entrada
            setTimeout(() => {
                loaderMessages.forEach(m => m.classList.remove('active'));
                const readyMsg = document.createElement('p');
                readyMsg.className = 'loader-msg active';
                readyMsg.innerHTML = 'Tudo pronto! 💜';
                loaderMessages[0].parentNode.appendChild(readyMsg);
                
                btnEntrar.classList.remove('hidden');
            }, 300);
        }
    }, intervalTime);

    // Ao clicar em Entrar
    btnEntrar.addEventListener('click', () => {
        // Inicia a música
        bgMusic.play().then(() => {
            isMuted = false;
        }).catch(err => {
            console.log("Autoplay bloqueado pelo navegador. A música tocará na primeira interação.", err);
            isMuted = true;
            iconPlaying.classList.add('hidden');
            iconMuted.classList.remove('hidden');
        });

        // Dissolve o loader
        loader.classList.add('fade-out');

        // Ativa animações do Scroll
        setTimeout(() => {
            checkReveal();
        }, 400);

        // Explosão de confetes inicial festiva!
        celebrateInitial();
    });


    /* ==========================================================================
       Canvas de Partículas & Efeito de Rastro do Mouse
       ========================================================================== */
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let mouseSparkles = [];
    const maxParticles = 60;

    // Redimensionar canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Paleta de cores das partículas
    const colors = [
        'rgba(229, 219, 255, 0.65)', // Lilás
        'rgba(255, 222, 235, 0.65)', // Rosa
        'rgba(231, 245, 255, 0.65)', // Azul
        'rgba(255, 249, 219, 0.65)', // Ouro claro
    ];

    // Classe para partículas de fundo flutuantes
    class AmbientParticle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
            this.size = Math.random() * 8 + 4;
            this.speedY = Math.random() * 0.4 + 0.15;
            this.speedX = (Math.random() - 0.5) * 0.25;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            // Tipos de partículas: 0 = círculo, 1 = coração, 2 = estrela/faísca
            this.type = Math.floor(Math.random() * 3);
            this.opacity = Math.random() * 0.5 + 0.2;
            this.angle = Math.random() * Math.PI * 2;
            this.spinSpeed = (Math.random() - 0.5) * 0.01;
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX + Math.sin(this.angle) * 0.15;
            this.angle += this.spinSpeed;

            // Se sair da tela, recria na parte inferior
            if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;

            if (this.type === 0) {
                // Círculo suave
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 1) {
                // Desenhar Coração
                ctx.beginPath();
                const d = this.size;
                ctx.moveTo(0, d / 4);
                ctx.quadraticCurveTo(0, 0, d / 2, 0);
                ctx.quadraticCurveTo(d, 0, d, d / 2);
                ctx.quadraticCurveTo(d, (3 * d) / 4, (3 * d) / 4, d);
                ctx.lineTo(0, d * 1.4);
                ctx.lineTo(-(3 * d) / 4, d);
                ctx.quadraticCurveTo(-d, (3 * d) / 4, -d, d / 2);
                ctx.quadraticCurveTo(-d, 0, -d / 2, 0);
                ctx.quadraticCurveTo(0, 0, 0, d / 4);
                ctx.fill();
            } else {
                // Estrela de 4 pontas
                ctx.beginPath();
                const r = this.size;
                ctx.moveTo(0, -r);
                ctx.quadraticCurveTo(0, 0, r, 0);
                ctx.quadraticCurveTo(0, 0, 0, r);
                ctx.quadraticCurveTo(0, 0, -r, 0);
                ctx.quadraticCurveTo(0, 0, 0, -r);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Classe para faíscas do mouse
    class MouseSparkle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 5 + 3;
            this.speedX = (Math.random() - 0.5) * 1.8;
            this.speedY = (Math.random() - 0.5) * 1.8;
            // Cores mais brilhantes de destaque (dourado e rosa)
            const sparkleColors = ['#ffd43b', '#fcc419', '#faa2c1', '#ffdeeb', '#e5dbff'];
            this.color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
            this.opacity = 1.0;
            this.life = 1.0;
            this.decay = Math.random() * 0.03 + 0.02; // Velocidade de desaparecimento
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= this.decay;
            if (this.size > 0.2) this.size -= 0.08;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            
            // Desenha estrela minimalista de 4 pontas para as faíscas
            ctx.beginPath();
            const r = this.size;
            ctx.translate(this.x, this.y);
            ctx.moveTo(0, -r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.quadraticCurveTo(0, 0, 0, r);
            ctx.quadraticCurveTo(0, 0, -r, 0);
            ctx.quadraticCurveTo(0, 0, 0, -r);
            ctx.fill();
            
            ctx.restore();
        }
    }

    // Inicializar partículas ambientais
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new AmbientParticle());
    }

    // Função para gerar faíscas do cursor
    function createMouseSparkle(x, y) {
        if (mouseSparkles.length < 150) {
            mouseSparkles.push(new MouseSparkle(x, y));
        }
    }

    // Loop de Animação do Canvas
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Atualizar e desenhar partículas de fundo
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Atualizar e desenhar faíscas do mouse
        for (let i = mouseSparkles.length - 1; i >= 0; i--) {
            const s = mouseSparkles[i];
            s.update();
            if (s.opacity <= 0) {
                mouseSparkles.splice(i, 1);
            } else {
                s.draw();
            }
        }

        requestAnimationFrame(animate);
    }
    animate();


    /* ==========================================================================
       Animação do Presente (Clique para Abrir)
       ========================================================================== */
    const giftBox = document.getElementById('gift-box-wrapper');
    const giftImage = document.getElementById('gift-image');
    const giftRevealContent = document.getElementById('gift-reveal-content');
    let isGiftOpened = false;

    giftBox.addEventListener('click', () => {
        if (isGiftOpened) return; // Só abre uma vez
        isGiftOpened = true;

        // Esconde a dica de clique do cursor
        const clickHint = giftBox.querySelector('.click-hint');
        if (clickHint) clickHint.classList.add('hidden');

        // Animação de tremor forte e escala antes de abrir
        giftImage.style.transform = 'scale(1.2) rotate(5deg)';
        
        setTimeout(() => {
            // Altera para a imagem de presente aberto
            giftImage.src = 'gift_opened.png';
            giftImage.style.transform = 'scale(1.0) rotate(0deg)';
            
            // Explosão mágica de confetes
            celebrateGift();

            // Mostra o conteúdo surpresa
            giftRevealContent.classList.remove('hidden');
            setTimeout(() => {
                giftRevealContent.classList.add('active');
            }, 100);

        }, 500);
    });


    /* ==========================================================================
       Configurações do Confete (Biblioteca Canvas-Confetti)
       ========================================================================== */
    
    // Confete inicial (entrada do site)
    function celebrateInitial() {
        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 9999 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            // Confetes coloridos pastel
            confetti(Object.assign({}, defaults, { 
                particleCount, 
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#e5dbff', '#ffdeeb', '#a5d8ff', '#ffd43b']
            }));
            confetti(Object.assign({}, defaults, { 
                particleCount, 
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#e5dbff', '#ffdeeb', '#a5d8ff', '#ffd43b']
            }));
        }, 250);
    }

    // Confete dourado e lilás ao abrir o presente
    function celebrateGift() {
        const count = 200;
        const defaults = {
            origin: { y: 0.6 },
            zIndex: 9999
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
            colors: ['#ffd43b', '#fcc419', '#e5dbff'] // Ouro e lilás
        });
        fire(0.2, {
            spread: 60,
            colors: ['#ffd43b', '#ffdeeb']
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
            colors: ['#e5dbff', '#a5d8ff', '#ffdeeb']
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
            colors: ['#ffd43b', '#e64980']
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
            colors: ['#fcc419', '#7048e8']
        });
    }


    /* ==========================================================================
       Animações ao Fazer Scroll (IntersectionObserver)
       ========================================================================== */
    const reveals = document.querySelectorAll('.reveal');

    function checkReveal() {
        const triggerBottom = window.innerHeight * 0.85;

        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;

            if (revealTop < triggerBottom) {
                reveal.classList.add('active');
            }
        });
    }

    // Cria o observer
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Uma vez animado, não precisa observar mais
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px" // Dispara ligeiramente antes de entrar completo
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // Fallback no scroll para garantir
    window.addEventListener('scroll', checkReveal);
});
