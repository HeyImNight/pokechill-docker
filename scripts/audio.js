const AudioManager = {
    audioElements: {},
    currentTrack: null,
    isMuted: false,
    volume: 0.5,

    init: function () {
        // Create audio elements
        this.createAudioElement('menu', 'audio/menu.mp3');
        this.createAudioElement('battle', 'audio/battle.mp3');

        // Try to load volume settings from local storage
        const savedVolume = localStorage.getItem('pokechill_volume');
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
        }

        const savedMute = localStorage.getItem('pokechill_muted');
        if (savedMute !== null) {
            this.isMuted = savedMute === 'true';
        }

        this.updateVolume();
        this.updateUI();
    },

    createAudioElement: function (name, src) {
        const audio = new Audio(src);
        audio.loop = true;
        audio.preload = 'auto';
        this.audioElements[name] = audio;
    },

    play: function (name) {
        if (this.currentTrack === name) return;

        // Fade out current track
        if (this.currentTrack && this.audioElements[this.currentTrack]) {
            const oldTrack = this.audioElements[this.currentTrack];
            this.fadeOut(oldTrack);
        }

        this.currentTrack = name;

        if (this.audioElements[name]) {
            const newTrack = this.audioElements[name];
            newTrack.currentTime = 0;
            newTrack.play().catch(e => console.log("Audio play failed (interaction required):", e));
            this.fadeIn(newTrack);
        }
    },

    stop: function () {
        if (this.currentTrack && this.audioElements[this.currentTrack]) {
            this.audioElements[this.currentTrack].pause();
            this.currentTrack = null;
        }
    },

    fadeOut: function (audio) {
        const originalVolume = this.volume;
        let vol = originalVolume;
        const interval = setInterval(() => {
            if (vol > 0.05) {
                vol -= 0.05;
                audio.volume = vol;
            } else {
                audio.pause();
                audio.volume = originalVolume; // Reset for next time
                clearInterval(interval);
            }
        }, 50);
    },

    fadeIn: function (audio) {
        audio.volume = 0;
        let vol = 0;
        const targetVolume = this.isMuted ? 0 : this.volume;

        const interval = setInterval(() => {
            if (vol < targetVolume) {
                vol += 0.05;
                if (vol > targetVolume) vol = targetVolume;
                audio.volume = vol;
            } else {
                clearInterval(interval);
            }
        }, 50);
    },

    setVolume: function (val) {
        this.volume = val;
        localStorage.setItem('pokechill_volume', val);
        this.updateVolume();
        // UI update not strictly needed here as slider drives this, but good for consistency
    },

    toggleMute: function () {
        this.isMuted = !this.isMuted;
        localStorage.setItem('pokechill_muted', this.isMuted);
        this.updateVolume();
        this.updateUI();
        return this.isMuted;
    },

    updateVolume: function () {
        const effectiveVolume = this.isMuted ? 0 : this.volume;
        for (const key in this.audioElements) {
            this.audioElements[key].volume = effectiveVolume;
        }
    },

    updateUI: function () {
        const slider = document.getElementById('settings-volume-slider');
        const muteBtn = document.getElementById('settings-mute-btn');

        if (slider) slider.value = this.volume;
        if (muteBtn) muteBtn.innerText = this.isMuted ? 'Unmute' : 'Mute';
    }
};

// Initialize on interaction to bypass browser autoplay policies
document.addEventListener('click', function initAudio() {
    AudioManager.init();
    // Default to menu music if nothing is playing
    if (!AudioManager.currentTrack) {
        AudioManager.play('menu');
    }
    document.removeEventListener('click', initAudio);
}, { once: true });
