import Cookies from 'js-cookie';

export function clearCookie(name: string, cookies?: typeof Cookies) {
  (cookies ?? Cookies).remove(name, {
    domain: process.env.HOST,
    path: '/',
  });
}
