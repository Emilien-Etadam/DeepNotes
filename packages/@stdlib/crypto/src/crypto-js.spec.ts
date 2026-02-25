import CryptoJS from 'crypto-js';
import { cryptoJsWordArrayToUint8Array } from './crypto-js';

describe('cryptoJsWordArrayToUint8Array', () => {
  it('convertit un WordArray connu (UTF-8 "hello") en Uint8Array', () => {
    const wordArray = CryptoJS.enc.Utf8.parse('hello');
    const result = cryptoJsWordArrayToUint8Array(wordArray);
    expect(result).toEqual(new Uint8Array([104, 101, 108, 108, 111]));
  });

  it('WordArray vide → Uint8Array vide', () => {
    const wordArray = CryptoJS.enc.Utf8.parse('');
    const result = cryptoJsWordArrayToUint8Array(wordArray);
    expect(result).toEqual(new Uint8Array([]));
  });
});
