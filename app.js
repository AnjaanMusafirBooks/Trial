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
    if (D1_PRODUCTS[b.id] && D1_PRODUCTS[b.id].mrp != null) {
      return Number(D1_PRODUCTS[b.id].mrp);
    }
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

        "<p>हर सफ़र बाहर जाने का नहीं होता।</p>" +

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

        '<a href="mailto:' +
        SITE.email +
        '">' +
        SITE.email +
        "</a>" +

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
        '<a href="mailto:' +
        SITE.email +
        '">' +
        SITE.email +
        "</a>" +

        '<a href="' +
        SITE.instagram +
        '" target="_blank" rel="noopener">Instagram ' +
        SITE.instagramName +
        "</a>";
    }
  }

  /* =========================
     CASHFREE BUY
  ========================= */

  document.addEventListener(
    "click",
    async function (e) {

      var btn =
        e.target.closest(
          ".buy-btn"
        );

      if (!btn) return;

      var productId =
        btn.getAttribute(
          "data-product-id"
        );

      var backendProductId =
        PRODUCT_IDS[
          productId
        ];

      if (!backendProductId) {
        alert(
          "Book not found."
        );
        return;
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
                '<div>' +
                  '<p class="checkout-kicker">ANJAAN MUSAFIR BOOKS</p>' +
                  '<h2 id="checkout-title">Complete Your Order</h2>' +
                '</div>' +
                '<button type="button" class="checkout-close" aria-label="Close" data-checkout-close>&times;</button>' +
              '</div>' +
              '<div class="checkout-book">' +
                '<img class="checkout-cover" src="' + esc(book.cover) + '" alt="' + esc(book.title) + ' — eBook cover">' +
                '<div class="checkout-book-info">' +
                  '<h3 class="checkout-title">' + esc(book.title) + '</h3>' +
                  '<div class="checkout-price">' + price(book) + '</div>' +
                  '<p class="checkout-secure">Secure checkout · Digital PDF</p>' +
                '</div>' +
              '</div>' +
              '<div class="checkout-divider"></div>' +
              '<form class="checkout-form" novalidate>' +
                '<label class="checkout-field">' +
                  '<span>Name <b>*</b></span>' +
                  '<input name="name" type="text" autocomplete="name" placeholder="अपना नाम लिखें" required>' +
                '</label>' +
                '<label class="checkout-field">' +
                  '<span>Email <b>*</b></span>' +
                  '<input name="email" type="email" autocomplete="email" placeholder="अपना Email लिखें" required>' +
                '</label>' +
                '<label class="checkout-field">' +
                  '<span>Mobile <em>(Optional)</em></span>' +
                  '<input name="phone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="10" placeholder="10-digit mobile number">' +
                '</label>' +
                '<label class="checkout-field">' +
                  '<span>Coupon Code <em>(Optional)</em></span>' +
                  '<input name="coupon" type="text" autocomplete="off" placeholder="Coupon code, अगर है">' +
                '</label>' +
                '<div class="checkout-error" hidden></div>' +
                '<div class="checkout-safe"><span class="checkout-safe-icon">✓</span><span>Your details are used only to create your order and payment session.</span></div>' +
                '<div class="checkout-actions">' +
                  '<button type="submit" class="btn primary checkout-pay">Continue to Payment</button>' +
                  '<button type="button" class="btn checkout-cancel" data-checkout-close>Cancel</button>' +
                '</div>' +
              '</form>' +
            '</div>';

          document.body.appendChild(modal);
          document.body.classList.add("checkout-open");

          var form = modal.querySelector(".checkout-form");
          var error = modal.querySelector(".checkout-error");
          var nameInput = form.elements.name;

          function close(value) {
            document.body.classList.remove("checkout-open");
            modal.classList.remove("open");
            setTimeout(function () {
              if (modal.parentNode) modal.remove();
            }, 230);
            resolve(value);
          }

          modal.querySelectorAll("[data-checkout-close]").forEach(function (el) {
            el.addEventListener("click", function () {
              close(null);
            });
          });

          document.addEventListener("keydown", function escClose(e) {
            if (!modal.parentNode) {
              document.removeEventListener("keydown", escClose);
              return;
            }

            if (e.key === "Escape") {
              document.removeEventListener("keydown", escClose);
              close(null);
            }
          });

          form.addEventListener("submit", function (e) {
            e.preventDefault();

            var name = form.elements.name.value.trim();
            var email = form.elements.email.value.trim();
            var phone = form.elements.phone.value.replace(/\D/g, "");
            var coupon = form.elements.coupon.value.trim().toUpperCase();

            error.hidden = true;
            error.textContent = "";

            if (!name) {
              error.textContent = "कृपया अपना नाम डालें।";
              error.hidden = false;
              nameInput.focus();
              return;
            }

            if (!email || !email.includes("@")) {
              error.textContent = "कृपया सही Email डालें।";
              error.hidden = false;
              form.elements.email.focus();
              return;
            }

            if (phone && !/^[6-9]\d{9}$/.test(phone)) {
              error.textContent = "कृपया सही 10-digit Indian Mobile Number डालें।";
              error.hidden = false;
              form.elements.phone.focus();
              return;
            }

            var pay = form.querySelector(".checkout-pay");

            pay.disabled = true;
            pay.textContent = "Preparing Payment...";

            close({
              name: name,
              email: email,
              phone: phone,
              coupon: coupon
            });
          });

          requestAnimationFrame(function () {
            modal.classList.add("open");
            nameInput.focus();
          });
        });
      }

      var checkoutBook =
        BOOKS.filter(function (b) {
          return b.id === productId;
        })[0];

      if (!checkoutBook) {
        alert("Book not found.");
        return;
      }

      var customer = await openCheckoutForm(checkoutBook);

      if (!customer) return;

      var name = customer.name;
      var email = customer.email;
      var phone = customer.phone;
      var coupon = customer.coupon;

      btn.disabled = true;

      btn.textContent =
        "Opening Payment...";

      try {

        var response =
          await fetch(
            WORKER_URL +
              "/api/create-order",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  product_id:
                    backendProductId,
                  name: name,
                  email: email,
                  phone: phone,
                  coupon: coupon
                })
            }
          );

        var data =
          await response.json();

        if (
          !response.ok ||
          !data.payment_session_id
        ) {

          console.error(data);

          alert(
            data && data.coupon_error
              ? data.coupon_error
              : "Payment शुरू नहीं हो सका। कृपया फिर कोशिश करें।"
          );

          btn.disabled =
            false;

          btn.textContent =
            "Buy Now";

          return;
        }

        if (
          typeof Cashfree !==
          "function"
        ) {

          alert(
            "Payment system load नहीं हुआ। कृपया page refresh करें।"
          );

          btn.disabled =
            false;

          btn.textContent =
            "Buy Now";

          return;
        }

        var cashfree =
          Cashfree({
            mode: "production"
          });

        await cashfree.checkout({
          paymentSessionId:
            data.payment_session_id,

          redirectTarget:
            "_self"
        });

      } catch (err) {

        console.error(err);

        alert(
          "Payment system से connection नहीं हो पाया।"
        );

        btn.disabled =
          false;

        btn.textContent =
          "Buy Now";
      }
    }
  );

  /* =========================
     PAYMENT RETURN
  ========================= */

  async function checkPaymentReturn() {

    var params =
      new URLSearchParams(
        location.search
      );

    var orderId =
      params.get(
        "order_id"
      );

    var paymentReturn =
      params.get(
        "payment"
      );

    if (
      paymentReturn !==
        "return" ||
      !orderId
    ) {
      return;
    }

    var box =
      document.createElement(
        "div"
      );

    box.style.cssText =
      "position:fixed;inset:0;background:#101a26;color:white;" +
      "display:flex;align-items:center;justify-content:center;" +
      "z-index:99999;padding:24px;text-align:center;font-family:Arial,sans-serif;";

    box.innerHTML =
      "<div>" +

      "<h2>Payment verify हो रहा है...</h2>" +

      "<p>कृपया कुछ सेकंड इंतज़ार करें।</p>" +

      "</div>";

    document.body.appendChild(
      box
    );

    try {

      var response =
        await fetch(
          WORKER_URL +
            "/api/payment-status?order_id=" +
            encodeURIComponent(
              orderId
            )
        );

      var data =
        await response.json();

      if (
        data.status ===
          "PAID" &&
        data.download_url
      ) {

        box.innerHTML =
          "<div>" +

          "<h2>Payment Successful ✅</h2>" +

          "<p>आपकी eBook तैयार है।</p>" +

          "<p>Order ID: <b>" +
          esc(data.order_id) +
          "</b><br><small>इसे संभालकर रखें।</small></p>" +

          '<a href="' +
          data.download_url +
          '" style="display:inline-block;padding:14px 22px;background:#b8892e;color:white;text-decoration:none;border-radius:8px;margin-top:15px;">Download eBook</a>' +

          '<p style="margin-top:14px"><a href="my-order.html">link खो जाए तो Mera Order खोलें</a></p>' +

          "</div>";

      } else if (
        data.status ===
        "PENDING"
      ) {

        box.innerHTML =
          "<div>" +

          "<h2>Payment अभी verify हो रहा है</h2>" +

          "<p>कुछ सेकंड बाद फिर कोशिश करें।</p>" +

          "</div>";

      } else {

        box.innerHTML =
          "<div>" +

          "<h2>Payment verify नहीं हुआ</h2>" +

          "<p>अगर payment से पैसे कटे हैं तो दोबारा payment न करें।</p>" +

          "</div>";
      }

    } catch (err) {

      console.error(err);

      box.innerHTML =
        "<div>" +

        "<h2>Verification में समस्या हुई</h2>" +

        "<p>कृपया कुछ देर बाद फिर कोशिश करें।</p>" +

        "</div>";
    }
  }

  /* =========================
     START WEBSITE
  ========================= */

  async function start() {

    chrome();

    var pg =
      document.body.dataset.page;

    /*
      BOOKS पहले render होंगे।
      D1 केवल latest price/offer के लिए है।
      इसलिए D1 slow या unavailable होने पर
      books गायब नहीं होंगी।
    */

    if (pg === "home") {
      home();

    } else if (pg === "book") {
      book();
    }

    /*
      D1 data आने के बाद latest
      price/MRP/offer के लिए refresh।
    */

    await loadD1Products();

    if (pg === "home") {
    } else if (pg === "book") {
      book();
    }

    checkPaymentReturn();
  }

  start();

})();
