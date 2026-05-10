// tools/unit-converter.js

// Land (Bangladeshi standard)
export const LAND_UNITS = {
  katha:    { name: 'কাঠা',   nameEn: 'Katha',   toBase: (v) => v * 0.033057,     fromBase: (v) => v / 0.033057 },
  bigha:    { name: 'বিঘা',   nameEn: 'Bigha',   toBase: (v) => v * 0.661157,     fromBase: (v) => v / 0.661157 },
  chotthak: { name: 'ছটাক',  nameEn: 'Chotthak', toBase: (v) => v * 0.0008264,    fromBase: (v) => v / 0.0008264 }, // 1 ছটাক জমি = ?
  shatak:   { name: 'শতাংশ', nameEn: 'Satak',    toBase: (v) => v * 0.01,         fromBase: (v) => v / 0.01 }, // 1 শতাংশ = 0.01 একর
  acre:     { name: 'একর',   nameEn: 'Acre',     toBase: (v) => v,                fromBase: (v) => v },
  sqft:     { name: 'বর্গফুট',nameEn: 'sq ft',   toBase: (v) => v / 43560,        fromBase: (v) => v * 43560 }
};

// Weight
export const WEIGHT_UNITS = {
  kg:       { name: 'কিলোগ্রাম', nameEn: 'kg',    toBase: (v) => v,             fromBase: (v) => v },
  gram:     { name: 'গ্রাম',    nameEn: 'g',      toBase: (v) => v / 1000,     fromBase: (v) => v * 1000 },
  pound:    { name: 'পাউন্ড',   nameEn: 'lb',     toBase: (v) => v * 0.453592,  fromBase: (v) => v / 0.453592 },
  mon:      { name: 'মন',      nameEn: 'Mon',    toBase: (v) => v * 40,        fromBase: (v) => v / 40 }, // 1 মন = 40 kg
  ser:      { name: 'সের',     nameEn: 'Ser',    toBase: (v) => v * 0.933,     fromBase: (v) => v / 0.933 }, // approx
  chatak:   { name: 'ছটাক',    nameEn: 'Chatak', toBase: (v) => v * 0.005834,  fromBase: (v) => v / 0.005834 }, // 1 ছটাক = 5.834g
  tola:     { name: 'তোলা',    nameEn: 'Tola',   toBase: (v) => v * 0.01166,   fromBase: (v) => v / 0.01166 } // 1 tola ≈ 11.66g
};

// Length
export const LENGTH_UNITS = {
  meter:    { name: 'মিটার',    nameEn: 'm',     toBase: (v) => v,             fromBase: (v) => v },
  cm:       { name: 'সেমি',     nameEn: 'cm',    toBase: (v) => v / 100,      fromBase: (v) => v * 100 },
  feet:     { name: 'ফুট',      nameEn: 'ft',    toBase: (v) => v * 0.3048,   fromBase: (v) => v / 0.3048 },
  inch:     { name: 'ইঞ্চি',    nameEn: 'in',    toBase: (v) => v * 0.0254,   fromBase: (v) => v / 0.0254 },
  yard:     { name: 'গজ',       nameEn: 'yd',    toBase: (v) => v * 0.9144,   fromBase: (v) => v / 0.9144 },
  km:       { name: 'কিলোমিটার',nameEn: 'km',    toBase: (v) => v * 1000,     fromBase: (v) => v / 1000 },
  mile:     { name: 'মাইল',     nameEn: 'mi',    toBase: (v) => v * 1609.34,  fromBase: (v) => v / 1609.34 }
};

// Volume (Liquid)
export const VOLUME_UNITS = {
  liter:    { name: 'লিটার',    nameEn: 'L',     toBase: (v) => v,             fromBase: (v) => v },
  ml:       { name: 'মিলিলিটার',nameEn: 'mL',    toBase: (v) => v / 1000,     fromBase: (v) => v * 1000 },
  gallon:   { name: 'গ্যালন',   nameEn: 'gal',   toBase: (v) => v * 3.78541,  fromBase: (v) => v / 3.78541 },
  cft:      { name: 'ঘনফুট',    nameEn: 'cft',   toBase: (v) => v * 28.3168,  fromBase: (v) => v / 28.3168 },
  poisha:   { name: 'পয়সা (তেল)', nameEn: 'Poisha', toBase: (v) => v * 0.0001, fromBase: (v) => v / 0.0001 } // not standard, just demo
};

// Temperature
export const TEMP_UNITS = {
  celsius:    { name: 'সেলসিয়াস',  nameEn: '°C',   toBase: (v) => v,             fromBase: (v) => v },
  fahrenheit: { name: 'ফারেনহাইট', nameEn: '°F',   toBase: (v) => (v - 32) * 5/9, fromBase: (v) => v * 9/5 + 32 },
  kelvin:     { name: 'কেলভিন',    nameEn: 'K',    toBase: (v) => v - 273.15,    fromBase: (v) => v + 273.15 }
};

export const CATEGORIES = {
  land: { name: 'জমি পরিমাপ', icon: '🌾', units: LAND_UNITS, baseUnit: 'acre' },
  weight: { name: 'ওজন', icon: '⚖️', units: WEIGHT_UNITS, baseUnit: 'kg' },
  length: { name: 'দৈর্ঘ্য', icon: '📏', units: LENGTH_UNITS, baseUnit: 'meter' },
  volume: { name: 'তরল পরিমাণ', icon: '💧', units: VOLUME_UNITS, baseUnit: 'liter' },
  temp: { name: 'তাপমাত্রা', icon: '🌡️', units: TEMP_UNITS, baseUnit: 'celsius' }
};

export function convert(value, fromUnitKey, toUnitKey, category) {
  const cat = CATEGORIES[category];
  if (!cat) return value;
  const fromUnit = cat.units[fromUnitKey];
  const toUnit = cat.units[toUnitKey];
  if (!fromUnit || !toUnit) return value;
  const baseValue = fromUnit.toBase(value);
  return toUnit.fromBase(baseValue);
}

export const SAMPLES = [
  { label: 'জমি (১ বিঘা)', category: 'land', from: 'bigha', to: 'acre', value: 1, result: 0.661 },
  { label: 'ওজন (১ মন)', category: 'weight', from: 'mon', to: 'kg', value: 1, result: 40 }
];