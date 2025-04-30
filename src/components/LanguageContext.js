import React, { createContext, useContext, useState } from "react";
import en from "../locales/en.json";
import hu from "../locales/hu.json";

const translations = {
  English: en,
  Hungarian: hu,
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("English");
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
