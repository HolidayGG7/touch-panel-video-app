const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
           || (window.innerWidth <= 768);
};

const checkMobile = isMobileDevice();
//conf
const CONFIG = {
    mobile: {
        loop: 'videos/mobile_scene1.mp4',
        part2: 'videos/mobile_scene2.mp4',
        part3: 'videos/mobile_scene3.mp4'
    },
    desktop: {
        loop: 'videos/pc_scene1.mp4',
        part2: 'videos/pc_scene2.mp4',
        part3: 'videos/pc_scene3.mp4'
    },
    get videos() {
        return checkMobile ? this.mobile : this.desktop;
    },
    autoStartFullscreen: true,      
    soundEnabled: true,        
    scrollVideoEnabled: true,     
    scrollSensitivity: 1.0          
};



//dom el

const elements = {
    video: document.getElementById('videoPlayer'),
    loader: document.getElementById('loader'),
    loaderText: document.querySelector('.loader-text'),
    loaderSpinner: document.querySelector('.spinner'),
    startAppButton: document.getElementById('startAppButton'),
    scenes: {
        scene1: document.getElementById('scene1'),
        scene2: document.getElementById('scene2'),
        scene3: document.getElementById('scene3')
    },
    buttons: {
        start: document.getElementById('startButton'),
        continue1: document.getElementById('continueButton1')
    },
    scroll: {
        container: document.getElementById('scrollContainer'),
        instructions: document.getElementById('scrollInstructions'),
        progress: document.getElementById('scrollProgress'),
        progressFill: document.querySelector('.progress-fill')
    }
};

//service condition

let currentScene = 1;
let isTransitioning = false;
let scrollVideoActive = false;
let lastScrollTime = 0;

//app control

class AppleOrchardApp {
    constructor() {
        this.init();
    }

    async init() {
        console.log('🍎 Инициализация приложения...');

        //setup
        this.setupVideo();

        this.setupEventListeners();

        // Предзагрузка первого видео
        await this.preloadFirstVideo();

        // Показываем кнопку "Поехали"
        this.showStartButton();

        console.log('✅ Приложение готово!');
    }

    async preloadFirstVideo() {
        const { video } = elements;
        const { loaderText } = elements;

        loaderText.textContent = 'Загрузка видео...';

        return new Promise((resolve) => {
            video.src = CONFIG.videos.loop;
            video.loop = true;

            video.addEventListener('loadeddata', () => {
                console.log('✅ Первое видео предзагружено');
                loaderText.textContent = 'Готово!';
                resolve();
            }, { once: true });

            video.load();
        });
    }

    showStartButton() {
        const { startAppButton, loaderSpinner, loaderText } = elements;

        // Скрываем спиннер и текст
        loaderSpinner.style.display = 'none';
        loaderText.style.display = 'none';

        // Показываем кнопку "Поехали"
        setTimeout(() => {
            startAppButton.classList.remove('hidden');
        }, 300);
    }

    prepareScene1() {
        console.log('🎬 Сцена 1: Готова к запуску');

        currentScene = 1;
        this.showScene(1);

        //najmite 1 dlya starta
        const { video } = elements;
        video.src = CONFIG.videos.loop;
        video.autoplay = true;
        video.loop = true;
        video.load();
    }

    setupVideo() {
        const { video } = elements;
    
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        
        //zvuk v video
        if (!CONFIG.soundEnabled) {
            video.muted = true;
        }
        
        //obrabotka pri okonchanii
        video.addEventListener('ended', () => this.onVideoEnded());
        
        //er
        video.addEventListener('error', (e) => {
            console.error('❌ Ошибка видео:', e);
            alert('Ошибка загрузки видео. Проверьте файлы в папке videos/');
        });
    }

    setupEventListeners() {
        const { buttons, startAppButton } = elements;

        // Кнопка "Поехали" в loader
        startAppButton.addEventListener('click', (e) => this.onStartAppClick(e));

        //start
        buttons.start.addEventListener('click', () => this.onStartClick());

        //part 2, 3
        buttons.continue1.addEventListener('click', () => this.onContinue1Click());
    }

    onStartAppClick(e) {
        console.log('👆 Клик: Поехали!');

        // Создаем ripple эффект
        this.createRipple(e);

        // Запускаем конфетти
        this.createConfetti();

        // Небольшая задержка перед скрытием loader
        setTimeout(() => {
            // Скрываем loader
            this.hideLoader();

            // Подготавливаем первую сцену
            this.prepareScene1();

            // Запускаем loop видео
            const { video } = elements;
            video.play().catch(err => {
                console.log('⚠️ Автоплей заблокирован:', err);
            });
        }, 600);
    }

    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        // Удаляем ripple после анимации
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    createConfetti() {
        const confettiContainer = document.getElementById('confettiContainer');
        const button = elements.startAppButton;
        const buttonRect = button.getBoundingClientRect();
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;

        // Создаем 30 розовых конфетти
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti';

            // Стартовая позиция - центр кнопки
            particle.style.left = buttonCenterX + 'px';
            particle.style.top = buttonCenterY + 'px';

            // Случайный угол разлета (360 градусов)
            const angle = Math.random() * Math.PI * 2; // Радианы
            const distance = 80 + Math.random() * 80; // Расстояние разлета

            // Вычисляем конечную позицию
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            particle.style.setProperty('--endX', endX + 'px');
            particle.style.setProperty('--endY', endY + 'px');

            // Случайная задержка
            particle.style.animationDelay = Math.random() * 0.1 + 's';

            // Случайный размер (маленькие точки)
            const size = 6 + Math.random() * 6;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';

            confettiContainer.appendChild(particle);

            // Удаляем частицу после анимации
            setTimeout(() => {
                particle.remove();
            }, 1200);
        }

        console.log('🎉 Конфетти запущено!');
    }

    //loop
    async startScene1() {
        console.log('🎬 Сцена 1: Loop заставка');

        if (scrollVideoActive) {
            this.disableScrollVideo();
        }

        currentScene = 1;
        this.showScene(1);

        try {
            await this.playVideo(CONFIG.videos.loop, true); // true = loop
        } catch (error) {
            console.log('⚠️ Видео будет запущено после взаимодействия пользователя');
        }
    }

    //vid2
    async startScene2() {
        if (isTransitioning) return;
        isTransitioning = true;
        
        console.log('🎬 Сцена 2: Полет по саду (SCROLL VIDEO)');
        
        currentScene = 2;
        this.showScene(2);
        
        //knopka continue
        elements.buttons.continue1.classList.add('hidden');
        
        //run
        await this.playVideo(CONFIG.videos.part2, false);
        
        if (CONFIG.scrollVideoEnabled) {
            console.log('📜 Включен Scroll Video режим');

            elements.video.pause();
            elements.video.currentTime = 0;
            
            //scroll elementi
            this.enableScrollVideo();
        } else {
            //auto play rejim
            console.log('▶️ Обычный режим воспроизведения');
        }
        
        isTransitioning = false;
    }

    enableScrollVideo() {
        const { video } = elements;
        const { container, instructions, progress, progressFill } = elements.scroll;
        
        scrollVideoActive = true;
        
        //pokazateli scroll
        container.style.display = 'block';
        instructions.classList.remove('hidden');
        progress.classList.add('visible');
        
        container.scrollTop = 0;

        const handleScroll = () => {
            if (!scrollVideoActive) return;
            
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const scrollProgress = Math.min(scrollTop / scrollHeight, 1);
            
            //obnovlyaem vremya so skrollom
            const targetTime = video.duration * scrollProgress;
            video.currentTime = targetTime;
            
            progressFill.style.height = `${scrollProgress * 100}%`;
            
            if (scrollProgress > 0.05) {
                instructions.classList.add('hidden');
            }
            
            //pri doskrole dokonca
            if (scrollProgress >= 0.98) {
                this.onScrollVideoComplete();
            }
            
            lastScrollTime = Date.now();
        };
        
        //obrabotchik s throttling
        let ticking = false;
        container.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        //touch dlya mobile
        container.addEventListener('touchmove', (e) => {
        });
        
        console.log('✅ Scroll Video активирован');
    }
    
    disableScrollVideo() {
        const { container, instructions, progress } = elements.scroll;
        
        scrollVideoActive = false;
        
        container.style.display = 'none';
        instructions.classList.add('hidden');
        progress.classList.remove('visible');
        
        console.log('❌ Scroll Video деактивирован');
    }
    
    onScrollVideoComplete() {
        if (!scrollVideoActive) return;
        
        console.log('✅ Scroll Video завершен');
        
        document.getElementById('scrollInstructions').style.display = "none";
        
        // otklyuchaem
        this.disableScrollVideo();
        
        // knopa prodoljit
        setTimeout(() => {
            elements.buttons.continue1.classList.remove('hidden');
        }, 500);
    }

    async startScene3() {
        if (isTransitioning) return;
        isTransitioning = true;
        
        console.log('🎬 Сцена 3: Спасение листа');
    
        if (scrollVideoActive) {
            this.disableScrollVideo();
        }
        
        currentScene = 3;
        this.showScene(3);

        await this.playVideo(CONFIG.videos.part3, false);
        
        isTransitioning = false;
    }

    async playVideo(src, loop = false) {
        const { video } = elements;
        
        return new Promise((resolve, reject) => {
            video.src = src;
            video.loop = loop;

            video.onloadeddata = async () => {
                try {
                    await video.play();
                    console.log(`Воспроизведение: ${src}`);
                    resolve();
                } catch (error) {
                    console.error('Ошибка воспроизведения:', error);

                    if (error.name === 'NotAllowedError') {
                        alert('Нажмите на экран для запуска видео');
                        
                        // Добавляем обработчик клика для старта
                        const startOnClick = async () => {
                            await video.play();
                            document.removeEventListener('click', startOnClick);
                        };
                        document.addEventListener('click', startOnClick);
                    }
                    
                    reject(error);
                }
            };
            
            video.onerror = () => {
                console.error(`Не удалось загрузить видео: ${src}`);
                reject(new Error('Video load failed'));
            };
        });
    }

    onVideoEnded() {
        console.log('⏹️ Видео закончилось');

        //esli loop to zanovo zapustitsya
        if (currentScene === 1) return;
        
        if (scrollVideoActive) return;
        
        if (currentScene === 2) {
            console.log('👉 Показываем кнопку "Продолжить"');
            elements.buttons.continue1.classList.remove('hidden');
        }
        
        //v konce vozvrashaem zanovo
        if (currentScene === 3) {
            console.log('🔄 Возврат к началу');
            setTimeout(() => {
                this.startScene1();
            }, 1000); //zaderjka pri vozvrate
        }
    }

    async onStartClick() {
        console.log('👆 Клик: Начать путешествие');

        const { video } = elements;
        if (video.paused) {
            try {
                await video.play();
                console.log('▶️ Loop видео запущено');
            } catch (error) {
                console.error('Ошибка запуска loop видео:', error);
            }
        }

        setTimeout(() => {
            this.startScene2();
        }, 100);
    }

    onContinue1Click() {
        console.log('👆 Клик: Продолжить');
        this.startScene3();
    }

    showScene(sceneNumber) {
        const { scenes } = elements;

        Object.values(scenes).forEach(scene => {
            scene.classList.remove('active');
        });

        scenes[`scene${sceneNumber}`].classList.add('active');
    }

    requestFullscreen() {
        const elem = document.documentElement;
 
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.log('⚠️ Fullscreen недоступен:', err);
            });
        } else if (elem.webkitRequestFullscreen) { 
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { 
            elem.msRequestFullscreen();
        }
        
        console.log('🖥️ Запрос fullscreen');
    }

    hideLoader() {
        setTimeout(() => {
            elements.loader.classList.add('hidden');
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM загружен, запуск приложения...');

    window.app = new AppleOrchardApp();
});

// document.addEventListener('fullscreenchange', () => {
//     if (!document.fullscreenElement && CONFIG.autoStartFullscreen) {
//       //nenado udalil
//     }
// });

// document.addEventListener('keydown', (e) => {
//     if (e.key === '1') window.app.startScene1();
//     if (e.key === '2') window.app.startScene2();
//     if (e.key === '3') window.app.startScene3();
//     if (e.key === 'f') window.app.requestFullscreen();
//     if (e.key === 's') {
//         CONFIG.scrollVideoEnabled = !CONFIG.scrollVideoEnabled;
//         console.log(`📜 Scroll Video: ${CONFIG.scrollVideoEnabled ? 'ON' : 'OFF'}`);
//     }
// });

console.log('💡 Горячие клавиши:');
console.log('  1, 2, 3 - переключение сцен');
console.log('  F - fullscreen');
console.log('  S - переключить scroll video (ON/OFF)');
