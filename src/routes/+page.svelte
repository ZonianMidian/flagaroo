<script lang="ts">
	import { checkMatch, formatTime, loadCountryData } from '$utils/utils';
	import { countriesStore, categoriesStore } from '$stores/store';
	import { getLocaleFromNavigator, t } from 'svelte-i18n';
	import type { LanguageData, UmamiEvent } from '$types';
	import { effectSounds } from '$utils/soundEffects';
	import Spinner from '$components/Spinner.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import '../app.css';

	export let data;
	const allFlags = data.allFlags;

	$: {
		$categoriesStore = data.categories;
	}

	let timer: ReturnType<typeof setInterval> | null = null;
	let actualTime: number = 0;
	let timeLimit: number = 60;
	let guessedCountries: string[] = [];
	let languageData: LanguageData = {};
	let currentLang: string = 'en';
	let gameStarted: boolean = false;
	let filteredCountries: string[] = [];
	let percentages: { [key: string]: string } = {};
	let isStopEnabled: boolean = false;
	let isStartEnabled: boolean = true;
	let isLoading: boolean = true;

	//Options
	let selectedCategory: string = 'All';
	let mode: string = 'Classic';

	let showPercentagePerTry: boolean = false;
	let showPercentageAtEnd: boolean = false;
	let showAnswersAtEnd: boolean = false;
	let playSoundEffects: boolean = true;
	let effectsVolume: number = 0.1;

	//Umami
	let umami: any;
	if (browser) {
		umami = (window as any)?.umami;
	}

	async function loadLanguage() {
		currentLang = getLocaleFromNavigator()?.slice(0, 2) ?? 'en';
		const langFile = await import(`$data/languages/${currentLang}.json`);
		languageData = langFile.default;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.shiftKey) {
			switch (event.key.toLowerCase()) {
				case 's':
					if (isStartEnabled) startGame();
					break;
				case 'p':
					if (isStopEnabled) stopGame();
					break;
				case 'r':
					restartGame();
					break;
			}
		}
	}

	onMount(() => {
		(async () => {
			effectSounds.preload();
			await loadLanguage();
			shuffleCountries();
			isLoading = false;
		})();

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	function shuffleCountries() {
		filteredCountries =
			selectedCategory === 'All'
				? allFlags
				: Object.values($categoriesStore).flatMap((cat) => cat[selectedCategory] || []);
		filteredCountries = filteredCountries.sort(() => Math.random() - 0.5);
	}

	function startGame() {
		if (umami) {
			const eventData: UmamiEvent = {
				mode,
				percentTry: showPercentagePerTry,
				percentEnd: showPercentageAtEnd,
				answersEnd: showAnswersAtEnd,
				soundEffects: playSoundEffects
			};
			if (mode === 'Timer') eventData.time = timeLimit;
			umami.track('start', eventData);
		}

		gameStarted = true;
		isStopEnabled = true;
		isStartEnabled = false;

		effectSounds.play('start', { volume: effectsVolume });

		if (mode === 'Timer') {
			const selectElement = document.getElementById('time') as HTMLSelectElement;
			timeLimit = +selectElement?.value || 0;
			startTimer(timeLimit);
		} else {
			startTimer(0);
		}

		disableControls(true);
		enableAllInputs();
		focusNextInput();
	}

	function startTimer(time: number) {
		actualTime = time;
		timer = setInterval(() => {
			if (mode === 'Timer') {
				actualTime--;
			} else {
				actualTime++;
			}

			if (actualTime <= 0) {
				clearInterval(timer!);
				endGame();
			}
		}, 1000);
	}

	function endGame() {
		if (umami) {
			umami.track('end', {
				result: `${guessedCountries.length}/${filteredCountries.length}`
			});
		}

		gameStarted = false;
		isStopEnabled = false;
		isStartEnabled = false;
		if (timer) clearInterval(timer);
		if (showAnswersAtEnd) revealAllNames();
		if (showPercentageAtEnd) showAllPercentages();
		disableControls(false);
		disableStartButton(true);

		if (playSoundEffects) {
			if (guessedCountries.length === filteredCountries.length) {
				effectSounds.play('win', { volume: effectsVolume });
			} else if (mode === 'Timer') {
				effectSounds.play('lose', { volume: effectsVolume });
			} else {
				setTimeout(() => effectSounds.play('end', { volume: effectsVolume }), 100);
			}
		}
	}

	function stopGame() {
		if (umami) {
			umami.track('stop');
		}

		endGame();
		disableStartButton(true);
	}

	function restartGame() {
		if (umami) {
			umami.track('restart');
		}

		guessedCountries = [];
		percentages = {};
		actualTime = 0;

		effectSounds.play('restart', { volume: effectsVolume });

		if (gameStarted) {
			endGame();
			clearAllInputs();
			shuffleCountries();
			startGame();
		} else {
			gameStarted = false;
			isStopEnabled = false;
			isStartEnabled = true;
			if (timer) clearInterval(timer);
			clearAllInputs();
			shuffleCountries();
			disableControls(false);
			disableStartButton(false);
		}
	}

	function disableControls(disable: boolean) {
		const controls = document.querySelectorAll('.game-control') as NodeListOf<
			HTMLInputElement | HTMLSelectElement
		>;
		controls.forEach((control) => {
			control.disabled = disable;
		});
	}

	function disableStartButton(disable: boolean) {
		const startButton = document.querySelector('#start-button') as HTMLButtonElement;
		if (startButton) {
			startButton.disabled = disable;
		}
	}

	function enableAllInputs() {
		const inputs = document.querySelectorAll('.country-input') as NodeListOf<HTMLInputElement>;
		inputs.forEach((input) => {
			input.disabled = false;
		});

		const buttons = document.querySelectorAll(
			'.country-reveal'
		) as NodeListOf<HTMLInputElement>;
		buttons.forEach((button) => {
			button.disabled = false;
		});
	}

	async function revealAllNames() {
		const inputs = document.querySelectorAll('.country-input') as NodeListOf<HTMLInputElement>;
		for (const input of inputs) {
			const countryCode = input.getAttribute('data-country-code');
			if (countryCode) {
				await revealName(countryCode);
			}
		}
	}

	async function revealName(countryCode: string) {
		const input = document.querySelector(
			`.country-input[data-country-code="${countryCode}"]`
		) as HTMLInputElement | null;
		if (!input) return;

		if (!$countriesStore[countryCode]) {
			const countryData = await loadCountryData(countryCode);
			if (countryData) {
				$countriesStore = { ...$countriesStore, [countryCode]: countryData };
			}
		}

		if ($countriesStore[countryCode]) {
			input.value = $countriesStore[countryCode].name[currentLang] || '';
			input.disabled = true;

			const button = document.querySelector(
				`.country-reveal[data-country-code="${countryCode}"]`
			) as HTMLInputElement;

			button.disabled = true;
		}
	}

	function showAllPercentages() {
		const percentageElements = document.querySelectorAll(
			'.percentage'
		) as NodeListOf<HTMLDivElement>;
		percentageElements.forEach((percentageElement) => {
			const countryCode = percentageElement.parentElement
				?.querySelector('.country-input')
				?.getAttribute('data-country-code');
			if (countryCode) {
				percentageElement.textContent = percentages[countryCode] || '';
				percentageElement.style.visibility = 'visible';
			}
		});
	}

	function clearAllInputs() {
		const inputs = document.querySelectorAll('.country-input') as NodeListOf<HTMLInputElement>;
		inputs.forEach((input) => {
			input.value = '';
			input.disabled = true;
			input.parentElement!.classList.remove('success', 'failure', 'revealed');
		});
		const percentages = document.querySelectorAll('.percentage') as NodeListOf<HTMLDivElement>;
		percentages.forEach((percentage) => {
			percentage.textContent = '';
			percentage.style.visibility = 'hidden';
		});
	}

	async function checkAnswer(event: KeyboardEvent, countryCode: string) {
		if ((event.key === 'Enter' || event.key === 'Tab') && gameStarted) {
			const inputElement = event.target as HTMLInputElement;
			const inputValue = inputElement.value;

			if (event.key === 'Tab') {
				event.preventDefault();
				focusNextInput(inputElement);
			}

			if (!$countriesStore[countryCode]) {
				const countryData = await loadCountryData(countryCode);
				if (countryData) {
					$countriesStore = { ...$countriesStore, [countryCode]: countryData };
				} else {
					console.error(`Failed to load data for ${countryCode}`);
					return;
				}
			}

			const country = $countriesStore[countryCode];
			if (country && inputValue) {
				const result = checkMatch(country, currentLang, inputValue);

				if (result.success) {
					guessedCountries = [...guessedCountries, countryCode];
					inputElement.disabled = true;
					inputElement.value = country.name[currentLang] || '';
					animateSuccess(inputElement, countryCode);
					if (event.key === 'Enter') {
						focusNextInput(inputElement);
					}
				} else {
					animateFailure(inputElement);
				}
				if (showPercentagePerTry || showPercentageAtEnd) {
					percentages[countryCode] = result.percent;
					if (showPercentagePerTry) {
						showPercentage(inputElement, result.percent);
					}
				}
			}
		}
	}

	function focusNextInput(currentInput?: HTMLInputElement) {
		const inputs = Array.from(
			document.querySelectorAll('.country-input')
		) as HTMLInputElement[];

		const enabledInputs = inputs.filter((input) => !input.disabled && input.tabIndex !== -1);

		if (enabledInputs.length === 0) {
			stopGame();
			return;
		}

		const currentIndex = currentInput ? inputs.indexOf(currentInput) : -1;

		for (let i = 1; i <= inputs.length; i++) {
			const nextIndex = (currentIndex + i) % inputs.length;
			const nextInput = inputs[nextIndex];

			if (!nextInput.disabled && nextInput.tabIndex !== -1) {
				nextInput.focus();
				return;
			}
		}

		stopGame();
	}

	function animateSuccess(element: HTMLInputElement, countryCode: string) {
		if (playSoundEffects) {
			effectSounds.play('success', { volume: effectsVolume });
		}
		element.parentElement!.classList.remove('revealed');
		element.parentElement!.classList.remove('failure');
		element.parentElement!.classList.add('success');

		const button = document.querySelector(
			`.country-reveal[data-country-code="${countryCode}"]`
		) as HTMLInputElement;

		button.disabled = true;
	}

	function animateFailure(element: HTMLInputElement) {
		if (playSoundEffects) {
			effectSounds.play('failature', { volume: effectsVolume });
		}
		element.parentElement!.classList.remove('revealed');
		element.parentElement!.classList.remove('success');
		element.parentElement!.classList.add('failure');
		setTimeout(() => element.parentElement!.classList.remove('failure'), 500);
	}

	function animateRevealed(element: HTMLButtonElement, countryCode: string) {
		if (playSoundEffects) {
			effectSounds.play('revealed', { volume: effectsVolume });
		}
		element.parentElement!.classList.remove('failure');
		element.parentElement!.classList.remove('success');
		element.parentElement!.classList.add('revealed');

		revealName(countryCode);

		const input = element.parentElement?.querySelector('.country-input');
		if (input) {
			focusNextInput(input as HTMLInputElement);
		}
	}

	function showPercentage(element: HTMLInputElement, percent: string) {
		const percentageElement = element.parentElement!.querySelector(
			'.percentage'
		) as HTMLDivElement;
		percentageElement.textContent = percent;
		percentageElement.style.visibility = 'visible';
	}

	function handleCategoryChange() {
		restartGame();
	}
</script>

<svelte:head>
	<title>Flagaroo</title>
	<meta property="og:title" content="Flagaroo" />

	<meta property="og:url" content={$page.url.origin} />
	<link rel="canonical" href={$page.url.origin} />

	<meta property="og:image" content={$page.url.origin + '/Flagaroo.png'} />
</svelte:head>

<div>
	{#if isLoading}
		<Spinner />
	{:else}
		<div class="game-buttons">
			<button id="start-button" on:click={startGame} disabled={!isStartEnabled}
				>{$t('buttons.start')}</button
			>
			<button on:click={stopGame} disabled={!isStopEnabled}>{$t('buttons.stop')}</button>
			<button on:click={restartGame}>{$t('buttons.restart')}</button>
		</div>

		<div class="controls">
			<label for="category">{$t('subtitle.categories')}:</label>
			<select
				id="category"
				bind:value={selectedCategory}
				on:change={handleCategoryChange}
				class="game-control"
			>
				<option value="All">{$t('categories.all')} [{allFlags.length}]</option>
				{#each Object.entries($categoriesStore) as [categoryGroup, subcategories]}
					<optgroup label={$t(`categories.${categoryGroup}.name`)}>
						{#each Object.keys(subcategories) as subcategory}
							<option value={subcategory}
								>{$t(`categories.${categoryGroup}.${subcategory}`)} [{Object.values(
									$categoriesStore
								).flatMap((cat) => cat[subcategory] || []).length}]</option
							>
						{/each}
					</optgroup>
				{/each}
			</select>

			<label for="mode">{$t('subtitle.mode')}:</label>
			<select id="mode" bind:value={mode} class="game-control">
				<option value="Classic">{$t('mode.classic')}</option>
				<option value="Timer">{$t('mode.timer')}</option>
			</select>

			{#if mode === 'Timer'}
				<label for="time">{$t('subtitle.time')}:</label>
				<select id="time" bind:value={timeLimit} class="game-control">
					<option value={30}>30s</option>
					<option value={1 * 60}>1m</option>
					<option value={5 * 60}>5m</option>
					<option value={10 * 60}>10m</option>
					<option value={15 * 60}>15m</option>
					<option value={30 * 60}>30m</option>
					<option value={60 * 60}>1h</option>
				</select>
			{/if}
		</div>

		<div class="options">
			<label class="option">
				<input type="checkbox" bind:checked={showPercentagePerTry} class="game-control" />
				{$t('options.try-percent')}
			</label>
			<label class="option">
				<input type="checkbox" bind:checked={showPercentageAtEnd} class="game-control" />
				{$t('options.end-percent')}
			</label>
			<label class="option">
				<input type="checkbox" bind:checked={showAnswersAtEnd} class="game-control" />
				{$t('options.end-name')}
			</label>
			<label class="option">
				<input type="checkbox" bind:checked={playSoundEffects} class="game-control" />
				{$t('options.sounds')}
			</label>
		</div>

		<div class="flag-grid">
			{#each filteredCountries as countryCode, index}
				<div
					class="flag-box"
					class:success={guessedCountries.includes(countryCode)}
					class:failure={false}
					class:revealed={false}
				>
					<div class="flag-container">
						<img
							src={`/flags/${countryCode}.svg`}
							alt={countryCode}
							loading="lazy"
							class="flag"
						/>
					</div>
					<button
						tabindex="-1"
						class="country-reveal"
						on:click={(e) => animateRevealed(e.currentTarget, countryCode)}
						disabled={!gameStarted}
						data-country-code={countryCode}
					>
						👁
					</button>
					<input
						tabindex={index + 1}
						type="text"
						class="country-input"
						on:keydown={(e) => checkAnswer(e, countryCode)}
						disabled={!gameStarted}
						data-country-code={countryCode}
					/>
					<div class="percentage" style="visibility: hidden;"></div>
				</div>
			{/each}
		</div>

		<div class="info-card timer-card">
			<div class="timer">
				{#if mode === 'Timer' && !gameStarted}
					{formatTime(timeLimit)}
				{:else}
					{formatTime(actualTime)}
				{/if}
			</div>
		</div>

		<div class="info-card timer-card">
			<div class="timer">
				{#if mode === 'Timer' && !gameStarted}
					{formatTime(timeLimit)}
				{:else}
					{formatTime(actualTime)}
				{/if}
			</div>
		</div>

		<div class="info-card score-card">
			<div class="game-info">
				<strong>{guessedCountries.length}/{filteredCountries.length}</strong>
			</div>
		</div>
	{/if}
</div>

<style>
	.game-buttons {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin-bottom: 20px;
	}

	.controls,
	.options {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
	}

	.controls select,
	.game-buttons button {
		padding: 5px 10px;
		font-size: 1em;
	}

	.game-buttons button,
	.controls select,
	.country-input,
	.option input {
		background-color: #4a4a4a;
		color: #ffffff;
		border-color: #666666;
		transition: all 0.3s ease;
	}

	.game-buttons button:not(:disabled),
	.controls select:not(:disabled),
	.country-input:not(:disabled),
	.option input:not(:disabled) {
		background-color: #5a5a5a;
		cursor: pointer;
	}

	.game-buttons button:not(:disabled):hover,
	.controls select:not(:disabled):hover,
	.country-input:not(:disabled):hover,
	.option input:not(:disabled):hover {
		background-color: #6a6a6a;
	}

	.game-buttons button:disabled,
	.controls select:disabled,
	.country-input:disabled,
	.option input:disabled {
		background-color: #3a3a3a;
		color: #888888;
		cursor: not-allowed;
		opacity: 0.7;
	}

	.game-buttons button:hover,
	.controls select:hover,
	.option input:hover {
		background-color: #4a4a4a;
	}

	.options label {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.flag-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		justify-content: center;
	}

	.flag-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10px;
		border: 1px solid #555555;
		border-radius: 5px;
		transition: all 0.3s ease;
		width: 100%;
		max-width: 200px;
		background-color: #3a3a3a;
	}

	.flag-box:focus-within {
		background-color: #4a4a4a;
		border-color: #777777;
	}

	.flag-container {
		width: 150px;
		height: 90px;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	}

	.flag {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.country-reveal {
		border-style: hidden;
		background-color: transparent;
		cursor: pointer;
		color: #6a6a6a;
	}

	.country-reveal:hover {
		color: #fff;
	}

	.country-reveal:disabled {
		color: transparent;
		cursor: auto;
	}

	.country-input {
		width: 100%;
		padding: 5px;
		text-align: center;
		border: 1px solid #b6b6b6;
		border-radius: 3px;
		margin-bottom: 5px;
	}

	.country-input:focus {
		outline: none;
	}

	.flag-box.success {
		background-color: #2a5a2a;
		border-color: #3a6a3a;
		animation: success-animation 0.5s ease;
	}

	@keyframes success-animation {
		0% {
			background-color: #3a3a3a;
		}
		50% {
			background-color: #2a5a2a;
		}
		100% {
			background-color: #2a5a2a;
		}
	}

	.flag-box.failure {
		background-color: #5a2a2a;
		border-color: #6a3a3a;
		animation: failure-animation 0.1s ease;
	}

	@keyframes failure-animation {
		0% {
			background-color: #3a3a3a;
		}
		25% {
			background-color: #5a2a2a;
		}
		75% {
			background-color: #5a2a2a;
		}
		100% {
			background-color: #5a2a2a;
		}
	}

	.flag-box.revealed {
		background-color: #a65a2a;
		border-color: #b36a3a;
		animation: revealed-animation 0.5s ease;
	}

	@keyframes revealed-animation {
		0% {
			background-color: #7a4a2a;
		}
		50% {
			background-color: #a65a2a;
		}
		100% {
			background-color: #a65a2a;
		}
	}

	.percentage {
		font-size: 0.8em;
		margin-top: 5px;
		height: 1em;
	}

	.options label {
		color: #e0e0e0;
	}

	.info-card {
		position: fixed;
		bottom: 10px;
		background-color: rgba(58, 58, 58, 0.8);
		padding: 10px 15px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
		transition: opacity 0.3s ease;
		z-index: 1000;
	}

	.info-card:hover {
		opacity: 1;
	}

	.timer-card {
		left: 10px;
	}

	.score-card {
		right: 10px;
	}

	.timer,
	.game-info {
		color: #ffffff;
		font-size: 1.2em;
		font-weight: bold;
	}
</style>
