import { Preferences } from '@capacitor/preferences';

// Capacitor Preferences guarda datos pequeños; NO se guardan contraseñas ni números de tarjeta.
export async function getStored(key, fallback = null) {
  try {
    const { value } = await Preferences.get({ key: `beautystore_${key}` });
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.warn(`No se pudo leer ${key}:`, error);
    return fallback;
  }
}
export async function setStored(key, value) {
  await Preferences.set({ key: `beautystore_${key}`, value: JSON.stringify(value) });
}
export async function deleteStored(key) {
  await Preferences.remove({ key: `beautystore_${key}` });
}
