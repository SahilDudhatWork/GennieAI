import i18n from 'i18n-js';
import en from './locales/en.json';
import hi from './locales/hi.json';
import fr from './locales/fr.json';
import zh from './locales/zh.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

i18n.translations = {
  en,
  hi,
  fr,
  zh,
};

i18n.fallbacks = true;

export const setI18nConfig = async languageTag => {
  i18n.locale = languageTag;
  await AsyncStorage.setItem('appLanguage', languageTag);
};

export default i18n;
