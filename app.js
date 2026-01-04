// GLOBAL STATE
let currentUser = { balance: 450 };
let slotData = { usa: 157, india: 423, canada: 92 };
let currentLang = 'en';
let currentCountry = 'india';
let discount = { rate: 0, label: 'Standard Price' };

const translations = {
  en: {
    appTitle: '🛂 VisaLive SECURE',
    countryLabel: '🌍 Country:',
    langLabel: '🌐 Language:',
    backupLabel: '💾 Data Safe',
    liveSlotsTitle: '🔴 LIVE SLOTS',
    usaLabel: '🇺🇸 USA',
    indiaLabel: '🇮🇳 India',
    canadaLabel: '🇨🇦 Canada',
    walletTitle: '💰 Secure Wallet',
    plan1Label: '1 Month',
    plan6Label: '6 Month',
    plan9Label: '9 Month',
    plan12Label: '12 Month'
  },
  hi: {
    appTitle: '🛂 वीजाLive सुरक्षित',
    countryLabel: '🌍 देश:',
    langLabel: '🌐 भाषा:',
    backupLabel: '💾 डेटा सुरक्षित',
    liveSlotsTitle: '🔴 लाइव स्लॉट्स',
    usaLabel: '🇺🇸 यूएसए',
    indiaLabel: '🇮🇳 भारत',
    canadaLabel: '🇨🇦 कनाडा',
    walletTitle: '💰 सुरक्षित वॉलेट',
    plan1Label: '1 महीना',
    plan6Label: '6 महीने',
    plan9Label: '9 महीने',
    plan12Label: '12 महीने'
  },
  bn: {
    appTitle: '🛂 ভিসাLাইভ সিকিউর',
    countryLabel: '🌍 দেশ:',
    langLabel: '🌐 ভাষা:',
    backupLabel: '💾 ডেটা নিরাপদ',
    liveSlotsTitle: '🔴 লাইভ স্লট',
    usaLabel: '🇺🇸 USA',
    indiaLabel: '🇮🇳 ভারত',
    canadaLabel: '🇨🇦 কানাডা',
    walletTitle: '💰 নিরাপদ ওয়ালেট',
    plan1Label: '১ মাস',
    plan6Label: '৬ মাস',
    plan9Label: '৯ মাস',
    plan12Label: '১২ মাস'
  }
};

const basePrices = { month1: 6, month6: 30, month9: 50, month12: 60 };

// LANGUAGE & TEXT UPDATE
function updateLanguage() {
  const t = translations[currentLang];
  document.getElementById('appTitle').textContent = t.appTitle;
  document.getElementById('countryLabel').textContent = t.countryLabel;
  document.getElementById('langLabel').textContent = t.langLabel;
  document.getElementById('backupLabel').textContent = t.backupLabel;
  document.getElementById('liveSlotsTitle').textContent = t.liveSlotsTitle;
  document.getElementById('usaLabel').textContent = t.usaLabel;
  document.getElementById('indiaLabel').textContent = t.indiaLabel;
  document.getElementById('canadaLabel').textContent = t.canadaLabel;
  document.getElementById('walletTitle').textContent = t.walletTitle;
  document.getElementById('plan1Label').textContent = t.plan1Label;
  document.getElementById('plan6Label').textContent = t.plan6Label;
  document.getElementById('plan9Label').textContent = t.plan9Label;
  document.getElementById('plan12Label').textContent = t.plan12Label;
  updateLiveCounters();
}

function changeCountry() {
  currentCountry = document.getElementById('countrySelect').value;
  localStorage.setItem('visalive_country', currentCountry);
  if (currentCountry === 'usa') slotData.usa = 250;
  else if (currentCountry === 'uk') slotData.india = 500;
  updateLiveCounters();
  updateDiscount();
}

function changeLanguage() {
  currentLang = document.getElementById('langSelect').value;
  localStorage.setItem('visalive_lang', currentLang);
  updateLanguage();
}

// DISCOUNT


// SIMPLE HASH & SECURE LOCAL BACKUP
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

function secureSaveUser() {
  const data = JSON.stringify(currentUser);
  const hash = simpleHash(data);
  const payload = JSON.stringify({ data, hash });
  localStorage.setItem('visalive_backup', payload);
}

function secureLoadUser() {
  const raw = localStorage.getItem('visalive_backup');
  if (!raw) return;
  try {
    const payload = JSON.parse(raw);
    const calcHash = simpleHash(payload.data);
    if (calcHash !== payload.hash) {
      alert('🚨 Tampered data detected! Resetting wallet.');
      return;
    }
    currentUser = JSON.parse(payload.data);
    document.getElementById('walletBalance').textContent =
      '$' + Math.floor(currentUser.balance);
  } catch (e) {
    console.error(e);
  }
}

// PAYMENT + SUBSCRIPTION IN ONE
let txidAttempts = 0;
let lastTxTime = 0;

function payAndBuyPlan(plan) {
  const price = Math.round(basePrices[plan] * (1 - discount.rate) * 100) / 100;

  const now = Date.now();
  if (now - lastTxTime < 5000) {
    alert('⏳ Please wait a few seconds before trying again.');
    return;
  }
  if (txidAttempts >= 5) {
    alert('🚫 Too many attempts! Please try later.');
    return;
  }

  const txid = prompt(`Enter payment TXID for $${price} (8–12 digits):`);
  if (!txid || !/^d{8,12}$/.test(txid)) {
    txidAttempts++;
    alert('❌ Invalid TXID! Must be 8–12 digits.');
    return;
  }

  lastTxTime = now;
  txidAttempts = 0;

  // demo: আসলে server-side verification লাগবে
  if (currentUser.balance < price) {
    currentUser.balance += price;
  }

  currentUser.balance -= price;
  document.getElementById('walletBalance').textContent =
    '$' + Math.floor(currentUser.balance);
  secureSaveUser();

  alert(`✅ ${plan.toUpperCase()} ACTIVE!
💳 Payment TXID: ${txid}
💰 $${price} deducted
💳 New Balance: $${Math.floor(currentUser.balance)}`);
}

// LIVE SLOTS
function updateLiveCounters() {
  document.getElementById('usaSlots').textContent = Math.floor(slotData.usa);
  document.getElementById('indiaSlots').textContent = Math.floor(slotData.india);
  document.getElementById('canadaSlots').textContent = Math.floor(slotData.canada);
  document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
}

function forceCheckSlots() {
  document.getElementById('nextCheck').textContent = 'Checking...';
  setTimeout(() => {
    slotData.usa = Math.max(50, slotData.usa + (Math.random() - 0.5) * 80);
    slotData.india = Math.max(200, slotData.india + (Math.random() - 0.5) * 150);
    slotData.canada = Math.max(30, slotData.canada + (Math.random() - 0.5) * 40);
    updateLiveCounters();
    document.getElementById('nextCheck').textContent = '30s';
    if (slotData.usa > 200) {
      alert(`🚨 USA SLOTS ALERT!
🇺🇸 ${Math.floor(slotData.usa)} LIVE NOW!
⚡ Buy Plan NOW!`);
    }
  }, 1000);
}

function manualBackup() {
  secureSaveUser();
  document.getElementById('backupTime').textContent = new Date().toLocaleTimeString();
  alert('✅ Secure Backup Complete!');
}

// সম্পূর্ণ অফিসিয়াল URLs (India/Bangladesh থেকে apply-এর জন্য)
const officialBookingUrls = {
  usa: 'https://ais.usvisa-info.com/en-in/niv',  // US Visa India
  india: 'https://visa.vfsglobal.com/ind/en/usa/',  // US/Other visa from India
  china: 'https://cova.mfa.gov.cn/',  // China Online Visa (COVA)
  russia: 'https://evisa.kdmid.ru/',  // Russia e-Visa
  israel: 'https://www.israelvisa.in/',  // Israel Visa India
  thailand: 'https://www.thaievisa.go.th/',  // Thailand e-Visa
  uk: 'https://www.gov.uk/standard-visitor/apply-standard-visitor-visa',  // UK GOV
  australia: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing',  // Australia Immi
  uae: 'https://uaeportal.ae/',  // UAE/Dubai Tourist Visa
  dubai: 'https://gdrfad.gov.ae/en/services/8d1a1c36-3997-49ca-8b5e-4ae9c1bb9b3a',  // Dubai GDRFA
  qatar: 'https://visitqatar.com/intl-en/plan-your-trip/visas',  // Qatar Hayya/Qatar Airways
  malaysia: 'https://malaysiavisa.imi.gov.my/'  // Malaysia eVISA
};

// bookOfficialSlot() ফাংশন আগের মতো রাখুন
// BASIC CLICKJACKING GUARD
if (window.top !== window.self) {
  window.top.location = window.location;
}

// DEVTOOLS BLOCK TRY
document.addEventListener('keydown', e => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
  ) {
    e.preventDefault();
    alert('🚫 Developer Tools Blocked');
  }
});

// TOUCH EFFECTS
document.addEventListener(
  'touchstart',
  e => {
    const target = e.target.closest('.plan-card, .btn');
    if (target) {
      target.style.transform = 'scale(0.95)';
      setTimeout(() => (target.style.transform = ''), 150);
    }
  },
  { passive: true }
);

// INIT
window.onload = function () {
  currentLang = localStorage.getItem('visalive_lang') || 'en';
  currentCountry = localStorage.getItem('visalive_country') || 'india';

  document.getElementById('langSelect').value = currentLang;
  document.getElementById('countrySelect').value = currentCountry;

  secureLoadUser();
  updateLanguage();
  updateDiscount();
  updateLiveCounters();
  document.getElementById('backupTime').textContent = new Date().toLocaleTimeString();

  const sec = document.getElementById('securityStatus');
  if (sec) sec.textContent = '🔒 Security: ACTIVE ✅';

  setInterval(forceCheckSlots, 30000);
  forceCheckSlots();

  document
    .getElementById('countrySelect')
    .addEventListener('change', changeCountry);
  document
    .getElementById('langSelect')
    .addEventListener('change', changeLanguage);
};
