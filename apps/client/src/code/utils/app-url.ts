export const APP_URL = process.env.APP_URL || 'https://deepnotes.app';

export function appPageUrl(pageId: string, params?: string): string {
  return `${APP_URL}/pages/${pageId}${params ? `?${params}` : ''}`;
}

export function appGroupUrl(groupId: string): string {
  return `${APP_URL}/groups/${groupId}`;
}
