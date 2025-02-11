<script lang="ts">
	import { fetchWakaTimeStats, prepareChartData, type WakaTimeStats } from '$lib/client/wakatime';
	import { lanyardStore } from '$lib/states/lanyard';
	import { onMount } from 'svelte';

	const birthday = new Date('2009-08-06');
	let age = 0;
	const radius = 50;
	const strokeWidth = 5;
	const center = 60;
	let currentTime = Date.now();
	let wakaTimeData: WakaTimeStats | null = null;
	let wakaTimeError: string | null = null;

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
		}, 1000);

		try {
			(async () => (wakaTimeData = await fetchWakaTimeStats()))();
		} catch (error) {
			wakaTimeError = 'Failed to load WakaTime stats';
		}

		return () => {
			clearInterval(interval);
			clearInterval(timeInterval);
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

	function getElapsedTime(timestamp: number) {
		const elapsed = Math.floor((currentTime - timestamp) / 1000);
		const hours = Math.floor(elapsed / 3600);
		const minutes = Math.floor((elapsed % 3600) / 60);
		const seconds = elapsed % 60;

		if (hours === 0) {
			return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	}

	$: customStatus = $lanyardStore?.activities?.find((activity) => activity.type === 4);

	$: regularActivities = $lanyardStore?.activities?.filter((activity) => activity.type !== 4) || [];

	function calculateStrokeDashArray(percent: number, radius: number): string {
		const circumference = 2 * Math.PI * radius;
		const strokeDasharray = `${(percent * circumference) / 100} ${circumference}`;
		return strokeDasharray;
	}
</script>

<main class="min-h-screen bg-gradient-to-br from-base to-crust p-4 text-text md:p-8">
	{#if $lanyardStore}
		<div class="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-12">
			<!-- hero -->
			<section
				class="relative transform overflow-hidden rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02] md:col-span-12"
			>
				<div
					class="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-crust/20 to-transparent"
				></div>
				<div class="relative z-10 flex flex-col items-center gap-8 md:flex-row">
					<img
						src="https://cdn.discordapp.com/avatars/{$lanyardStore.discord_user.id}/{$lanyardStore
							.discord_user.avatar}.webp?size=1024"
						alt="Avatar"
						class="h-40 w-40 transform rounded-full border-4 border-crust shadow-lg transition-transform hover:rotate-6"
					/>
					<div class="text-center md:text-left">
						<h1
							class="bg-gradient-to-r from-text to-subtext0 bg-clip-text text-5xl font-bold text-transparent"
						>
							Mohammad
						</h1>
						<p class="text-text-muted text-2xl font-medium">{age.toFixed(2)} years old</p>
						<p class="text-text-muted mt-2">{$lanyardStore.discord_user.username}</p>
					</div>
				</div>
			</section>

			<!-- about -->
			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02] md:col-span-5"
			>
				<h2 class="mb-6 text-2xl font-bold text-text">About Me</h2>
				<p class="text-text-muted">Born on August 6th, 2009.</p>
				{#if customStatus}
					<p class="text-text-muted mt-2">
						Status: {customStatus.state || customStatus.details || 'No status'}
					</p>
				{/if}
			</section>

			<!-- activities -->
			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02] md:col-span-7"
			>
				<h2 class="mb-6 text-2xl font-bold text-text">Current Activities</h2>
				{#if regularActivities.length > 0}
					<div class="space-y-4">
						{#each regularActivities as activity}
							<div class="bg-base-dark/50 hover:bg-base-dark rounded-lg p-6 transition-all">
								<div class="flex items-start gap-4">
									{#if activity.assets?.large_image}
										<img
											src={activity.assets.large_image}
											alt={activity.name}
											class="h-16 w-16 rounded-md"
										/>
									{/if}
									<div class="flex-1">
										<div class="flex items-center justify-between">
											<span class="font-medium text-text">{activity.name}</span>
											{#if activity.timestamps?.start}
												<span class="text-sm text-green">
													{getElapsedTime(activity.timestamps.start)}
												</span>
											{/if}
										</div>
										{#if activity.state}
											<p class="text-text-muted">{activity.state}</p>
										{/if}
										{#if activity.details}
											<p class="text-text-muted text-sm">{activity.details}</p>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-text-muted">No current activities</p>
				{/if}
			</section>

			<!-- languages -->
			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02] md:col-span-8"
			>
				<h2 class="mb-6 text-2xl font-bold text-text">Programming Languages</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					{#each languages as lang}
						<div class="bg-base-dark/30 hover:bg-base-dark/50 group rounded-lg p-4 transition-all">
							<div class="mb-3 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<img src={lang.icon} alt={lang.name} class="h-8 w-8" />
									<a
										href={lang.link}
										target="_blank"
										rel="noopener noreferrer"
										class="text-lg text-text transition-colors hover:text-subtext0"
									>
										{lang.name}
									</a>
								</div>
								<span class="text-text-muted font-medium">{lang.proficiency}%</span>
							</div>
							<div class="bg-base-dark/50 relative h-3 w-full overflow-hidden rounded-full">
								<div
									class="absolute inset-0 bg-gradient-to-r from-crust to-surface0 opacity-20"
								></div>
								<div
									class="relative h-full rounded-full bg-gradient-to-r from-crust to-surface0 transition-all duration-300 ease-out group-hover:translate-x-1"
									style="width: {lang.proficiency}%"
								>
									<div class="absolute inset-0 opacity-50">
										<div
											class="animate-shimmer h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
											style="background-size: 200% 100%"
										></div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- skills -->
			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02] md:col-span-4"
			>
				<h2 class="mb-6 text-2xl font-bold text-text">Skills</h2>
				<div class="grid grid-cols-2 gap-3">
					{#each skills as skill}
						<a
							href={skill.link}
							target="_blank"
							rel="noopener noreferrer"
							class="bg-base-dark/50 flex flex-col items-center gap-2 rounded-lg p-4
									transition-all hover:scale-105 hover:bg-crust hover:shadow-lg"
						>
							<img src={skill.icon} alt={skill.name} class="h-8 w-8" />
							<span class="text-center text-sm">{skill.name}</span>
						</a>
					{/each}
				</div>
			</section>

			<!-- wakatime -->
			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02] md:col-span-12"
			>
				<h2 class="mb-6 text-2xl font-bold text-text">Weekly Coding Stats</h2>
				{#if wakaTimeError}
					<p class="text-center text-red">{wakaTimeError}</p>
				{:else if !wakaTimeData}
					<div class="flex justify-center">
						<div
							class="h-48 w-48 animate-spin rounded-full border-4 border-crust border-t-surface0"
						></div>
					</div>
				{:else}
					{@const chartData = prepareChartData(wakaTimeData.languages)}
					<div class="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
						<div class="relative">
							<svg viewBox="0 0 120 120" class="mx-auto w-full max-w-md -rotate-90 transform">
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
										stroke-dasharray={calculateStrokeDashArray(segment.percent, radius)}
										stroke-dashoffset={-((offset * 2 * Math.PI * radius) / 100)}
										class="transition-all duration-500"
									/>
								{/each}
							</svg>
							<div class="absolute inset-0 flex items-center justify-center">
								<div class="text-center">
									<p class="text-2xl font-bold">{chartData.totalTime}</p>
									<p class="text-text-muted text-sm">This Week</p>
								</div>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4">
							{#each chartData.segments as segment}
								<div class="flex items-center gap-2">
									<div class="h-3 w-3 rounded-full" style="background-color: {segment.color}"></div>
									<div>
										<p class="font-medium">{segment.name}</p>
										<p class="text-text-muted text-sm">{segment.timeSpent}</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</section>

			<!-- socials -->
			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02] md:col-span-12"
			>
				<h2 class="mb-6 text-2xl font-bold text-text">My Socials</h2>
				<div class="grid grid-cols-2 gap-6 md:grid-cols-3">
					<a
						href="https://discord.com/users/{$lanyardStore.discord_user.id}"
						class="flex items-center gap-2 rounded-md bg-[#5865F2] p-2 text-white transition-all hover:scale-105 hover:opacity-90"
					>
						<img
							src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/discord.svg"
							alt="Discord"
							class="h-5 w-5"
						/>
						<span>Discord</span>
					</a>
					<a
						href="https://github.com/vMohammad24"
						class="flex items-center gap-2 rounded-md bg-[#24292e] p-2 text-white transition-all hover:scale-105 hover:opacity-90"
					>
						<img
							src="https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/github/github-original.svg"
							alt="GitHub"
							class="h-5 w-5"
						/>
						<span>GitHub</span>
					</a>
					<a
						href="https://x.com/vMohammad_"
						class="flex items-center gap-2 rounded-md bg-black p-2 text-white transition-all hover:scale-105 hover:opacity-90"
					>
						<img
							src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/x.svg"
							alt="Twitter"
							class="h-5 w-5 invert"
						/>
						<span>Twitter</span>
					</a>
					<a
						href="https://instagram.com/vmohammad42"
						class="flex items-center gap-2 rounded-md bg-[#E4405F] p-2 text-white transition-all hover:scale-105 hover:opacity-90"
					>
						<img
							src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/instagram.svg"
							alt="Instagram"
							class="h-5 w-5"
						/>
						<span>Instagram</span>
					</a>
					<a
						href="https://t.me/vMohammad42"
						class="flex items-center gap-2 rounded-md bg-[#0088cc] p-2 text-white transition-all hover:scale-105 hover:opacity-90"
					>
						<img
							src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/telegram.svg"
							alt="Telegram"
							class="h-5 w-5"
						/>
						<span>Telegram</span>
					</a>
				</div>
			</section>

			<!-- footer -->
			<footer
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02] md:col-span-12"
			>
				<div class="text-text-muted flex flex-col items-center gap-2 text-center">
					<p>© {new Date().getFullYear()} vMohammad. All rights reserved.</p>
					<p>
						This website is open source on
						<a
							href="https://github.com/vMohammad24/portfolio"
							target="_blank"
							rel="noopener noreferrer"
							class="text-subtext0 underline hover:opacity-80"
						>
							GitHub
						</a>
					</p>
				</div>
			</footer>
		</div>
	{:else}
		<div class="mx-auto max-w-3xl">
			<section class="mb-8 rounded-lg bg-base p-6 shadow-lg">
				<div class="flex items-center gap-6">
					<div class="bg-base-dark h-24 w-24 animate-pulse rounded-full"></div>
					<div class="space-y-2">
						<div class="bg-base-dark h-8 w-32 animate-pulse rounded"></div>
						<div class="bg-base-dark h-6 w-24 animate-pulse rounded"></div>
					</div>
				</div>
			</section>

			<section class="mb-8 rounded-lg bg-base p-6 shadow-lg">
				<div class="bg-base-dark h-6 w-32 animate-pulse rounded"></div>
				<div class="bg-base-dark mt-4 h-4 w-3/4 animate-pulse rounded"></div>
			</section>

			<section class="mb-8 rounded-lg bg-base p-6 shadow-lg">
				<div class="bg-base-dark mb-4 h-6 w-40 animate-pulse rounded"></div>
				<div class="space-y-4">
					{#each Array(2) as _}
						<div class="bg-base-dark rounded-lg p-4">
							<div class="flex gap-4">
								<div class="h-16 w-16 animate-pulse rounded-md bg-base"></div>
								<div class="flex-1 space-y-2">
									<div class="h-5 w-1/2 animate-pulse rounded bg-base"></div>
									<div class="h-4 w-3/4 animate-pulse rounded bg-base"></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section class="mb-8 rounded-lg bg-base p-6 shadow-lg">
				<div class="bg-base-dark mb-4 h-6 w-48 animate-pulse rounded"></div>
				<div class="space-y-4">
					{#each Array(5) as _}
						<div>
							<div class="bg-base-dark h-5 w-32 animate-pulse rounded"></div>
							<div class="bg-base-dark mt-1 h-2 w-full animate-pulse rounded-full"></div>
						</div>
					{/each}
				</div>
			</section>

			<section class="mb-8 rounded-lg bg-base p-6 shadow-lg">
				<div class="bg-base-dark mb-4 h-6 w-40 animate-pulse rounded"></div>
				<div class="flex flex-wrap gap-3">
					{#each Array(7) as _}
						<div class="bg-base-dark h-8 w-24 animate-pulse rounded-full"></div>
					{/each}
				</div>
			</section>

			<section class="rounded-lg bg-base p-6 shadow-lg">
				<div class="bg-base-dark mb-4 h-6 w-32 animate-pulse rounded"></div>
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
					{#each Array(5) as _}
						<div class="bg-base-dark h-10 animate-pulse rounded-md"></div>
					{/each}
				</div>
			</section>
		</div>
	{/if}
</main>
