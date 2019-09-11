// STEP 1 - DECLARE ALL VARIABLES, FUNCTIONS AND METHODS ---------------------------------------------------------------------------------

jQuery.fn.extend({
  expand: function() {
    var $toExpand = $(this).hasClass("expanded") ? $("") : $(this);
    var $toCollapse = $(this).hasClass("expanded")
      ? $(this)
      : $(".product-row.expanded").not($(this));
    var language = $("html")
      .attr("lang")
      .replace(/-/g, "");
    var speed = 400;
    $toExpand
      .find(".product-features, .product-summary")
      .hide(speed, function() {
        $toExpand
          .addClass("expanded")
          .find(
            ".product-features, .product-details, .product-document-link.en, .product-document-link." +
              language +
              ", .product-contact-link, .product-images img:not(:first)"
          )
          .show(speed);
      });
    $toCollapse
      .find(
        ".product-features, .product-details, .product-document-link.en, .product-document-link." +
          language +
          ", .product-contact-link, .product-images img:not(:first)"
      )
      .hide(speed, function() {
        $toCollapse
          .removeClass("expanded")
          .find(".product-features, .product-summary")
          .show(speed);
      });
    return this;
  }
});

nabu = {
  banners: {
    i: 0,
    n: 0,
    content: [],
    preloadComplete: false,
    timer: null,
    prepare: function() {
      // load all banners into an object
      // filter out irrelevant banners
      // rank the banner based on times viewed and relevance
      // add navigation buttons
      nabu.banners.n = $("#banners article").length;
      $("#banners article").each(function(i) {
        var img = "";
        for (var j = 0; j < 10; j++) {
          if ($(this).hasClass("bg-" + j)) {
            img =
              '<img src="http://' +
              window.location.host +
              "/sites/all/themes/zen_interflux/images/banner-" +
              j +
              '.jpg" width:"958" height="220" />';
            break;
          }
        }
        nabu.banners.content[i] = {
          name: $(this).attr("id"),
          html: $(this),
          img: img
        };
        console.log(i, nabu.banners.content[i].name);
        $(this).remove();
        $("#banners nav ul").append("<li><div></div></li>");
      });
    },
    preload: function() {
      // preload the first image into #preload
      // preload all other images as soon as the first one is fully loaded
      // remove #preload as soon as all images are fully loaded
      $("#banners .preload")
        .append($(nabu.banners.content[0].img))
        .imagesLoaded()
        .always(function() {
          $.each(nabu.banners.content, function(i) {
            $("#banners .preload").append($(nabu.banners.content[i].img));
          });
          $("#banners .preload")
            .imagesLoaded()
            .always(function() {
              nabu.banners.preloadComplete = true;
              $("#banners .preload").remove();
            });
        });
    },
    rotateTo: function(i, easing) {
      // display a specific banner
      // function parameter i can be 'next', 'prev' or the i within nabu.banners.content[i]
      console.log(i, nabu.banners.i);
      if (i !== nabu.banners.i) {
        var n = nabu.banners.n; // total number of banners
        var a = nabu.banners.i; // the current banner that will be dissapearing
        var b = i == "next" ? a + 1 : i == "prev" ? a - 1 : i; // the new banner that will be appearing
        b = b < 0 ? n - 1 : b;
        b = b > n - 1 ? 0 : b;
        nabu.banners.i = b;
        var speed1 = 1200;
        var speed2 = nabu.banners.preloadComplete ? 0 : 600;
        var easing = easing || "easeOutQuart"; // if easing is undefined, default to easeOutQuart (for next, prev and nav li)
        // var easing = i == 'next' || i == 'prev' ? 'easeOutQuart' : 'easeInOutQuart';
        if (i == "prev") {
          // add new banner with next animation
          $(nabu.banners.content[b].html)
            .clone()
            .append($(nabu.banners.content[b].img))
            .prependTo($("#banners .stage"))
            .css({
              transform: "scale(0.9,0.9)",
              opacity: 0
            })
            .delay(0)
            .animate(
              {
                transform: "scale(1,1)",
                opacity: 1
              },
              speed1,
              easing
            )
            .imagesLoaded()
            .done(function(instance) {
              $(instance.elements[0])
                .addClass("image-done")
                .find("img")
                .fadeTo(speed2, 1);
            })
            .fail(function() {
              $(instance.elements[0]).addClass("image-broken");
            });
          // remove old banner with next animation
          $("#banners article")
            .slice(1)
            .stop()
            .animate(
              {
                transform: "scale(1.1,1.1)",
                opacity: 0
              },
              speed1,
              easing,
              function() {
                $(this).remove();
              }
            );
        } else if (i == "next" || typeof i === "number") {
          // add new banner with prev animation
          $(nabu.banners.content[b].html)
            .clone()
            .append($(nabu.banners.content[b].img))
            .appendTo($("#banners .stage"))
            .css({
              transform: "scale(1.1,1.1)",
              opacity: 0
            })
            .delay(0)
            .animate(
              {
                transform: "scale(1,1)",
                opacity: 1
              },
              speed1,
              easing
            )
            .imagesLoaded()
            .done(function(instance) {
              $(instance.elements[0])
                .addClass("image-done")
                .find("img")
                .fadeTo(speed2, 1);
            })
            .fail(function() {
              $(instance.elements[0]).addClass("image-broken");
            });
          // remove old banner with prev animation
          $("#banners article")
            .slice(0, -1)
            .stop()
            .animate(
              {
                transform: "scale(0.9,0.9)",
                opacity: 0
              },
              speed1,
              easing,
              function() {
                $(this).remove();
              }
            );
        }
        $("#banners nav li")
          .removeAttr("class")
          .eq(b)
          .addClass("active");
      }
    },
    startTimer: function() {
      nabu.banners.timer = setInterval(function() {
        nabu.banners.rotateTo("next", "easeInOutQuart");
      }, 5000);
    },
    pauseTimer: function() {
      clearInterval(nabu.banners.timer);
    }
  },
  products: {
    addReadMore: function() {
      var language = $("html")
        .attr("lang")
        .replace(/-/g, "");
      var translation = {
        en: "Read more ...",
        de: "mehr lesenâ€¦",
        fr: "En savoir plus â€¦",
        it: "Leggi ancoraâ€¦.",
        ptpt: "mais informaÃ§Ã£o",
        ro: "Citeste mai multe...",
        es: "mÃ¡s informaciÃ³n",
        sv: "LÃ¤s mer...",
        pl: "Czytaj wiÄ™cej...",
        ru: "ÐŸÐ¾Ð´Ñ€Ð¾Ð±Ð½ÐµÐµ â€¦",
        cs: "ÄŒÃ­st vÃ­ce ...",
        th: "à¸­à¹ˆà¸²à¸™à¹€à¸žà¸´à¹ˆà¸¡à¹€à¸•à¸´à¸¡ ...",
        id: "Baca lebih lanjut ...",
        zhhans: "æ›´å¤šâ€¦",
        tr: "Daha fazla bilgi..."
      };
      $(".product-row .product-summary p").append(
        ' <a href="javascript:void(0)" class"read-more"> ' +
          translation[language] +
          "</a>"
      );
    },
    wrapTooltips: function() {
      $(".product-features li>div+p")
        .wrapInner("<span></span>")
        .prepend('<div class="tooltip-arrow"></div>');
    },
    translateContactLinks: function() {
      var language = $("html")
        .attr("lang")
        .replace(/-/g, "");
      var translations = {
        samples: {
          en: "More information / demos / samples",
          de: "Weitere Informationen / Demos / Proben",
          fr: "Plus d'information / dÃ©mos / Ã©chantillons",
          it: "Ulteriori informazioni / demo / campioni",
          ptpt: "Mais informaÃ§Ãµes / demos / amostras",
          ro: "Mai multe informaÈ›ii / demo-uri / probe",
          es: "MÃ¡s informaciÃ³n / demos / muestras",
          sv: "Mer information / demos / prov",
          pl: "WiÄ™cej informacji / demos / prÃ³bki",
          ru: "ÐŸÐ¾Ð´Ñ€Ð¾Ð±Ð½ÐµÐµ / Ð´ÐµÐ¼ÐºÐ¸ / Ð¾Ð±Ñ€Ð°Ð·Ñ†Ñ‹",
          cs: "VÃ­ce informacÃ­ / dema / ukÃ¡zky",
          th:
            "à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸žà¸´à¹ˆà¸¡à¹€à¸•à¸´à¸¡ / à¸ªà¸²à¸˜à¸´à¸• / à¸•à¸±à¸§à¸­à¸¢à¹ˆà¸²à¸‡",
          id: "Informasi lebih lanjut / demo / sampel",
          zhhans: "æ›´å¤šä¿¡æ¯/æ¼”ç¤º/æ ·æœ¬",
          tr: "Daha fazla bilgi / demos / numuneler"
        }
      };
      $(".product-row .product-contact-link a").html(
        translations.samples[language]
      );
    },
    animateHighlight: function() {
      // animate the orange product title highlight label
      $(".product-highlight h3").each(function() {
        $(this)
          .clone()
          .appendTo($(this).parent());
      });
      var timer = setInterval(
        function() {
          $(".product-highlight h3:first-child")
            .css({
              marginTop: "0px"
            })
            .animate({
              marginTop: "-22px"
            }),
            1000;
        },
        2500,
        "easeOutExpo"
      );
    }
  },
  link: {
    hashTag: window.location.hash.slice(1),
    hasValidHashTag: function() {
      return nabu.link.hashTag.match(/^\d+$/);
    },
    scrollToTarget: function() {
      console.log(nabu.link.hashTag);
      var $target = $(".product-row .node-" + nabu.link.hashTag).parent(
        ".product-row"
      );
      window.scrollTo(0, 0);
      if ($target.length) {
        $target.addClass("expanded");
        $("html,body").animate(
          {
            scrollTop: $target.offset().top - 30
          },
          1200
        );
      }
    }
  },
  allPages: function() {
    $(".region-footer2 .inner-region").wrap(
      '<div class="bg-footer-top"><div class="bg-footer-bottom"></div></div>'
    );
    $(".messages").click(function() {
      $(this).hide();
    });
  },
  languageBlock: function() {
    $("#block-locale-language").append('<div class="bg-lang-right"></div>');
    $("#block-locale-language .language-switcher-locale-url").append(
      '<div class="bg-lang"></div><div class="bg-lang-left"></div>'
    );
    $(
      "#block-locale-language .language-switcher-locale-url li.active"
    ).prependTo("#block-locale-language .language-switcher-locale-url");
    $("#block-locale-language .language-switcher-locale-url li.active")
      .prepend("Language: ")
      .append('<div class="arrow-1"></div>');
    var w1 = $("#block-locale-language li.active").width() + 1;
    $("#block-locale-language .inner-block").css({
      width: w1
    });
    var w2 = 50; /* this may vary depending on amount of languages */
    $("#block-locale-language li").each(function() {
      w2 =
        w2 +
        parseFloat($(this).width()) +
        parseFloat($(this).css("padding-right"));
    });
    var langIsExpanded = false;
    $("#block-locale-language li.active").click(function(e) {
      e.preventDefault();
      if (langIsExpanded == false) {
        $("#block-locale-language .inner-block").animate(
          {
            width: w2
          },
          1200
        );
        $("#block-locale-language li")
          .not(".active")
          .each(function(idx) {
            $(this)
              .delay(idx * 120)
              .fadeTo(1200, 1);
          });
        $(".arrow-1").fadeTo(1200, 1);
        langIsExpanded = true;
      } else {
        e.preventDefault();
        $("#block-locale-language .inner-block").animate(
          {
            width: w1
          },
          1200
        );
        $("#block-locale-language li, .arrow-1")
          .not(".active")
          .fadeTo(1200, 0);
        langIsExpanded = false;
      }
    });
  },
  navigationBlock: function() {
    var now = new Date();
    var yearNow = now.getFullYear();
    var yearStart = 1980;
    var ageIF = yearNow - yearStart;
    $("#block-menu-menu-interflux-menu>div>ul.menu").attr("id", "nav");
    $("body.i18n-en #nav").append(
      '<div class="slogan">Interflux, bringing chemistry to electronics for over ' +
        ageIF +
        " years</div>"
    );
    $("body.i18n-de #nav").append(
      '<div class="slogan">Interflux, Ã¼ber ' +
        ageIF +
        " Jahre Chemie fÃ¼r die Elektronikfertigung</div>"
    );
    $("body.i18n-fr #nav").append(
      '<div class="slogan">Interflux, fabricant de produits chimiques pour lâ€™industrie Ã©lectronique depuis ' +
        ageIF +
        " ans</div>"
    );
    $("body.i18n-es #nav").append(
      '<div class="slogan">Interflux, suministrando productos quÃ­micos para la electronica por mas de ' +
        ageIF +
        " aÃ±os</div>"
    );
    $("body.i18n-pt-pt #nav").append(
      '<div class="slogan">Interflux, por mais de ' +
        ageIF +
        " anos fornecimento de quÃ­mica para a eletrÃ´nica</div>"
    );
    $("body.i18n-it #nav").append(
      '<div class="slogan">Interflux, produce la chimica per lâ€™elettronica da oltre ' +
        ageIF +
        " anni</div>"
    );
    $("body.i18n-ro #nav").append(
      '<div class="slogan">Interflux ofera produse chimice pentru electronica de peste ' +
        ageIF +
        " ani</div>"
    );
    $("body.i18n-sv #nav").append(
      '<div class="slogan">Interflux, har fÃ¶rt kemi till elektroniken i Ã¶ver ' +
        ageIF +
        " Ã¥r</div>"
    );
    $("body.i18n-ru #nav").append(
      '<div class="slogan">Interflux â€“ ÑƒÐ¶Ðµ Ð±Ð¾Ð»ÑŒÑˆÐµ ' +
        ageIF +
        " Ð»ÐµÑ‚ Ð¼Ñ‹ Ð¾Ð±ÑŠÐµÐ´Ð¸Ð½ÑÐµÐ¼</div>"
    );
    $("body.i18n-pl #nav").append(
      '<div class="slogan">Interflux, procesy chemiczne dla elektroniki od ponad ' +
        ageIF +
        " lat</div>"
    );
    $("body.i18n-cs #nav").append(
      '<div class="slogan">Interflux, procesy chemiczne dla elektroniki od ponad ' +
        ageIF +
        " lat</div>"
    );
    $("body.i18n-th #nav").append(
      '<div class="slogan">à¸­à¸´à¸™à¹€à¸•à¸­à¸£à¹Œà¸Ÿà¸¥à¸±à¸à¸‹à¹Œà¹„à¸”à¹‰à¸™à¸³à¸œà¸¥à¸´à¸•à¸ à¸±à¸“à¸‘à¹Œà¸ªà¸²à¸£à¹€à¸„à¸¡à¸µ à¸¡à¸²à¸ªà¸¹à¹ˆà¸§à¸‡à¸à¸²à¸£à¸­à¸´à¹€à¸¥à¹‡à¸à¸—à¸£à¸­à¸™à¸´à¸à¸ªà¹Œà¹€à¸›à¹‡à¸™à¹€à¸§à¸¥à¸²à¸à¸§à¹ˆà¸² ' +
        ageIF +
        " à¸›à¸µ</div>"
    );
    $("body.i18n-id #nav").append(
      '<div class="slogan">Interflux, menyatukan bahan kimia dengan alat elektronik selama lebih dari ' +
        ageIF +
        " tahun</div>"
    );
    $("body.i18n-zh-hans #nav").append(
      '<div class="slogan">Interfluxè‡´åŠ›äºŽç”µå­å·¥ä¸šä¸­çš„åŒ–å­¦åº”ç”¨é¢†åŸŸè¶…è¿‡' +
        ageIF +
        "å¹´</div>"
    );
    $("body.i18n-tr #nav").append(
      '<div class="slogan">Interflux ' +
        ageIF +
        " y&#305;l&#305; a&#351;k&#305;n bir s&uuml;redir elektronik sekt&ouml;r&uuml;ne kimyasal &uuml;r&uuml;n sunar</div>"
    );
    $("#nav .expanded>a").click(function(e) {
      e.preventDefault();
    });
  },
  homePage: function() {
    $(".page-home .region-corpus .inner-region").wrap(
      '<div class="bg-home-top"><div class="bg-home-bottom"></div></div>'
    );
    $(".page-home a.active").click(function(event) {
      event.preventDefault();
    });
    $("#homepage-nav .pane-content>ul>li").each(function() {
      var i = $(this).index() + 1;
      $(this).attr("id", "home" + i);
    });
    $("#homepage-nav .pane-content>ul>li>a").each(function() {
      var tooltip = $(this).attr("title");
      $(this)
        .wrapInner('<div class="title"></div>')
        .append('<div class="desc">' + tooltip + "</div>")
        .removeAttr("title");
    });
    $("#homepage-nav .pane-content>ul").prepend(
      '<div class="home-1"></div><div class="home-2"></div><div class="home-3"></div><div class="home-4"></div><div class="home-5"></div><div class="home-6"></div><div class="home-7"></div><div class="home-8"></div><div class="home-9"></div><div class="home-10"></div>'
    );
    $("#homepage-lang .language-switcher-locale-url").prepend(
      "<li>Languages: </li>"
    );

    function showHomeBg(index) {
      if (index > 0 && index <= 5) {
        $(".home-1, .home-2, .home-3, .home-4, .home-5")
          .stop()
          .animate(
            {
              opacity: 0
            },
            400
          );
        $(".home-" + index)
          .stop()
          .css("opacity", "1")
          .prependTo(".pane-menu-menu-interflux-menu>.pane-content>.menu");
      } else if (index > 5 && index <= 10) {
        $(".home-6, .home-7, .home-8, .home-9, .home-10")
          .stop()
          .animate(
            {
              opacity: 0
            },
            400
          );
        $(".home-" + index)
          .stop()
          .css("opacity", "1")
          .prependTo(".pane-menu-menu-interflux-menu>.pane-content>.menu");
      }
    }
    $("#home1 li a").hover(function() {
      var i =
        $(this)
          .parent()
          .index() + 1;
      showHomeBg(i);
    });
    $("#home2 li a").hover(function() {
      var i =
        $(this)
          .parent()
          .index() + 6;
      showHomeBg(i);
    });

    // ADD ARROWS TO THE HOMEPAGE LINKS
    $("#home1 ul a, #home2 ul a").each(function() {
      $(this).append('<div class="arrow"></div>');
    });

    // LOAD HIDDEN IMAGES ONLY AFTER DOM READY
    $(
      ".home-2, .home-3, .home-4, .home-5, .home-6, .home-7, .home-9, .home-10"
    ).css(
      "background-image",
      "url(/sites/all/themes/zen_interflux/images/homepage-images-2.jpg)"
    );
  },
  documentsPage: function() {
    // VARIABLES
    var language = $("html")
      .attr("lang")
      .replace(/-/g, "");
    var translations = {
      searchDocuments: {
        en: "SEARCH DOCUMENTS",
        de: "DOKUMENTSUCHE",
        fr: "Recherche de documents",
        it: "RICERCA DOCUMENTI",
        ptpt: "Buscar documentos",
        ro: "CAUTA DOCUMENTE",
        es: "Buscar documentos",
        sv: "SÃ–K DOKUMENT",
        pl: "szukaj dokumentÃ³w",
        ru: "ÐŸÐ¾Ð¸ÑÐº Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ð¾Ð²",
        cs: "HLEDAT DOKUMENTY",
        th: "à¸„à¹‰à¸™à¸«à¸²à¹€à¸­à¸à¸ªà¸²à¸£",
        id: "SEARCH DOCUMENTS",
        zhhans: "æœç´¢æ–‡ä»¶",
        tr: "ARAMA BELGELER"
      },
      noResults: {
        en: "No results",
        de: "Keine Ergebnisse",
        fr: "Pas de rÃ©sultats",
        it: "Nessun risultato",
        ptpt: "Sem resultado",
        ro: "Niciun rezultat",
        es: "No hay resultados",
        sv: "Inga resultat",
        pl: "Brak wynikÃ³w",
        ru: "Ñ€ÐµÐ·ÑƒÐ»ÑŒÑ‚Ð°Ñ‚ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½",
        cs: "Å½Ã¡dnÃ© vÃ½sledky",
        th: "à¹„à¸¡à¹ˆà¸žà¸š",
        id: "No results",
        zhhans: "æ— ",
        tr: "Sonu&ccedil; yok"
      },
      example: {
        en: "e.g. 2005M English",
        de: "z.B. 2005M Deutsch",
        fr: "par exemple 2005M FranÃ§ais",
        it: "ad esempio 2005M Italiano",
        ptpt: "por exemplo 2005M PortuguÃªs",
        ro: "de exemplu, 2005M RomÃ¢nÄƒ",
        es: "por ejemplo 2005M EspaÃ±ol",
        sv: "t ex 2005M Svenska",
        pl: "np. 2005M",
        ru: "Ð½Ð°Ð¿Ñ€Ð¸Ð¼ÐµÑ€ 2005M",
        cs: "napÅ™. 2005M English",
        th: "à¹€à¸Šà¹ˆà¸™à¸œà¸¹à¹‰ 2005M",
        id: "misalnya 2005M",
        zhhans: "ä¾‹å¦‚ï¼š2005M",
        tr: ""
      }
    };

    // TRANSLATE
    $("#document-search h2").html(translations.searchDocuments[language]);
    $("#document-search input").attr(
      "placeholder",
      translations.example[language]
    );
    $("#document-list .document-rows").prepend(
      '<div class="no-results">- ' +
        translations.noResults[language] +
        " -</div>"
    );

    // CLICK SEARCH BOX BEHAVIOUR
    $("body.page-documents").click(function() {
      $("#document-search .searchbox").removeClass("focus");
    });
    $("#document-search .searchbox").click(function(e) {
      e.stopPropagation();
      $(this).addClass("focus");
      $(this)
        .children("input")
        .focus();
    });
    $("#document-search .clear-button").click(function() {
      $(this).hide();
      $("#document-search input")
        .val("")
        .focus()
        .trigger("keyup");
    });

    // SEARCH LOGIC
    $(
      "#document-list .document-group-name .field, #document-list .document-pdf .label, .document-pdf .field a"
    ).addClass("search-me");
    $("#document-search input").on("keyup blur change", function() {
      $("#document-list .views-row").removeClass("has-all-search-words");
      $(".search-me")
        .find("em")
        .contents()
        .unwrap();
      if ($(this).val()) {
        // if the search box has text

        // 1. GET SEARCH WORDS
        var arr = $(this)
          .val()
          .split(" "); // space separate the search words
        var searchWords = [];
        for (var i = 0; i < arr.length; i++) {
          // removes all the empty search values by pushing the non-empties into a new array
          if (arr[i]) {
            searchWords.push(arr[i]);
          }
        }

        // 2. LOOP THROUGH SEARCHABLE ELEMENTS
        $(".search-me").each(function() {
          // 3. LOOP THROUGH SEARCH WORDS
          for (var i = 0; i < searchWords.length; i++) {
            // loop over each space separated search word

            // 4. IN THIS SEARCHABLE ELEMENT, WRAP THIS SEARCH WORD
            var $searchees = $(this);
            var searchMeText = $searchees.html();
            var pattern = new RegExp(searchWords[i], "gi");
            var arrSplits = searchMeText.split(pattern);
            var arrMatches = searchMeText.match(pattern);
            var STR = "";
            if (arrMatches !== null) {
              STR += arrSplits[0];
              for (var ii = 0; ii < arrMatches.length; ii++) {
                var jj = ii + 1;
                STR += "#" + arrMatches[ii] + "@"; // originally <em> and </em> but proved buggy when looking for a word starting with e or m (English) for example, so replace by # and @
                STR += arrSplits[jj];
              }
              $searchees.html(STR);
              $searchees
                .parents("#document-list .views-row")
                .addClass("has-" + searchWords[i]);
            }

            // if (arrMatches !== null) {
            //     for (var ii = 0; ii < arrSplits.length; ii++) {
            //         STR += arrSplits[ii];
            //         if (arrMatches[ii]) {
            //             STR += '#' + arrMatches[ii] + '@'; // originally <em> and </em> but proved buggy when looking for a word starting with e or m (English) for example, so replace by # and @
            //         }
            //     }
            //     $searchees.html(STR);
            //     $searchees.parents('#document-list .views-row').addClass('has-' + searchWords[i]);
            // };
          } // end search word loop

          $(this).html(
            $(this)
              .html()
              .replace(/#/g, "<em>")
              .replace(/@/g, "</em>")
          );
        }); // end of searchable elements loop

        // 5. EVALUATE WHICH DOCUMENTS TO HIDE
        $("#document-list .views-row").each(function() {
          var k = 0;
          for (var i = 0; i < searchWords.length; i++) {
            if ($(this).hasClass("has-" + searchWords[i])) {
              k++;
            }
          }
          if (k >= searchWords.length) {
            $(this).addClass("has-all-search-words");
          } else {
            $(this).removeClass("has-all-search-words");
          }
        });

        // 6. SHOW CLEAR TEXT BUTTON
        $("#document-search .clear-button").show();
      } else {
        // if the search box is empty
        $("#document-list .views-row").addClass("has-all-search-words");
        $("#document-search .clear-button").hide();
      }

      // 6. SHOW HIDE DOCUMENTS
      $("#document-list .views-row.has-all-search-words").show();
      $("#document-list .views-row:not(.has-all-search-words)").hide();

      // 7. REDEFINE WHICH ROWS ARE ODD OR EVEN
      $("#document-list .views-row").removeClass(
        "views-row-odd views-row-even"
      );
      $("#document-list .views-row.has-all-search-words")
        .filter(":even")
        .addClass("views-row-odd");
      $("#document-list .views-row.has-all-search-words")
        .filter(":odd")
        .addClass("views-row-even");

      // 8. ACTIONS WHEN THERE ARE NOT RESULTS
      if ($("#document-list .views-row.has-all-search-words").length > 0) {
        $("#document-list .no-results").hide();
      } else {
        $("#document-list .no-results").show();
      }
    });
  },
  contactPage: function() {
    // VARIABLES
    var language = $("html")
      .attr("lang")
      .replace(/-/g, "");
    var translations = {
      whereLocated: {
        en: "WHERE IS YOUR COMPANY LOCATED?",
        de: "Wo befindet sich Ihr Unternehmen?",
        fr: "OÃ¹ est situÃ©e votre entreprise ?",
        it: "IN CHE LOCALITA' SI TROVA LA TUA SOCIETA'?",
        ptpt: "Onde vocÃª estÃ¡?",
        ro: "Unde este localizata compania ta?",
        es: "Â¿DÃ³nde se encuentra su empresa?",
        sv: "Var finns ert fÃ¶retag?",
        pl: "Gdzie siÄ™ mieÅ›ci Twoja firma?",
        ru: " Ð Ð°ÑÐ¿Ð¾Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ Ð’Ð°ÑˆÐµÐ¹ ÐºÐ¾Ð¼Ð¿Ð°Ð½Ð¸Ð¸",
        cs: "KDE SE NACHÃZÃ VAÅ E SPOLEÄŒNOST?",
        th:
          "à¸šà¸£à¸´à¸©à¸±à¸—à¸‚à¸­à¸‡à¸„à¸¸à¸“à¸•à¸±à¹‰à¸‡à¸­à¸¢à¸¹à¹ˆà¸—à¸µà¹ˆà¹ƒà¸”",
        id: "Di mana lokasi perusahaan Anda?",
        zhhans: "ä½ çš„å…¬å¸åœ°å€ä½äºŽï¼Ÿ",
        tr: "NEREDE F&#304;RMA BULUNMAKTADIR ?"
      },
      yourCountry: {
        en: "Your country ...",
        de: "Ihr Land ...",
        fr: "Votre pays ...",
        it: "Il tuo paese ...",
        ptpt: "O seu paÃ­s ...",
        ro: "Tara ta ...",
        es: "Su paÃ­s ...",
        sv: "Ditt land ...",
        pl: "TwÃ³j kraj:",
        ru: "Ð¡Ñ‚Ñ€Ð°Ð½Ð° ",
        cs: "VaÅ¡e zemÄ› ...",
        th: "à¸›à¸£à¸°à¹€à¸—à¸¨à¸‚à¸­à¸‡à¸„à¸¸à¸“",
        id: "Negara anda....",
        zhhans: "ä½ çš„å…¬å¸åœ°å€ä½äºŽï¼Ÿ",
        tr: "Senin ulken ..."
      },
      headquarters: {
        en:
          "Headquarters of the InterfluxÂ® Group. Researches, develops and produces soldering chemicals and solders. Distributor for all countries.",
        de:
          "Hauptsitz der InterfluxÂ® Gruppe. Entwickelt und produziert LÃ¶tchemie und Lot. Verteiler fÃ¼r alle LÃ¤nder.",
        fr:
          "SiÃ¨ge du Groupe InterfluxÂ®. Recherche, dÃ©veloppe et fabrique des produits chimiques pour le brasage. Distributeur pour tous les pays.",
        it:
          "Sede del Gruppo InterfluxÂ®. Ricerca, sviluppa e produce prodotti chimici saldatura e e leghe di saldatura. Distributore per tutti i paesi.",
        ptpt:
          "Sede do Grupo InterfluxÂ®. Pesquisa, desenvolvimento e produÃ§Ã£o dos produtos quÃ­micos de solda. Distribuidor para todos os paÃ­ses.",
        ro:
          "Sediul grupului InterfluxÂ®. Cercetari, dezvoltÄƒ È™i produce chimice lipire È™i aliaje de lipit. Distribuitor pentru toate È›Äƒrile.",
        es:
          "Sede del Grupo InterfluxÂ®. Investiga, desarrolla y fabrica productos quÃ­micos para soldadura y soldaduras. Distribuidor para todos los paÃ­ses.",
        sv:
          "HÃ¶gkvarter InterfluxÂ® Grupp. Forskar, utvecklar och producerar lÃ¶dning kemikalier och lod. DistributÃ¶r fÃ¶r alla lÃ¤nder.",
        pl:
          "Centala InterfluxÂ® Group. Bada, rozwija i produkuje chemiÄ™ do procesÃ³w elektroniczych. Dystrybutor dla wszystkich krajÃ³w",
        ru:
          "Ð“Ð¾Ð»Ð¾Ð²Ð½Ð¾Ð¹ Ð¾Ñ„Ð¸Ñ Ð“Ñ€ÑƒÐ¿Ð¿Ñ‹ ÐšÐ¾Ð¼Ð¿Ð°Ð½Ð¸Ð¹ InterfluxÂ®. Ð˜ÑÑÐ»ÐµÐ´Ð¾Ð²Ð°Ð½Ð¸Ñ, Ñ€Ð°Ð·Ñ€Ð°Ð±Ð¾Ñ‚ÐºÐ° Ð¸ Ð¿Ñ€Ð¾Ð¸Ð·Ð²Ð¾Ð´ÑÑ‚Ð²Ð¾ Ñ…Ð¸Ð¼Ð¸Ñ‡ÐµÑÐºÐ¸Ñ… Ð¼Ð°Ñ‚ÐµÑ€Ð¸Ð°Ð»Ð¾Ð² Ð´Ð»Ñ Ð¿Ð°Ð¹ÐºÐ¸ . Ð”Ð¸ÑÑ‚Ñ€Ð¸Ð±ÑŒÑŽÑ‚Ð¾Ñ€ Ð¿Ð¾ Ð²ÑÐµÐ¼ ÑÑ‚Ñ€Ð°Ð½Ð°Ð¼",
        cs:
          "HlavnÃ­ sÃ­dlo skupiny Interflux Â®. VÃ½zkum, vÃ½voj a vÃ½roba pÃ¡jecÃ­ch chemiÃ­ a pÃ¡jky. Distributor pro vÅ¡echny zemÄ›.",
        th:
          "à¸ªà¸³à¸™à¸±à¸à¸‡à¸²à¸™à¹ƒà¸«à¸à¹ˆà¸‚à¸­à¸‡ Interflux à¹„à¸”à¹‰à¸—à¸³à¸à¸²à¸£à¸„à¹‰à¸™à¸„à¸§à¹‰à¸² , à¸žà¸±à¸’à¸™à¸² à¹à¸¥à¸°à¸œà¸¥à¸´à¸•à¹€à¸à¸µà¹ˆà¸¢à¸§à¸à¸±à¸šà¸™à¹‰à¸³à¸¢à¸²à¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸›à¸£à¸°à¸ªà¸²à¸™à¹à¸¥à¸°à¸¥à¸§à¸”à¹€à¸Šà¸·à¹ˆà¸­à¸¡ à¹‚à¸”à¸¢à¸ˆà¸±à¸”à¸ˆà¸³à¸«à¸™à¹ˆà¸²à¸¢à¹„à¸›à¸¢à¸±à¸‡à¸ªà¸²à¸‚à¸²à¸—à¸±à¹ˆà¸§à¸›à¸£à¸°à¹€à¸—à¸¨",
        id:
          "Kantor Pusat dari Kelompok Interflux. Meneliti, mengembangkan dan memproduksi bahan-bahan kimia untuk pensolderan dan bahan-bahan solder. Distributor untuk semua negara.",
        zhhans:
          "InterfluxÂ®é›†å›¢æ€»éƒ¨ç”Ÿäº§åŠç ”å‘ä½•ç§ç„Šæ–™ç»é”€å•†éå¸ƒå…¨çƒ",
        tr:
          "InterfluxÂ® Grup'un genel merkezi. Lehimleme kimyasallar&#305; ve lehimler ara&#351;t&#305;r&#305;r, geli&#351;tirir ve &uuml;retir. T&uuml;m &uuml;lkeler i&ccedil;in distrib&uuml;t&ouml;rler."
      },
      member: {
        en: "Member of the InterfluxÂ® Group. Distributor for",
        de: "Mitglied der InterfluxÂ® Gruppe. Verteiler fÃ¼r",
        fr: "Membre du groupe InterfluxÂ®. Distributeur pour",
        it: "Membro del Gruppo InterfluxÂ®. Distributore per",
        ptpt: "Membro do Grupo InterfluxÂ®. Distribuidor para",
        ro: "Membru al Grupului InterfluxÂ®. Distribuitor pentru",
        es: "Miembro del Grupo InterfluxÂ®. Distribuidor en",
        sv: "Ledamot av InterfluxÂ® Grupp. DistributÃ¶r fÃ¶r",
        pl: "CzÅ‚onek  InterfluxÂ® Group. Dystrybutor na",
        ru:
          "Ð£Ñ‡Ð°ÑÑ‚Ð½Ð¸Ðº Ð“Ñ€ÑƒÐ¿Ð¿Ñ‹ ÐšÐ¾Ð¼Ð¿Ð°Ð½Ð¸Ð¹ InterfluxÂ®.  Ð”Ð¸ÑÑ‚Ñ€Ð¸Ð±ÑŒÑŽÑ‚Ð¾Ñ€ ",
        cs: "ÄŒlen skupiny Interflux Â®. Distributor pro",
        th:
          "à¸ªà¸²à¸‚à¸²à¸‚à¸­à¸‡ Interflux à¹à¸•à¹ˆà¸¥à¸°à¸›à¸£à¸°à¹€à¸—à¸¨ à¸ˆà¸±à¸”à¸ˆà¸³à¸«à¹ˆà¸²à¸¢à¹„à¸›à¸¢à¸±à¸‡ à¸›à¸£à¸°à¹€à¸—à¸¨",
        id: "Anggota dari Kelompok Interflux. Distributor untuk",
        zhhans: "InterfluxÂ®é›†å›¢æˆå‘˜",
        tr: "InterfluxÂ® Grup &uuml;yesi. i&ccedil;in distrib&uuml;t&ouml;r"
      },
      partner: {
        en: "InterfluxÂ® distributor for",
        de: "InterfluxÂ® Verteiler fÃ¼r",
        fr: "Distributeur d'InterfluxÂ® pour",
        it: "Distributore per InterfluxÂ® per",
        ptpt: "Distribuidor para InterfluxÂ® na",
        ro: "Distribuitor InterfluxÂ® pentru",
        es: "Distribuidor para InterfluxÂ® en",
        sv: "InterfluxÂ® distributÃ¶r i",
        pl: "InterfluxÂ® dystrybutor na",
        ru: "InterfluxÂ®  Ð¼Ð°Ñ‚ÐµÑ€Ð¸Ð°Ð»Ð¾Ð²   ",
        cs: "Interflux Â® distributor pro",
        th: "à¸ªà¸²à¸‚à¸²à¸‚à¸­à¸‡ Interflux à¹à¸•à¹ˆà¸¥à¸°à¸›à¸£à¸°à¹€à¸—à¸¨",
        id: "distributor Interflux untuk",
        zhhans: "InterfluxÂ®ç»é”€å•†",
        tr: "i&ccedil;in InterfluxÂ® distrib&uuml;t&ouml;r&uuml;"
      },
      and: {
        en: "and",
        de: "und",
        fr: "et",
        it: "e",
        ptpt: "e",
        ro: "È™i",
        es: "y",
        sv: "och",
        pl: "i",
        ru: "Ð¸",
        cs: "a",
        th: "à¹à¸¥à¸°",
        id: "dan",
        zhhans: "å’Œ",
        tr: "ve"
      },
      seeAllContacts: {
        en: "See all contacts",
        de: "Alle Kontakte",
        fr: "Voir tous les contacts",
        it: "Vedi tutti i contatti",
        ptpt: "Ver todos os contatos",
        ro: "Vezi toate contactele",
        es: "Ver todos los contactos",
        sv: "Visa alla kontakter",
        pl: "Zobacz wszystkie kontakty",
        ru: "Ð’ÑÐµ ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹ ",
        cs: "Zobrazit vÅ¡echny kontakty",
        th:
          "à¸ªà¸²à¸¡à¸²à¸£à¸–à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹„à¸”à¹‰à¸ˆà¸²à¸à¸£à¸²à¸¢à¸Šà¸·à¹ˆà¸­",
        id: "Lihat semua kontak",
        zhhans: "å…¨éƒ¨è”ç³»æ–¹å¼",
        tr: "T&uuml;m ileti&#351;im bilgilerini g&ouml;r&uuml;n"
      }
    };

    // COUNTRIES MISSING
    // COUNTRIES MISSING
    // COUNTRIES MISSING
    // COUNTRIES MISSING
    // COUNTRIES MISSING
    // COUNTRIES MISSING

    contact = {
      suggest: function() {
        $("#contact-search .searchbox").removeClass("focus");
        $("#contact-search .searchbox input")
          .val(
            countries[
              $("#contact-search .country-list li.focus")
                .attr("id")
                .slice(8)
            ][language]
          )
          .blur();
        var arr =
          countries[
            $("#contact-search .country-list li.focus")
              .attr("id")
              .slice(8)
          ].matches;
        $("#contact-list .views-row").hide();
        $("#contact-list .member")
          .last()
          .parents(".views-row")
          .after($("#contact-list .headquarters").parents(".views-row"));
        $("#contact-see-all-link").show();
        $("#contact-map .marker").removeClass("active");
        for (var i in arr) {
          $("#contact-list ." + arr[i]).show();
          $("#contact-map .marker." + arr[i])
            .addClass("active")
            .removeClass("hidden");
        }
        var t = 0;
        var s = 5;
        $("#contact-map .marker.partner")
          .not(".active")
          .each(function() {
            $(this)
              .delay(t)
              .queue(function(next) {
                $(this).addClass("hidden");
                next();
              });
            t += s;
          });
        $("#contact-map .marker.member")
          .not(".active")
          .each(function() {
            $(this)
              .delay(t)
              .queue(function(next) {
                $(this).addClass("hidden");
                next();
              });
            t += s;
          });
        $("#contact-map .marker.headquarters")
          .not(".active")
          .each(function() {
            $(this)
              .delay(t)
              .queue(function(next) {
                $(this).addClass("hidden");
                next();
              });
            t += s;
          });
        setTimeout(function() {
          $("#contact-map .marker.hidden").addClass("dead");
        }, 400);
      },

      showall: function() {
        $("#contact-search .searchbox input").val("");
        // countrylist.filter(); // commented out because it slows down the user interaction, instead use below
        $("#contact-search .country-list ul").html(strCountryList);
        $("#contact-list .views-row").show();
        $("#contact-see-all-link").hide();
        $("#contact-list .member")
          .first()
          .parents(".views-row")
          .before($("#contact-list .headquarters").parents(".views-row"));
        var t = 0;
        var s = 5;
        $("#contact-map .marker").removeClass("active dead");
        $("#contact-map .marker.headquarters").each(function() {
          $(this)
            .delay(t)
            .queue(function(next) {
              $(this).removeClass("hidden");
              next();
            });
          t += s;
        });
        $("#contact-map .marker.member").each(function() {
          $(this)
            .delay(t)
            .queue(function(next) {
              $(this).removeClass("hidden");
              next();
            });
          t += s;
        });
        $("#contact-map .marker.partner").each(function() {
          $(this)
            .delay(t)
            .queue(function(next) {
              $(this).removeClass("hidden");
              next();
            });
          t += s;
        });
      }
    };

    countrylist = {
      filter: function() {
        $("#contact-search .searchbox").addClass("focus");
        var $input = $("#contact-search .searchbox input");
        var $searchees = $("#contact-search .country-list li");
        $searchees
          .removeClass("has-match has-first-letter-match")
          .each(function() {
            $(this).text($(this).text());
          });
        if ($input.val()) {
          // if the search box has text

          // 1. GET SEARCH WORDS
          var arr = $input.val().split(" "); // space separate the search words
          var searchWords = [];
          for (var i = 0; i < arr.length; i++) {
            // removes all the empty search values by pushing the non-empties into a new array
            if (arr[i]) {
              searchWords.push(arr[i]);
            }
          }

          // 2. LOOP THROUGH SEARCHABLE ELEMENTS
          $searchees.each(function() {
            // 3. LOOP THROUGH SEARCH WORDS
            for (var i = 0; i < searchWords.length; i++) {
              // loop over each space separated search word

              // 4. IN THIS SEARCHABLE ELEMENT, WRAP THIS SEARCH WORD
              var $thisSearchee = $(this);
              var searchMeText = $thisSearchee.html();
              var pattern = new RegExp(searchWords[i], "gi");
              var arrSplits = searchMeText.split(pattern);
              var arrMatches = searchMeText.match(pattern);
              var STR = "";
              if (arrMatches !== null) {
                STR += arrSplits[0];
                for (var ii = 0; ii < arrMatches.length; ii++) {
                  var jj = ii + 1;
                  STR += "#" + arrMatches[ii] + "@"; // originally <em> and </em> but proved buggy when looking for a word starting with e or m (English) for example, so replace by # and @
                  STR += arrSplits[jj];
                }
                $thisSearchee.html(STR);
                // $searchees.parents('#document-list .views-row').addClass('has-' + searchWords[i]);
              }
            } // end search word loop

            $(this).html(
              $(this)
                .html()
                .replace(/#/g, "<em>")
                .replace(/@/g, "</em>")
            );
          }); // end of searchable elements loop

          // 5. EVALUATE WHICH COUNTRIES TO HIDE
          $searchees
            .has("em")
            .addClass("has-match")
            .each(function() {
              if (
                $(this)
                  .html()
                  .slice(0, 4)
                  .toLowerCase() == "<em>"
              ) {
                $(this).addClass("has-first-letter-match");
              }
            });
        } else {
          // if the search box is empty
          $searchees.addClass("has-match");
        }

        // 6. SORT THE COUNTRY LIST
        var k = 0;
        var arr1 = [];
        var arr2 = [];
        $searchees.filter(".has-first-letter-match").each(function() {
          var ref =
            countries[
              $(this)
                .attr("id")
                .slice(8)
            ];
          arr1.push({
            country: ref[language],
            domref: ref.domref
          });
          k++;
        });
        $searchees
          .filter(".has-match")
          .not(".has-first-letter-match")
          .each(function() {
            countries[
              $(this)
                .attr("id")
                .slice(8)
            ].acb = k;
            var ref =
              countries[
                $(this)
                  .attr("id")
                  .slice(8)
              ];
            arr2.push({
              country: ref[language],
              domref: ref.domref
            });
            k++;
          });
        // to sort an array with objects [{k:v,k:v},{k:v,k:v}] on the values of those objects
        arr1.sort(function(a, b) {
          return a.country > b.country ? 1 : b.country > a.country ? -1 : 0;
        });
        arr2.sort(function(a, b) {
          return a.country > b.country ? 1 : b.country > a.country ? -1 : 0;
        });
        var matchList = [];
        for (var i in arr1) {
          matchList.push(arr1[i]);
        }
        for (var i in arr2) {
          matchList.push(arr2[i]);
        }
        for (var i in matchList) {
          $("#contact-search .country-list ul").append($(matchList[i].domref));
        }

        // 8. SHOW HIDE COUNTRIES
        $("#contact-search .country-list li.has-match").show();
        $("#contact-search .country-list li:not(.has-match)").hide();

        // 9. SET FOCUS IN COUNTRY LIST
        $("#contact-search .country-list li").removeClass("focus");
        $("#contact-search .country-list li.has-match")
          .first()
          .addClass("focus");

        // 10. HIDE LIST IF NO RESULTS
        if (k < 1) {
          $("#contact-search .country-list").hide();
        } else {
          $("#contact-search .country-list").show();
        }
      }
    };

    // GENERATE COUNTRY LIST + TRANSLATE COUNTRIES IN CONTACT ADDRESS AND RIGHT TOP COUNTRY LABEL
    var strCountryList = "";
    for (var i in countries) {
      // GENERATE
      if (language !== "en" && countries[i][language] !== countries[i].en) {
        strCountryList +=
          '<li id="country-' +
          i +
          '">' +
          countries[i][language] +
          " (" +
          countries[i].en +
          ")</li>";
      } else {
        strCountryList +=
          '<li id="country-' + i + '">' + countries[i][language] + "</li>";
      }
      countries[i].domref = "#country-" + i;
      countries[i].matches = [];
      // TRANSLATE
      $(
        "#contact-list .contact-country .field, #contact-list .contact-country-big .field"
      ).each(function(ii) {
        if ($(this).text() == countries[i].en) {
          $(this).html(countries[i][language]);
        }
      });
    }
    $("#contact-search .country-list ul").html(strCountryList);
    countrylist.filter();
    var strCountryList = $("#contact-search .country-list ul").html();
    $("#contact-search .searchbox").removeClass("focus");

    // TRANSLATE
    $("#contact-search h2").html(translations.whereLocated[language]);
    $("#contact-search input").attr(
      "placeholder",
      translations.yourCountry[language]
    );
    $("#contact-see-all-link a").text(translations.seeAllContacts[language]);

    // GENERATE AND TRANSLATE CONTACT DESCRIPTION + EACH COUNTRY GETS THE DOM REFS OF CONTACTS THAT COVER THEM + CREATE MAP MARKERS
    $("#contact-list .views-row").each(function(i) {
      var str = "";
      var type = $(this)
        .find(".contact-type .field>div")
        .eq(0)
        .attr("class")
        .slice(0, -7);
      var coverage = $(this)
        .find(".contact-countries-coverage .field")
        .text()
        .split("|");
      var n = coverage.length;
      for (var j = 0; j < coverage.length; j++) {
        for (var k = 0; k < countries.length; k++) {
          if (coverage[j] == countries[k].en) {
            // TRANSLATE
            coverage[j] = countries[k][language];
            // DOM REFS
            countries[k].matches.push(
              "views-row-" + ($(".views-row").index($(this)) + 1)
            );
            k = 99999; // stop the country loop, because match has been found
          }
        }
      }
      switch (type) {
        case "interflux group headquarters":
          str = translations.headquarters[language] + " ";
          break;
        case "interflux group member":
          str = translations.member[language] + " ";
          break;
        case "interflux partner":
          str = translations.partner[language] + " ";
          break;
      }
      switch (type) {
        case "interflux group member":
        case "interflux partner":
          for (var i = 0; i < coverage.length; i++) {
            str +=
              coverage[i] +
              (i + 1 == n
                ? "."
                : i + 2 == n
                ? " " + translations.and[language] + " "
                : ", ");
          }
          break;
      }
      var extra = $(this)
        .find('.contact-description h4 [lang="' + [language] + '"]')
        .text();
      $(this)
        .find(".contact-description h4")
        .html(str + " " + extra);
      // CREATE MAP MARKERS
      $("#contact-map .markers").append(
        '<li class="marker hidden ' +
          $.trim(
            $(this)
              .find(".contact-type .field>div")
              .attr("class")
          ) +
          " views-row-" +
          ($(".views-row").index($(this)) + 1) +
          '" style="left:' +
          $.trim(
            $(this)
              .find(".contact-map-x")
              .text()
          ) +
          "px; top:" +
          $.trim(
            $(this)
              .find(".contact-map-y")
              .text()
          ) +
          "px; z-index:" +
          $.trim(
            $(this)
              .find(".contact-map-y")
              .text()
          ) +
          ';"><div class="icon"><div class="label"><div class="label-inner">' +
          $.trim(
            $(this)
              .find(".contact-company-name")
              .text()
          ) +
          " (" +
          $.trim(
            $(this)
              .find(".contact-country")
              .text()
          ) +
          ')</div><div class="label-arrow-border"></div><div class="label-arrow"></div></div></div><div class="shadow"></div></li>'
      );
    });

    // ANIMATE MAP MARKERS
    var t = 900;
    var s = 50;
    $("#contact-map .marker.headquarters").each(function() {
      $(this)
        .delay(t)
        .queue(function(next) {
          $(this).removeClass("hidden");
          next();
        });
      t += s;
    });
    $("#contact-map .marker.member").each(function() {
      $(this)
        .delay(t)
        .queue(function(next) {
          $(this).removeClass("hidden");
          next();
        });
      t += s;
    });
    $("#contact-map .marker.partner").each(function() {
      $(this)
        .delay(t)
        .queue(function(next) {
          $(this).removeClass("hidden");
          next();
        });
      t += s;
    });

    // CLICK, HOVER & KEYDOWN BEHAVIOUR CONTACT PAGE
    $("#contact-search .searchbox input").on("keydown", function(e) {
      switch (e.keyCode) {
        case 9:
        case 13:
        case 39:
          // ON PRESS TAB, ENTER OR RIGHT
          e.preventDefault();
          contact.suggest();
          break;
        case 38: // ON PRESS UP
          e.preventDefault();
          $("#contact-search .country-list li.focus")
            .prevAll(".has-match")
            .first()
            .addClass("focus")
            .siblings("li")
            .removeClass("focus");
          break;
        case 40:
          // ON PRESS DOWN
          e.preventDefault();
          $("#contact-search .country-list li.focus")
            .nextAll(".has-match")
            .first()
            .addClass("focus")
            .siblings("li")
            .removeClass("focus");
          break;
      }
    });
    $("#contact-search .searchbox input").on("keyup", function(e) {
      switch (e.keyCode) {
        case 9:
        case 13:
        case 39:
        case 38:
        case 40: // ON PRESS TAB, ENTER OR ARROWS
          break;
        default:
          // ON ANY OTHER KEYUP
          countrylist.filter();
      }
    });
    $("body.page-contact").click(function() {
      $("#contact-search .searchbox").removeClass("focus");
    });
    $("#contact-search .searchbox").click(function(e) {
      e.stopPropagation();
      $(this).addClass("focus");
      contact.showall();
    });
    $("#contact-search .searchbox .country-list").on("click", "li", function(
      e
    ) {
      e.stopPropagation();
      contact.suggest();
    });

    $("#contact-search .country-list").mouseenter(function(e) {
      e.stopPropagation();
      $("#contact-search .searchbox input").blur();
    });
    $("#contact-search .searchbox").mouseenter(function() {
      if ($(this).hasClass("focus")) {
        $("#contact-search .searchbox input").focus();
      }
    });
    $("#contact-search .searchbox .country-list").on(
      "mouseenter",
      "li",
      function() {
        $(this)
          .addClass("focus")
          .siblings("li")
          .removeClass("focus");
      }
    );
    $("#contact-see-all-link a").on("click", function(e) {
      e.preventDefault();
      contact.showall();
    });

    // PLACE IF BELGIUM IN FRONT OF THE LIST
    $("#contact-list .member")
      .first()
      .parents(".views-row")
      .before($("#contact-list .headquarters").parents(".views-row"));

    // WRAP ALL COPYRIGHT SYMBOLS WITH SUPERSCRIPT
    $("#contact-list .contact-company-name h3, #contact-map .label-inner").each(
      function() {
        $(this).html(
          $(this)
            .text()
            .replace(/Â®/g, "<sup>Â®</sup>")
        );
      }
    );
  }
};
