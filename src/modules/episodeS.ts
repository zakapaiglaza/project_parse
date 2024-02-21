export default class Episodes {
    title: string;
    sounds: string[];
    url?: string;

    constructor(title: string, sounds: string[] = [], url?: string) {
        this.title = title;
        this.sounds = sounds;
        this.url = url;
    }

    addSound(sound: string): void {
        this.sounds.push(sound);
    }

    getVoiceActing(voice: number): string | undefined {
        if (!this.sounds || this.sounds.length === 0) {
            console.error(`Для  '${this.title}' нет озвучек.`);
            return;
        }

        const selectedVoice = this.sounds[voice];
        if (selectedVoice) {
            console.log(`Выбрана озвучка '${selectedVoice}' для эпизода '${this.title}'.`);
            return selectedVoice;
        } else {
            console.error(`Озвучка '${voice}' не найдена для эпизода '${this.title}'.`);
            return undefined;
        }
    }
}