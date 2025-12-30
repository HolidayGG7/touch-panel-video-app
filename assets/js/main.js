const storyConfig = [
    {
        videoSrc: 'assets/videos/pole.mp4',
        buttonText: 'Как получить здоровый урожай?',
        delay: 500,
        animationIn: 'easy-zoom-in',
        animationOut: 'fade-out',
        overlayText: null
    },
    {
        videoSrc: 'assets/videos/1.mp4',
        buttonText: 'Раскрыть потенциал роста',
        delay: 2000,
        animationIn: null,
        animationOut: null,
        overlayText: null
    },
    {
        videoSrc: 'assets/videos/2.mp4',
        buttonText: 'Как это работает?',
        delay: 2000,
        animationIn: null,
        animationOut: null,
        overlayText: null
    },
    {
        videoSrc: 'assets/videos/3.mp4',
        buttonText: 'Какой результат?',
        delay: 2000,
        animationIn: null,
        animationOut: null,
        overlayText: 'Физиологический эффект - влияние фунгицида на физиологические процессы, протекающие в растении, которое проявляется наряду с их основным защитным и лечебным действием. <br><br>Улучшение азотного питания<br>Смягчение водного стресса<br>Снижение этилена<br>Активация защитных ферментов'
    },
    {
        videoSrc: 'assets/videos/4.mp4',
        buttonText: 'Миравис Нео - мой выбор',
        delay: 2000,
        animationIn: null,
        animationOut: null,
        overlayText: 'Физиологический эффект МИРАВИС® Нео помогает сорту реализовать генетический заложенный потенциал, увличивает урожайность в среднем на 3 ц/га и выход качественного зерна',
        secondText: true
    },
    {
        videoSrc: 'assets/videos/5.mp4',
        last: true,
        buttonText: null,
        delay: null,
        animationIn: null,
        animationOut: 'easy-fade-out',
        overlayText: null
    }
];

class InteractiveCinema {
    constructor(config) {
        this.config = config;
        this.current = 0;
        this.videos = [document.getElementById('v1'), document.getElementById('v2')];
        this.activeIdx = 0;
        this.btn = document.getElementById('action-btn');
        this.textCont = document.getElementById('text-container');
        
        
        // Таймеры для очистки
        this.resetTimer = null;
        this.btnTimer = null;

        this.btn.addEventListener('click', () => this.next());
        
        // Запуск первой сцены
        this.renderScene();
    }

    get currentVideo() { return this.videos[this.activeIdx]; }
    get nextVideo() { return this.videos[1 - this.activeIdx]; }

    renderScene() {
        const scene = this.config[this.current];
        const videoTag = this.currentVideo;

        // 1. Сброс UI
        this.btn.classList.remove('visible');
        this.textCont.classList.remove('show');
        if (this.resetTimer) clearTimeout(this.resetTimer);
        if (this.btnTimer) clearTimeout(this.btnTimer);

        // 2. Установка видео
        videoTag.src = scene.videoSrc;
        videoTag.load();

        const onPlay = () => {
            videoTag.play();
            
            // 3. Анимация видео
            videoTag.className = 'video-layer active';
            if (scene.animationIn) videoTag.classList.add(scene.animationIn);

            // 4. Показ текста
            if (scene.overlayText) {
                this.textCont.innerHTML = scene.overlayText;
                if(scene.secondText){
                    this.textCont.classList.add('second-text');
                }else{
                    this.textCont.classList.remove('second-text');
                }
                this.textCont.classList.add('show');
            }

            // 5. Показ кнопки (если есть)
            if (scene.buttonText) {
                this.btnTimer = setTimeout(() => {
                    this.btn.innerText = scene.buttonText;
                    this.btn.classList.add('visible');
                }, scene.delay || 0);
            }

            // 6. ПРОВЕРКА НА LAST (АВТОРЕСЕТ)
            if (scene.last === true) {
                console.log("Это последняя сцена, запуск таймера возврата...");
                this.resetTimer = setTimeout(() => {
                    this.goToStart();
                }, 5000); // 5 секунд
            }

            videoTag.removeEventListener('canplaythrough', onPlay);
        };

        videoTag.addEventListener('canplaythrough', onPlay);
    }

    next() {
        document.getElementById('audio-click').play()
        this.current = (this.current + 1) % this.config.length;
        this.switchVideoLayer();
    }

    goToStart() {
        console.log("Возврат к началу");
        this.current = 0;
        this.switchVideoLayer();
    }

    switchVideoLayer() {
        const currentTag = this.currentVideo;
        const nextTag = this.nextVideo;
        const nextScene = this.config[this.current];

        // Подготовка следующего видео в фоновом теге
        nextTag.src = nextScene.videoSrc;
        nextTag.classList.remove('active');
        nextTag.load();

        nextTag.oncanplaythrough = () => {
            // Переключаем активный индекс
            this.activeIdx = 1 - this.activeIdx;
            
            // Плавная подмена слоев через классы
            nextTag.classList.add('active');
            currentTag.classList.remove('active');

            // Запускаем отрисовку логики (текст, кнопка, автореreset)
            this.renderScene();
            nextTag.oncanplaythrough = null;
        };
    }
}

new InteractiveCinema(storyConfig);