(function () {
  var $ = function (s) { return document.querySelector(s); };

  var esc = function (t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
  };

  var rs = function (n) {
    return "₹" + n;
  };

  /* =========================
     CLOUDFLARE WORKER
  ========================= */

  var WORKER_URL =
    "https://anjaan-musafir-delivery.officialsuperswagg.workers.dev";

  var PRODUCT_IDS = {
    "dimag-ka-shor": "DIMAG_KA_SHOR",
    "ai-career": "AI_PLUS_CAREER",
    "aadaton-ke-paar": "AADATON_KE_PAAR",
    "vicharon-ki-kaid": "VICHARON_KI_KAID",
    "reality-of-manifestation": "REALITY_OF_MANIFESTATION"
  };

  /* =========================
     BOOK LINK
  ========================= */

  function link(b) {
    return "book.html?book=" + encodeURIComponent(b.id);
  }

  /* =========================
     BOOK BADGE
  ========================= */

  function badge(b) {
    var L = D1_PRODUCTS[b.id] && D1_PRODUCTS[b.id].label;
    if (L) return '<span class="badge">' + esc(L) + "</span>";

    if (b.featured) {
      return '<span class="badge">Featured</span>';
    }

    if (b.popular) {
      return '<span class="badge">Popular</span>';
    }

    return "";
  }

  /* =========================
     D1 PRODUCT DATA
  ========================= */

  var D1_PRODUCTS = {};

  async function loadD1Products() {
    if (typeof BOOKS === "undefined") {
      console.error("BOOKS data not found.");
      return;
    }

    try {
      var response = await fetch(WORKER_URL + "/api/catalog");
      if (!response.ok) return;

      var data = await response.json();
      var all = (data && data.products) || {};

      BOOKS.forEach(function (b) {
        var d = all[PRODUCT_IDS[b.id]];
        if (d && d.price != null) D1_PRODUCTS[b.id] = d;
      });
    } catch (err) {
      console.warn("catalog load failed", err);
    }
  }

  function currentPrice(b) {
    if (
      D1_PRODUCTS[b.id] &&
      D1_PRODUCTS[b.id].price != null
    ) {
      return Number(D1_PRODUCTS[b.id].price);
    }

    return Number(b.price);
  }

  function currentMrp(b) {
  return Number(b.mrp || 0);
  }

  /* =========================
     PRICE
  ========================= */

  function price(b, big) {
    var now = currentPrice(b);
    var mrp = currentMrp(b);

    var off =
      mrp && mrp > now
        ? Math.round((1 - now / mrp) * 100)
        : 0;

    return '<div class="price' +
      (big ? " big" : "") +
      '">' +

      (big
        ? '<p class="plabel">' +
          esc(SITE.priceLabel) +
          "</p>"
        : "") +

      '<span class="now">' +
      rs(now) +
      "</span>" +

      (off
        ? '<s>' +
          rs(mrp) +
          '</s><span class="off">' +
          off +
          "% OFF</span>"
        : "") +

      "</div>";
  }

  /* =========================
     BUY BUTTON
  ========================= */

  function buy(b, cls) {
    cls = cls || "btn";

    if (!b.checkout) {
      return '<span class="' +
        cls +
        ' off-btn" aria-disabled="true">जल्द उपलब्ध</span>';
    }

    return '<button type="button" class="' +
      cls +
      ' primary buy-btn" data-product-id="' +
      esc(b.id) +
      '">Buy Now</button>';
  }

  /* =========================
     BOOK CARD
  ========================= */

  function card(b) {
    return '<article class="card">' +

      badge(b) +

      '<a href="' +
      link(b) +
      '">' +

      '<img src="' +
      esc(b.cover) +
      '" alt="' +
      esc(b.title) +
      ' — eBook cover" loading="lazy">' +

      "</a>" +

      "<h3>" +
      esc(b.title) +
      "</h3>" +

      '<p class="sub">' +
      esc(b.subtitle) +
      "</p>" +

      '<p class="meta">' +
      esc(b.author) +
      " · " +
      b.pages +
      " पेज</p>" +

      price(b) +

      '<div class="actions">' +

      '<a class="btn" href="' +
      link(b) +
      '">View Book</a>' +

      buy(b) +

      "</div>" +

      "</article>";
  }

  /* =========================
     HOME PAGE
  ========================= */

  function home() {
    var f = BOOKS.filter(function (b) {
      return b.featured;
    })[0];

    var fs = $("#featured");

    if (f && fs) {
      fs.innerHTML =
        '<div class="wrap feat">' +

        '<a class="feat-img" href="' +
        link(f) +
        '">' +

        '<img src="' +
        esc(f.cover) +
        '" alt="' +
        esc(f.title) +
        ' — eBook cover">' +

        "</a>" +

        "<div>" +

        '<p class="kicker">Featured Book</p>' +

        badge(f) +

        "<h2>" +
        esc(f.title) +
        "</h2>" +

        '<p class="sub">' +
        esc(f.subtitle) +
        "</p>" +

        "<p>" +
        esc(f.desc) +
        "</p>" +

        price(f, true) +

        '<div class="actions">' +

        '<a class="btn" href="' +
        link(f) +
        '">View Book</a>' +

        buy(f) +

        "</div>" +

        "</div>" +

        "</div>";

    } else if (fs) {
      fs.hidden = true;
    }

    var grid = $("#grid");

    if (grid) {
      grid.innerHTML =
        BOOKS.map(card).join("");
    }

    var hc = $("#herocovers");

    if (hc) {
      hc.innerHTML =
        BOOKS.slice(0, 4)
          .map(function (b) {
            return '<img src="' +
              esc(b.cover) +
              '" alt="">';
          })
          .join("");
    }
  }

  /* =========================
     LIST
  ========================= */

  function list(a) {
    if (!Array.isArray(a)) {
      return "<ul></ul>";
    }

    return "<ul>" +

      a.map(function (x) {
        return "<li>" +
          esc(x) +
          "</li>";
      }).join("") +

      "</ul>";
  }

  /* =========================
     BOOK DETAIL PAGE
  ========================= */

  function book() {
    var id =
      new URLSearchParams(
        location.search
      ).get("book");

    var b =
      BOOKS.filter(function (x) {
        return x.id === id;
      })[0];

    var root = $("#book");

    if (!root) return;

    if (!b) {
      root.innerHTML =
        '<div class="wrap" style="padding:4rem 0">' +
        "<h1>यह किताब नहीं मिली</h1>" +
        '<p><a class="btn" href="index.html#books">सारी किताबें देखें</a></p>' +
        "</div>";

      return;
    }

    document.title =
      b.title +
      " — Anjaan Musafir Books";

    var md =
      document.querySelector(
        'meta[name="description"]'
      );

    if (md) {
      md.content =
        b.title +
        " — " +
        b.subtitle +
        ". Hindi eBook, Anjaan Musafir Books.";
    }

    var pv =
      b.preview &&
      b.preview.enabled &&
      b.preview.pages.length
        ? '<section class="wrap sec">' +

          "<h2>Preview</h2>" +

          '<div class="pv">' +

          b.preview.pages
            .map(function (p, i) {
              return '<img src="' +
                esc(p) +
                '" alt="' +
                esc(b.title) +
                " preview " +
                (i + 1) +
                '" loading="lazy">';
            })
            .join("") +

          "</div>" +

          "</section>"

        : "";

    var faq = [
      [
        "यह eBook किस भाषा में है?",
        b.language + " में।"
      ],

      [
        "eBook कैसे मिलेगी?",
        "Cashfree पर payment सफल होने के बाद payment verify होगा और आपको secure download link मिलेगा। यह Digital PDF है।"
      ],

      [
        "क्या refund मिलेगा?",
        "डिजिटल उत्पाद होने के कारण सामान्य परिस्थितियों में refund, return या cancellation संभव नहीं है। पूरी जानकारी Refund Policy पेज पर है।"
      ],

      [
        "भुगतान या access में दिक्कत आए तो?",
        "हमें " +
        SITE.email +
        " पर लिखिए। हम समस्या समझने और हल करने की कोशिश करेंगे।"
      ]
    ];

    root.innerHTML =

      '<section class="bhero">' +

      '<div class="wrap bgrid">' +

      '<img src="' +
      esc(b.cover) +
      '" alt="' +
      esc(b.title) +
      ' — eBook cover">' +

      "<div>" +

      badge(b) +

      "<h1>" +
      esc(b.title) +
      "</h1>" +

      '<p class="sub">' +
      esc(b.subtitle) +
      "</p>" +

      '<p class="meta">लेखक: ' +
      esc(b.author) +
      " · " +
      b.pages +
      " पेज · " +
      esc(b.language) +
      "</p>" +

      price(b, true) +

      '<div class="actions">' +
      buy(b) +
      "</div>" +

      "</div>" +

      "</div>" +

      "</section>" +

      '<section class="wrap sec narrow">' +
      "<h2>इस किताब के बारे में</h2>" +
      "<p>" +
      esc(b.desc) +
      "</p>" +
      "</section>" +

      '<section class="wrap sec narrow">' +
      "<h2>किताब के अंदर क्या है</h2>" +
      list(b.inside) +
      "</section>" +

      (b.chapters
        ? '<section class="wrap sec narrow">' +
          "<h2>अध्याय</h2>" +
          '<ol class="chaps">' +

          b.chapters
            .map(function (c) {
              return "<li>" +
                esc(c) +
                "</li>";
            })
            .join("") +

          "</ol>" +
          "</section>"
        : "") +

      '<section class="wrap sec narrow">' +
      "<h2>यह किताब किसके लिए है</h2>" +
      list(b.forWho) +
      "</section>" +

      '<section class="wrap sec narrow">' +
      "<h2>किताब की जानकारी</h2>" +

      "<dl>" +

      "<dt>लेखक</dt>" +
      "<dd>" +
      esc(b.author) +
      "</dd>" +

      "<dt>पेज</dt>" +
      "<dd>" +
      b.pages +
      "</dd>" +

      "<dt>भाषा</dt>" +
      "<dd>" +
      esc(b.language) +
      "</dd>" +

      "<dt>Format</dt>" +
      "<dd>Digital eBook (PDF)</dd>" +

      "</dl>" +

      (b.note
        ? '<p class="note">' +
          esc(b.note) +
          "</p>"
        : "") +

      "</section>" +

      pv +

      '<section class="wrap sec narrow">' +

      "<h2>FAQ</h2>" +

      faq.map(function (q) {
        return "<details>" +

          "<summary>" +
          esc(q[0]) +
          "</summary>" +

          "<p>" +
          esc(q[1]) +
          "</p>" +

          "</details>";

      }).join("") +

      "</section>" +

      '<section class="final">' +

      '<div class="wrap">' +

      "<h2>" +
      esc(b.title) +
      "</h2>" +

      price(b, true) +

      '<div class="actions c">' +

      buy(b) +

      '<a class="btn light" href="index.html#books">और किताबें</a>' +

      "</div>" +

      "</div>" +

      "</section>" +

      '<section class="wrap sec">' +

      "<h2>और किताबें</h2>" +

      '<div class="grid">' +

      BOOKS
        .filter(function (x) {
          return x.id !== b.id;
        })
        .map(card)
        .join("") +

      "</div>" +

      "</section>" +

      '<div class="sticky">' +

      price(b) +

      buy(b) +

      "</div>";
  }

  /* =========================
     DYNAMIC SITE CONTENT
     Public content is fetched from Worker/D1; existing HTML remains the fallback.
     Bodies are plain text with optional ## headings and - bullet lines (never raw HTML).
  ========================= */
  var SITE_CONTENT = {};
  function renderPlainContent(target, body, activeEmail) {
    if (!target || typeof body !== "string") return;
    var frag = document.createDocumentFragment();
    body.split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;
      var node;
      if (line.indexOf("## ") === 0) {
        node = document.createElement("h2"); node.textContent = line.slice(3);
      } else if (line.indexOf("- ") === 0) {
        node = document.createElement("p"); node.className = "dynamic-list-item"; node.textContent = "• " + line.slice(2);
      } else {
        node = document.createElement("p");
        // Keep policy content as text, but make email addresses clickable without interpreting HTML.
        var emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
        var last = 0, match;
        while ((match = emailPattern.exec(line)) !== null) {
          node.appendChild(document.createTextNode(line.slice(last, match.index)));
          var address = match[0];
          if (activeEmail && address.toLowerCase() === String(SITE.email || "").toLowerCase()) address = activeEmail;
          var link = document.createElement("a");
          link.href = "mailto:" + address;
          link.textContent = address;
          node.appendChild(link);
          last = match.index + match[0].length;
        }
        if (last) node.appendChild(document.createTextNode(line.slice(last)));
        else node.textContent = line;
      }
      frag.appendChild(node);
    });
    target.replaceChildren(frag);
  }
  async function loadSiteContent() {
    try {
      var response = await fetch(WORKER_URL + "/api/site-content", { cache: "no-store" });
      if (!response.ok) return;
      var payload = await response.json();
      SITE_CONTENT = payload && payload.content || {};
      var contentApiAvailable = !!(payload && payload.ok);
      var configuredEmail = SITE_CONTENT.contact_email && SITE_CONTENT.contact_email.enabled && SITE_CONTENT.contact_email.body;
      var activeEmail = configuredEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredEmail.trim()) ? configuredEmail.trim() : SITE.email;
      document.querySelectorAll("[data-dynamic-title]").forEach(function (node) {
        var key = node.getAttribute("data-dynamic-title");
        var item = SITE_CONTENT[key];
        if (item && item.enabled && item.title) node.textContent = item.title;
      });
      document.querySelectorAll("[data-dynamic-content]").forEach(function (node) {
        var key = node.getAttribute("data-dynamic-content");
        var item = SITE_CONTENT[key];
        if (!item || !item.enabled) {
          // Only hide optional sections when the API successfully confirms that
          // their content is disabled/missing. If the API is unavailable, keep
          // the original static HTML as a safe fallback.
          if (contentApiAvailable && ["about", "vision", "contact"].indexOf(key) !== -1) {
            if (key === "contact") {
              // Contact content appears on both the dedicated Contact page and the home-page contact block.
              document.querySelectorAll('[data-dynamic-content="contact"], [data-dynamic-title="contact"]').forEach(function (contactNode) {
                var contactSection = contactNode.closest("section");
                if (contactSection) contactSection.hidden = true;
              });
              var homeContact = document.getElementById("contact");
              if (homeContact) homeContact.hidden = true;
            } else {
              var section = node.closest("section");
              if (section) section.hidden = true;
            }
          }
          return;
        }
        if (item.enabled && ["about", "vision", "contact"].indexOf(key) !== -1) {
          var visibleSection = node.closest("section");
          if (visibleSection) visibleSection.hidden = false;
          if (key === "contact") {
            var homeContactVisible = document.getElementById("contact");
            if (homeContactVisible) homeContactVisible.hidden = false;
          }
        }
        if (node.id === "dynamic-policy-content") {
          renderPlainContent(node, item.body, activeEmail);
          var policyMain = node.closest("main");
          var heading = policyMain && policyMain.querySelector(".phead h1");
          if (heading && item.title) heading.textContent = item.title;
          var updatedLabel = policyMain && policyMain.querySelector(".phead .upd");
          if (updatedLabel && item.published_at) {
            var publishedDate = new Date(String(item.published_at).replace(" ", "T") + "Z");
            if (!Number.isNaN(publishedDate.getTime())) {
              updatedLabel.textContent = "अंतिम अपडेट: " + new Intl.DateTimeFormat("hi-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(publishedDate);
            }
          }
          if (item.title) document.title = item.title + " — Anjaan Musafir Books";
        } else if (item.body != null) {
          node.textContent = item.body;
        }
      });
      var announcement = SITE_CONTENT.announcement;
      if (announcement && announcement.enabled && announcement.body.trim()) {
        var bar = document.createElement("div"); bar.className = "dynamic-announcement"; bar.textContent = announcement.body;
        bar.setAttribute("role", "status");
        document.body.insertBefore(bar, document.body.firstChild);
      }
      var email = configuredEmail;
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        email = email.trim();
        document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
          // Set attributes/text through DOM APIs; never concatenate editable content into HTML.
          link.href = "mailto:" + email;
          link.textContent = email;
        });
      }
      var tagline = SITE_CONTENT.footer_tagline;
      var taglineNode = document.querySelector("[data-footer-tagline]");
      if (tagline && tagline.enabled && taglineNode) taglineNode.textContent = tagline.body;
      else if (contentApiAvailable && taglineNode) taglineNode.closest("p") && (taglineNode.closest("p").hidden = true);
      var footerNote = SITE_CONTENT.footer_note;
      var footerNoteNode = document.querySelector("[data-footer-note]");
      if (footerNote && footerNote.enabled && footerNoteNode) footerNoteNode.textContent = footerNote.body;
      else if (contentApiAvailable && footerNoteNode) footerNoteNode.closest("p") && (footerNoteNode.closest("p").hidden = true);
    } catch (err) { console.warn("Dynamic site content unavailable; static content retained.", err); }
  }

  /* =========================
     HEADER / FOOTER
  ========================= */

  function chrome() {
    var l = SITE.legal;

    var foot = $("#foot");

    if (foot) {
      foot.innerHTML =
        '<div class="wrap fgrid">' +

        "<div>" +

        '<p class="brand">ANJAAN MUSAFIR BOOKS</p>' +

        '<p data-footer-tagline>हर सफ़र बाहर जाने का नहीं होता।</p>' +
        '<p class="presented-by"><img src="assets/digitech-move-logo.jpg" alt="DigiTech Move" loading="lazy"> <span data-footer-note>Presented by DigiTech Move</span></p>' +

        "</div>" +

        '<nav aria-label="Footer">' +

        '<a href="index.html#books">Books</a>' +
        '<a href="index.html#about">About</a>' +
        '<a href="contact.html">Contact</a>' +
        '<a href="privacy.html">Privacy Policy</a>' +
        '<a href="terms.html">Terms &amp; Conditions</a>' +
        '<a href="refund.html">Refund Policy</a>' +

        "</nav>" +

        "<div>" +

        '<a href="mailto:' + SITE.email + '">' + SITE.email + "</a>" +

        '<a href="' +
        SITE.instagram +
        '" target="_blank" rel="noopener">Instagram ' +
        SITE.instagramName +
        "</a>" +

        "</div>" +

        "</div>" +

        '<p class="wrap copy">© 2026 Anjaan Musafir Books · Owned &amp; Operated by Nitendra Sahu · All Rights Reserved.</p>';
    }

    var m = $("#menu");
    var n = $("#nav");

    if (n && !n.querySelector('a[href="my-order.html"]')) {
      var orderLink = document.createElement("a");
      orderLink.href = "my-order.html";
      orderLink.textContent = "Mera Order";
      n.appendChild(orderLink);
    }

    if (m && n) {

      m.addEventListener(
        "click",
        function () {
          var o =
            n.classList.toggle(
              "open"
            );

          m.setAttribute(
            "aria-expanded",
            o
          );
        }
      );

      n.addEventListener(
        "click",
        function (e) {

          if (
            e.target.tagName ===
            "A"
          ) {

            n.classList.remove(
              "open"
            );

            m.setAttribute(
              "aria-expanded",
              false
            );
          }

        }
      );
    }

    var c =
      $("#contactlinks");

    if (c) {
      c.innerHTML =
        '<a href="mailto:' + SITE.email + '">' + SITE.email + "</a>" +

        '<a href="' +
        SITE.instagram +
        '" target="_blank" rel="noopener">Instagram ' +
        SITE.instagramName +
        "</a>";
    }
  }

  /* =========================
     CHECKOUT / COUPON / CASHFREE
  ========================= */

  function money(n) {
    var v = Number(n || 0);
    return "₹" + (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2));
  }

  function showResultModal(data, options) {
    options = options || {};

    var old = document.querySelector(".result-modal");
    if (old) old.remove();

    var success = options.success !== false;
    var title = options.title || (success ? "Payment Successful" : "Something went wrong");
    var message = options.message || "";
    var bookName = data && data.product_name ? data.product_name : "";
    var orderId = data && data.order_id ? data.order_id : "";
    var finalPrice = data && data.final_price != null ? Number(data.final_price) : null;
    var regularPrice = data && data.regular_price != null ? Number(data.regular_price) : null;
    var currentPrice = data && data.current_price != null ? Number(data.current_price) : null;
    var discountPrice = data && data.discount_price != null ? Number(data.discount_price) : null;
    var totalSavings = regularPrice != null && finalPrice != null
      ? Math.max(0, regularPrice - finalPrice)
      : null;
    var downloadsRemaining = data && data.downloads_remaining != null
      ? Number(data.downloads_remaining)
      : null;
    var maxDownloads = data && data.max_downloads != null
      ? Number(data.max_downloads)
      : null;

    var modal = document.createElement("div");
    modal.className = "result-modal";

    var rows = "";
    if (success && finalPrice != null) {
      rows =
        '<div class="result-prices">' +
          (regularPrice != null ? '<div><span>Regular Price</span><b>' + money(regularPrice) + '</b></div>' : "") +
          (currentPrice != null ? '<div><span>Current Price</span><b>' + money(currentPrice) + '</b></div>' : "") +
          (discountPrice != null && discountPrice > 0 ? '<div><span>Coupon Discount</span><b class="result-save">−' + money(discountPrice) + '</b></div>' : "") +
          '<div class="result-final"><span>Paid</span><b>' + money(finalPrice) + '</b></div>' +
          (totalSavings != null && totalSavings > 0 ? '<div><span>Total Savings</span><b class="result-save">' + money(totalSavings) + '</b></div>' : "") +
          (downloadsRemaining != null ? '<div><span>Downloads Remaining</span><b>' + downloadsRemaining + (maxDownloads != null ? ' / ' + maxDownloads : '') + '</b></div>' : "") +
        '</div>';
    }

    modal.innerHTML =
      '<div class="result-backdrop"></div>' +
      '<div class="result-dialog" role="dialog" aria-modal="true" aria-labelledby="result-title">' +
        '<button type="button" class="result-close" aria-label="Close">&times;</button>' +
        '<div class="result-icon ' + (success ? "success" : "error") + '">' + (success ? "✓" : "!") + '</div>' +
        '<p class="result-kicker">ANJAAN MUSAFIR BOOKS</p>' +
        '<h2 id="result-title">' + esc(title) + '</h2>' +
        (bookName ? '<p class="result-book">' + esc(bookName) + '</p>' : "") +
        (message ? '<p class="result-message">' + esc(message) + '</p>' : "") +
        (orderId ? '<div class="result-order"><span>Order ID</span><b>' + esc(orderId) + '</b></div>' : "") +
        rows +
        (success && data && data.download_url
          ? '<a class="btn primary result-download" href="' + esc(data.download_url) + '">Download eBook</a>'
          : "") +
        (success && orderId
          ? '<a class="result-myorder" href="my-order.html">Order खो जाए तो Mera Order खोलें →</a>'
          : "") +
        '<button type="button" class="btn result-secondary">Close</button>' +
      '</div>';

    document.body.appendChild(modal);

    function close() {
      modal.classList.remove("open");
      document.body.classList.remove("result-open");
      setTimeout(function () {
        if (modal.parentNode) modal.remove();
      }, 220);
    }

    modal.querySelector(".result-close").addEventListener("click", close);
    modal.querySelector(".result-secondary").addEventListener("click", close);
    modal.querySelector(".result-backdrop").addEventListener("click", close);

    function escClose(e) {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", escClose);
        close();
      }
    }
    document.addEventListener("keydown", escClose);

    document.body.classList.add("result-open");
    requestAnimationFrame(function () { modal.classList.add("open"); });
  }

  async function validateCoupon(productId, coupon) {
    var response = await fetch(
      WORKER_URL + "/api/validate-coupon",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: PRODUCT_IDS[productId],
          coupon: coupon
        })
      }
    );

    var data = {};
    try { data = await response.json(); } catch (e) {}

    if (!response.ok || !data.valid) {
      throw new Error(data.error || "यह coupon सही या चालू नहीं है।");
    }

    return data;
  }

  function openCheckoutForm(book) {
    return new Promise(function (resolve) {
      var old = document.querySelector(".checkout-modal");
      if (old) old.remove();

      var modal = document.createElement("div");
      modal.className = "checkout-modal";
      modal.innerHTML =
        '<div class="checkout-backdrop" data-checkout-close></div>' +
        '<div class="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">' +
          '<div class="checkout-head">' +
            '<div><p class="checkout-kicker">ANJAAN MUSAFIR BOOKS</p><h2 id="checkout-title">Complete Your Order</h2></div>' +
            '<button type="button" class="checkout-close" aria-label="Close" data-checkout-close>&times;</button>' +
          '</div>' +
          '<div class="checkout-book">' +
            '<img class="checkout-cover" src="' + esc(book.cover) + '" alt="' + esc(book.title) + ' — eBook cover">' +
            '<div class="checkout-book-info"><h3 class="checkout-title">' + esc(book.title) + '</h3><div class="checkout-price" data-live-price>' + price(book) + '</div><p class="checkout-secure">Secure checkout · Digital PDF</p></div>' +
          '</div>' +
          '<div class="checkout-divider"></div>' +
          '<form class="checkout-form" novalidate>' +
            '<label class="checkout-field"><span>Name <b>*</b></span><input name="name" type="text" autocomplete="name" placeholder="अपना नाम लिखें" required></label>' +
            '<label class="checkout-field"><span>Email <b>*</b></span><input name="email" type="email" autocomplete="email" placeholder="अपना Email लिखें" required></label>' +
            '<label class="checkout-field"><span>Mobile <b>*</b></span><input name="phone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="10" placeholder="10-digit mobile number" required></label>' +
            '<div class="checkout-field coupon-field"><span>Coupon Code <em>(Optional)</em></span><div class="coupon-row"><input name="coupon" type="text" autocomplete="off" placeholder="Coupon code, अगर है"><button type="button" class="btn coupon-verify">Verify</button></div><div class="coupon-status" hidden></div></div>' +
            '<div class="checkout-error" hidden></div>' +
            '<div class="checkout-safe"><span class="checkout-safe-icon">✓</span><span>Your details are used only to create your order and payment session.</span></div>' +
            '<div class="checkout-actions"><button type="submit" class="btn primary checkout-pay">Continue</button><button type="button" class="btn checkout-cancel" data-checkout-close>Cancel</button></div>' +
          '</form>' +
        '</div>';

      document.body.appendChild(modal);
      document.body.classList.add("checkout-open");

      var form = modal.querySelector(".checkout-form");
      var error = modal.querySelector(".checkout-error");
      var couponInput = form.elements.coupon;
      var verifyButton = modal.querySelector(".coupon-verify");
      var couponStatus = modal.querySelector(".coupon-status");
      var priceBox = modal.querySelector("[data-live-price]");
      var nameInput = form.elements.name;
      var verified = null;

      function close(value) {
        document.body.classList.remove("checkout-open");
        modal.classList.remove("open");
        setTimeout(function () { if (modal.parentNode) modal.remove(); }, 230);
        resolve(value);
      }

      function setError(msg) {
        error.textContent = msg || "";
        error.hidden = !msg;
      }

      function clearVerified() {
        verified = null;
        couponStatus.hidden = true;
        couponStatus.textContent = "";
        couponStatus.className = "coupon-status";
        priceBox.innerHTML = price(book);
      }

      couponInput.addEventListener("input", clearVerified);

      verifyButton.addEventListener("click", async function () {
        var coupon = couponInput.value.trim().toUpperCase();
        setError("");
        if (!coupon) {
          clearVerified();
          return;
        }

        verifyButton.disabled = true;
        verifyButton.textContent = "Checking…";
        try {
          var data = await validateCoupon(book.id, coupon);
          verified = data;

var payableAmount =
  data.final_price > 0 && data.final_price < 1
    ? 1
    : data.final_price;

priceBox.innerHTML =
  '<div class="coupon-price-preview">' +
    '<span class="now">' + money(payableAmount) + '</span>' +
    '<s>' + money(data.current_price) + '</s>' +
    '<b>Save ' + money(data.discount_price) + '</b>' +
  '</div>';

couponStatus.className = "coupon-status ok";
couponStatus.hidden = false;
couponStatus.innerHTML = data.free
  ? "✓ Coupon verified · 100% OFF · Pay ₹0"
  : "✓ Coupon verified · Pay " + money(payableAmount);
        } catch (err) {
          clearVerified();
          couponStatus.className = "coupon-status bad";
          couponStatus.hidden = false;
          couponStatus.textContent = err.message || "Coupon verify नहीं हुआ।";
        } finally {
          verifyButton.disabled = false;
          verifyButton.textContent = "Verify";
        }
      });

      modal.querySelectorAll("[data-checkout-close]").forEach(function (el) {
        el.addEventListener("click", function () { close(null); });
      });

      function escClose(e) {
        if (!modal.parentNode) {
          document.removeEventListener("keydown", escClose);
          return;
        }
        if (e.key === "Escape") {
          document.removeEventListener("keydown", escClose);
          close(null);
        }
      }
      document.addEventListener("keydown", escClose);

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        setError("");

        var name = form.elements.name.value.trim();
        var email = form.elements.email.value.trim();
        var phone = form.elements.phone.value.replace(/\D/g, "");
        var coupon = couponInput.value.trim().toUpperCase();

        if (!name) {
          setError("कृपया अपना नाम डालें।");
          nameInput.focus();
          return;
        }
        if (!email || !email.includes("@")) {
          setError("कृपया सही Email डालें।");
          form.elements.email.focus();
          return;
        }
        if (!/^[6-9]\d{9}$/.test(phone)) {
          setError("कृपया सही 10-digit Indian Mobile Number डालें।");
          form.elements.phone.focus();
          return;
        }
        if (coupon && (!verified || verified.coupon_code !== coupon)) {
          setError("पहले Verify button से coupon को verify करें।");
          verifyButton.focus();
          return;
        }

        var pay = form.querySelector(".checkout-pay");
        pay.disabled = true;
        pay.textContent = "Preparing…";
        close({ name: name, email: email, phone: phone, coupon: coupon });
      });

      requestAnimationFrame(function () {
        modal.classList.add("open");
        nameInput.focus();
      });
    });
  }

  document.addEventListener("click", async function (e) {
    var btn = e.target.closest(".buy-btn");
    if (!btn) return;

    var productId = btn.getAttribute("data-product-id");
    var backendProductId = PRODUCT_IDS[productId];
    var checkoutBook = BOOKS.filter(function (b) { return b.id === productId; })[0];

    if (!backendProductId || !checkoutBook) {
      showResultModal(null, { success: false, title: "Book not found", message: "यह किताब अभी उपलब्ध नहीं है।" });
      return;
    }

    var customer = await openCheckoutForm(checkoutBook);
    if (!customer) return;

    btn.disabled = true;
    btn.textContent = "Opening…";

    try {
      var response = await fetch(WORKER_URL + "/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: backendProductId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          coupon: customer.coupon
        })
      });

      var data = {};
      try { data = await response.json(); } catch (err) {}

      if (!response.ok) {
        showResultModal(null, {
          success: false,
          title: "Order शुरू नहीं हो सका",
          message: data.coupon_error || data.error || "कृपया थोड़ी देर बाद फिर कोशिश करें।"
        });
        return;
      }

      if (data.free && data.download_url) {
        showResultModal(data, {
          success: true,
          title: "Congratulations! 🎉",
          message: "आपका 100% OFF coupon successfully apply हो गया। आपकी eBook अब तैयार है।"
        });
        return;
      }

      if (!data.payment_session_id) {
        showResultModal(null, {
          success: false,
          title: "Payment शुरू नहीं हो सका",
          message: "Payment session नहीं मिला। कृपया फिर कोशिश करें।"
        });
        return;
      }

      if (typeof Cashfree !== "function") {
        showResultModal(null, {
          success: false,
          title: "Payment system load नहीं हुआ",
          message: "कृपया page refresh करके फिर कोशिश करें।"
        });
        return;
      }

      var cashfree = Cashfree({ mode: "production" });
      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });
    } catch (err) {
      console.error(err);
      showResultModal(null, {
        success: false,
        title: "Payment connection में समस्या",
        message: "Payment system से connection नहीं हो पाया। कृपया फिर कोशिश करें।"
      });
    } finally {
      btn.disabled = false;
      btn.textContent = "Buy Now";
    }
  });

  /* =========================
     PAYMENT RETURN
  ========================= */

  async function checkPaymentReturn() {
    var params = new URLSearchParams(location.search);
    var orderId = params.get("order_id");
    var paymentReturn = params.get("payment");

    if (paymentReturn !== "return" || !orderId) return;

    showResultModal(null, {
      success: false,
      title: "Payment verify हो रहा है…",
      message: "कृपया कुछ सेकंड इंतज़ार करें।"
    });

    try {
      var response = await fetch(
        WORKER_URL + "/api/payment-status?order_id=" + encodeURIComponent(orderId)
      );
      var data = await response.json();

      var old = document.querySelector(".result-modal");
      if (old) old.remove();
      document.body.classList.remove("result-open");

      if (data.status === "PAID" && data.download_url) {
        showResultModal(data, {
          success: true,
          title: "Payment Successful 🎉",
          message: "Congratulations! आपकी eBook तैयार है।"
        });
      } else if (data.status === "PENDING") {
        showResultModal(data, {
          success: false,
          title: "Payment अभी verify हो रहा है",
          message: "अगर payment से पैसे कटे हैं, दोबारा payment न करें। कुछ देर बाद Mera Order से भी check कर सकते हैं।"
        });
      } else {
        showResultModal(data, {
          success: false,
          title: "Payment verify नहीं हुआ",
          message: "अगर payment से पैसे कटे हैं तो दोबारा payment न करें। पहले कुछ देर बाद फिर check करें।"
        });
      }
    } catch (err) {
      console.error(err);
      var old2 = document.querySelector(".result-modal");
      if (old2) old2.remove();
      document.body.classList.remove("result-open");
      showResultModal(null, {
        success: false,
        title: "Verification में समस्या",
        message: "कृपया कुछ देर बाद फिर कोशिश करें।"
      });
    }
  }

  /* =========================
     START WEBSITE
  ========================= */

  async function start() {
    chrome();
    await loadSiteContent();

    var pg = document.body.dataset.page;

    if (pg === "home") {
      home();
    } else if (pg === "book") {
      book();
    }

    await loadD1Products();

    if (pg === "home") {
      home();
    } else if (pg === "book") {
      book();
    }

    checkPaymentReturn();
  }

  start();

})();
