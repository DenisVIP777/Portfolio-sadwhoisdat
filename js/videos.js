class VideoPlayer {
    constructor(selector, options) {
        let defaultOptions = {
            isMuted: () => {},
            isEnded: () => {},
            isPlayed: () => {},
            isPaused: () => {},
            initialVolume: 1,
            videoList: [],
            activeTrack: 0,
        };

        this.selector = selector;
        this.options = Object.assign(defaultOptions, options);
        this.video = document.querySelector(this.selector);
        this.parent = null;
        this.elements = {};

        this.draggingTimeline = false;
        this.draggingVolume = false;
        this.playing = false;
        this.muted = false;

        this.volumePanelWidth = 0;
        this.volumeHandleWidth = 0;
        this.maxHandleDistance = 0;
        this.timelineRect = 0;
        this.timelineWidth = 0;

        this.previousVolume = 0.5;

        this.check();
        this.init();
        this.events();
        this.standardEvents();
    }

    check() {
        if (!this.video) {
            console.error('Элемента с таким селектором не существует!');
            return;
        }

        // if (!this.video.getAttribute('src')) {
        //     console.error('Не заполнен атрибут src!');
        //     return;
        // }
    }

    calculateSizes() {
        this.volumePanelWidth = this.elements.volumePanel.offsetWidth;
        this.volumeHandleWidth = this.elements.volumeHandle.offsetWidth;
        this.maxHandleDistance = this.volumePanelWidth - this.volumeHandleWidth;
        this.timelineRect = this.elements.timeline.getBoundingClientRect();
        this.timelineWidth = this.timelineRect.width;

        // Обновление положения timelineHandle
        const progressWidthTwo = this.elements.timelineProgress.offsetWidth;
        const translateX = (progressWidthTwo) + "px";
        this.elements.timelineHandle.style.transform = 'translateX(' + translateX + ')';
    }

    formatTime = (time, format = "colon") => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);

        if (format === "dot") {
            return minutes + ' мин. ' + seconds + ' сек.';
        }

        return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    setAria(el, attr, val) {
        el.setAttribute(attr, val);
    }

    findElements() {
        const parent = this.video.closest('.video-player');
        this.parent = parent;

        this.elements = {
            timeline: parent.querySelector('.timeline'),
            timelineProgress: parent.querySelector('.timeline__progress'),
            timelineHandle: parent.querySelector('.timeline__handle'),

            volumePanel: parent.querySelector('.video-player-volume-panel'),
            volumeHandle: parent.querySelector('.video-player-volume-panel__handle'),
            volumeBtn: parent.querySelector('.video-player__volume'),
            volumeIndicator: parent.querySelector('.video-player__volume-indicator'),

            timeDisplay: parent.querySelector('.video-player__time'),
            timeCurrent: parent.querySelector('.video-player__current-time'),
            timeDuration: parent.querySelector('.video-player__duration'),

            playButton: parent.querySelector('.video-player__play'),
            fullscreenButton: parent.querySelector('.video-player__fullscreen'),

            prevButton: parent.querySelector('.video-player__prev'),
            nextButton: parent.querySelector('.video-player__next'),

            playButtonIcon: parent.querySelector('.video-player-btn__play-icon'),
            volumeButtnIcon: parent.querySelector('.video-player-btn__volume-icon'),

            //Video info
            artwork: parent.querySelector('.video-artwork'),
            videoName: parent.querySelector('.video-name'),
            videoDescription: parent.querySelector('.video-description'),

            //Video panel info
            panelArtwork: document.querySelector('.video-content__image-work'),
            panelVideoName: document.querySelector('.video-content__name-work'),
            panelVideoDescription: document.querySelector('.info-work__text'),
            panelProjectLink: document.querySelector('.video-content__button-open-project'),
            panelDetailedDescription: document.querySelector('.video-content__text'),
            panelRoles: document.querySelector('.video-content__list-roles'),
            panelTask: document.querySelector('.video-content__task'),
            panelSolution: document.querySelector('.video-content__solution'),
            panelResult: document.querySelector('.video-content__result'),
        };
    }

    loadTrack() {
        this.loadVideo();

        this.elements.prevButton.addEventListener('click', function() {
            this.prevTrack();
        }.bind(this));

        this.elements.nextButton.addEventListener('click', function() {
            this.nextTrack();
        }.bind(this));
    }

    loadVideo() {
        this.video.src = this.options.videoList[this.options.activeTrack].path;

        //Video info
        this.elements.artwork.src = this.options.videoList[this.options.activeTrack].artvideo;
        this.elements.videoName.textContent = this.options.videoList[this.options.activeTrack].name;
        this.elements.videoDescription.textContent = this.options.videoList[this.options.activeTrack].desc;

        //Video panel info
        this.elements.panelArtwork.src = this.options.videoList[this.options.activeTrack].artvideo;
        this.elements.panelVideoName.textContent = this.options.videoList[this.options.activeTrack].name;
        this.elements.panelVideoDescription.textContent = this.options.videoList[this.options.activeTrack].desc;

        if (this.elements.panelProjectLink) {
            this.elements.panelProjectLink.href = this.options.videoList[this.options.activeTrack].linkProject;
        }
        this.elements.panelDetailedDescription.innerHTML = this.options.videoList[this.options.activeTrack].detailedDescription;
        //roles
        const roles = this.options.videoList[this.options.activeTrack].roles;
        this.elements.panelRoles.innerHTML = "";
        roles.forEach(element => {
            const rolesItem = document.createElement("li");
            rolesItem.classList.add('list-roles__item');
            rolesItem.textContent = element;
            this.elements.panelRoles.append(rolesItem);
        });
        this.elements.panelTask.innerHTML = this.options.videoList[this.options.activeTrack].task;
		this.elements.panelSolution.innerHTML = this.options.videoList[this.options.activeTrack].solution;
		this.elements.panelResult.innerHTML = this.options.videoList[this.options.activeTrack].result;

        this.video.addEventListener("loadedmetadata", function(event) {
            const currentTime = this.video.currentTime;
            const duration = this.video.duration;
            const progressWidth = (currentTime / duration) * 100 + "%";
            this.elements.timelineProgress.style.width = progressWidth;
            this.elements.timelineHandle.style.transform = 'translateX(' + progressWidth + ')';
            this.updateTimelineAria();
        }.bind(this));
    }

    prevTrack() {
        this.options.activeTrack = (this.options.activeTrack - 1 + this.options.videoList.length) % this.options.videoList.length;
        this.loadVideo();

        this.video.addEventListener("loadedmetadata", function() {
            if (this.playing) {
                this.videoPlay();
            } else {
                this.videoPause();
            }
        }.bind(this));
    }

    nextTrack() {
        this.options.activeTrack = (this.options.activeTrack + 1) % this.options.videoList.length;
        this.loadVideo();

        this.video.addEventListener("loadedmetadata", function() {
            if (this.playing) {
                this.videoPlay();
            } else {
                this.videoPause();
            }
        }.bind(this));
    }

    initElements() {
        this.video.load();
        this.video.addEventListener("loadedmetadata", function(event) {
            const duration = this.video.duration;
            const currentTime = this.video.currentTime;
            this.elements.timeCurrent.textContent = this.formatTime(currentTime);
            this.elements.timeDuration.textContent = this.formatTime(duration);

            this.setAria(this.elements.timeline, 'aria-valuemax', Math.floor(duration));
            this.setAria(this.elements.timeline, 'aria-valuenow', Math.floor(currentTime));
            this.setAria(this.elements.timeline, 'aria-valuetext', `${this.formatTime(currentTime, 'dot')} (общая длительность : ${this.formatTime(duration, 'dot')})`);
        
            this.initVolume();
        }.bind(this));
    }

    init() {
        this.video.controls = false;
        this.video.setAttribute('muted', '');
        this.video.setAttribute('playsinline', '');
        this.video.setAttribute('preload', 'metadata');

        
        this.findElements();
        this.loadTrack();
        this.calculateSizes();
        this.initElements();
    }

    updateTimelineAria() {
        const currentTime = this.video.currentTime;
        const duration = this.video.duration;

        this.setAria(this.elements.timeline, 'aria-valuemax', `${Math.floor(duration)}`);
        this.setAria(this.elements.timeline, 'aria-valuenow', `${Math.floor(currentTime)}`);
        this.setAria(this.elements.timeline, 'aria-valuetext', `${this.formatTime(currentTime, 'dot')} (общая длительность : ${this.formatTime(duration, 'dot')})`);

    }

    initVolume() {
        const newHandleDistance = this.options.initialVolume * this.maxHandleDistance;
        const volume = (this.options.initialVolume * 100).toFixed(0);

        this.video.volume = this.options.initialVolume;

        this.elements.volumeHandle.style.left = `${newHandleDistance}px`;

        this.setAria(this.elements.volumePanel, 'aria-valuenow', volume);
        this.setAria(this.elements.volumePanel, 'aria-valuetext', `${volume}% громкость`);
        this.elements.volumeIndicator.textContent = `${volume}%`;
    }

    updateVolume(event, changeVolume) {
        let volume = this.video.volume;
        let newHandleDistance = 0;
        let mutedText = "";

        if (event.type === 'mousedown' || event.type === 'click' || event.type === 'mousemove') {
            let offsetX = event.clientX - this.elements.volumePanel.getBoundingClientRect().left;

            newHandleDistance = Math.min(this.maxHandleDistance, Math.max(0, offsetX - this.volumeHandleWidth / 2));

            volume = (newHandleDistance / this.maxHandleDistance);
        }

        if (event.type === 'keydown') {
            if (changeVolume === 'inc') {
                volume = Math.min(1, volume + 0.05);
            } else if (changeVolume === 'dec') {
                volume = Math.max(0, volume - 0.05);
            }

            newHandleDistance = (volume * this.maxHandleDistance);
        }

        if (event.type === 'volumechange') {
            volume = this.video.volume;
            newHandleDistance = (volume * this.maxHandleDistance);
        }

        this.elements.volumeHandle.style.left = `${newHandleDistance}px`;
        this.video.volume = volume;

        if (this.video.muted) {
            mutedText = ' звук отключён';
        }

        if (volume === 0 && !this.muted) {
            this.mute();
        } else if (volume > 0 && this.muted) {
            this.unmute();
        }

        this.updateVolumeIndicator();
        this.setAria(this.elements.volumePanel, 'aria-valuenow', (volume * 100).toFixed(0));
        this.setAria(this.elements.volumePanel, 'aria-valuetext', `${(volume * 100).toFixed(0)}% громкость${mutedText}`);

        this.options.initialVolume = this.video.volume;
    }

    updateVolumeOnTouch(event) {
        let volume = this.video.volume;
        let newHandleDistance = 0;
        let mutedText = "";

        if (event.type === 'touchstart' || event.type === 'click' || event.type === 'touchmove') {
            let offsetX = event.changedTouches[0].clientX - this.elements.volumePanel.getBoundingClientRect().left;

            newHandleDistance = Math.min(this.maxHandleDistance, Math.max(0, offsetX - this.volumeHandleWidth / 2));

            volume = (newHandleDistance / this.maxHandleDistance);
        }

        if (event.type === 'volumechange') {
            volume = this.video.volume;
            newHandleDistance = (volume * this.maxHandleDistance);
        }

        this.elements.volumeHandle.style.left = `${newHandleDistance}px`;
        this.video.volume = volume;

        if (this.video.muted) {
            mutedText = ' звук отключён';
        }

        if (volume === 0 && !this.muted) {
            this.mute();
        } else if (volume > 0 && this.muted) {
            this.unmute();
        }

        this.updateVolumeIndicator();
        this.setAria(this.elements.volumePanel, 'aria-valuenow', (volume * 100).toFixed(0));
        this.setAria(this.elements.volumePanel, 'aria-valuetext', `${(volume * 100).toFixed(0)}% громкость${mutedText}`);

        this.options.initialVolume = this.video.volume;
    }

    updateVolumeIndicator() {
        const volume = (this.video.volume * 100).toFixed(0);

        this.elements.volumeIndicator.textContent = `${volume}%`;

        if (!this.video.muted) {
            this.elements.volumeIndicator.classList.remove('hidden');
        }

        setTimeout(() => {
            this.elements.volumeIndicator.classList.add('hidden');
        }, 500);
    }

    videoPlay() {
        this.playing = true;

        this.video.play();
        this.elements.playButton.setAttribute('aria-label', 'Для активации кнопки Пауза нажмите k');
        this.elements.playButtonIcon.classList.replace('video-player-btn__icon--play', 'video-player-btn__icon--pause');
    }

    videoPause() {
        this.playing = false;

        this.video.pause();
        this.elements.playButton.setAttribute('aria-label', 'Для активации кнопки Смотреть нажмите k');
        this.elements.playButtonIcon.classList.replace('video-player-btn__icon--pause', 'video-player-btn__icon--play');
    }

    mute() {
        this.previousVolume = this.video.volume;
        this.muted = true;
        this.options.isMuted(this);
        this.video.muted = true;

        this.elements.volumeBtn.setAttribute('aria-label', 'Для активации кнопки Включить звук нажмите m');
        this.elements.volumeButtnIcon.classList.replace('video-player-btn__icon--unmuted', 'video-player-btn__icon--muted');
    }

    unmute() {
        this.muted = false;
        this.video.muted = false;

        this.elements.volumeBtn.setAttribute('aria-label', 'Для активации кнопки Отключить звук нажмите m');
        this.elements.volumeButtnIcon.classList.replace('video-player-btn__icon--muted', 'video-player-btn__icon--unmuted');
    }

    updateTimeline(event) {
        const timelineWidth = this.timelineWidth;
        const clickX = event.clientX - this.timelineRect.left;

        const seekTime = (clickX / timelineWidth) * this.video.duration;

        const progressWidth = this.elements.timelineProgress.offsetWidth;
        this.elements.timelineHandle.style.transform = `translateX(${progressWidth}px)`;

        this.video.currentTime = seekTime;

        this.updateTimelineAria();
    }

    updateTimelineOnTouch(event) {
        const timelineWidth = this.timelineWidth;
        const clickX = event.changedTouches[0].clientX - this.timelineRect.left;

        const seekTime = (clickX / timelineWidth) * this.video.duration;

        const progressWidth = this.elements.timelineProgress.offsetWidth;
        this.elements.timelineHandle.style.transform = `translateX(${progressWidth}px)`;

        this.video.currentTime = seekTime;

        this.updateTimelineAria();
    }

    enterFullscreen(element) {
        setTimeout(() => {
            this.elements.playButton.focus();
        }, 200);

        if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
    }

    toggleFullscreen() {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement ||  document.msFullscreenElement) {
			this.exitFullscreen();
		} else {
			this.enterFullscreen(this.parent);
		}

        this.parent.addEventListener("fullscreenchange", () => {
            this.calculateSizes();
        });
    }

    adjustVideoTime(seconds) {
        if (this.video) {
            this.video.currentTime += seconds;
        }
    }

    events() {
        window.addEventListener('resize', () => {
            this.calculateSizes();
        });

        this.video.addEventListener('click', function() {
            if (!this.playing) {
                this.videoPlay();
            } else {
                this.videoPause();
            }
        }.bind(this));

        this.elements.playButton.addEventListener('click', function() {
            if (!this.playing) {
                this.videoPlay();
            } else {
                this.videoPause();
            }
        }.bind(this));

        this.elements.volumeBtn.addEventListener('click', function() {
            if (!this.muted) {
                this.mute();
            } else {
                this.unmute();
            }
        }.bind(this));

        this.video.addEventListener('timeupdate', function() {
            const currentTime = this.video.currentTime;
            const duration = this.video.duration;
            const progressWidth = (currentTime / duration) * 100 + "%";
            this.elements.timelineProgress.style.width = progressWidth;

            const progressWidthTwo = this.elements.timelineProgress.offsetWidth;
            const handleWidth = this.elements.timelineHandle.offsetWidth;

            const translateX = (progressWidthTwo) + "px";
            this.elements.timelineHandle.style.transform = 'translateX(' + translateX + ')';

            this.elements.timeCurrent.textContent = this.formatTime(currentTime);
            this.elements.timeDuration.textContent = this.formatTime(duration);

            this.updateTimelineAria();
        }.bind(this));

        // Управление с клавиатуры
        document.addEventListener('keydown', function(event) {
            if (this.video.parentNode.contains(document.activeElement)) {
                const keyCode = event.keyCode;

                switch(keyCode) {
                    case 75:
                        event.preventDefault();
                        if (!this.playing) {
                            this.videoPlay();
                        } else {
                            this.videoPause();
                        }
                        break;
                    
                    case 77:
                        if (!this.muted) {
                            this.mute();
                        } else {
                            this.unmute();
                        }
                        this.updateVolumeIndicator();
                        break;
                    
                    case 70:
                        event.preventDefault();
                        this.toggleFullscreen.bind(this)();
                        break;
                    
                    case 13:
                        event.preventDefault();
                        this.toggleFullscreen.bind(this)();
                        break;

                    case 38:
                        event.preventDefault();
                        this.updateVolume(event, 'inc');
                        break;

                    case 40:
                        event.preventDefault();
                        this.updateVolume(event, 'dec');
                        break;
                }

                if (document.activeElement !== this.elements.volumePanel) {
                    switch(keyCode) {
                        case 37:
                            event.preventDefault();
                            this.adjustVideoTime(-5);
                            break;

                        case 39:
                            event.preventDefault();
                            this.adjustVideoTime(5);
                            break;
                    }
                }

                if (document.activeElement === this.parent || document.activeElement === this.elements.timeline || document.activeElement === this.elements.volumePanel) {
                    switch(keyCode) {
                        case 32:
                            event.preventDefault();
                            if (!this.playing) {
                                this.videoPlay();
                            } else {
                                this.videoPause();
                            }
                            break;
                    }
                }

                if (document.activeElement === this.elements.volumePanel) {
                    switch(keyCode) {
                        case 37:
                            event.preventDefault();
                            this.updateVolume(event, 'dec');
                            break;

                        case 39:
                            event.preventDefault();
                            this.updateVolume(event, 'inc');
                            break;
                    }
                }
            }
        }.bind(this));

        this.elements.timeline.addEventListener('mousedown', function(event) {
            this.draggingTimeline = true;
            this.updateTimeline(event);
        }.bind(this));

        this.elements.volumePanel.addEventListener('mousedown', function(event) {
            this.draggingVolume = true;
            this.updateVolume(event);
        }.bind(this));

        document.addEventListener('mousemove', function(event) {
            if (this.draggingTimeline) {
                this.updateTimeline(event);
            }

            if (this.draggingVolume) {
                this.updateVolume(event);
            }
        }.bind(this));

        document.addEventListener('mouseup', function(event) {
            if (this.draggingTimeline) {
                this.draggingTimeline = false;
            }

            if (this.draggingVolume) {
                this.draggingVolume = false;
            }
        }.bind(this));

        // Touch events start
        this.elements.timeline.addEventListener('touchstart', function(event) {
            this.draggingTimeline = true;
            this.updateTimelineOnTouch(event);
        }.bind(this));

        this.elements.volumePanel.addEventListener('touchstart', function(event) {
            this.draggingVolume = true;
            this.updateVolumeOnTouch(event);
        }.bind(this));

        document.addEventListener('touchmove', function(event) {
            if (this.draggingTimeline) {
                this.updateTimelineOnTouch(event);
            }

            if (this.draggingVolume) {
                this.updateVolumeOnTouch(event);
            }
        }.bind(this));

        document.addEventListener('touchend', function(event) {
            if (this.draggingTimeline) {
                this.draggingTimeline = false;
            }

            if (this.draggingVolume) {
                this.draggingVolume = false;
            }
        }.bind(this));
        // Touch events end

        if (this.elements.fullscreenButton) {
            this.elements.fullscreenButton.addEventListener('click', function() {
                this.toggleFullscreen();
            }.bind(this));
        }
    }

    standardEvents() {
        this.video.addEventListener('play', function() {
            this.video.play();
            this.options.isPlayed(this);
        }.bind(this));

        this.video.addEventListener('pause', function() {
            this.video.pause();
            this.options.isPaused(this);
        }.bind(this));

        this.video.addEventListener('ended', function() {
            this.options.isEnded(this);
        }.bind(this));
    }
}