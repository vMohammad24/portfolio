<script lang="ts">
	import { lanyardStore } from '$lib/states/lanyard';
	import { onMount } from 'svelte';

	const birthday = new Date('2009-08-06');
	let age = 0;

	onMount(() => {
		const updateAge = () => {
			const now = new Date();
			const diff = now.getTime() - birthday.getTime();
			age = diff / (1000 * 60 * 60 * 24 * 365.25);
		};

		updateAge();
		const interval = setInterval(updateAge, 5000);
		return () => clearInterval(interval);
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
		const start = timestamp;
		const now = Date.now();
		const elapsed = Math.floor((now - start) / 1000);

		if (elapsed < 60) return 'just now';
		if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
		if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
		return `${Math.floor(elapsed / 86400)}d ago`;
	}

	$: customStatus = $lanyardStore?.activities?.find((activity) => activity.type === 4);

	$: regularActivities = $lanyardStore?.activities?.filter((activity) => activity.type !== 4) || [];
</script>

<main class="min-h-screen bg-gradient-to-br from-base to-crust p-8 text-text">
	{#if $lanyardStore}
		<div class="mx-auto max-w-4xl space-y-6">
			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02]"
			>
				<div class="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
					<img
						src="https://cdn.discordapp.com/avatars/{$lanyardStore.discord_user.id}/{$lanyardStore
							.discord_user.avatar}.webp?size=1024"
						alt="Avatar"
						class="h-32 w-32 rounded-full border-4 border-crust shadow-lg"
					/>
					<div class="text-center sm:text-left">
						<h1 class="text-4xl font-bold">Mohammad</h1>
						<p class="text-text-muted text-xl font-medium">{age.toFixed(2)} years old</p>
						<p class="text-text-muted mt-2">{$lanyardStore.discord_user.username}</p>
					</div>
				</div>
			</section>

			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02]"
			>
				<h2 class="mb-6 text-2xl font-bold text-text">About Me</h2>
				<p class="text-text-muted">Born on August 6th, 2009.</p>
				{#if customStatus}
					<p class="text-text-muted mt-2">
						Status: {customStatus.state || customStatus.details || 'No status'}
					</p>
				{/if}
			</section>

			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02]"
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
												<span class="text-text-muted text-sm">
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

			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02]"
			>
				<h2 class="mb-6 text-2xl font-bold text-text">Programming Languages</h2>
				<div class="space-y-6">
					{#each languages as lang}
						<div class="group">
							<div class="flex items-center justify-between">
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
							<div class="bg-base-dark/50 mt-2 h-3 rounded-full">
								<div
									class="h-full rounded-full bg-crust transition-all group-hover:bg-gradient-to-r group-hover:from-crust group-hover:to-surface0"
									style="width: {lang.proficiency}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02]"
			>
				<h2 class="mb-6 text-2xl font-bold text-text">Skills & Technologies</h2>
				<div class="flex flex-wrap gap-4">
					{#each skills as skill}
						<a
							href={skill.link}
							target="_blank"
							rel="noopener noreferrer"
							class="bg-base-dark/50 flex items-center gap-3 rounded-full px-6 py-3 text-text transition-all hover:scale-105 hover:bg-crust hover:shadow-lg"
						>
							<img src={skill.icon} alt={skill.name} class="h-5 w-5" />
							{skill.name}
						</a>
					{/each}
				</div>
			</section>

			<section
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02]"
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

			<footer
				class="transform rounded-xl bg-base/80 p-8 shadow-2xl transition-all hover:scale-[1.02]"
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
