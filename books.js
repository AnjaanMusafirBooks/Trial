/* books.js — सिर्फ़ किताबों की जानकारी (डेटा)। यहाँ कोई कोड-लॉजिक नहीं है।
   - नई किताब जोड़नी हो तो नीचे वाली किसी किताब की कॉपी बनाकर बदल दें।
   - price: असली कीमत D1 डेटाबेस से आती है; यहाँ वाली सिर्फ़ बैकअप है। mrp: कटी हुई पुरानी कीमत।
   - पेज और कीमतें live site के screenshot से मिलाई गई हैं। */

/* SITE: पूरी वेबसाइट की सामान्य जानकारी (footer और contact में दिखती है) */
var SITE = {
  email: "officialsuperswagg@gmail.com",
  instagram: "https://instagram.com/anjaanmusafirbooks",
  instagramName: "@anjaanmusafirbooks",
  priceLabel: "आज की कीमत",
  legal: {}
};

/* BOOKS: सारी किताबों की सूची। हर किताब के फ़ील्ड:
   id=पेज का नाम (D1 से जुड़ा), title=नाम, subtitle=उपशीर्षक, cover=कवर फ़ोटो, featured=होम पर बड़ी दिखे,
   popular=Popular बैज, checkout=true तो Buy Now चलेगा (false तो "जल्द उपलब्ध"), desc=छोटा विवरण,
   inside=अंदर क्या है, forWho=किसके लिए, chapters=अध्याय सूची, note=सावधानी नोट, preview=नमूने के पन्ने */
var BOOKS = [
  {
    id: "vicharon-ki-kaid",
    title: "विचारों की कैद",
    subtitle: "जब अपने ही विचार इंसान को भीतर से बाँधने लगें",
    author: "अनजान मुसाफ़िर",
    pages: 119, language: "हिंदी",
    price: 49, mrp: 499,
    cover: "vicharon-ki-kaid.jpg",
    featured: true,
    checkout: true,
    desc: "यह किताब उस जगह से शुरू होती है जहाँ ‘कुछ नहीं हुआ’ कहने के बाद भी भीतर बहुत कुछ चल रहा होता है। अपने मन को समझने की एक सरल, ईमानदार शुरुआत।",
    inside: [
      "बार-बार एक ही बात सोचने की आदत को समझना",
      "छोटी बात पर घंटों सोचने के कारण",
      "मन के शोर को शांत करने के सरल अभ्यास"
    ],
    forWho: [
      "जो बहुत ज़्यादा सोचते हैं और थक जाते हैं",
      "जो पुरानी बातों में अटके रहते हैं",
      "जो भविष्य के डर से परेशान रहते हैं"
    ],
    note: "यह किताब प्रेरणा और समझ के लिए है, चिकित्सा सलाह का विकल्प नहीं।",
    preview: {
      enabled: true,
      pages: ["vicharon-ki-kaid-1.jpg", "vicharon-ki-kaid-2.jpg", "vicharon-ki-kaid-3.jpg"]
    }
  },
  {
    id: "dimag-ka-shor",
    title: "दिमाग़ का शोर",
    subtitle: "Overthinking को समझें, रोकें और ख़ुद को बेहतर बनाएँ",
    author: "Nitendra Sahu",
    pages: 100, language: "हिंदी",
    price: 129, mrp: 399,
    cover: "dimag-ka-shor.jpg",
    popular: true,
    checkout: true,
    desc: "Overthinking से निकलने की व्यावहारिक गाइड — समझें, पकड़ें, रोकें, बदलें। Practical tools, worksheets और 21-Day Reset Plan के साथ।",
    inside: ["Practical tools", "Worksheets", "21-Day Reset Plan"],
    forWho: ["जो overthinking से परेशान हैं", "जो मन को साफ़ और शांत करना चाहते हैं"],
    note: "यह किताब चिकित्सा या मनोवैज्ञानिक सलाह का विकल्प नहीं है.",
    preview: { enabled: false, pages: [] }
  },
  {
    id: "ai-career",
    title: "AI + Career",
    subtitle: "नए दौर में अपने लिए बेहतर करियर बनाने की व्यावहारिक मार्गदर्शिका",
    author: "Anjaan Musafir",
    pages: 70, language: "हिंदी",
    price: 99, mrp: 299,
    cover: "ai-career.jpg",
    checkout: true,
    desc: "AI को समझें, ज़रूरी कौशल सीखें, उन्हें करियर में इस्तेमाल करें और नए अवसर बनाएँ — बदलते समय के साथ आगे बढ़ने वालों के लिए।",
    inside: ["AI को समझो", "ज़रूरी कौशल सीखो", "करियर में इस्तेमाल करो", "नए अवसर बनाओ"],
    forWho: ["स्टूडेंट्स और जॉब करने वाले", "जो AI के दौर में खुद को आगे रखना चाहते हैं"],
    note: "",
    preview: { enabled: false, pages: [] }
  },
  {
    id: "aadaton-ke-paar",
    title: "आदतों के पार",
    subtitle: "अनुशासन, फोकस और निरंतरता की वह यात्रा, जो आदतों से आगे जाती है",
    author: "Nitendra Sahu",
    pages: 113, language: "हिंदी",
    price: 129, mrp: 399,
    cover: "aadaton-ke-paar.jpg",
    checkout: true,
    desc: "12 अध्याय, 30 दिन की योजना और टेम्पलेट के साथ अनुशासन, फोकस और निरंतरता बनाने की सरल राह।",
    inside: ["12 अध्याय", "30 दिन की योजना", "टेम्पलेट"],
    forWho: ["जो शुरू करके छोड़ देते हैं", "जो रोज़ की आदतें मज़बूत करना चाहते हैं"],
    note: "",
    preview: { enabled: false, pages: [] }
  },
  {
    id: "reality-of-manifestation",
    title: "The Reality of Manifestation",
    subtitle: "सपनों को हक़ीक़त बनाने की व्यावहारिक, विज्ञान-आधारित और चरण-दर-चरण गाइड",
    author: "Nitendra Sahu",
    pages: 69, language: "हिंदी",
    price: 99, mrp: 299,
    cover: "reality-of-manifestation.jpg",
    checkout: true,
    desc: "R.E.A.L. Method (Reveal, Embed, Act, Loop), 21-दिन का Blueprint और ढेर सारे templates — सिर्फ़ सोचने नहीं, करने का तरीका।",
    inside: ["R.E.A.L. Method", "21-दिन का Blueprint", "Templates और Trackers", "FAQ, Glossary, Cheat Sheet"],
    chapters: [
      "Manifestation का सच: मिथक और हक़ीक़त", "आपका दिमाग़: ध्यान, विश्वास और पहचान",
      "स्पष्टता: आप सच में क्या चाहते हैं?", "इरादे का वाक्य: सपने को शब्द देना",
      "सीमित मान्यताएँ: भीतर की कहानी बदलिए", "Visualization: कल्पना का सही तरीका",
      "भावनाएँ, कृतज्ञता और ऊर्जा", "क्रिया: Manifestation का असली इंजन",
      "आदतें और निरंतरता: प्रणाली की ताक़त", "डर, टालमटोल और आत्म-तोड़फोड़",
      "माहौल और लोग: आपका अदृश्य गुरुत्व", "समीक्षा और धैर्य: चक्र को घुमाते रहिए",
      "21-दिन का Manifestation Blueprint"
    ],
    forWho: ["जो सपनों को योजना में बदलना चाहते हैं", "जो ‘सोचो और मिलेगा’ से आगे का सच जानना चाहते हैं"],
    note: "यह पुस्तक शैक्षणिक और प्रेरणात्मक उद्देश्य से है; परिणाम व्यक्ति-दर-व्यक्ति भिन्न हो सकते हैं।",
    preview: { enabled: false, pages: [] }
  }
];
