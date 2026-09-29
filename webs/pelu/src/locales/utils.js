import ca from './ca.json';
import es from './es.json';

const languages = { ca, es };

export function useTranslations(lang) {
  return function t(key) {
    return languages[lang]?.[key] || languages['ca'][key] || key;
  };
}