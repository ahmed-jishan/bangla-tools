// tools/batch-number-converter.js

import { numberToBanglaWords, currencyToBanglaWords, toBanglaDigits, toEnglishDigits, formatBangladeshi, formatInternational } from './number-converter.js';

// Type of conversion
export const CONVERSION_TYPES = {
    WORDS_BN: {
        id: 'words_bn',
        label: 'বাংলা কথায় (Number → শব্দ)',
        icon: '🔤',
        desc: 'প্রতি লাইনের সংখ্যাকে বাংলা বর্ণে রূপান্তর',
        processor: (numStr, opts) => {
            const val = parseFloat(toEnglishDigits(numStr));
            if (isNaN(val)) return numStr; // keep as is
            return numberToBanglaWords(String(val));
        }
    },
    CURRENCY_BN: {
        id: 'currency_bn',
        label: 'বাংলা মুদ্রা (টাকা ও পয়সা)',
        icon: '💰',
        desc: 'সংখ্যাকে "একশত টাকা পঞ্চাশ পয়সা" আকারে লেখে',
        processor: (numStr, opts) => {
            const val = parseFloat(toEnglishDigits(numStr));
            if (isNaN(val)) return numStr;
            return currencyToBanglaWords(String(val));
        }
    },
    DIGITS_BN: {
        id: 'digits_bn',
        label: 'ইংরেজি → বাংলা ডিজিট',
        icon: '🔢',
        desc: '0-9 কে ০-৯ তে রূপান্তর',
        processor: (numStr, opts) => toBanglaDigits(numStr)
    },
    DIGITS_EN: {
        id: 'digits_en',
        label: 'বাংলা → ইংরেজি ডিজিট',
        icon: '🔢',
        desc: '০-৯ কে 0-9 তে রূপান্তর',
        processor: (numStr, opts) => toEnglishDigits(numStr)
    },
    FORMAT_BD: {
        id: 'format_bd',
        label: 'বাংলাদেশি কমা ফরম্যাট',
        icon: '💱',
        desc: '১,২৩,৪৫,৬৭৮ (লক্ষ/কোটি)',
        processor: (numStr, opts) => formatBangladeshi(numStr)
    },
    FORMAT_INTL: {
        id: 'format_intl',
        label: 'আন্তর্জাতিক কমা ফরম্যাট',
        icon: '🌍',
        desc: '১২৩,৪৫৬,৭৮৯ (হাজার, মিলিয়ন)',
        processor: (numStr, opts) => formatInternational(numStr)
    },
    CUSTOM: {
        id: 'custom',
        label: 'কাস্টম ফরম্যাট',
        icon: '⚙️',
        desc: 'প্রিফিক্স, সাফিক্স, দশমিক স্থান নির্ধারণ',
        processor: (numStr, opts) => {
            let val = parseFloat(toEnglishDigits(numStr));
            if (isNaN(val)) return numStr;
            let formatted = val.toFixed(opts.decimals || 0);
            if (opts.thousands === 'bd') formatted = formatBangladeshi(formatted);
            else if (opts.thousands === 'intl') formatted = formatInternational(formatted);
            if (opts.currencySymbol) formatted = `${opts.currencySymbol} ${formatted}`;
            if (opts.prefix) formatted = opts.prefix + formatted;
            if (opts.suffix) formatted = formatted + opts.suffix;
            return formatted;
        }
    }
};

// Predefined custom format presets
export const CUSTOM_PRESETS = {
    receipt: {
        label: '📄 রসিদ ফরম্যাট',
        prefix: 'মোট টাকা: ',
        suffix: ' টাকা মাত্র',
        decimals: 0,
        thousands: 'bd',
        currencySymbol: '৳'
    },
    invoice: {
        label: '🧾 চালান ফরম্যাট',
        prefix: 'পরিমাণ: ',
        suffix: ' টাকা',
        decimals: 2,
        thousands: 'intl',
        currencySymbol: ''
    },
    price_list: {
        label: '🏷️ দামের তালিকা',
        prefix: '৳ ',
        suffix: '',
        decimals: 0,
        thousands: 'bd',
        currencySymbol: ''
    },
    plain_number: {
        label: '🔢 কেবল সংখ্যা',
        prefix: '',
        suffix: '',
        decimals: 0,
        thousands: 'none',
        currencySymbol: ''
    }
};

/**
 * Process a batch of lines
 * @param {string} text - multiline string
 * @param {object} options - conversion type and custom settings
 * @returns {string} processed text
 */
export function batchProcess(text, options = {}) {
    const { conversionType = 'words_bn', customOptions = {} } = options;
    const lines = text.split(/\r?\n/);

    // Find the correct converter by matching the id
    let converter = null;
    for (let key in CONVERSION_TYPES) {
        if (CONVERSION_TYPES[key].id === conversionType) {
            converter = CONVERSION_TYPES[key];
            break;
        }
    }
    if (!converter) converter = CONVERSION_TYPES.WORDS_BN;

    const processed = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed === '') return '';
        // Try to extract number(s) per line – simple: whole line treated as a single number
        // If line contains non-numeric characters like "Item 150 Tk", we can attempt to find first number
        let numberPart = trimmed;
        // If currency symbol or text exists, extract numeric part
        const match = trimmed.match(/[\d,]+(?:\.\d+)?/);
        if (match) numberPart = match[0];
        try {
            if (converter.id === 'custom') {
                return converter.processor(numberPart, customOptions);
            } else {
                return converter.processor(numberPart, customOptions);
            }
        } catch (e) {
            return line; // fallback
        }
    });
    return processed.join('\n');
}

export function getStats(original, processed) {
    const origLines = original.split(/\r?\n/).filter(l => l.trim().length > 0);
    const outLines = processed.split(/\r?\n/).filter(l => l.trim().length > 0);
    return {
        inputLines: origLines.length,
        outputLines: outLines.length,
        unchanged: original === processed ? 0 : outLines.length
    };
}

export const SAMPLES = [
    { label: 'দামের তালিকা', text: '1200\n2500\n3750\n4999' },
    { label: 'রসিদের জন্য', text: '1500.50\n2750\n3400.75' },
    { label: 'মিশ্র বাংলা ডিজিট', text: '১২০০\n২৫০০\n৩৭৫০' },
    { label: 'বড় সংখ্যা', text: '1234567\n9876543\n55000000' }
];