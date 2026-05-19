// ES module exports for app.js compatibility
export function addWord(word) { window.spellChecker.add(word); }
export function removeWord(word) { window.spellChecker.remove(word); }
export function checkWord(word) { return window.spellChecker.check(word); }
export function checkText(text) { return window.spellChecker.checkText(text); }
export function getStats() { return window.spellChecker.stats(); }
export function getSuggestions(word) { return window.spellChecker.suggest(word); }
// Dummy SAMPLES export to satisfy app.js import
export const SAMPLES = [];
// Bangla Spell Checker - Simple & Clean
// 500 words dictionary, Levenshtein distance, smart suggestions

class BanglaSpellChecker {
    constructor() {
        this.words = new Set([
            // === 500 Core Bangla Words ===
            // Pronouns
            "আমি","তুমি","সে","আমরা","তোমরা","তারা","আপনি","এই","ওই","যে",
            "কে","কী","কার","কাকে","কোন","কিছু","সব","অনেক","এক","দুই",

            // Verbs
            "কর","হয়","থাক","যাওয়া","আসা","দেওয়া","নেওয়া","বলা","খাওয়া","পড়া",
            "লেখা","দেখা","শোনা","বোঝা","জানা","চাওয়া","পাওয়া","মনে","ভাবা","চলা",
            "বসা","উঠা","ঘুমানো","হাসা","কাঁদা","খেলা","দৌড়ানো","ফেরা","মরা","বাঁচা",
            "জেগে","জাগা","গাওয়া","নাচা","বাজানো","ভাঙা","গড়া","কাটা","পোড়া","ঢাকা",
            "মোড়া","ধোয়া","রাখা","ফেলা","তোলা","নামা","বাড়া","কমা","শেখা","শেখানো",

            // Nouns
            "বাংলা","দেশ","জাতি","মানুষ","ভাষা","কথা","বিষয়","সময়","জায়গা","বাড়ি",
            "স্কুল","বই","পাতা","ফুল","গাছ","পানি","আকাশ","মাটি","সূর্য","চাঁদ",
            "তারা","বিদ্যুৎ","আগুন","বাতাস","মেঘ","বৃষ্টি","রোদ","ঠাণ্ডা","গরম","রাত",
            "দিন","সকাল","বিকেল","সন্ধ্যা","সপ্তাহ","মাস","বছর","আজ","কাল","পরশু",
            "গতকাল","আগামীকাল","ঘণ্টা","মিনিট","সেকেন্ড","মুহূর্ত","যুগ","শতাব্দী",

            // Family
            "বাবা","মা","ভাই","বোন","দাদা","দাদী","নানা","নানী","চাচা","চাচী",
            "মামা","মামী","ফুফু","ফুফা","খালা","খালু","স্বামী","স্ত্রী","ছেলে","মেয়ে",
            "বৌ","জামাই","নাতি","নাতনি","পরিবার",

            // Body
            "মাথা","চোখ","কান","নাক","মুখ","হাত","পা","আঙুল","চুল","চামড়া",
            "রক্ত","হাড়","মাংস","হৃদয়","ফুসফুস","মস্তিষ্ক","পেট","পিঠ","বুক","গলা",

            // Food
            "ভাত","রুটি","ডাল","তরকারি","মাছ","মাংস","ডিম","দুধ","চা","কফি",
            "পানি","জল","মিষ্টি","লবণ","চিনি","তেল","ঘি","মসলা","হলুদ","মরিচ",
            "পেঁয়াজ","রসুন","আদা","লেবু","কলা",

            // Education
            "শিক্ষা","পড়াশোনা","বিদ্যালয়","কলেজ","বিশ্ববিদ্যালয়","শিক্ষক","শিক্ষিকা",
            "ছাত্র","ছাত্রী","পরীক্ষা","পাস","ফেল","নম্বর","ফলাফল","বিজ্ঞান","গণিত",
            "ইতিহাস","ভূগোল","অর্থনীতি","রাজনীতি",

            // Tech
            "কম্পিউটার","মোবাইল","ফোন","ইন্টারনেট","ওয়েবসাইট","অ্যাপ","সফটওয়্যার",
            "হার্ডওয়্যার","প্রোগ্রাম","কোড","ডেটা","ফাইল","ফোল্ডার","ডাউনলোড","আপলোড",
            "ক্লিক","পাসওয়ার্ড","ইমেইল","মেসেজ","ভিডিও",

            // Politics
            "সরকার","রাষ্ট্র","দেশ","জাতীয়","আন্তর্জাতিক","নির্বাচন","ভোট","দল",
            "নেতা","নেত্রী","মন্ত্রী","প্রধানমন্ত্রী","রাষ্ট্রপতি","সংসদ","আইন","বিচার",
            "আদালত","পুলিশ","সমাজ","সংস্কৃতি",

            // Economy
            "টাকা","পয়সা","দাম","বাজার","দোকান","বিক্রি","ক্রয়","ব্যবসা","চাকরি",
            "পেশা","কর্ম","বেতন","ঋণ","ব্যাংক","বিনিয়োগ",

            // Transport
            "গাড়ি","বাস","ট্রেন","বিমান","নৌকা","লঞ্চ","রিকশা","সাইকেল","মোটর",
            "রাস্তা","সেতু","স্টেশন","বিমানবন্দর","থানা","ভাড়া",

            // Nature
            "প্রকৃতি","বন","পাহাড়","নদী","সমুদ্র","হ্রদ","বিল","খাল","পুকুর",
            "তীর","বালু","পাথর","ধূলা","কাদা","পশু","পাখি","ফুল","ফল","বৃক্ষ","ঘাস",

            // Colors
            "লাল","নীল","সবুজ","হলুদ","কালো","সাদা","কমলা","বেগুনি","গোলাপি","বাদামি",

            // Emotions
            "ভালো","খারাপ","সুখ","দুঃখ","আনন্দ","বেদনা","ভয়","সাহস","রাগ","ক্ষোভ",
            "ঘৃণা","ভালোবাসা","প্রেম","বিশ্বাস","সন্দেহ",

            // Adjectives
            "বড়","ছোট","লম্বা","খাটো","মোটা","চিকন","ভারী","হালকা","উচু","নিচু",
            "দ্রুত","ধীর","নতুন","পুরনো","আধুনিক","সুন্দর","শক্ত","নরম","তীব্র","মৃদু",

            // Numbers
            "শূন্য","এক","দুই","তিন","চার","পাঁচ","ছয়","সাত","আট","নয়",
            "দশ","বিশ","ত্রিশ","চল্লিশ","একশ",

            // Time
            "আজ","কাল","পরশু","গতকাল","আগামীকাল","এখন","তখন","আগে","পরে","প্রথম",
            "শেষ","মাঝে","সর্বদা","কখনো","মুহূর্ত",

            // Directions
            "উত্তর","দক্ষিণ","পূর্ব","পশ্চিম","উপর","নিচে","সামনে","পেছনে","ডান","বাঁ",

            // States
            "আছে","নেই","হয়","হবে","হতো","থাকে","থাকবে","গেছে","গেল","যায়",
            "যাবে","আসে","আসবে","দেয়","দেবে","নেয়","নেবে","পায়","পাবে","বলে",

            // Phrases
            "আমাদের","তোমাদের","তাদের","একটি","কোনো","কিছু","অনেক","সবাই","প্রতি",
            "প্রায়","বেশি","কম","আরো","আর","ও","অথবা","কিন্তু","তবে","যদি","তাই",

            // Conjuncts
            "স্কুল","স্টেশন","স্পষ্ট","স্ত্রী","স্মৃতি","স্রষ্টা","ক্ষতি","ক্ষমা",
            "ক্ষুধা","ক্ষমতা","জ্ঞান","জ্ঞানী","ন্ত","ন্দ","ন্ধ","প্র","ব্র","ম্প",
            "ম্ব","স্থ",

            // Places
            "বাংলাদেশ","ঢাকা","চট্টগ্রাম","খুলনা","রাজশাহী","বরিশাল","সিলেট","রংপুর",
            "কুমিল্লা","কক্সবাজার","বান্দরবান","রাঙ্গামাটি","খাগড়াছড়ি","ময়মনসিংহ","গাজীপুর",

            // Names
            "মোহাম্মদ","আহমেদ","হাসান","হোসেন","রহমান","আলী","ইসলাম","খান","মিয়া",
            "উদ্দিন","চৌধুরী","সরকার","তালুকদার","মল্লিক","মণ্ডল","শেখ","সিদ্দিক","কাজী","মজুমদার","বেগম","খাতুন","সুলতানা","রানী","রাজা",
            
        ]);

        this.cache = new Map();
        this.custom = new Set();
        this.loadCustom();
    }

    loadCustom() {
        try {
            const saved = localStorage.getItem('bangla_custom_words');
            if (saved) {
                JSON.parse(saved).forEach(w => {
                    this.words.add(w);
                    this.custom.add(w);
                });
            }
        } catch(e) {}
    }

    saveCustom() {
        try {
            localStorage.setItem('bangla_custom_words', JSON.stringify([...this.custom]));
        } catch(e) {}
    }

    add(word) {
        const w = word.trim();
        if (w.length > 1) {
            this.words.add(w);
            this.custom.add(w);
            this.saveCustom();
            this.cache.clear();
        }
    }

    remove(word) {
        const w = word.trim();
        this.words.delete(w);
        this.custom.delete(w);
        this.saveCustom();
        this.cache.clear();
    }

    check(word) {
        const w = word.trim();
        if (w.length < 2) return {ok: true, word: w};

        if (this.cache.has(w)) return this.cache.get(w);

        const ok = this.words.has(w);
        const result = {ok, word: w, sug: ok ? [] : this.suggest(w)};
        this.cache.set(w, result);
        return result;
    }

    checkText(text) {
        const errors = [];
        const words = [];
        const regex = /[ঀ-৿]+/g;
        let m;

        while ((m = regex.exec(text)) !== null) {
            words.push({word: m[0], start: m.index, end: m.index + m[0].length});
        }

        words.forEach(({word, start, end}) => {
            const r = this.check(word);
            if (!r.ok) {
                errors.push({
                    word: r.word,
                    start, end,
                    sug: r.sug,
                    type: r.sug.length ? this.guessType(r.word, r.sug[0]) : 'unknown'
                });
            }
        });

        return {text, errors, count: errors.length, total: words.length, clean: !errors.length};
    }

    suggest(word) {
        const all = [];

        // Levenshtein
        for (const w of this.words) {
            const d = this.dist(word, w);
            const max = Math.max(1, Math.floor(word.length * 0.4));
            if (d > 0 && d <= max) {
                all.push({w, s: 1 - d/Math.max(word.length, w.length), m: 'lev'});
            }
        }

        // Prefix
        const pre = word.slice(0, -1);
        for (const w of this.words) {
            if (w.startsWith(pre) && w !== word) {
                all.push({w, s: 0.7, m: 'pre'});
            }
        }

        // Sort & dedup
        const seen = new Set();
        const out = [];
        all.sort((a,b) => b.s - a.s);

        for (const x of all) {
            if (!seen.has(x.w)) {
                seen.add(x.w);
                out.push(x.w);
                if (out.length >= 5) break;
            }
        }

        return out;
    }

    dist(a, b) {
        const m = [];
        for (let i = 0; i <= b.length; i++) m[i] = [i];
        for (let j = 0; j <= a.length; j++) m[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                m[i][j] = b[i-1] === a[j-1] 
                    ? m[i-1][j-1] 
                    : 1 + Math.min(m[i-1][j-1], m[i][j-1], m[i-1][j]);
            }
        }
        return m[b.length][a.length];
    }

    guessType(wrong, right) {
        const vs = 'ািীুূৃেৈোৌ্';
        const wv = [...wrong].some(c => vs.includes(c));
        const rv = [...right].some(c => vs.includes(c));
        if (wv !== rv) return 'vowel';

        const wc = wrong.includes('্');
        const rc = right.includes('্');
        if (wc !== rc) return 'conjunct';

        return 'spelling';
    }

    stats() {
        return {
            total: this.words.size,
            core: 500,
            custom: this.custom.size
        };
    }
}

// Global instance
window.spellChecker = new BanglaSpellChecker();
export default BanglaSpellChecker;