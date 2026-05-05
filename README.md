# বাংলা Text Tools Suite

একটি scalable, modular web application বাংলা ভাষার text tools এর জন্য।

## Project Structure

```
bangla-tools/
├── index.html              ← Main entry point
├── css/
│   └── style.css           ← Global styles, themes, layout
├── js/
│   ├── app.js              ← Main router + sidebar + tool renderers
│   └── tools/
│       ├── bijoy-to-unicode.js   ← Bijoy → Unicode engine
│       ├── unicode-to-bijoy.js   ← Unicode → Bijoy engine
│       └── avro-phonetic.js      ← Avro phonetic engine
└── README.md
```

## কীভাবে চালাবেন

### Option 1: VS Code Live Server (সবচেয়ে সহজ)
1. VS Code এ project folder open করুন
2. `Live Server` extension install করুন
3. `index.html` এ right-click → `Open with Live Server`

### Option 2: Python HTTP Server
```bash
cd bangla-tools
python -m http.server 3000
# Browser এ যান: http://localhost:3000
```

### Option 3: Node.js
```bash
cd bangla-tools
npx serve .
```

> ⚠️ **Note:** ES Modules (`import/export`) ব্যবহার করা হয়েছে, তাই সরাসরি `file://` protocol এ open করলে কাজ করবে না। HTTP server দরকার।

## নতুন Tool যোগ করতে

1. `js/tools/` ফোল্ডারে নতুন file বানান (যেমন: `word-counter.js`)
2. file এ `export` করুন main function টি
3. `js/app.js` এ:
   - উপরে `import` যোগ করুন
   - `TOOLS` array তে tool definition যোগ করুন
   - `renderTool()` function এ নতুন case যোগ করুন
   - নতুন render function লিখুন

```js
// Example: নতুন tool যোগ করা
// 1. app.js এ import:
import { wordCount } from './tools/word-counter.js';

// 2. TOOLS array এ:
{ id: 'word-counter', name: 'Word Counter', icon: '📊', ... }

// 3. renderTool() এ:
else if (id === 'word-counter') renderWordCounter(view);

// 4. নতুন function:
function renderWordCounter(container) { ... }
```

## Features

- ✅ Dark / Light theme toggle
- ✅ Responsive — mobile সহ সব screen size এ কাজ করে
- ✅ Sidebar navigation
- ✅ Live conversion (typing এর সাথে সাথে)
- ✅ Sample texts
- ✅ Copy to clipboard
- ✅ Word/character statistics
- ✅ Zero dependencies — কোনো npm/build step নেই
- ✅ ES Modules — scalable, modular architecture

## Tools (v1.0)

| Tool | Status | File |
|------|--------|------|
| Bijoy → Unicode | ✅ Ready | `bijoy-to-unicode.js` |
| Unicode → Bijoy | ✅ Ready | `unicode-to-bijoy.js` |
| Avro Phonetic | ✅ Ready | `avro-phonetic.js` |
| Word Counter | 🔜 Coming | — |
| Text Cleaner | 🔜 Coming | — |
| Find & Replace | 🔜 Coming | — |

## Browser Support

Modern browsers: Chrome 80+, Firefox 75+, Safari 14+, Edge 80+
