export const isMac = /Mac|iPod|iPhone|iPad/.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : '',
);

export const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : '',
  );
