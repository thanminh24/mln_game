import landing from "./images/landing.png";
import ttxhExample from "./images/vidu.png";
import ytxhExample from "./images/vidu2.png";
import classExample from "./images/vidu3.png";
import doiMoi1991 from "./images/doi-moi-1991.jpg";
import baoLu2024 from "./images/bao-lu-2024.jpg";
import friedrichEngelsPortrait from "./images/friedrich-engels-portrait.jpg";
import hcmDeclaration1945 from "./images/hcm-declaration-1945.jpg";
import hegelPortrait1831 from "./images/hegel-portrait-1831.jpg";
import karlMarxPortrait from "./images/karl-marx-portrait.jpg";

const unsplashRaw = (url: string) => `${url}&auto=format&fit=crop&w=2400&q=80`;

export const IMAGE_FALLBACKS = {
  nature: unsplashRaw("https://images.unsplash.com/photo-1743485754066-f45e26489e9a?crop=entropy&cs=tinysrgb&fm=jpg"),
  population: unsplashRaw("https://images.unsplash.com/photo-1506741485568-47c278a3e70a?crop=entropy&cs=tinysrgb&fm=jpg"),
  production: unsplashRaw("https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=tinysrgb&fm=jpg"),
  degree: unsplashRaw("https://images.unsplash.com/photo-1627556704302-624286467c65?crop=entropy&cs=tinysrgb&fm=jpg"),
  ai: unsplashRaw("https://images.unsplash.com/photo-1677442135703-1787eea5ce01?crop=entropy&cs=tinysrgb&fm=jpg"),
  culture: unsplashRaw("https://images.unsplash.com/photo-1486056997767-09578eee7de1?crop=entropy&cs=tinysrgb&fm=jpg"),
  security: unsplashRaw("https://images.unsplash.com/photo-1592890288564-76628a30a657?crop=entropy&cs=tinysrgb&fm=jpg"),
  sharing: unsplashRaw("https://images.unsplash.com/photo-1681569685386-b7bda397672e?crop=entropy&cs=tinysrgb&fm=jpg"),
};

export const IMAGES = {
  landing,
  ttxhExample,
  ytxhExample,
  classExample,
  quoteMarxProduction: karlMarxPortrait,
  quoteMarxDialectic: hegelPortrait1831,
  quoteEngels: friedrichEngelsPortrait,
  quoteHoChiMinh: hcmDeclaration1945,
  caseFlood: baoLu2024,
  caseDoiMoi: doiMoi1991,
  forms: [
    IMAGE_FALLBACKS.degree,
    IMAGE_FALLBACKS.security,
    IMAGE_FALLBACKS.culture,
    landing,
    classExample,
    IMAGE_FALLBACKS.ai,
    IMAGE_FALLBACKS.sharing,
  ],
  laws: [
    IMAGE_FALLBACKS.degree,
    IMAGE_FALLBACKS.ai,
    IMAGE_FALLBACKS.culture,
    IMAGE_FALLBACKS.security,
    IMAGE_FALLBACKS.sharing,
  ],
  ttxh: [IMAGE_FALLBACKS.nature, IMAGE_FALLBACKS.population, IMAGE_FALLBACKS.production],
};
