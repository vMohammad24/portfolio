<script lang="ts">
	import {
		extractProjectStats,
		fetchWakaTimeStats,
		prepareChartData,
		type WakaTimeStats
	} from '$lib/client/wakatime';
	import Background from '$lib/components/Background.svelte';
	import { lanyardStore } from '$lib/states/lanyard';
	import { viewport } from '$lib/utils/intersection';
	import { ArrowRight, ArrowUp, ChevronDown, ExternalLink } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { backOut, elasticOut } from 'svelte/easing';
	import { fade, fly, slide } from 'svelte/transition';
	type ProjectData = {
		name: string;
		description: string;
		link: string;
		logo?: string;
		wakatimeName?: string;
		wakatimeStats?: {
			totalSeconds: number;
			text: string;
			percent: number;
		} | null;
		techs?: string[];
	};

	const birthday = new Date('2009-08-06');
	let age = 0;
	const radius = 50;
	const strokeWidth = 5;
	const center = 60;
	let currentTime = Date.now();
	let wakaTimeData: WakaTimeStats | null = null;
	let wakaTimeError: string | null = null;
	let projects: ProjectData[] = [
		{
			name: 'NaviThingy',
			description:
				'A Navidrome/Subsonic client for Desktop providing the best experience possible.',
			link: 'https://github.com/vmohammad24/NaviThingy/',
			wakatimeName: 'NaviThingy',
			wakatimeStats: null,
			techs: ['Tauri', 'Svelte', 'Bun', 'Rust']
		},
		{
			name: 'Tidal Subsonic',
			description: `A translation layer for Tidal's API to make it compatible with Subsonic clients.`,
			link: 'https://tidal.vmohammad.dev',
			wakatimeName: 'tidal',
			wakatimeStats: null,
			logo: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=64&url=https://tidal.com',
			techs: ['Bun', 'Typescript', 'SQLite', 'Redis']
		},
		{
			name: 'Peekless',
			description: 'An end to end encrypted search engine providing you with privacy and security.',
			link: 'https://search.vmohammad.dev',
			wakatimeName: 'peekless',
			wakatimeStats: null,
			logo: 'https://search.vmohammad.dev/public/img/favicon.svg',
			techs: ['Bun', 'TypeScript', 'Redis']
		}
	];

	onMount(() => {
		const updateAge = () => {
			const now = new Date();
			const diff = now.getTime() - birthday.getTime();
			age = diff / (1000 * 60 * 60 * 24 * 365.25);
		};

		updateAge();
		const intreval = setInterval(() => {
			currentTime = Date.now();
			updateAge();
		}, 250);

		try {
			(async () => {
				wakaTimeData = await fetchWakaTimeStats();
				if (wakaTimeData?.data?.projects) {
					const wakatimeProjectNames = projects
						.filter((p) => p.wakatimeName)
						.map((p) => p.wakatimeName as string);

					const projectStats = extractProjectStats(wakaTimeData, wakatimeProjectNames);

					projects = projects.map((project) => {
						if (project.wakatimeName && projectStats[project.wakatimeName]) {
							return {
								...project,
								wakatimeStats: projectStats[project.wakatimeName]
							};
						}
						return project;
					});
				}
			})();
		} catch (error) {
			wakaTimeError = 'Failed to load WakaTime stats';
		}

		return () => {
			clearInterval(intreval);
		};
	});

	const languages = [
		{
			name: 'TypeScript',
			proficiency: 100,
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/typescript/typescript-original.svg',
			link: 'https://www.typescriptlang.org/'
		},
		{
			name: 'Java',
			proficiency: 90,
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/java/java-original.svg',
			link: 'https://www.java.com/'
		},
		{
			name: 'JavaScript',
			proficiency: 85,
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/javascript/javascript-original.svg',
			link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
		},
		{
			name: 'Python',
			proficiency: 80,
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/python/python-original.svg',
			link: 'https://www.python.org/'
		},
		{
			name: 'Golang',
			proficiency: 75,
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/go/go-original.svg',
			link: 'https://golang.org/'
		}
	];

	const skills = [
		{
			name: 'Svelte',
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/svelte/svelte-original.svg',
			link: 'https://svelte.dev/'
		},
		{
			name: 'Next.js',
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/nextjs/nextjs-original.svg',
			link: 'https://nextjs.org/'
		},
		{
			name: 'React.js',
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/react/react-original.svg',
			link: 'https://react.dev/'
		},
		{
			name: 'Elysia.js',
			icon: 'https://elysiajs.com/assets/elysia.svg',
			link: 'https://elysiajs.com/'
		},
		{
			name: 'TailwindCSS',
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/tailwindcss/tailwindcss-original.svg',
			link: 'https://tailwindcss.com/'
		},
		{
			name: 'Discord.js',
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/discordjs/discordjs-original.svg',
			link: 'https://discord.js.org/'
		},
		{
			name: 'PostgreSQL',
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/postgresql/postgresql-original.svg',
			link: 'https://www.postgresql.org/'
		},
		{
			name: 'Redis',
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/redis/redis-original.svg',
			link: 'https://redis.io/'
		}
	];

	function formatDuration(start: number, end?: number): string {
		const duration = Math.floor(((end || currentTime) - start) / 1000);

		const hours = Math.floor(duration / 3600);
		const minutes = Math.floor((duration % 3600) / 60);
		const seconds = duration % 60;

		if (hours > 0) {
			return `${hours}h ${minutes}m ${seconds}s`;
		}
		if (minutes > 0) {
			return `${minutes}m ${seconds}s`;
		}
		return `${seconds}s`;
	}

	function getElapsedTime(timestamp: number): string {
		const seconds = Math.floor((currentTime - timestamp) / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) {
			return `${days}d ${hours % 24}h ago`;
		}
		if (hours > 0) {
			return `${hours}h ${minutes % 60}m ago`;
		}
		if (minutes > 0) {
			return `${minutes}m ago`;
		}
		return 'just now';
	}

	function getTimeUntil(timestamp: number): string {
		const seconds = Math.floor((timestamp - currentTime) / 1000);
		if (seconds <= 0) return 'Finished';

		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		if (hours > 0) {
			return `${hours}h ${minutes % 60}m left`;
		}
		if (minutes > 0) {
			return `${minutes}m ${seconds % 60}s left`;
		}
		return `${seconds}s left`;
	}

	function getSongProgress(start: number, end: number): number {
		const total = end - start;
		const elapsed = Math.min(currentTime - start, total);
		return Math.floor((elapsed / total) * 100);
	}

	$: customStatus = $lanyardStore?.activities?.find((activity) => activity.type === 4);

	$: regularActivities = $lanyardStore?.activities?.filter((activity) => activity.type !== 4) || [];
	$: avatarDecoration = $lanyardStore?.discord_user.avatar_decoration_data
		? `https://cdn.discordapp.com/avatar-decoration-presets/${$lanyardStore.discord_user.avatar_decoration_data.asset}.png?size=1024&passthrough=true`
		: null;
	function calculateStrokeDashArray(percent: number, radius: number): string {
		const circumference = 2 * Math.PI * radius;
		const strokeDasharray = `${(percent * circumference) / 100} ${circumference}`;
		return strokeDasharray;
	}

	const sections: Record<string, HTMLElement | SVGElement | null> = {
		header: null,
		about: null,
		activities: null,
		languages: null,
		skills: null,
		projects: null,
		wakatime: null,
		socials: null,
		footer: null
	};

	let showBackToTop = false;

	function scrollToSection(sectionId: string) {
		const section = sections[sectionId];
		if (section) {
			section.scrollIntoView({ behavior: 'smooth' });
		}
	}

	onMount(() => {
		const updateAge = () => {
			const now = new Date();
			const diff = now.getTime() - birthday.getTime();
			age = diff / (1000 * 60 * 60 * 24 * 365.25);
		};

		updateAge();
		const interval = setInterval(updateAge, 5000);

		const timeInterval = setInterval(() => {
			currentTime = Date.now();
		}, 250);

		try {
			(async () => {
				wakaTimeData = await fetchWakaTimeStats();
				if (wakaTimeData?.data?.projects) {
					const wakatimeProjectNames = projects
						.filter((p) => p.wakatimeName)
						.map((p) => p.wakatimeName as string);

					const projectStats = extractProjectStats(wakaTimeData, wakatimeProjectNames);

					projects = projects.map((project) => {
						if (project.wakatimeName && projectStats[project.wakatimeName]) {
							return {
								...project,
								wakatimeStats: projectStats[project.wakatimeName]
							};
						}
						return project;
					});
				}
			})();
		} catch (error) {
			wakaTimeError = 'Failed to load WakaTime stats';
		}

		const scrollObserver = new IntersectionObserver(() => {}, { threshold: 0.3 });

		for (const section of Object.values(sections)) {
			if (section) scrollObserver.observe(section);
		}

		const handleScroll = () => {
			showBackToTop = window.scrollY > 500;
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			clearInterval(interval);
			clearInterval(timeInterval);
			window.removeEventListener('scroll', handleScroll);
			for (const section of Object.values(sections)) {
				if (section) scrollObserver.unobserve(section);
			}
		};
	});

	function typingEffect(
		node: HTMLElement,
		{ text, speed = 50, delay = 0 }: { text: string; speed?: number; delay?: number }
	) {
		const words = text.split(' ');
		let i = 0;
		let timer: number;

		function type() {
			if (i < words.length) {
				const word = words[i];
				const span = document.createElement('span');
				span.textContent = (i > 0 ? ' ' : '') + word;
				span.className = 'opacity-0 transform translate-y-2';
				setTimeout(() => {
					span.className = 'opacity-100 transform translate-y-0 transition-all duration-500';
				}, 10);
				node.appendChild(span);
				i++;
				timer = setTimeout(type, speed);
			}
		}

		setTimeout(() => type(), delay);

		return {
			destroy() {
				clearTimeout(timer);
			}
		};
	}

	const socials = [
		{
			name: 'Discord',
			link: `https://discord.com/users/${$lanyardStore?.discord_user.id || '840854894881538079'}`,
			useDiscordId: true,
			icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/discord.svg',
			gradientFrom: '#5865F2',
			gradientTo: '#4752C4',
			iconColor: '#FFFFFF'
		},
		{
			name: 'GitHub',
			link: 'https://github.com/vMohammad24',
			icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/github/github-original.svg',
			gradientFrom: '#333',
			gradientTo: '#24292e',
			iconColor: '#FFFFFF'
		},
		{
			name: 'Twitter',
			link: 'https://x.com/vMohammad_',
			icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/x.svg',
			gradientFrom: 'black',
			gradientFromOpacity: '80',
			gradientTo: 'black',
			shadowColor: 'white',
			shadowOpacity: '10',
			iconColor: '#FFFFFF',
			invert: true
		},
		{
			name: 'Instagram',
			link: 'https://instagram.com/vmohammad42',
			icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/instagram.svg',
			gradientFrom: '#833AB4',
			gradientTo: '#FCAF45'
		},
		{
			name: 'Telegram',
			link: 'https://t.me/vMohammad42',
			icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/telegram.svg',
			gradientFrom: '#0088cc',
			gradientTo: '#0088cc'
		}
	];
</script>

<svelte:head>
	<title>Mohammad's Portfolio</title>
	<meta
		name="description"
		content="Full-stack developer and student passionate about TypeScript, Svelte, and more."
	/>
</svelte:head>

<main
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-base to-crust p-4 text-text md:p-8"
>
	<div class="fixed inset-0 z-0 opacity-20">
		<Background particleCount={40} />
	</div>

	{#if $lanyardStore}
		<button
			class="fixed bottom-6 right-6 z-40 transform rounded-full bg-lavender/80 p-3 text-crust shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-lavender"
			style="opacity: {showBackToTop ? '1' : '0'}; pointer-events: {showBackToTop
				? 'auto'
				: 'none'}; transform: scale({showBackToTop ? '1' : '0.8'});"
			on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			aria-label="Back to top"
		>
			<ArrowUp class="h-6 w-6" />
		</button>

		<div
			class="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-12"
			in:fade={{ duration: 1000, delay: 200 }}
		>
			<section
				bind:this={sections.header}
				id="header"
				class="hover:shadow-purple/20 relative overflow-hidden rounded-xl bg-gradient-to-r from-base/80 via-base/70 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 md:col-span-12"
				use:viewport.intersection
				class:animate-slide-up={$viewport.get(sections.header)}
			>
				<div
					class="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-crust/20 to-transparent"
				></div>
				<div class="relative z-10 flex flex-col items-center gap-8 md:flex-row">
					<div
						class="group relative grid h-40 w-40 shrink-0 place-items-center"
						in:fade={{ duration: 600, delay: 300 }}
					>
						<div
							class="absolute inset-0 rounded-full bg-gradient-to-r from-pink to-mauve opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-30"
						></div>

						{#if avatarDecoration}
							<img
								class="pointer-events-none absolute z-20 h-36 w-36 animate-float rounded-full"
								src={avatarDecoration}
								alt="Avatar Decoration"
							/>
						{/if}
						<img
							class="z-5 h-32 w-32 rounded-full border-2 border-surface0 object-cover shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:border-lavender"
							src="https://cdn.discordapp.com/avatars/{$lanyardStore.discord_user.id}/{$lanyardStore
								.discord_user.avatar}.webp?size=1024"
							alt="Avatar"
							loading="eager"
						/>

						<div
							class="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface0 bg-mantle"
						>
							<span
								class="h-3 w-3 rounded-full {$lanyardStore.discord_status === 'online'
									? 'animate-pulse bg-green'
									: $lanyardStore.discord_status === 'idle'
										? 'bg-yellow'
										: $lanyardStore.discord_status === 'dnd'
											? 'bg-red'
											: 'bg-surface0'}"
							></span>
						</div>
					</div>
					<div class="text-center md:text-left">
						<h1
							class="mb-2 bg-gradient-to-r from-text to-subtext0 bg-clip-text text-5xl font-bold text-transparent"
							in:fly={{ y: 20, duration: 600, delay: 500, easing: backOut }}
						>
							Mohammad
						</h1>
						<div class="text-text-muted h-8 text-2xl font-medium">
							<span
								class="inline-block"
								in:fly={{ y: 20, duration: 600, delay: 700, easing: backOut }}
							>
								{age.toFixed(2)} years old
							</span>
						</div>

						<div
							class="text-text-muted mt-4 flex flex-wrap gap-1 border-l-2 border-lavender pl-3 text-lg"
							in:fly={{ y: 20, duration: 600, delay: 900, easing: backOut }}
							use:typingEffect={{
								text: 'Full-stack developer with a passion for building basically anything and everything.',
								speed: 80,
								delay: 1200
							}}
						></div>

						<div class="mt-6 flex flex-wrap gap-3">
							<button
								on:click={() => scrollToSection('projects')}
								class="rounded-md bg-lavender/80 px-5 py-2 font-medium text-crust transition-all duration-300 hover:-translate-y-1 hover:bg-lavender hover:shadow-md focus:outline-none focus:ring-2 focus:ring-lavender/50"
								in:fly={{ y: 20, duration: 500, delay: 1500, easing: backOut }}
							>
								View Projects
							</button>
							<button
								on:click={() => scrollToSection('socials')}
								class="rounded-md bg-surface0/50 px-5 py-2 font-medium text-text transition-all duration-300 hover:-translate-y-1 hover:bg-surface0 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-surface0/50"
								in:fly={{ y: 20, duration: 500, delay: 1600, easing: backOut }}
							>
								Connect
							</button>
						</div>
					</div>
				</div>

				{#if customStatus}
					<div class="mx-auto mt-8 max-w-xl md:ml-48 md:mt-12">
						<div
							class="transform rounded-lg border-l-4 border-lavender bg-surface0/30 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lavender/20"
							in:fly={{ y: 20, duration: 500, delay: 1700, easing: backOut }}
						>
							<div class="flex items-center gap-3">
								<div class="h-3 w-3 animate-pulse rounded-full bg-lavender"></div>
								<p class="text-text-muted italic">{customStatus.state}</p>
							</div>
						</div>
					</div>
				{/if}
			</section>

			<section
				bind:this={sections.about}
				id="about"
				class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-blue/20 md:col-span-5"
				use:viewport.intersection
				class:animate-slide-up={$viewport.get(sections.about)}
			>
				<h2 class="relative mb-6 inline-block text-2xl font-bold text-text">
					About Me
					<span
						class="absolute bottom-0 left-0 h-1 w-0 bg-blue transition-all duration-500 group-hover:w-full"
					></span>
				</h2>
				<div class="space-y-4">
					<p
						class="text-text-muted leading-relaxed"
						in:fly={{ y: 10, duration: 500, delay: 300, easing: backOut }}
					>
						Born on August 6th, 2009, in Jordan. I'm a student and full-stack developer looking to
						improve my skills each day.
					</p>
				</div>
			</section>

			<section
				bind:this={sections.activities}
				class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-green/20 md:col-span-7"
				use:viewport.intersection
				class:animate-slide-up={$viewport.get(sections.activities)}
			>
				<h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
					Current Activities
					<span
						class="absolute bottom-0 left-0 h-1 w-0 bg-green transition-all duration-500 group-hover:w-full"
					></span>
				</h2>

				{#if regularActivities.length > 0}
					<div class="space-y-4">
						{#each regularActivities as activity, i}
							<div
								class="bg-base-dark/50 transform rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-surface0/70 hover:shadow-md"
								in:fly={{ y: 20, duration: 400, delay: 300 + i * 100, easing: backOut }}
							>
								<div class="flex items-start gap-4">
									{#if activity.assets?.large_image}
										<img
											src={activity.assets.large_image}
											alt={activity.name}
											class="h-16 w-16 rounded-md object-cover shadow-sm transition-transform duration-300 hover:rotate-3 hover:scale-110"
										/>
									{/if}
									<div class="flex-1">
										<div class="flex items-center justify-between">
											<span class="font-medium text-text">{activity.name}</span>
											{#if activity.timestamps?.start}
												<span class="flex items-center gap-1 text-sm text-green">
													<span class="inline-block h-2 w-2 animate-pulse rounded-full bg-green"
													></span>
													<span class="group relative">
														{#if activity.type === 2 && activity.timestamps.end}
															<span class="transition-opacity duration-300">
																{getTimeUntil(activity.timestamps.end)}
															</span>
															<span
																class="absolute -top-8 right-0 whitespace-nowrap rounded-md bg-surface0/90 px-2 py-1 text-xs opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100"
															>
																{formatDuration(activity.timestamps.start, activity.timestamps.end)}
															</span>
														{:else}
															<span class="transition-opacity duration-300">
																{getElapsedTime(activity.timestamps.start)}
															</span>
															<span
																class="absolute -top-8 right-0 whitespace-nowrap rounded-md bg-surface0/90 px-2 py-1 text-xs opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100"
															>
																Started: {new Date(activity.timestamps.start).toLocaleTimeString()}
															</span>
														{/if}
													</span>
												</span>
											{/if}
										</div>

										{#if activity.type === 2 && activity.timestamps?.start && activity.timestamps?.end}
											{@const progress = getSongProgress(
												activity.timestamps.start,
												activity.timestamps.end
											)}
											{#key currentTime}
												<div class="mb-1.5 mt-2.5">
													<div
														class="relative h-1.5 w-full overflow-hidden rounded-full bg-surface0/50"
													>
														<div
															class="h-full rounded-full bg-gradient-to-r from-green/70 to-green/90 transition-[width] duration-500 ease-out"
															style="width: {progress}%;"
														>
															<div
																class="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
																style="background-size: 200% 100%;"
															></div>
														</div>
													</div>
												</div>
											{/key}
										{:else if activity.timestamps?.start && !activity.timestamps?.end}
											<div class="mb-1.5 mt-2.5">
												<div
													class="relative h-1.5 w-full overflow-hidden rounded-full bg-surface0/50"
												>
													<div
														class="relative h-full animate-progress-indeterminate rounded-full bg-gradient-to-r from-green/70 to-green/90"
													></div>
												</div>
											</div>
										{/if}

										{#if activity.details}
											<p class="text-text-muted mt-1">{activity.details}</p>
										{/if}
										{#if activity.state}
											<p class="text-text-muted mt-1 text-sm">{activity.state}</p>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div
						class="rounded-lg bg-surface0/30 p-6 backdrop-blur-sm"
						in:slide={{ duration: 400, delay: 300 }}
					>
						<p class="text-text-muted text-center">Currently not doing anything</p>
					</div>
				{/if}
			</section>

			<section
				bind:this={sections.languages}
				id="languages"
				class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-yellow/20 md:col-span-8"
				use:viewport.intersection
				class:animate-slide-up={$viewport.get(sections.languages)}
			>
				<h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
					Programming Languages
					<span
						class="absolute bottom-0 left-0 h-1 w-0 bg-yellow transition-all duration-500 group-hover:w-full"
					></span>
				</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					{#each languages as lang, i}
						<div
							class="bg-base-dark/30 group rounded-lg p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:bg-surface0/50 hover:shadow-md"
							in:fly={{ y: 20, duration: 400, delay: 200 + i * 100, easing: backOut }}
						>
							<div class="mb-3 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<img
										src={lang.icon}
										alt={lang.name}
										class="h-8 w-8 transition-transform duration-300 group-hover:rotate-12"
									/>
									<a
										href={lang.link}
										target="_blank"
										rel="noopener noreferrer"
										class="text-lg text-text transition-colors duration-300 hover:text-blue"
									>
										{lang.name}
									</a>
								</div>
								<span class="text-text-muted font-medium">{lang.proficiency}%</span>
							</div>
							<div class="bg-base-dark/50 relative h-3 w-full overflow-hidden rounded-full">
								<div
									class="absolute inset-0 bg-gradient-to-r from-blue to-lavender opacity-20"
								></div>
								<div
									class="relative h-full rounded-full bg-gradient-to-r from-blue to-lavender opacity-70 transition-opacity duration-300 ease-out group-hover:opacity-100"
									style="width: 0%; --proficiency: {lang.proficiency}%;"
									use:viewport.intersection
									class:animate-proficiency={$viewport.get(sections.languages)}
									style:animation-delay={$viewport.get(sections.languages)
										? i * 100 + 'ms'
										: undefined}
								>
									<div class="absolute inset-0 opacity-50">
										<div
											class="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"
											style="background-size: 200% 100%"
										></div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section
				bind:this={sections.skills}
				id="skills"
				class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-pink/20 md:col-span-4"
				use:viewport.intersection
				class:animate-slide-up={$viewport.get(sections.skills)}
			>
				<h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
					Skills
					<span
						class="absolute bottom-0 left-0 h-1 w-0 bg-pink transition-all duration-500 group-hover:w-full"
					></span>
				</h2>
				<div class="grid grid-cols-2 gap-4">
					{#each skills as skill, i}
						<a
							href={skill.link}
							target="_blank"
							rel="noopener noreferrer"
							class="bg-base-dark/50 group flex flex-col items-center gap-2 rounded-lg p-4
									transition-all duration-300 hover:scale-105 hover:bg-mantle hover:shadow-lg
                                    focus:outline-none focus:ring-2 focus:ring-pink/50"
							in:fly={{ y: 15, x: 5, duration: 400, delay: 100 + i * 75, easing: elasticOut }}
						>
							<div class="relative">
								<img
									src={skill.icon}
									alt={skill.name}
									class="h-10 w-10 transition-transform duration-500 group-hover:scale-110"
								/>
							</div>
							<span
								class="text-center text-sm font-medium transition-colors duration-300 group-hover:text-pink"
								>{skill.name}</span
							>
						</a>
					{/each}
				</div>

				<div class="mt-8 border-t border-surface0/30 pt-4">
					<h3 class="mb-3 text-lg font-medium text-pink/80">Currently Learning</h3>
					<div class="flex flex-wrap gap-2">
						{#each ['Rust'] as skill, i}
							<span class="rounded-full bg-mantle/50 px-2 py-1 text-xs">{skill}</span>
						{/each}
					</div>
				</div>
			</section>

			<section
				bind:this={sections.projects}
				id="projects"
				class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-teal/20 md:col-span-12"
				use:viewport.intersection
				class:animate-slide-up={$viewport.get(sections.projects)}
			>
				<h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
					My Projects
					<span
						class="absolute bottom-0 left-0 h-1 w-0 bg-teal transition-all duration-500 group-hover:w-full"
					></span>
				</h2>

				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each projects as project, i}
						<div
							class="bg-base-dark/30 group relative h-full overflow-hidden rounded-lg p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:bg-surface0/50 hover:shadow-md"
							in:fly={{ y: 20, duration: 400, delay: 200 + i * 150, easing: backOut }}
						>
							<div
								class="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
							></div>

							<div class="mb-4 flex items-center gap-4">
								<div class="relative">
									<div
										class="absolute inset-0 rounded-md bg-gradient-to-br from-teal/40 to-blue/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
									></div>
									<img
										src={project.logo ??
											'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/github/github-original.svg'}
										alt={project.name}
										class="relative h-12 w-12 rounded-md bg-base/50 object-cover p-1 transition-transform duration-300 group-hover:rotate-6"
									/>
								</div>
								<a
									href={project.link}
									target="_blank"
									rel="noopener noreferrer"
									class="text-xl font-medium text-text transition-colors duration-300 hover:text-teal"
								>
									{project.name}
								</a>

								<a
									href={project.link}
									target="_blank"
									rel="noopener noreferrer"
									class="ml-auto rounded-full bg-surface0/50 p-2 opacity-0 transition-opacity duration-300 hover:bg-teal/70 hover:text-crust group-hover:opacity-100"
									aria-label="View project"
								>
									<ExternalLink class="h-5 w-5" />
								</a>
							</div>

							<p class="text-text-muted mb-4 min-h-[60px]">{project.description}</p>

							<div class="mb-4 flex flex-wrap gap-2">
								{#each project.techs || [] as tech}
									<span class="rounded-full bg-mantle/50 px-2 py-1 text-xs">{tech}</span>
								{/each}
							</div>

							{#if project.wakatimeStats}
								<div
									class="mt-auto flex items-center gap-2 rounded-lg bg-surface0/20 p-3 transition-colors duration-300 group-hover:bg-surface0/40"
								>
									<div class="h-3 w-3 animate-pulse rounded-full bg-teal"></div>
									<span class="text-text-muted text-sm">
										Coding time: <span class="font-medium text-teal"
											>{project.wakatimeStats.text}</span
										>
										<span class="ml-1 text-xs opacity-70"
											>({project.wakatimeStats.percent.toFixed(1)}%)</span
										>
									</span>
								</div>
							{:else if project.wakatimeName}
								<div class="mt-auto flex items-center gap-2 rounded-lg bg-surface0/20 p-3">
									<div class="h-3 w-3 animate-pulse rounded-full bg-surface0"></div>
									<span class="text-text-muted text-sm">Loading WakaTime stats...</span>
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<div class="mt-8 flex justify-center">
					<a
						href="https://github.com/vMohammad24"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 rounded-lg bg-surface0/40 px-6 py-3 transition-all duration-300 hover:-translate-y-1 hover:bg-teal/70 hover:text-crust focus:outline-none focus:ring-2 focus:ring-teal/50"
					>
						<span>More Projects on GitHub</span>
						<ArrowRight class="h-5 w-5" />
					</a>
				</div>
			</section>

			<section
				bind:this={sections.wakatime}
				id="wakatime"
				class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-red/20 md:col-span-12"
				use:viewport.intersection
				class:animate-slide-up={$viewport.get(sections.wakatime)}
			>
				<h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
					Weekly Coding Stats
					<span
						class="absolute bottom-0 left-0 h-1 w-0 bg-red transition-all duration-500 group-hover:w-full"
					></span>
				</h2>
				{#if wakaTimeError}
					<p class="text-center text-red">{wakaTimeError}</p>
				{:else if !wakaTimeData}
					<div class="flex justify-center">
						<div
							class="h-48 w-48 animate-spin rounded-full border-4 border-crust border-t-surface0"
						></div>
					</div>
				{:else}
					{@const chartData = prepareChartData(wakaTimeData.data.languages)}
					<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
						<div class="rounded-lg bg-surface0/20 px-4 py-3 backdrop-blur-sm">
							<span class="text-text-muted block text-sm">Total Coding Time</span>
							<span class="text-2xl font-bold text-red"
								>{wakaTimeData.data.human_readable_total}</span
							>
						</div>
						<div class="flex flex-wrap gap-4">
							<div class="rounded-lg bg-surface0/20 px-4 py-3 backdrop-blur-sm">
								<span class="text-text-muted block text-sm">Daily Average</span>
								<span class="font-medium">{wakaTimeData.data.human_readable_daily_average}</span>
							</div>
							<div class="rounded-lg bg-surface0/20 px-4 py-3 backdrop-blur-sm">
								<span class="text-text-muted block text-sm">Range</span>
								<span class="font-medium">{wakaTimeData.data.human_readable_range}</span>
							</div>
						</div>
					</div>

					<div
						class="grid grid-cols-1 items-start gap-8 md:grid-cols-2"
						in:fade={{ duration: 800 }}
					>
						<div class="relative">
							<svg
								viewBox="0 0 120 120"
								class="mx-auto w-full max-w-md -rotate-90 transform transition-transform duration-1000 hover:rotate-0"
							>
								{#each chartData.segments as segment, i}
									{@const offset = chartData.segments
										.slice(0, i)
										.reduce((acc, s) => acc + s.percent, 0)}

									<circle
										cx={center}
										cy={center}
										r={radius}
										fill="none"
										stroke={segment.color}
										stroke-width={strokeWidth}
										stroke-dasharray="0 1000"
										stroke-dashoffset={-((offset * 2 * Math.PI * radius) / 100)}
										class="opacity-0 transition-all duration-1000"
										use:viewport.intersection
										class:animate-chart-animated={$viewport.get(sections.wakatime)}
										style="--final-dasharray: {calculateStrokeDashArray(
											segment.percent,
											radius
										)}; animation-delay: {i * 200}ms;"
									/>
								{/each}
							</svg>
							<div class="absolute inset-0 flex items-center justify-center">
								<div
									class="flex h-28 w-28 transform flex-col items-center justify-center rounded-full bg-base/60 text-center backdrop-blur-sm transition-transform duration-500 hover:scale-110"
								>
									<p class="text-2xl font-bold">{chartData.totalTime}</p>
									<p class="text-text-muted text-xs">This Week</p>
								</div>
							</div>
						</div>

						<div class="flex flex-col gap-5">
							<div class="grid grid-cols-2 gap-4">
								{#each chartData.segments.slice(0, 6) as segment, i}
									<div
										class="flex transform items-center gap-3 rounded-lg bg-surface0/30 p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-surface0/60 hover:shadow-md"
										in:fly={{ y: 15, duration: 400, delay: 300 + i * 100, easing: backOut }}
									>
										<div
											class="h-4 w-4 rounded-full"
											style="background-color: {segment.color}"
										></div>
										<div class="min-w-0 flex-1">
											<p class="truncate font-medium">{segment.name}</p>
											<div class="text-text-muted flex justify-between text-sm">
												<span>{segment.text}</span>
												<span class="text-xs">{segment.percent.toFixed(1)}%</span>
											</div>
										</div>
									</div>
								{/each}
							</div>

							{#if wakaTimeData.data.languages.length > 6}
								<details class="group">
									<summary class="text-text-muted cursor-pointer list-none text-sm hover:text-text">
										<span class="flex items-center gap-1">
											<ChevronDown
												class="h-4 w-4 transition-transform duration-300 group-open:-rotate-180"
											/>
											Show all {wakaTimeData.data.languages.length} languages
										</span>
									</summary>
									<div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
										{#each wakaTimeData.data.languages.slice(6) as lang, i}
											<div
												class="flex items-center gap-2 rounded bg-surface0/20 p-2"
												in:fly={{ y: 10, duration: 300, delay: 100 + i * 50, easing: backOut }}
											>
												<div
													class="h-3 w-3 rounded-full"
													style="background-color: {lang.color || '#ccc'}"
												></div>
												<span class="truncate text-sm">{lang.name}</span>
												<span class="text-text-muted ml-auto whitespace-nowrap text-xs"
													>{lang.text}</span
												>
											</div>
										{/each}
									</div>
								</details>
							{/if}
						</div>
					</div>

					{#if wakaTimeData.data.projects && wakaTimeData.data.projects.length > 0}
						<div class="mt-8 border-t border-surface0/30 pt-6">
							<h3 class="mb-4 text-xl font-medium">Project Distribution</h3>
							<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{#each wakaTimeData.data.projects.slice(0, 9) as project, i}
									<div
										class="flex items-center justify-between rounded-lg bg-surface0/20 p-3 transition-all duration-300 hover:-translate-y-1 hover:bg-surface0/40"
										in:fly={{ y: 10, duration: 300, delay: 100 + i * 75, easing: backOut }}
									>
										<div class="flex items-center gap-3">
											<div class="flex h-8 w-8 items-center justify-center rounded-md bg-base/70">
												<span class="text-xs font-bold"
													>{project.name.substring(0, 2).toUpperCase()}</span
												>
											</div>
											<div>
												<p class="max-w-[150px] truncate font-medium">{project.name}</p>
												<p class="text-text-muted text-xs">{project.text}</p>
											</div>
										</div>
										<div
											class="flex h-8 w-8 items-center justify-center rounded-full bg-red/10 text-xs font-medium text-red"
										>
											{project.percent.toFixed(0)}%
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{/if}
			</section>

			<section
				bind:this={sections.socials}
				id="socials"
				class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-mauve/20 md:col-span-12"
				use:viewport.intersection
				class:animate-slide-up={$viewport.get(sections.socials)}
			>
				<h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
					My Socials
					<span
						class="absolute bottom-0 left-0 h-1 w-0 bg-mauve transition-all duration-500 group-hover:w-full"
					></span>
				</h2>

				<div
					class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5"
					in:fly={{ y: 15, duration: 400, delay: 200, easing: backOut }}
				>
					{#each socials as social}
						<a
							href={social.link}
							target="_blank"
							rel="noopener noreferrer"
							class="flex flex-col items-center gap-3 rounded-md p-5 text-white shadow-lg transition-all duration-300 hover:scale-105"
							style="background: linear-gradient(to right, {social.gradientFrom}, {social.gradientTo});"
						>
							<div class="relative">
								<img
									src={social.icon}
									alt={social.name}
									class="h-8 w-8 transition-transform duration-500 group-hover:scale-110"
									style="filter: brightness(0) invert(1);"
								/>
							</div>
							<span>{social.name}</span>
						</a>
					{/each}
				</div>
			</section>

			<footer
				bind:this={sections.footer}
				id="footer"
				class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-lavender/20 md:col-span-12"
				use:viewport.intersection
				class:animate-slide-up={$viewport.get(sections.footer)}
			>
				<div class="text-text-muted flex flex-col items-center gap-4 text-center">
					<p>© {new Date().getFullYear()} vMohammad. All rights reserved.</p>
					<p>
						This website is open source on
						<a
							href="https://github.com/vMohammad24/portfolio"
							target="_blank"
							rel="noopener noreferrer"
							class="group relative inline-block text-subtext0 transition-colors duration-300 hover:text-mauve"
						>
							GitHub
							<span
								class="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 transform bg-mauve/30 transition-transform duration-300 group-hover:scale-x-100"
							></span>
						</a>
					</p>
				</div>
			</footer>
		</div>
	{:else}
		<div class="relative z-10 mx-auto max-w-3xl" in:fade={{ duration: 500 }}>
			<section
				class="mb-8 rounded-lg bg-gradient-to-br from-base/80 to-surface0/30 p-6 shadow-lg backdrop-blur-sm"
			>
				<div class="flex items-center gap-6">
					<div class="h-24 w-24 animate-pulse rounded-full bg-surface0/50"></div>
					<div class="space-y-2">
						<div class="h-8 w-32 animate-pulse rounded bg-surface0/50"></div>
						<div class="h-6 w-24 animate-pulse rounded bg-surface0/50"></div>
					</div>
				</div>
			</section>

			<section
				class="mb-8 rounded-lg bg-gradient-to-br from-base/80 to-surface0/30 p-6 shadow-lg backdrop-blur-sm"
			>
				<div class="h-6 w-32 animate-pulse rounded bg-surface0/50"></div>
				<div class="mt-4 h-4 w-3/4 animate-pulse rounded bg-surface0/50"></div>
			</section>

			<section
				class="mb-8 rounded-lg bg-gradient-to-br from-base/80 to-surface0/30 p-6 shadow-lg backdrop-blur-sm"
			>
				<div class="mb-4 h-6 w-40 animate-pulse rounded bg-surface0/50"></div>
				<div class="space-y-4">
					{#each Array(2) as _, i}
						<div
							class="rounded-lg bg-surface0/50 p-4"
							in:fly={{ y: 10, duration: 300, delay: i * 100 }}
						>
							<div class="flex gap-4">
								<div class="h-16 w-16 animate-pulse rounded-md bg-crust"></div>
								<div class="flex-1 space-y-2">
									<div class="h-5 w-1/2 animate-pulse rounded bg-crust"></div>
									<div class="h-4 w-3/4 animate-pulse rounded bg-crust"></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section
				class="mb-8 rounded-lg bg-gradient-to-br from-base/80 to-surface0/30 p-6 shadow-lg backdrop-blur-sm"
			>
				<div class="mb-4 h-6 w-48 animate-pulse rounded bg-surface0/50"></div>
				<div class="space-y-4">
					{#each Array(5) as _, i}
						<div in:fly={{ y: 10, duration: 300, delay: i * 80 }}>
							<div class="h-5 w-32 animate-pulse rounded bg-surface0/50"></div>
							<div class="mt-1 h-2 w-full animate-pulse rounded-full bg-surface0/50"></div>
						</div>
					{/each}
				</div>
			</section>

			<section
				class="mb-8 rounded-lg bg-gradient-to-br from-base/80 to-surface0/30 p-6 shadow-lg backdrop-blur-sm"
			>
				<div class="mb-4 h-6 w-40 animate-pulse rounded bg-surface0/50"></div>
				<div class="flex flex-wrap gap-3">
					{#each Array(7) as _, i}
						<div
							class="h-8 w-24 animate-pulse rounded-full bg-surface0/50"
							in:fly={{ y: 10, x: 5, duration: 300, delay: i * 60 }}
						></div>
					{/each}
				</div>
			</section>

			<section
				class="rounded-lg bg-gradient-to-br from-base/80 to-surface0/30 p-6 shadow-lg backdrop-blur-sm"
			>
				<div class="mb-4 h-6 w-32 animate-pulse rounded bg-surface0/50"></div>
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
					{#each Array(5) as _, i}
						<div
							class="h-10 animate-pulse rounded-md bg-surface0/50"
							in:fly={{ y: 10, x: 5, duration: 300, delay: i * 100 }}
						></div>
					{/each}
				</div>
			</section>
		</div>
	{/if}
</main>
