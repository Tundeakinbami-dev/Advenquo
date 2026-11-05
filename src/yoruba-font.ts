import { TTFLoader } from '@pmndrs/uikit';

const yorubaCharset = Array.from(
  new Set(
    `\t\n\r !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~` +
      'ẸỌṢẹọṣÀÈÌÒÙàèìòùÁÉÍÓÚáéíóúŃńḿḾ\u0300\u0301\u0304\u0323',
  ),
).join('');

let yorubaFontFamilies: Promise<Record<string, Record<string, unknown>>> | null = null;

/** Generate the UI text atlas with Yoruba letters and tone marks included. */
export function loadYorubaFontFamilies(): Promise<Record<string, Record<string, unknown>>> {
  yorubaFontFamilies ??= (async () => {
    const url = new URL('/fonts/NotoSans-Yoruba.ttf', window.location.href).href;
    const generated = await new TTFLoader().loadAsync([{
      url,
      charset: yorubaCharset,
      textureSize: [1024, 1024],
    }]);
    const family = Object.values(generated)[0] as Record<string, unknown> | undefined;
    const font = family ? Object.values(family)[0] : undefined;
    if (!font) throw new Error('Noto Sans Yoruba atlas generation returned no font data.');
    return { 'Noto Sans Yoruba': { 400: font, 700: font } };
  })();
  return yorubaFontFamilies;
}
