import { createAudioStore } from '@elron/svelte-audio-store';

const sounds = {
	failature: 'sounds/failature.mp3',
	revealed: 'sounds/revealed.mp3',
	success: 'sounds/success.mp3',
	lose: 'sounds/lose.mp3',
	win: 'sounds/win.mp3'
};

export const effectSounds = createAudioStore(sounds);
