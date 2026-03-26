export const APP_URL = process.env.APP_URL || 'https://deepnotes.app';

export function appPageUrl(pageId: string, params?: string): string {
  const query = params ? `?${params}` : '';
  return `${APP_URL}/pages/${pageId}${query}`;
}

export function appGroupUrl(groupId: string): string {
  return `${APP_URL}/groups/${groupId}`;
}
