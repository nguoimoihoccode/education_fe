export function shouldEnableQuizOfflineAuth(enabled: boolean, isAuthenticated: boolean) {
  return enabled && !isAuthenticated;
}
