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
import formPoliticsNew from "./images/form-politics-new.jpg";
import formLawNew from "./images/form-law-new.jpg";
import formEthicsNew from "./images/form-ethics-new.jpg";
import formAestheticsNew from "./images/form-aesthetics-new.jpg";
import formReligionNew from "./images/form-religion-new.jpg";
import formScienceNew from "./images/form-science-new.jpg";
import formPhilosophyNew from "./images/form-philosophy-new.jpg";
import germanExample from "./images/german-example.jpg";
import bienChungSequence from "./images/bien-chung-sequence.png";

const unsplashRaw = (url: string) => `${url}&auto=format&fit=crop&w=2400&q=80`;

export const IMAGE_FALLBACKS = {
  nature: unsplashRaw("https://images.unsplash.com/photo-1743485754066-f45e26489e9a?crop=entropy&cs=tinysrgb&fm=jpg"),
  population: unsplashRaw("https://images.unsplash.com/photo-1506741485568-47c278a3e70a?crop=entropy&cs=tinysrgb&fm=jpg"),
  production: unsplashRaw("https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=tinysrgb&fm=jpg"),
  degree: unsplashRaw("https://images.unsplash.com/photo-1627556704302-624286467c65?crop=entropy&cs=tinysrgb&fm=jpg"),
  ai: unsplashRaw("https://images.unsplash.com/photo-1677442135703-1787eea5ce01?crop=entropy&cs=tinysrgb&fm=jpg"),
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
  bienChungSequence,
  caseFlood: baoLu2024,
  caseDoiMoi: doiMoi1991,
  forms: [
    formPoliticsNew,    // 0 — Ý thức chính trị
    formLawNew,         // 1 — Ý thức pháp quyền
    formEthicsNew,      // 2 — Ý thức đạo đức
    formAestheticsNew,  // 3 — Ý thức thẩm mỹ
    formReligionNew,    // 4 — Ý thức tôn giáo
    formScienceNew,     // 5 — Ý thức khoa học
    formPhilosophyNew,  // 6 — Ý thức triết học
  ],
  laws: [
    IMAGE_FALLBACKS.degree,
    IMAGE_FALLBACKS.ai,
    germanExample,          // 2 — Quy luật 03: tính kế thừa
    IMAGE_FALLBACKS.degree,
    IMAGE_FALLBACKS.ai,
  ],
  ttxh: [IMAGE_FALLBACKS.nature, IMAGE_FALLBACKS.population, IMAGE_FALLBACKS.production],
};
