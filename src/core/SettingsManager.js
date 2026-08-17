export class SettingsManager {
    constructor() {
        this.masterVolume = 0.8;
        this.bgmVolume = 0.5;
        this.sfxVolume = 0.8;
        this.screenShake = true;
        this.damageFloaters = true;
        this.hitstop = true;

        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem('tempest_settings');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.masterVolume !== undefined) this.masterVolume = data.masterVolume;
                if (data.bgmVolume !== undefined) this.bgmVolume = data.bgmVolume;
                if (data.sfxVolume !== undefined) this.sfxVolume = data.sfxVolume;
                if (data.screenShake !== undefined) this.screenShake = data.screenShake;
                if (data.damageFloaters !== undefined) this.damageFloaters = data.damageFloaters;
                if (data.hitstop !== undefined) this.hitstop = data.hitstop;
            }
        } catch(e) {}
    }

    save() {
        try {
            localStorage.setItem('tempest_settings', JSON.stringify({
                masterVolume: this.masterVolume,
                bgmVolume: this.bgmVolume,
                sfxVolume: this.sfxVolume,
                screenShake: this.screenShake,
                damageFloaters: this.damageFloaters,
                hitstop: this.hitstop
            }));
        } catch(e) {}
    }
}
