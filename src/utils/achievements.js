// Utility functions to fetch achievements from various platforms

import { teamConfig } from '../config/team.js';

/**
 * Fetch with timeout helper
 */
async function fetchWithTimeout(url, options = {}, timeout = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetch GitHub organization stats with timeout (faster, optimized)
 */
export async function fetchGitHubStats() {
  if (!teamConfig.github.enabled || !teamConfig.github.org) {
    return null;
  }

  try {
    // Fetch only org data, skip repos for speed
    const orgResponse = await fetchWithTimeout(
      `https://api.github.com/orgs/${teamConfig.github.org}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      },
      3000 // 3 second timeout
    );

    if (!orgResponse.ok) {
      return null;
    }

    const orgData = await orgResponse.json();

    return {
      name: orgData.name || orgData.login,
      publicRepos: orgData.public_repos || 0,
      followers: orgData.followers || 0,
      // Skip fetching individual repos for speed
      totalStars: 0,
      totalForks: 0,
    };
  } catch (error) {
    console.warn('GitHub API unavailable');
    return null;
  }
}

/**
 * Fetch CTFTime team stats with timeout (faster, optimized)
 */
export async function fetchCTFTimeStats() {
  if (!teamConfig.ctftime.enabled || !teamConfig.ctftime.teamId) {
    return null;
  }

  try {
    const response = await fetchWithTimeout(
      `https://ctftime.org/api/v1/teams/${teamConfig.ctftime.teamId}/`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NexoLabs-Website/1.0',
        },
      },
      3000 // 3 second timeout
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const currentYear = new Date().getFullYear();

    return {
      name: data.name,
      rating: data.rating?.[currentYear]?.rating_points || 0,
      ranking: data.rating?.[currentYear]?.rating_place || null,
      country: data.country,
      events: data.rating?.[currentYear]?.rating_events || 0,
    };
  } catch (error) {
    console.warn('CTFTime API unavailable');
    return null;
  }
}

/**
 * Generate achievement badges from connected platforms (optimized)
 */
export async function generateAchievements() {
  const achievements = [];

  // Fetch both APIs in parallel with Promise.allSettled (doesn't fail if one fails)
  const [githubResult, ctftimeResult] = await Promise.allSettled([
    fetchGitHubStats(),
    fetchCTFTimeStats(),
  ]);

  // GitHub achievements
  const githubStats = githubResult.status === 'fulfilled' ? githubResult.value : null;
  if (githubStats) {
    if (githubStats.publicRepos > 0) {
      achievements.push({
        icon: '💻',
        title: `${githubStats.publicRepos} Open Source Projects`,
        description: `Contributing tools and exploits to the security community`,
      });
    }

    if (githubStats.followers > 0) {
      achievements.push({
        icon: '👥',
        title: `${githubStats.followers} GitHub Followers`,
        description: `Building a community of security enthusiasts and researchers`,
      });
    }
  }

  // CTFTime achievements
  const ctftimeStats = ctftimeResult.status === 'fulfilled' ? ctftimeResult.value : null;
  if (ctftimeStats) {
    if (ctftimeStats.ranking) {
      achievements.push({
        icon: '🏆',
        title: `#${ctftimeStats.ranking} on CTFTime`,
        description: `Ranked ${ctftimeStats.ranking} globally on CTFTime leaderboard`,
      });
    }

    if (ctftimeStats.events > 0) {
      achievements.push({
        icon: '🎯',
        title: `${ctftimeStats.events} CTF Competitions`,
        description: `Participated in ${ctftimeStats.events} CTF events this year`,
      });
    }

    if (ctftimeStats.rating > 0) {
      achievements.push({
        icon: '📊',
        title: `${ctftimeStats.rating.toFixed(2)} Rating Points`,
        description: `Current CTFTime rating based on recent performance`,
      });
    }
  }

  // Social platform achievements (instant, no API calls)
  if (teamConfig.hackerone.enabled && teamConfig.hackerone.username) {
    achievements.push({
      icon: '🎖️',
      title: 'HackerOne Researcher',
      description: `Active bug bounty hunter on HackerOne platform`,
    });
  }

  if (teamConfig.bugcrowd.enabled && teamConfig.bugcrowd.username) {
    achievements.push({
      icon: '🔐',
      title: 'Bugcrowd Contributor',
      description: `Discovering and reporting security vulnerabilities responsibly`,
    });
  }

  if (teamConfig.twitter.enabled && teamConfig.twitter.handle) {
    achievements.push({
      icon: '📱',
      title: 'Active on Twitter/X',
      description: `Sharing security insights and CTF updates @${teamConfig.twitter.handle}`,
    });
  }

  if (teamConfig.discord.enabled) {
    achievements.push({
      icon: '💬',
      title: 'Discord Community',
      description: `Join our Discord server to discuss security and CTF challenges`,
    });
  }

  return achievements;
}

/**
 * Get all stats summary (optimized with parallel fetching)
 */
export async function getAllStats() {
  const [githubResult, ctftimeResult] = await Promise.allSettled([
    fetchGitHubStats(),
    fetchCTFTimeStats(),
  ]);

  const github = githubResult.status === 'fulfilled' ? githubResult.value : null;
  const ctftime = ctftimeResult.status === 'fulfilled' ? ctftimeResult.value : null;

  return {
    github,
    ctftime,
    hasData: !!(github || ctftime),
  };
}
