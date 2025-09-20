<script lang="ts">
  import type { Contribution, GitHubContributions } from "$lib/types";
  import { fade } from "svelte/transition";

  interface Props {
    githubContributions: GitHubContributions | null;
    githubError: string | null;
  }

  const { githubContributions, githubError }: Props = $props();

  function getContributionColor(level: number): string {
    switch (level) {
      case 0:
        return "rgb(22, 27, 34)";
      case 1:
        return "rgb(49, 116, 143)";
      case 2:
        return "rgb(116, 199, 236)";
      case 3:
        return "rgb(166, 227, 161)";
      case 4:
        return "rgb(135, 216, 142)";
      default:
        return "rgb(22, 27, 34)";
    }
  }

  function formatContributionDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getTotalContributions(): number {
    if (!githubContributions) return 0;
    return Object.values(githubContributions.total).reduce(
      (sum, total) => sum + total,
      0
    );
  }
  function getCurrentStreak(): number {
    if (!githubContributions) return 0;

    const today = new Date();
    let streak = 0;
    const currentDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();

      let found = false;

      if (githubContributions.contributions[year]?.[month]?.[day]) {
        const contribution =
          githubContributions.contributions[year][month][day];
        if (contribution && contribution.count > 0) {
          streak++;
          found = true;
        }
      }

      if (!found) break;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }
  function getMaxContributionsInDay(): number {
    if (!githubContributions) return 0;
    let max = 0;
    for (const year of Object.values(githubContributions.contributions)) {
      for (const month of Object.values(year)) {
        for (const day of Object.values(month)) {
          if (day && day.count > max) max = day.count;
        }
      }
    }
    return max;
  }

  function getLongestStreak(): number {
    if (!githubContributions) return 0;
    let longestStreak = 0;
    let currentStreak = 0;
    const allDates: { date: Date; count: number }[] = [];
    for (const [year, yearData] of Object.entries(
      githubContributions.contributions
    )) {
      for (const [month, monthData] of Object.entries(yearData)) {
        for (const [day, contribution] of Object.entries(monthData)) {
          allDates.push({
            date: new Date(
              Number.parseInt(year),
              Number.parseInt(month) - 1,
              Number.parseInt(day)
            ),
            count: contribution?.count || 0,
          });
        }
      }
    }

    allDates.sort((a, b) => a.date.getTime() - b.date.getTime());

    for (const { count } of allDates) {
      if (count > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return longestStreak;
  }

  function getContributionsForYear(year: number): Contribution[] {
    if (!githubContributions) return [];

    const yearContributions = githubContributions.contributions[year] || {};
    const startDate = new Date(year, 0, 1);
    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - startDate.getDay());

    const contributions: Contribution[] = [];
    const currentDate = new Date(firstSunday);
    for (let week = 0; week < 53; week++) {
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const month = currentDate.getMonth() + 1;
        const dayOfMonth = currentDate.getDate();

        const contribution = yearContributions[month]?.[dayOfMonth];

        contributions.push({
          date: dateStr,
          count: contribution?.count || 0,
          level: contribution?.level || 0,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return contributions;
  }
</script>

<section
  id="github"
  class="transform rounded-xl bg-gradient-to-br from-background/80 to-secondary/40 p-8 shadow-2xl backdrop-blur-xs transition-all duration-500 hover:shadow-green/20 md:col-span-12"
>
  <h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
    GitHub Contributions
    <span
      class="absolute bottom-0 left-0 h-1 w-0 bg-green transition-all duration-500 group-hover:w-full"
    ></span>
  </h2>

  {#if githubError}
    <div class="text-center p-8">
      <p class="text-red">{githubError}</p>
    </div>
  {:else if githubContributions}
    <div class="space-y-6">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          class="rounded-lg bg-secondary/20 p-4 text-center backdrop-blur-xs"
        >
          <div class="text-2xl font-bold text-green">
            {getTotalContributions().toLocaleString()}
          </div>
          <div class="text-gray text-sm">Total</div>
        </div>
        <div
          class="rounded-lg bg-secondary/20 p-4 text-center backdrop-blur-xs"
        >
          <div class="text-2xl font-bold text-green">
            {getCurrentStreak()}
          </div>
          <div class="text-gray text-sm">Current Streak</div>
        </div>
        <div
          class="rounded-lg bg-secondary/20 p-4 text-center backdrop-blur-xs"
        >
          <div class="text-2xl font-bold text-green">
            {getLongestStreak()}
          </div>
          <div class="text-gray text-sm">Longest Streak</div>
        </div>
        <div
          class="rounded-lg bg-secondary/20 p-4 text-center backdrop-blur-xs"
        >
          <div class="text-2xl font-bold text-green">
            {getMaxContributionsInDay()}
          </div>
          <div class="text-gray text-sm">Best Day</div>
        </div>
      </div>

      <div class="overflow-x-hidden">
        {#each Object.keys(githubContributions.contributions)
          .sort()
          .reverse()
          .slice(0, 3) as year}
          {@const yearContributions = getContributionsForYear(parseInt(year))}
          {@const yearTotal = githubContributions.total[year]}

          <div class="mb-6">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-lg font-medium text-text">{year}</h3>
              <span class="text-gray text-sm"
                >{yearTotal.toLocaleString()} contributions</span
              >
            </div>

            <div
              class="grid gap-1"
              style="grid-template-columns: repeat(53, 1fr);"
            >
              {#each yearContributions as contribution, i}
                <div
                  class="group relative h-3 w-3 rounded-xs transition-all duration-200 hover:scale-125 hover:z-50"
                  style="background-color: {getContributionColor(
                    contribution.level
                  )};"
                  in:fade={{ duration: 200, delay: i * 2 }}
                >
                  <div
                    class="pointer-events-none fixed -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-secondary/90 px-2 py-1 text-xs opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100"
                  >
                    {contribution.count} contributions on {formatContributionDate(
                      contribution.date
                    )}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <div class="flex items-center justify-between">
        <span class="text-gray text-sm">Less</span>
        <div class="flex gap-1">
          {#each [0, 1, 2, 3, 4] as level}
            <div
              class="h-3 w-3 rounded-xs"
              style="background-color: {getContributionColor(level)};"
            ></div>
          {/each}
        </div>
        <span class="text-gray text-sm">More</span>
      </div>
    </div>
  {:else}
    <div class="text-center p-8">
      <div class="text-gray">Loading contributions...</div>
    </div>
  {/if}
</section>
