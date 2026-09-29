import ca from "../content/ca.json";
import en from "../content/en.json";
import es from "../content/es.json";

const translations = {
  ca,
  en,
  es,
};

export function getTranslations(lang) {
  return translations[lang] || translations.ca;
}