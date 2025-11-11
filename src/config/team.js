// Team configuration for fetching achievements from GitHub and social platforms
export const teamConfig = {
  // GitHub organization or main team repository
  github: {
    enabled: true, // Set to true when you have a GitHub org/repo
    org: 'nexolab-team', // Your GitHub organization name
    repos: [], // Specific repos to track (empty = all public repos)
  },
  
  // CTFTime team profile - 51l3nt_br34ch
  ctftime: {
    enabled: true, // Set to true when you have a CTFTime team
    teamId: 409004 // Your CTFTime team ID
  },
  
  // HackerOne profile
  hackerone: {
    enabled: false,
    username: null, // Your HackerOne username
  },
  
  // Bugcrowd profile
  bugcrowd: {
    enabled: false,
    username: null,
  },
  
  // Twitter/X
  twitter: {
    enabled: false,
    handle: null, // e.g., 'nexolabs'
  },
  
  // Discord community
  discord: {
    enabled: false,
    serverId: null,
  },
};

// Helper functions to check if any platform is connected
export function hasGitHubConnected() {
  return teamConfig.github.enabled && teamConfig.github.org;
}

export function hasCTFTimeConnected() {
  return teamConfig.ctftime.enabled && teamConfig.ctftime.teamId;
}

export function hasSocialsConnected() {
  return teamConfig.twitter.enabled || 
         teamConfig.discord.enabled || 
         teamConfig.hackerone.enabled || 
         teamConfig.bugcrowd.enabled;
}

export function hasAnyPlatformConnected() {
  return hasGitHubConnected() || hasCTFTimeConnected() || hasSocialsConnected();
}
