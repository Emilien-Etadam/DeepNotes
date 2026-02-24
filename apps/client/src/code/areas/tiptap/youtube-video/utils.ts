export const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)(?!.*\/channel\/)(?!\/@)(.+)?$/;
export const YOUTUBE_REGEX_GLOBAL =
  /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)(?!.*\/channel\/)(?!\/@)(.+)?$/g;

export const isValidYoutubeUrl = (url: string) => {
  return url.match(YOUTUBE_REGEX);
};

export interface GetEmbedUrlOptions {
  url: string;
  allowFullscreen?: boolean;
  autoplay?: boolean;
  ccLanguage?: string;
  ccLoadPolicy?: boolean;
  controls?: boolean;
  disableKBcontrols?: boolean;
  enableIFrameApi?: boolean;
  endTime?: number;
  interfaceLanguage?: string;
  ivLoadPolicy?: number;
  loop?: boolean;
  modestBranding?: boolean;
  nocookie?: boolean;
  origin?: string;
  playlist?: string;
  progressBarColor?: string;
  startAt?: number;
}

export const getYoutubeEmbedUrl = (nocookie?: boolean) => {
  return nocookie
    ? 'https://www.youtube-nocookie.com/embed/'
    : 'https://www.youtube.com/embed/';
};

export const getEmbedUrlFromYoutubeUrl = (options: GetEmbedUrlOptions) => {
  const {
    url,
    allowFullscreen,
    autoplay,
    ccLanguage,
    ccLoadPolicy,
    controls,
    disableKBcontrols,
    enableIFrameApi,
    endTime,
    interfaceLanguage,
    ivLoadPolicy,
    loop,
    modestBranding,
    nocookie,
    origin,
    playlist,
    progressBarColor,
    startAt,
  } = options;

  const baseEmbedUrl = parseYoutubeUrlToEmbedBase(url, nocookie);
  if (baseEmbedUrl == null) return null;
  if (baseEmbedUrl === url) return url;

  const params = buildEmbedParams({
    allowFullscreen,
    autoplay,
    ccLanguage,
    ccLoadPolicy,
    controls,
    disableKBcontrols,
    enableIFrameApi,
    endTime,
    interfaceLanguage,
    ivLoadPolicy,
    loop,
    modestBranding,
    origin,
    playlist,
    progressBarColor,
    startAt,
  });

  if (params.length) {
    return `${baseEmbedUrl}?${params.join('&')}`;
  }
  return baseEmbedUrl;
};

function parseYoutubeUrlToEmbedBase(
  url: string,
  nocookie?: boolean,
): string | null {
  if (url.includes('/embed/')) {
    return url;
  }
  if (url.includes('youtu.be')) {
    const id = url.split('/').pop();
    if (!id) return null;
    return `${getYoutubeEmbedUrl(nocookie)}${id}`;
  }
  const videoIdRegex = /v=([-\w]+)/gm;
  const matches = videoIdRegex.exec(url);
  if (!matches || !matches[1]) return null;
  return `${getYoutubeEmbedUrl(nocookie)}${matches[1]}`;
}

type EmbedParamsOptions = {
  allowFullscreen?: boolean;
  autoplay?: boolean;
  ccLanguage?: string;
  ccLoadPolicy?: boolean;
  controls?: boolean;
  disableKBcontrols?: boolean;
  enableIFrameApi?: boolean;
  endTime?: number;
  interfaceLanguage?: string;
  ivLoadPolicy?: number;
  loop?: boolean;
  modestBranding?: boolean;
  origin?: string;
  playlist?: string;
  progressBarColor?: string;
  startAt?: number;
};

function buildPlayerParams(options: EmbedParamsOptions): string[] {
  const params: string[] = [];
  if (options.allowFullscreen === false) params.push('fs=0');
  if (options.autoplay) params.push('autoplay=1');
  if (!options.controls) params.push('controls=0');
  if (options.disableKBcontrols) params.push('disablekb=1');
  if (options.enableIFrameApi) params.push('enablejsapi=1');
  if (options.loop) params.push('loop=1');
  if (options.modestBranding) params.push('modestbranding=1');
  if (options.progressBarColor) params.push(`color=${options.progressBarColor}`);
  return params;
}

function buildContentParams(options: EmbedParamsOptions): string[] {
  const params: string[] = [];
  if (options.ccLanguage) params.push(`cc_lang_pref=${options.ccLanguage}`);
  if (options.ccLoadPolicy) params.push('cc_load_policy=1');
  if (options.endTime) params.push(`end=${options.endTime}`);
  if (options.interfaceLanguage) params.push(`hl=${options.interfaceLanguage}`);
  if (options.ivLoadPolicy) params.push(`iv_load_policy=${options.ivLoadPolicy}`);
  if (options.origin) params.push(`origin=${options.origin}`);
  if (options.playlist) params.push(`playlist=${options.playlist}`);
  if (options.startAt) params.push(`start=${options.startAt}`);
  return params;
}

function buildEmbedParams(options: EmbedParamsOptions): string[] {
  return [...buildPlayerParams(options), ...buildContentParams(options)];
}
