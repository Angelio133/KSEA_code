import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  fr: {
    translation: {
      home: "Accueil",
      map: "Carte",
      report: "Signaler",
      profile: "Profil",
      startDriving: "Démarrer la Conduite",
      alert: "Attention !",
      slowDown: "Ralentissez s'il vous plaît",
    },
  },
  mg: {
    translation: {
      home: "Fandraisana",
      map: "Saritany",
      report: "Mitory",
      profile: "Profil",
      startDriving: "Hanomboka ny fiara",
      alert: "Attention !",
      slowDown: "Mihena haingana azafady",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "fr",
  fallbackLng: "fr",
  compatibilityJSON: "v3", // Résout le bug 'Intl API compatible'
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
