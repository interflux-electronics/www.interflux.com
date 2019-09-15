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
              '<img src="/assets/images/legacy/banner-"' +
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
        de: "mehr lesen…",
        fr: "En savoir plus …",
        it: "Leggi ancora….",
        ptpt: "mais informação",
        ro: "Citeste mai multe...",
        es: "más información",
        sv: "Läs mer...",
        pl: "Czytaj więcej...",
        ru: "Подробнее …",
        cs: "Číst více ...",
        th: "อ่านเพิ่มเติม ...",
        id: "Baca lebih lanjut ...",
        zhhans: "更多…",
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
          fr: "Plus d'information / démos / échantillons",
          it: "Ulteriori informazioni / demo / campioni",
          ptpt: "Mais informações / demos / amostras",
          ro: "Mai multe informații / demo-uri / probe",
          es: "Más información / demos / muestras",
          sv: "Mer information / demos / prov",
          pl: "Więcej informacji / demos / próbki",
          ru: "Подробнее / демки / образцы",
          cs: "Více informací / dema / ukázky",
          th: "ข้อมูลเพิ่มเติม / สาธิต / ตัวอย่าง",
          id: "Informasi lebih lanjut / demo / sampel",
          zhhans: "更多信息/演示/样本",
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
      '<div class="slogan">Interflux, über ' +
        ageIF +
        " Jahre Chemie für die Elektronikfertigung</div>"
    );
    $("body.i18n-fr #nav").append(
      '<div class="slogan">Interflux, fabricant de produits chimiques pour l’industrie électronique depuis ' +
        ageIF +
        " ans</div>"
    );
    $("body.i18n-es #nav").append(
      '<div class="slogan">Interflux, suministrando productos químicos para la electronica por mas de ' +
        ageIF +
        " años</div>"
    );
    $("body.i18n-pt-pt #nav").append(
      '<div class="slogan">Interflux, por mais de ' +
        ageIF +
        " anos fornecimento de química para a eletrônica</div>"
    );
    $("body.i18n-it #nav").append(
      '<div class="slogan">Interflux, produce la chimica per l’elettronica da oltre ' +
        ageIF +
        " anni</div>"
    );
    $("body.i18n-ro #nav").append(
      '<div class="slogan">Interflux ofera produse chimice pentru electronica de peste ' +
        ageIF +
        " ani</div>"
    );
    $("body.i18n-sv #nav").append(
      '<div class="slogan">Interflux, har fört kemi till elektroniken i över ' +
        ageIF +
        " år</div>"
    );
    $("body.i18n-ru #nav").append(
      '<div class="slogan">Interflux – уже больше ' +
        ageIF +
        " лет мы объединяем</div>"
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
      '<div class="slogan">อินเตอร์ฟลักซ์ได้นำผลิตภัณฑ์สารเคมี มาสู่วงการอิเล็กทรอนิกส์เป็นเวลากว่า ' +
        ageIF +
        " ปี</div>"
    );
    $("body.i18n-id #nav").append(
      '<div class="slogan">Interflux, menyatukan bahan kimia dengan alat elektronik selama lebih dari ' +
        ageIF +
        " tahun</div>"
    );
    $("body.i18n-zh-hans #nav").append(
      '<div class="slogan">Interflux致力于电子工业中的化学应用领域超过' +
        ageIF +
        "年</div>"
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
      "url(/assets/images/legacy/homepage-images-2.jpg)"
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
        sv: "SÖK DOKUMENT",
        pl: "szukaj dokumentów",
        ru: "Поиск документов",
        cs: "HLEDAT DOKUMENTY",
        th: "ค้นหาเอกสาร",
        id: "SEARCH DOCUMENTS",
        zhhans: "搜索文件",
        tr: "ARAMA BELGELER"
      },
      noResults: {
        en: "No results",
        de: "Keine Ergebnisse",
        fr: "Pas de résultats",
        it: "Nessun risultato",
        ptpt: "Sem resultado",
        ro: "Niciun rezultat",
        es: "No hay resultados",
        sv: "Inga resultat",
        pl: "Brak wyników",
        ru: "результат не найден",
        cs: "Žádné výsledky",
        th: "ไม่พบ",
        id: "No results",
        zhhans: "无",
        tr: "Sonu&ccedil; yok"
      },
      example: {
        en: "e.g. 2005M English",
        de: "z.B. 2005M Deutsch",
        fr: "par exemple 2005M Français",
        it: "ad esempio 2005M Italiano",
        ptpt: "por exemplo 2005M Português",
        ro: "de exemplu, 2005M Română",
        es: "por ejemplo 2005M Español",
        sv: "t ex 2005M Svenska",
        pl: "np. 2005M",
        ru: "например 2005M",
        cs: "např. 2005M English",
        th: "เช่นผู้ 2005M",
        id: "misalnya 2005M",
        zhhans: "例如：2005M",
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
        fr: "Où est située votre entreprise ?",
        it: "IN CHE LOCALITA' SI TROVA LA TUA SOCIETA'?",
        ptpt: "Onde você está?",
        ro: "Unde este localizata compania ta?",
        es: "¿Dónde se encuentra su empresa?",
        sv: "Var finns ert företag?",
        pl: "Gdzie się mieści Twoja firma?",
        ru: " Расположение Вашей компании",
        cs: "KDE SE NACHÁZÍ VAŠE SPOLEČNOST?",
        th: "บริษัทของคุณตั้งอยู่ที่ใด",
        id: "Di mana lokasi perusahaan Anda?",
        zhhans: "你的公司地址位于？",
        tr: "NEREDE F&#304;RMA BULUNMAKTADIR ?"
      },
      yourCountry: {
        en: "Your country ...",
        de: "Ihr Land ...",
        fr: "Votre pays ...",
        it: "Il tuo paese ...",
        ptpt: "O seu país ...",
        ro: "Tara ta ...",
        es: "Su país ...",
        sv: "Ditt land ...",
        pl: "Twój kraj:",
        ru: "Страна ",
        cs: "Vaše země ...",
        th: "ประเทศของคุณ",
        id: "Negara anda....",
        zhhans: "你的公司地址位于？",
        tr: "Senin ulken ..."
      },
      headquarters: {
        en:
          "Headquarters of the Interflux® Group. Researches, develops and produces soldering chemicals and solders. Distributor for all countries.",
        de:
          "Hauptsitz der Interflux® Gruppe. Entwickelt und produziert Lötchemie und Lot. Verteiler für alle Länder.",
        fr:
          "Siège du Groupe Interflux®. Recherche, développe et fabrique des produits chimiques pour le brasage. Distributeur pour tous les pays.",
        it:
          "Sede del Gruppo Interflux®. Ricerca, sviluppa e produce prodotti chimici saldatura e e leghe di saldatura. Distributore per tutti i paesi.",
        ptpt:
          "Sede do Grupo Interflux®. Pesquisa, desenvolvimento e produção dos produtos químicos de solda. Distribuidor para todos os países.",
        ro:
          "Sediul grupului Interflux®. Cercetari, dezvoltă și produce chimice lipire și aliaje de lipit. Distribuitor pentru toate țările.",
        es:
          "Sede del Grupo Interflux®. Investiga, desarrolla y fabrica productos químicos para soldadura y soldaduras. Distribuidor para todos los países.",
        sv:
          "Högkvarter Interflux® Grupp. Forskar, utvecklar och producerar lödning kemikalier och lod. Distributör för alla länder.",
        pl:
          "Centala Interflux® Group. Bada, rozwija i produkuje chemię do procesów elektroniczych. Dystrybutor dla wszystkich krajów",
        ru:
          "Головной офис Группы Компаний Interflux®. Исследования, разработка и производство химических материалов для пайки . Дистрибьютор по всем странам",
        cs:
          "Hlavní sídlo skupiny Interflux ®. Výzkum, vývoj a výroba pájecích chemií a pájky. Distributor pro všechny země.",
        th:
          "สำนักงานใหญ่ของ Interflux ได้ทำการค้นคว้า , พัฒนา และผลิตเกี่ยวกับน้ำยาเชื่อมประสานและลวดเชื่อม โดยจัดจำหน่ายไปยังสาขาทั่วประเทศ",
        id:
          "Kantor Pusat dari Kelompok Interflux. Meneliti, mengembangkan dan memproduksi bahan-bahan kimia untuk pensolderan dan bahan-bahan solder. Distributor untuk semua negara.",
        zhhans: "Interflux®集团总部生产及研发何种焊料经销商遍布全球",
        tr:
          "Interflux® Grup'un genel merkezi. Lehimleme kimyasallar&#305; ve lehimler ara&#351;t&#305;r&#305;r, geli&#351;tirir ve &uuml;retir. T&uuml;m &uuml;lkeler i&ccedil;in distrib&uuml;t&ouml;rler."
      },
      member: {
        en: "Member of the Interflux® Group. Distributor for",
        de: "Mitglied der Interflux® Gruppe. Verteiler für",
        fr: "Membre du groupe Interflux®. Distributeur pour",
        it: "Membro del Gruppo Interflux®. Distributore per",
        ptpt: "Membro do Grupo Interflux®. Distribuidor para",
        ro: "Membru al Grupului Interflux®. Distribuitor pentru",
        es: "Miembro del Grupo Interflux®. Distribuidor en",
        sv: "Ledamot av Interflux® Grupp. Distributör för",
        pl: "Członek  Interflux® Group. Dystrybutor na",
        ru: "Участник Группы Компаний Interflux®.  Дистрибьютор ",
        cs: "Člen skupiny Interflux ®. Distributor pro",
        th: "สาขาของ Interflux แต่ละประเทศ จัดจำห่ายไปยัง ประเทศ",
        id: "Anggota dari Kelompok Interflux. Distributor untuk",
        zhhans: "Interflux®集团成员",
        tr: "Interflux® Grup &uuml;yesi. i&ccedil;in distrib&uuml;t&ouml;r"
      },
      partner: {
        en: "Interflux® distributor for",
        de: "Interflux® Verteiler für",
        fr: "Distributeur d'Interflux® pour",
        it: "Distributore per Interflux® per",
        ptpt: "Distribuidor para Interflux® na",
        ro: "Distribuitor Interflux® pentru",
        es: "Distribuidor para Interflux® en",
        sv: "Interflux® distributör i",
        pl: "Interflux® dystrybutor na",
        ru: "Interflux®  материалов   ",
        cs: "Interflux ® distributor pro",
        th: "สาขาของ Interflux แต่ละประเทศ",
        id: "distributor Interflux untuk",
        zhhans: "Interflux®经销商",
        tr: "i&ccedil;in Interflux® distrib&uuml;t&ouml;r&uuml;"
      },
      and: {
        en: "and",
        de: "und",
        fr: "et",
        it: "e",
        ptpt: "e",
        ro: "și",
        es: "y",
        sv: "och",
        pl: "i",
        ru: "и",
        cs: "a",
        th: "และ",
        id: "dan",
        zhhans: "和",
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
        ru: "Все контакты ",
        cs: "Zobrazit všechny kontakty",
        th: "สามารถตรวจสอบได้จากรายชื่อ",
        id: "Lihat semua kontak",
        zhhans: "全部联系方式",
        tr: "T&uuml;m ileti&#351;im bilgilerini g&ouml;r&uuml;n"
      }
    };

    countries = [
      {
        en: "Afghanistan",
        de: "Afghanistan",
        fr: "Afghanistan",
        it: "Afghanistan",
        ptpt: "Afeganist�o",
        ro: "Afganistan",
        es: "Afganist�n",
        sv: "Afghanistan",
        pl: "Afganistan",
        ru:
          "&#1040;&#1092;&#1075;&#1072;&#1085;&#1080;&#1089;&#1090;&#1072;&#1085;",
        cs: "Afgh�nist�n",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3629;&#3633;&#3615;&#3585;&#3634;&#3609;&#3636;&#3626;&#3606;&#3634;&#3609;",
        id: "Afganistan",
        zhhans: "&#38463;&#23500;&#27735;",
        tr: "Afganistan"
      },
      {
        en: "Albania",
        de: "Albanien",
        fr: "Albanie",
        it: "Albania",
        ptpt: "Alb�nia",
        ro: "Albania",
        es: "Albania",
        sv: "Albanien",
        pl: "Albania",
        ru: "&#1040;&#1083;&#1073;&#1072;&#1085;&#1080;&#1103;",
        cs: "Alb�nie",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3649;&#3629;&#3621;&#3648;&#3610;&#3648;&#3609;&#3637;&#3618;",
        id: "Albania",
        zhhans: "&#38463;&#29246;&#24052;&#23612;&#20126;",
        tr: "Arnavutluk"
      },
      {
        en: "Algeria",
        de: "Algerien",
        fr: "Alg�rie",
        it: "Algeria",
        ptpt: "Arg�lia",
        ro: "Algeria",
        es: "Argelia",
        sv: "Algeriet",
        pl: "Algieria",
        ru: "&#1040;&#1083;&#1078;&#1080;&#1088;",
        cs: "Al��rsko",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3649;&#3629;&#3621;&#3592;&#3637;&#3648;&#3619;&#3637;&#3618;",
        id: "Aljazair",
        zhhans: "&#38463;&#29246;&#21450;&#21033;&#20126;",
        tr: "Cezayir"
      },
      {
        en: "Andorra",
        de: "Andorra",
        fr: "Andorre",
        it: "Andorra",
        ptpt: "Andorra",
        ro: "Andorra",
        es: "Andorra",
        sv: "Andorra",
        pl: "Andora",
        ru: "&#1072;&#1085;&#1076;&#1086;&#1088;&#1088;&#1072;",
        cs: "Andorra",
        th: "&#3629;&#3633;&#3609;&#3604;&#3629;&#3619;&#3660;&#3619;&#3634;",
        id: "Andorra",
        zhhans: "&#23433;&#36947;&#8203;&#8203;&#29246;",
        tr: "Andora"
      },
      {
        en: "Angola",
        de: "Angola",
        fr: "Angola",
        it: "Angola",
        ptpt: "Angola",
        ro: "Angola",
        es: "Angola",
        sv: "Angola",
        pl: "Angola",
        ru: "&#1040;&#1085;&#1075;&#1086;&#1083;&#1072;",
        cs: "Angola",
        th: "&#3649;&#3629;&#3591;&#3650;&#3585;&#3621;&#3634;",
        id: "Angola",
        zhhans: "&#23433;&#21733;&#25289;",
        tr: "Angola"
      },
      {
        en: "Antigua and Barbuda",
        de: "Antigua und Barbuda",
        fr: "Antigua-et-Barbuda",
        it: "Antigua e Barbuda",
        ptpt: "Ant�gua e Barbuda",
        ro: "Antigua &#537;i Barbuda",
        es: "Antigua y Barbuda",
        sv: "Antigua och Barbuda",
        pl: "Antigua i Barbuda",
        ru:
          "&#1040;&#1085;&#1090;&#1080;&#1075;&#1091;&#1072; &#1080; &#1041;&#1072;&#1088;&#1073;&#1091;&#1076;&#1072;",
        cs: "Antigua a Barbuda",
        th:
          "&#3649;&#3629;&#3609;&#3605;&#3636;&#3585;&#3634;&#3649;&#3621;&#3632;&#3610;&#3634;&#3619;&#3660;&#3610;&#3641;&#3604;&#3634;",
        id: "Antigua and Barbuda",
        zhhans: "&#23433;&#25552;&#29916;&#21644;&#24052;&#24067;&#36948;",
        tr: "Antigua ve Barbuda"
      },
      {
        en: "Argentina",
        de: "Argentinien",
        fr: "Argentine",
        it: "Argentina",
        ptpt: "Argentina",
        ro: "Argentina",
        es: "Argentina",
        sv: "Argentina",
        pl: "Argentyna",
        ru: "&#1040;&#1088;&#1075;&#1077;&#1085;&#1090;&#1080;&#1085;&#1072;",
        cs: "Argentina",
        th:
          "&#3629;&#3634;&#3619;&#3660;&#3648;&#3592;&#3609;&#3605;&#3636;&#3609;&#3634;",
        id: "Argentina",
        zhhans: "&#38463;&#26681;&#24311;",
        tr: "Arjantin"
      },
      {
        en: "Armenia",
        de: "Armenien",
        fr: "Arm�nie",
        it: "Armenia",
        ptpt: "Arm�nia",
        ro: "Armenia",
        es: "Armenia",
        sv: "Armenien",
        pl: "Armenia",
        ru: "&#1040;&#1088;&#1084;&#1077;&#1085;&#1080;&#1103;",
        cs: "Arm�nie",
        th:
          "&#3629;&#3634;&#3619;&#3660;&#3648;&#3617;&#3648;&#3609;&#3637;&#3618;",
        id: "Armenia",
        zhhans: "&#20126;&#32654;&#23612;&#20126;",
        tr: "Ermenistan"
      },
      {
        en: "Aruba",
        de: "Aruba",
        fr: "Aruba",
        it: "Aruba",
        ptpt: "Aruba",
        ro: "Aruba",
        es: "Aruba",
        sv: "Aruba",
        pl: "Aruba",
        ru: "&#1040;&#1088;&#1091;&#1073;&#1072;",
        cs: "Aruba",
        th: "&#3629;&#3634;&#3619;&#3641;&#3610;&#3634;",
        id: "Aruba",
        zhhans: "&#38463;&#39791;&#24052;",
        tr: "Aruba"
      },
      {
        en: "Australia",
        de: "Australien",
        fr: "Australie",
        it: "Australia",
        ptpt: "Austr�lia",
        ro: "Australia",
        es: "Australia",
        sv: "Australien",
        pl: "Australia",
        ru: "&#1040;&#1074;&#1089;&#1090;&#1088;&#1072;&#1083;&#1080;&#1103;",
        cs: "Austr�lie",
        th:
          "&#3629;&#3629;&#3626;&#3648;&#3605;&#3619;&#3648;&#3621;&#3637;&#3618;",
        id: "Australia",
        zhhans: "&#28595;&#22823;&#21033;&#20126;",
        tr: "Avustralya"
      },
      {
        en: "Austria",
        de: "&Ouml;sterreich",
        fr: "Autriche",
        it: "Austria",
        ptpt: "�ustria",
        ro: "Austria",
        es: "Austria",
        sv: "&Ouml;sterrike",
        pl: "Austria",
        ru: "&#1040;&#1074;&#1089;&#1090;&#1088;&#1080;&#1103;",
        cs: "Rakousko",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3629;&#3629;&#3626;&#3648;&#3605;&#3619;&#3637;&#3618;",
        id: "Austria",
        zhhans: "&#22887;&#22320;&#21033;",
        tr: "Avusturya"
      },
      {
        en: "Azerbaijan",
        de: "Aserbaidschan",
        fr: "Azerba�djan",
        it: "Azerbaijan",
        ptpt: "Azerbaij�o",
        ro: "Azerbaidjan",
        es: "Azerbaijan",
        sv: "Azerbajdzjan",
        pl: "Azerbejdzan",
        ru:
          "&#1040;&#1079;&#1077;&#1088;&#1073;&#1072;&#1081;&#1076;&#1078;&#1072;&#1085;",
        cs: "�zerbajd��n",
        th:
          "&#3629;&#3634;&#3648;&#3595;&#3629;&#3619;&#3660;&#3652;&#3610;&#3592;&#3634;&#3609;",
        id: "Azerbaijan",
        zhhans: "&#38463;&#22622;&#25308;&#30086;",
        tr: "Azerbaycan"
      },
      {
        en: "Bahamas",
        de: "Bahamas",
        fr: "Bahamas",
        it: "Bahamas",
        ptpt: "Bahamas",
        ro: "Bahamas",
        es: "Bahamas",
        sv: "Bahamas",
        pl: "Bahamy",
        ru:
          "&#1041;&#1072;&#1075;&#1072;&#1084;&#1089;&#1082;&#1080;&#1077; &#1086;&#1089;&#1090;&#1088;&#1086;&#1074;&#1072;",
        cs: "Bahamsk� ostrovy",
        th: "&#3610;&#3634;&#3630;&#3634;&#3617;&#3634;&#3626;",
        id: "Bahama",
        zhhans: "&#24052;&#21704;&#39340;",
        tr: "Bahama"
      },
      {
        en: "Bahrain",
        de: "Bahrain",
        fr: "Bahre�n",
        it: "Bahrain",
        ptpt: "Bahrain",
        ro: "Bahrain",
        es: "Bahrein",
        sv: "Bahrain",
        pl: "Bahrajn",
        ru: "&#1041;&#1072;&#1093;&#1088;&#1077;&#1081;&#1085;",
        cs: "Bahrajn",
        th: "&#3610;&#3634;&#3627;&#3660;&#3648;&#3619;&#3609;",
        id: "Bahrain",
        zhhans: "&#24052;&#26519;",
        tr: "Bahreyn"
      },
      {
        en: "Bangladesh",
        de: "Bangladesch",
        fr: "Bangladesh",
        it: "Bangladesh",
        ptpt: "Bangladesh",
        ro: "Bangladesh",
        es: "Bangladesh",
        sv: "Bangladesh",
        pl: "Bangladesz",
        ru: "&#1041;&#1072;&#1085;&#1075;&#1083;&#1072;&#1076;&#1077;&#1096;",
        cs: "Banglad��",
        th: "&#3610;&#3633;&#3591;&#3588;&#3621;&#3634;&#3648;&#3607;&#3624;",
        id: "Bangladesh",
        zhhans: "&#23391;&#21152;&#25289;&#22283;",
        tr: "Banglade&#351;"
      },
      {
        en: "Barbados",
        de: "Barbados",
        fr: "Barbade",
        it: "Barbados",
        ptpt: "Barbados",
        ro: "Barbados",
        es: "Barbados",
        sv: "Barbados",
        pl: "Barbados",
        ru: "&#1041;&#1072;&#1088;&#1073;&#1072;&#1076;&#1086;&#1089;",
        cs: "Barbados",
        th: "&#3610;&#3634;&#3619;&#3660;&#3648;&#3610;&#3650;&#3604;&#3626;",
        id: "Barbados",
        zhhans: "&#24052;&#24052;&#22810;&#26031;",
        tr: "Barbados"
      },
      {
        en: "Belarus",
        de: "Belarus",
        fr: "Bi�lorussie",
        it: "Bielorussia",
        ptpt: "Belarus",
        ro: "Bielorusia",
        es: "Bielorrusia",
        sv: "Vitryssland",
        pl: "Bialorus",
        ru: "&#1041;&#1077;&#1083;&#1072;&#1088;&#1091;&#1089;&#1100;",
        cs: "Belorusko",
        th: "&#3648;&#3610;&#3621;&#3634;&#3619;&#3640;&#3626;",
        id: "Belarus",
        zhhans: "&#30333;&#20420;&#32645;&#26031;",
        tr: "Beyaz Rusya"
      },
      {
        en: "Belgium",
        de: "Belgien",
        fr: "Belgique",
        it: "Belgio",
        ptpt: "B�lgica",
        ro: "Belgia",
        es: "B�lgica",
        sv: "Belgien",
        pl: "Belgia",
        ru: "&#1041;&#1077;&#1083;&#1100;&#1075;&#1080;&#1103;",
        cs: "Belgie",
        th: "&#3648;&#3610;&#3621;&#3648;&#3618;&#3637;&#3656;&#3618;&#3617;",
        id: "Belgia",
        zhhans: "&#27604;&#21033;&#26178;",
        tr: "Bel&ccedil;ika"
      },
      {
        en: "Belize",
        de: "Belize",
        fr: "Belize",
        it: "Belize",
        ptpt: "Belize",
        ro: "Belize",
        es: "Belice",
        sv: "Belize",
        pl: "Belize",
        ru: "&#1041;&#1077;&#1083;&#1080;&#1079;",
        cs: "Belize",
        th: "&#3648;&#3610;&#3621;&#3637;&#3595;",
        id: "Belize",
        zhhans: "&#20271;&#21033;&#33586;",
        tr: "Belize"
      },
      {
        en: "Benin",
        de: "Benin",
        fr: "B�nin",
        it: "Benin",
        ptpt: "Benin",
        ro: "Benin",
        es: "Benin",
        sv: "Benin",
        pl: "Benin",
        ru: "&#1041;&#1077;&#1085;&#1080;&#1085;",
        cs: "Benin",
        th: "&#3648;&#3610;&#3609;&#3636;&#3609;",
        id: "Benin",
        zhhans: "&#35997;&#23527;",
        tr: "Benin"
      },
      {
        en: "Bhutan",
        de: "Bhutan",
        fr: "Bhoutan",
        it: "Bhutan",
        ptpt: "But�o",
        ro: "Bhutan",
        es: "Bhutan",
        sv: "Bhutan",
        pl: "Bhutan",
        ru: "&#1041;&#1091;&#1090;&#1072;&#1085;",
        cs: "Bh�t�n",
        th: "&#3616;&#3641;&#3599;&#3634;&#3609;",
        id: "Bhutan",
        zhhans: "&#19981;&#20025;",
        tr: "Butan"
      },
      {
        en: "Bolivia",
        de: "Bolivien",
        fr: "Bolivie",
        it: "Bolivia",
        ptpt: "Bol�via",
        ro: "Bolivia",
        es: "Bolivia",
        sv: "Bolivia",
        pl: "Boliwia",
        ru: "&#1041;&#1086;&#1083;&#1080;&#1074;&#1080;&#1103;",
        cs: "Bol�vie",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3650;&#3610;&#3621;&#3636;&#3648;&#3623;&#3637;&#3618;",
        id: "Bolivia",
        zhhans: "&#29627;&#21033;&#32173;&#20126;",
        tr: "Bolivya"
      },
      {
        en: "Bosnia and Herzegovina",
        de: "Bosnien und Herzegowina",
        fr: "Bosnie-Herz�govine",
        it: "Bosnia-Erzegovina",
        ptpt: "B�snia e Herzegovina",
        ro: "Bosnia &#537;i Her&#539;egovina",
        es: "Bosnia y Herzegovina",
        sv: "Bosnien och Hercegovina",
        pl: "Bosnia i Hercegowina",
        ru:
          "&#1041;&#1086;&#1089;&#1085;&#1080;&#1103; &#1080; &#1043;&#1077;&#1088;&#1094;&#1077;&#1075;&#1086;&#1074;&#1080;&#1085;&#1072;",
        cs: "Bosna a Hercegovina",
        th:
          "&#3610;&#3629;&#3626;&#3648;&#3609;&#3637;&#3618;&#3649;&#3621;&#3632;&#3648;&#3630;&#3629;&#3619;&#3660;&#3648;&#3595;&#3650;&#3585;",
        id: "Bosnia dan Herzegovina",
        zhhans:
          "&#27874;&#26031;&#23612;&#20126;&#21644;&#40657;&#22622;&#21733;&#32173;&#37027;",
        tr: "Bosna Hersek"
      },
      {
        en: "Botswana",
        de: "Botswana",
        fr: "Botswana",
        it: "Botswana",
        ptpt: "Botswana",
        ro: "Botswana",
        es: "Botswana",
        sv: "Botswana",
        pl: "Botswana",
        ru: "&#1041;&#1086;&#1090;&#1089;&#1074;&#1072;&#1085;&#1072;",
        cs: "Botswana",
        th: "&#3610;&#3629;&#3605;&#3626;&#3623;&#3634;&#3609;&#3634;",
        id: "Botswana",
        zhhans: "&#21338;&#33576;&#29926;&#32013;",
        tr: "Botsvana"
      },
      {
        en: "Brazil",
        de: "Brasilien",
        fr: "Br�sil",
        it: "Brasile",
        ptpt: "Brasil",
        ro: "Brazilia",
        es: "Brasil",
        sv: "Brasilien",
        pl: "Brazylia",
        ru: "&#1041;&#1088;&#1072;&#1079;&#1080;&#1083;&#1080;&#1103;",
        cs: "Braz�lie",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3610;&#3619;&#3634;&#3595;&#3636;&#3621;",
        id: "Brazil",
        zhhans: "&#24052;&#35199;",
        tr: "Brezilya"
      },
      {
        en: "Brunei",
        de: "Brunei",
        fr: "Brunei",
        it: "Brunei",
        ptpt: "Brunei",
        ro: "Brunei",
        es: "Brun�i",
        sv: "Brunei",
        pl: "Brunei",
        ru: "&#1041;&#1088;&#1091;&#1085;&#1077;&#1081;",
        cs: "Brunej",
        th: "&#3610;&#3619;&#3641;&#3652;&#3609;",
        id: "Brunei",
        zhhans: "&#25991;&#33802;",
        tr: "Bruney"
      },
      {
        en: "Bulgaria",
        de: "Bulgarien",
        fr: "Bulgarie",
        it: "Bulgaria",
        ptpt: "Bulg�ria",
        ro: "Bulgaria",
        es: "Bulgaria",
        sv: "Bulgarien",
        pl: "Bulgaria",
        ru: "&#1041;&#1086;&#1083;&#1075;&#1072;&#1088;&#1080;&#1103;",
        cs: "Bulharsko",
        th: "&#3610;&#3633;&#3621;&#3649;&#3585;&#3648;&#3619;&#3637;&#3618;",
        id: "Bulgaria",
        zhhans: "&#20445;&#21152;&#21033;&#20126;",
        tr: "Bulgaristan"
      },
      {
        en: "Burkina Faso",
        de: "Burkina Faso",
        fr: "Burkina Faso",
        it: "Burkina Faso",
        ptpt: "Burkina Faso",
        ro: "Burkina Faso",
        es: "Burkina Faso",
        sv: "Burkina Faso",
        pl: "Burkina Faso",
        ru:
          "&#1041;&#1091;&#1088;&#1082;&#1080;&#1085;&#1072;-&#1060;&#1072;&#1089;&#1086;",
        cs: "Burkina Faso",
        th:
          "&#3610;&#3641;&#3619;&#3660;&#3585;&#3636;&#3609;&#3634;&#3615;&#3634;&#3650;&#3595;",
        id: "Burkina Faso",
        zhhans: "&#24067;&#22522;&#32013;&#27861;&#32034;",
        tr: "Burkina Faso"
      },
      {
        en: "Burma",
        de: "Birma",
        fr: "Birmanie",
        it: "Birmania",
        ptpt: "Birm�nia",
        ro: "Birmania",
        es: "Birmania",
        sv: "Burma",
        pl: "Birma",
        ru: "&#1041;&#1080;&#1088;&#1084;&#1072;",
        cs: "Barma",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3614;&#3617;&#3656;&#3634;",
        id: "Birma",
        zhhans: "&#32236;&#30008;",
        tr: "Burma"
      },
      {
        en: "Burundi",
        de: "Burundi",
        fr: "Burundi",
        it: "Burundi",
        ptpt: "Burundi",
        ro: "Burundi",
        es: "Burundi",
        sv: "Burundi",
        pl: "Burundi",
        ru: "&#1041;&#1091;&#1088;&#1091;&#1085;&#1076;&#1080;",
        cs: "Burundi",
        th: "&#3610;&#3640;&#3619;&#3640;&#3609;&#3604;&#3637;",
        id: "Burundi",
        zhhans: "&#24067;&#38534;&#36842;",
        tr: "Burundi"
      },
      {
        en: "Cambodia",
        de: "Kambodscha",
        fr: "Cambodge",
        it: "Cambogia",
        ptpt: "Camboja",
        ro: "Cambogia",
        es: "Camboya",
        sv: "Kambodja",
        pl: "Kambodza",
        ru: "&#1050;&#1072;&#1084;&#1073;&#1086;&#1076;&#1078;&#1072;",
        cs: "Kambod�a",
        th: "&#3585;&#3633;&#3617;&#3614;&#3641;&#3594;&#3634;",
        id: "Kamboja",
        zhhans: "&#26604;&#22484;&#23528;",
        tr: "Kambo&ccedil;ya"
      },
      {
        en: "Cameroon",
        de: "Kamerun",
        fr: "Cameroun",
        it: "Camerun",
        ptpt: "Camar�es",
        ro: "Camerun",
        es: "Camer�n",
        sv: "Kamerun",
        pl: "Kamerun",
        ru: "&#1050;&#1072;&#1084;&#1077;&#1088;&#1091;&#1085;",
        cs: "Kamerun",
        th: "&#3649;&#3588;&#3648;&#3617;&#3629;&#3619;&#3641;&#3609;",
        id: "Kamerun",
        zhhans: "&#21888;&#40613;&#38534;",
        tr: "Kamerun"
      },
      {
        en: "Canada",
        de: "Kanada",
        fr: "Canada",
        it: "Canada",
        ptpt: "Canad�",
        ro: "Canada",
        es: "Canad�",
        sv: "Kanada",
        pl: "Kanada",
        ru: "&#1050;&#1072;&#1085;&#1072;&#1076;&#1072;",
        cs: "Kanada",
        th: "&#3649;&#3588;&#3609;&#3634;&#3604;&#3634;",
        id: "Kanada",
        zhhans: "&#21152;&#25343;&#22823;",
        tr: "Kanada"
      },
      {
        en: "Cape Verde",
        de: "Kap Verde",
        fr: "Cap-Vert",
        it: "Capo Verde",
        ptpt: "Cabo Verde",
        ro: "Capul Verde",
        es: "Cabo Verde",
        sv: "Kap Verde",
        pl: "Wyspy Zielonego Przyladka",
        ru: "&#1050;&#1072;&#1073;&#1086;-&#1042;&#1077;&#1088;&#1076;&#1077;",
        cs: "Cape Verde",
        th: "&#3648;&#3588;&#3611;&#3648;&#3623;&#3636;&#3619;&#3660;&#3604;",
        id: "Cape Verde",
        zhhans: "&#20315;&#24471;&#35282;",
        tr: "Ye&#351;il Burun"
      },
      {
        en: "Central African Republic",
        de: "Zentralafrikanische Republik",
        fr: "R�publique centrafricaine",
        it: "Repubblica Centrafricana",
        ptpt: "Rep�blica Centro-Africano",
        ro: "Republica Centrafrican&#259;",
        es: "Rep�blica Centroafricana",
        sv: "Centralafrikanska republiken",
        pl: "Republika Srodkowoafrykanska",
        ru:
          "&#1062;&#1077;&#1085;&#1090;&#1088;&#1072;&#1083;&#1100;&#1085;&#1086;-&#1040;&#1092;&#1088;&#1080;&#1082;&#1072;&#1085;&#1089;&#1082;&#1072;&#1103; &#1056;&#1077;&#1089;&#1087;&#1091;&#1073;&#1083;&#1080;&#1082;&#1072;",
        cs: "Stredoafrick� republika",
        th:
          "&#3626;&#3634;&#3608;&#3634;&#3619;&#3603;&#3619;&#3633;&#3600;&#3649;&#3629;&#3615;&#3619;&#3636;&#3585;&#3634;&#3585;&#3621;&#3634;&#3591;",
        id: "Republik Afrika Tengah",
        zhhans: "&#20013;&#38750;&#20849;&#21644;&#22283;",
        tr: "Orta Afrika Cumhuriyeti"
      },
      {
        en: "Chad",
        de: "Chad",
        fr: "Tchad",
        it: "Ciad",
        ptpt: "Chade",
        ro: "Ciad",
        es: "Chad",
        sv: "Tchad",
        pl: "Czad",
        ru: "&#1063;&#1072;&#1076;",
        cs: "Chad",
        th: "&#3594;&#3634;&#3604;",
        id: "Chad",
        zhhans: "&#20045;&#24471;",
        tr: "&Ccedil;ad"
      },
      {
        en: "Chile",
        de: "Chile",
        fr: "Chili",
        it: "Chile",
        ptpt: "Chile",
        ro: "Chile",
        es: "Chile",
        sv: "Chile",
        pl: "Chile",
        ru: "&#1063;&#1080;&#1083;&#1080;",
        cs: "Chile",
        th: "&#3594;&#3636;&#3621;&#3637;",
        id: "Chile",
        zhhans: "&#26234;&#21033;",
        tr: "&#350;ili"
      },
      {
        en: "China",
        de: "China",
        fr: "Chine",
        it: "Cina",
        ptpt: "China",
        ro: "China",
        es: "China",
        sv: "Kina",
        pl: "Chiny",
        ru: "&#1050;&#1080;&#1090;&#1072;&#1081;",
        cs: "C�na",
        th: "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3592;&#3637;&#3609;",
        id: "Cina",
        zhhans: "&#20013;&#22283;",
        tr: "&Ccedil;in"
      },
      {
        en: "Colombia",
        de: "Kolumbien",
        fr: "Colombie",
        it: "Colombia",
        ptpt: "Col�mbia",
        ro: "Columbia",
        es: "Colombia",
        sv: "Colombia",
        pl: "Kolumbia",
        ru: "&#1050;&#1086;&#1083;&#1091;&#1084;&#1073;&#1080;&#1103;",
        cs: "Kolumbie",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3650;&#3588;&#3621;&#3629;&#3617;&#3648;&#3610;&#3637;&#3618;",
        id: "Kolumbia",
        zhhans: "&#21733;&#20523;&#27604;&#20126;",
        tr: "Kolombiya"
      },
      {
        en: "Comoros",
        de: "Komoren",
        fr: "Comores",
        it: "Comore",
        ptpt: "Comores",
        ro: "Comore",
        es: "Comoras",
        sv: "Komorerna",
        pl: "Komory",
        ru:
          "&#1050;&#1086;&#1084;&#1086;&#1088;&#1089;&#1082;&#1080;&#1077; &#1086;&#1089;&#1090;&#1088;&#1086;&#1074;&#1072;",
        cs: "Komory",
        th: "&#3588;&#3629;&#3650;&#3617;&#3650;&#3619;&#3626;",
        id: "Comoros",
        zhhans: "&#31185;&#25705;&#32645;",
        tr: "Komor Adalar&#305;"
      },
      {
        en: "Congo-Brazzaville",
        de: "Kongo-Brazzaville",
        fr: "Congo-Brazzaville",
        it: "Congo-Brazzaville",
        ptpt: "Congo-Brazzaville",
        ro: "Congo-Brazzaville",
        es: "Congo-Brazzaville",
        sv: "Kongo-Brazzaville",
        pl: "Kongo-Brazzaville",
        ru:
          "&#1050;&#1086;&#1085;&#1075;&#1086;- &#1041;&#1088;&#1072;&#1079;&#1079;&#1072;&#1074;&#1080;&#1083;&#1100;",
        cs: "Kongo - Brazzaville",
        th: "&#3588;&#3629;&#3591;&#3650;&#3585;",
        id: "Kongo-Brazzaville",
        zhhans: "&#21083;&#26524; - &#24067;&#25289;&#26612;&#32173;&#29246;",
        tr: "Kongo Brazavil"
      },
      {
        en: "Congo-Kinshasa",
        de: "Kongo-Kinshasa",
        fr: "Congo-Kinshasa",
        it: "Congo-Kinshasa",
        ptpt: "Congo-Kinshasa",
        ro: "Congo-Kinshasa",
        es: "Congo-Kinshasa",
        sv: "Kongo-Kinshasa",
        pl: "Kongo-Kinszasa",
        ru:
          "&#1050;&#1086;&#1085;&#1075;&#1086;-&#1050;&#1080;&#1085;&#1096;&#1072;&#1089;&#1072;",
        cs: "Kongo - Kinshasa",
        th:
          "&#3626;&#3634;&#3608;&#3634;&#3619;&#3603;&#3619;&#3633;&#3600;&#3611;&#3619;&#3632;&#3594;&#3634;&#3608;&#3636;&#3611;&#3652;&#3605;&#3618;&#3588;&#3629;&#3591;&#3650;&#3585;",
        id: "Kongo-Kinshasa",
        zhhans: "&#21083;&#26524;&#37329;&#27801;&#34217;",
        tr: "Kongo Ki&#351;asa"
      },
      {
        en: "Costa Rica",
        de: "Costa Rica",
        fr: "Costa Rica",
        it: "Costa Rica",
        ptpt: "Costa Rica",
        ro: "Costa Rica",
        es: "Costa Rica",
        sv: "COSTA RICA",
        pl: "Kostaryka",
        ru: "&#1050;&#1086;&#1089;&#1090;&#1072;-&#1056;&#1080;&#1082;&#1072;",
        cs: "Kostarika",
        th: "&#3588;&#3629;&#3626;&#3605;&#3634;&#3619;&#3636;&#3585;&#3634;",
        id: "Kosta Rika",
        zhhans: "&#21733;&#26031;&#36948;&#40654;&#21152;",
        tr: "Kosta Rika"
      },
      {
        en: "Croatia",
        de: "Kroatien",
        fr: "Croatie",
        it: "Croazia",
        ptpt: "Cro�cia",
        ro: "Croa&#539;ia",
        es: "Croacia",
        sv: "Kroatien",
        pl: "Chorwacja",
        ru: "&#1061;&#1086;&#1088;&#1074;&#1072;&#1090;&#1080;&#1103;",
        cs: "Chorvatsko",
        th: "&#3650;&#3588;&#3619;&#3648;&#3629;&#3648;&#3594;&#3637;&#3618;",
        id: "Kroasia",
        zhhans: "&#20811;&#32645;&#22320;&#20126;",
        tr: "H&#305;rvatistan"
      },
      {
        en: "Cuba",
        de: "Kuba",
        fr: "Cuba",
        it: "Cuba",
        ptpt: "Cuba",
        ro: "Cuba",
        es: "Cuba",
        sv: "Kuba",
        pl: "Kuba",
        ru: "&#1050;&#1091;&#1073;&#1072;",
        cs: "Kuba",
        th: "&#3588;&#3636;&#3623;&#3610;&#3634;",
        id: "Kuba",
        zhhans: "&#21476;&#24052;",
        tr: "K&uuml;ba"
      },
      {
        en: "Curacao",
        de: "Curacao",
        fr: "Cura&ccedil;ao",
        it: "Curacao",
        ptpt: "Curacao",
        ro: "Curacao",
        es: "Curacao",
        sv: "Curacao",
        pl: "Curacao",
        ru:
          "&#1083;&#1080;&#1082;&#1077;&#1088; &#1082;&#1102;&#1088;&#1072;&#1089;&#1086;",
        cs: "Curacao",
        th: "&#3588;&#3641;&#3619;&#3634;&#3648;&#3595;&#3634;",
        id: "Curacao",
        zhhans: "&#24235;&#25289;&#32034;",
        tr: "Cura&ccedil;oa"
      },
      {
        en: "Cyprus",
        de: "Zypern",
        fr: "Chypre",
        it: "Cipro",
        ptpt: "Chipre",
        ro: "Cipru",
        es: "Chipre",
        sv: "Cypern",
        pl: "Cypr",
        ru: "&#1050;&#1080;&#1087;&#1088;",
        cs: "Kypr",
        th: "&#3652;&#3595;&#3611;&#3619;&#3633;&#3626;",
        id: "Siprus",
        zhhans: "&#22622;&#28006;&#36335;&#26031;",
        tr: "K&#305;br&#305;s"
      },
      {
        en: "Czech Republic",
        de: "Tschechische Republik",
        fr: "R�publique tch�que",
        it: "Repubblica Ceca",
        ptpt: "Rep�blica Checa",
        ro: "Republica Ceha",
        es: "Rep�blica Checa",
        sv: "Tjeckien",
        pl: "Czechy",
        ru:
          "&#1063;&#1077;&#1096;&#1089;&#1082;&#1072;&#1103; &#1088;&#1077;&#1089;&#1087;&#1091;&#1073;&#1083;&#1080;&#1082;&#1072;",
        cs: "Cesk� republika",
        th:
          "&#3626;&#3634;&#3608;&#3634;&#3619;&#3603;&#3619;&#3633;&#3600;&#3648;&#3594;&#3655;&#3585;",
        id: "Republik Ceko",
        zhhans: "&#25463;&#20811;&#20849;&#21644;&#22283;",
        tr: "&Ccedil;ek Cumhuriyeti"
      },
      {
        en: "Denmark",
        de: "D&auml;nemark",
        fr: "Danemark",
        it: "Danimarca",
        ptpt: "Dinamarca",
        ro: "Danemarca",
        es: "Dinamarca",
        sv: "Danmark",
        pl: "Dania",
        ru: "&#1044;&#1072;&#1085;&#1080;&#1103;",
        cs: "D�nsko",
        th: "&#3648;&#3604;&#3609;&#3617;&#3634;&#3619;&#3660;&#3585;",
        id: "Denmark",
        zhhans: "&#20025;&#40613;",
        tr: "Danimarka"
      },
      {
        en: "Djibouti",
        de: "Dschibuti",
        fr: "Djibouti",
        it: "Gibuti",
        ptpt: "Djibouti",
        ro: "Djibouti",
        es: "Djibouti",
        sv: "Djibouti",
        pl: "Dzibuti",
        ru: "&#1044;&#1078;&#1080;&#1073;&#1091;&#1090;&#1080;",
        cs: "D�ibuti",
        th: "&#3592;&#3636;&#3610;&#3641;&#3605;&#3637;",
        id: "Djibouti",
        zhhans: "&#21513;&#24067;&#25552;",
        tr: "Cibuti"
      },
      {
        en: "Dominica",
        de: "Dominica",
        fr: "Dominique",
        it: "Dominica",
        ptpt: "Dominica",
        ro: "Dominica",
        es: "Dominica",
        sv: "Dominica",
        pl: "Dominika",
        ru: "&#1044;&#1086;&#1084;&#1080;&#1085;&#1080;&#1082;&#1072;",
        cs: "Dominika",
        th: "&#3650;&#3604;&#3617;&#3636;&#3609;&#3636;&#3585;&#3634;",
        id: "Dominica",
        zhhans: "&#22810;&#31859;&#23612;&#21152;",
        tr: "Dominik"
      },
      {
        en: "Dominican Republic",
        de: "Dominikanische Republik",
        fr: "R�publique dominicaine",
        it: "Repubblica Dominicana",
        ptpt: "Rep�blica Dominicana",
        ro: "Republica Dominican&#259;",
        es: "Rep�blica Dominicana",
        sv: "Dominikansa Republiken",
        pl: "Dominikana",
        ru:
          "&#1044;&#1086;&#1084;&#1080;&#1085;&#1080;&#1082;&#1072;&#1085;&#1089;&#1082;&#1072;&#1103; &#1056;&#1077;&#1089;&#1087;&#1091;&#1073;&#1083;&#1080;&#1082;&#1072;",
        cs: "Dominik�nsk� republika",
        th:
          "&#3626;&#3634;&#3608;&#3634;&#3619;&#3603;&#3619;&#3633;&#3600;&#3650;&#3604;&#3617;&#3636;&#3609;&#3636;&#3585;&#3633;&#3609;",
        id: "Republik Dominika",
        zhhans: "&#22810;&#26126;&#23612;&#21152;&#20849;&#21644;&#22283;",
        tr: "Dominik Cumhuriyeti"
      },
      {
        en: "Ecuador",
        de: "Ecuador",
        fr: "�quateur",
        it: "Ecuador",
        ptpt: "Equador",
        ro: "Ecuador",
        es: "Ecuador",
        sv: "Ecuador",
        pl: "Ekwador",
        ru: "&#1069;&#1082;&#1074;&#1072;&#1076;&#1086;&#1088;",
        cs: "Ekv�dor",
        th: "&#3648;&#3629;&#3585;&#3623;&#3634;&#3604;&#3629;&#3619;&#3660;",
        id: "Ekuador",
        zhhans: "&#21380;&#29916;&#22810;&#29246;",
        tr: "Ekvador"
      },
      {
        en: "Egypt",
        de: "�gypten",
        fr: "�gypte",
        it: "Egitto",
        ptpt: "Egito",
        ro: "Egipt",
        es: "Egipto",
        sv: "Egypten",
        pl: "Egipt",
        ru: "&#1045;&#1075;&#1080;&#1087;&#1077;&#1090;",
        cs: "Egypt",
        th: "&#3629;&#3637;&#3618;&#3636;&#3611;&#3605;&#3660;",
        id: "Mesir",
        zhhans: "&#22467;&#21450;",
        tr: "M&#305;s&#305;r"
      },
      {
        en: "El Salvador",
        de: "El Salvador",
        fr: "El Salvador",
        it: "El Salvador",
        ptpt: "El Salvador",
        ro: "El Salvador",
        es: "El Salvador",
        sv: "El Salvador",
        pl: "Salwador",
        ru: "&#1057;&#1072;&#1083;&#1100;&#1074;&#1072;&#1076;&#1086;&#1088;",
        cs: "El Salvador",
        th:
          "&#3648;&#3629;&#3621;&#3595;&#3633;&#3621;&#3623;&#3634;&#3604;&#3629;&#3619;&#3660;",
        id: "El Salvador",
        zhhans: "&#34217;&#29246;&#29926;&#22810;",
        tr: "El Salvador"
      },
      {
        en: "Equatorial Guinea",
        de: "�quatorial-Guinea",
        fr: "Guin�e �quatoriale",
        it: "Guinea Equatoriale",
        ptpt: "Guin� Equatorial",
        ro: "Guineea Ecuatorial&#259;",
        es: "Guinea Ecuatorial",
        sv: "Ekvatorialguinea",
        pl: "Gwinea R�wnikowa",
        ru:
          "&#1069;&#1082;&#1074;&#1072;&#1090;&#1086;&#1088;&#1080;&#1072;&#1083;&#1100;&#1085;&#1072;&#1103; &#1043;&#1074;&#1080;&#1085;&#1077;&#1103;",
        cs: "Rovn�kov� Guinea",
        th:
          "&#3629;&#3636;&#3648;&#3588;&#3623;&#3607;&#3629;&#3648;&#3619;&#3637;&#3618;&#3621;&#3585;&#3636;&#3609;&#3637;",
        id: "Equatorial Guinea",
        zhhans: "&#36196;&#36947;&#24190;&#20839;&#20126;",
        tr: "Ekvator Ginesi"
      },
      {
        en: "Eritrea",
        de: "Eritrea",
        fr: "Erythr�e",
        it: "Eritrea",
        ptpt: "Eritreia",
        ro: "Eritreea",
        es: "Eritrea",
        sv: "Eritrea",
        pl: "Erytrea",
        ru: "&#1069;&#1088;&#1080;&#1090;&#1088;&#1077;&#1103;",
        cs: "Eritrea",
        th: "Eritrea",
        id: "Eritrea",
        zhhans: "&#21380;&#31435;&#29305;&#37324;&#20126;",
        tr: "Eritre"
      },
      {
        en: "Estonia",
        de: "Estland",
        fr: "Estonie",
        it: "Estonia",
        ptpt: "Est�nia",
        ro: "Estonia",
        es: "Estonia",
        sv: "Estland",
        pl: "Estonia",
        ru: "&#1069;&#1089;&#1090;&#1086;&#1085;&#1080;&#1103;",
        cs: "Estonsko",
        th: "&#3648;&#3629;&#3626;&#3650;&#3605;&#3648;&#3609;&#3637;&#3618;",
        id: "Estonia",
        zhhans: "&#24859;&#27801;&#23612;&#20126;",
        tr: "Estonya"
      },
      {
        en: "Ethiopia",
        de: "�thiopien",
        fr: "Ethiopie",
        it: "Etiopia",
        ptpt: "Eti�pia",
        ro: "Etiopia",
        es: "Etiop�a",
        sv: "Etiopien",
        pl: "Etiopia",
        ru: "&#1069;&#1092;&#1080;&#1086;&#1087;&#1080;&#1103;",
        cs: "Etiopie",
        th:
          "&#3626;&#3634;&#3608;&#3634;&#3619;&#3603;&#3619;&#3633;&#3600;&#3648;&#3629;&#3608;&#3636;&#3650;&#3629;&#3648;&#3611;&#3637;&#3618;",
        id: "Etiopia",
        zhhans: "&#22467;&#22622;&#20420;&#27604;&#20126;",
        tr: "Etiyopya"
      },
      {
        en: "Fiji",
        de: "Fidschi",
        fr: "Fidji",
        it: "Fiji",
        ptpt: "Fiji",
        ro: "Fiji",
        es: "Fiji",
        sv: "Fiji",
        pl: "Fidzi",
        ru: "&#1060;&#1080;&#1076;&#1078;&#1080;",
        cs: "Fid�i",
        th: "&#3615;&#3636;&#3592;&#3636;",
        id: "Fiji",
        zhhans: "&#26000;",
        tr: "Fiji"
      },
      {
        en: "Finland",
        de: "Finnland",
        fr: "Finlande",
        it: "Finlandia",
        ptpt: "Finl�ndia",
        ro: "Finlanda",
        es: "Finlandia",
        sv: "Finland",
        pl: "Finlandia",
        ru: "&#1060;&#1080;&#1085;&#1083;&#1103;&#1085;&#1076;&#1080;&#1103;",
        cs: "Finsko",
        th: "&#3615;&#3636;&#3609;&#3649;&#3621;&#3609;&#3604;&#3660;",
        id: "Finlandia",
        zhhans: "&#33452;&#34349;",
        tr: "Finlandiya"
      },
      {
        en: "France",
        de: "Frankreich",
        fr: "France",
        it: "Francia",
        ptpt: "Fran&ccedil;a",
        ro: "Fran&#539;a",
        es: "Francia",
        sv: "Frankrike",
        pl: "Francja",
        ru: "&#1060;&#1088;&#1072;&#1085;&#1094;&#1080;&#1103;",
        cs: "Francie",
        th: "&#3613;&#3619;&#3633;&#3656;&#3591;&#3648;&#3624;&#3626;",
        id: "Perancis",
        zhhans: "&#27861;&#22283;",
        tr: "Fransa"
      },
      {
        en: "Gabon",
        de: "Gabun",
        fr: "Gabon",
        it: "Gabon",
        ptpt: "Gab�o",
        ro: "Gabon",
        es: "Gab�n",
        sv: "Gabon",
        pl: "Gabon",
        ru: "&#1043;&#1072;&#1073;&#1086;&#1085;",
        cs: "Gabon",
        th: "&#3585;&#3634;&#3610;&#3629;&#3591;",
        id: "Gabon",
        zhhans: "&#21152;&#34028;",
        tr: "Gabon"
      },
      {
        en: "Gambia",
        de: "Gambia",
        fr: "Gambie",
        it: "Gambia",
        ptpt: "G�mbia",
        ro: "Gambia",
        es: "Gambia",
        sv: "Gambia",
        pl: "Gambia",
        ru: "&#1043;&#1072;&#1084;&#1073;&#1080;&#1103;",
        cs: "Gambie",
        th: "&#3649;&#3585;&#3617;&#3648;&#3610;&#3637;&#3618;",
        id: "Gambia",
        zhhans: "&#23713;&#27604;&#20126;",
        tr: "Gambiya"
      },
      {
        en: "Georgia",
        de: "Georgia",
        fr: "G�orgie",
        it: "Georgia",
        ptpt: "Georgia",
        ro: "Georgia",
        es: "Georgia",
        sv: "Georgien",
        pl: "Gruzja",
        ru: "&#1043;&#1088;&#1091;&#1079;&#1080;&#1103;",
        cs: "Gruzie",
        th: "&#3592;&#3629;&#3619;&#3660;&#3648;&#3592;&#3637;&#3618;",
        id: "Georgia",
        zhhans: "&#26684;&#39791;&#21513;&#20126;",
        tr: "G&uuml;rcistan"
      },
      {
        en: "Germany",
        de: "Deutschland",
        fr: "Allemagne",
        it: "Germania",
        ptpt: "Alemanha",
        ro: "Germania",
        es: "Alemania",
        sv: "Tyskland",
        pl: "Niemcy",
        ru: "&#1043;&#1077;&#1088;&#1084;&#1072;&#1085;&#1080;&#1103;",
        cs: "Nemecko",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3648;&#3618;&#3629;&#3619;&#3617;&#3633;&#3609;",
        id: "Jerman",
        zhhans: "&#24503;&#22283;",
        tr: "Almanya"
      },
      {
        en: "Ghana",
        de: "Ghana",
        fr: "Ghana",
        it: "Ghana",
        ptpt: "Gana",
        ro: "Ghana",
        es: "Ghana",
        sv: "Ghana",
        pl: "Ghana",
        ru: "&#1043;&#1072;&#1085;&#1072;",
        cs: "Ghana",
        th: "&#3585;&#3634;&#3609;&#3634;",
        id: "Ghana",
        zhhans: "&#21152;&#32013;",
        tr: "Gana"
      },
      {
        en: "Greece",
        de: "Griechenland",
        fr: "Gr�ce",
        it: "Grecia",
        ptpt: "Gr�cia",
        ro: "Grecia",
        es: "Grecia",
        sv: "Grekland",
        pl: "Grecja",
        ru: "&#1043;&#1088;&#1077;&#1094;&#1080;&#1103;",
        cs: "Recko",
        th: "&#3585;&#3619;&#3637;&#3585;",
        id: "Yunani",
        zhhans: "&#24076;&#33240;",
        tr: "Yunanistan"
      },
      {
        en: "Grenada",
        de: "Grenada",
        fr: "Grenade",
        it: "Grenada",
        ptpt: "Granada",
        ro: "Grenada",
        es: "Granada",
        sv: "Grenada",
        pl: "Grenada",
        ru: "&#1043;&#1088;&#1077;&#1085;&#1072;&#1076;&#1072;",
        cs: "Grenada",
        th: "&#3648;&#3585;&#3619;&#3648;&#3609;&#3604;&#3634;",
        id: "Grenada",
        zhhans: "&#26684;&#26519;&#32013;&#36948;",
        tr: "Grenada"
      },
      {
        en: "Guatemala",
        de: "Guatemala",
        fr: "Guatemala",
        it: "Guatemala",
        ptpt: "Guatemala",
        ro: "Guatemala",
        es: "Guatemala",
        sv: "Guatemala",
        pl: "Gwatemala",
        ru: "&#1043;&#1074;&#1072;&#1090;&#1077;&#1084;&#1072;&#1083;&#1072;",
        cs: "Guatemala",
        th: "&#3585;&#3633;&#3623;&#3648;&#3605;&#3617;&#3634;&#3621;&#3634;",
        id: "Guatemala",
        zhhans: "&#21361;&#22320;&#39340;&#25289;",
        tr: "Guatemala"
      },
      {
        en: "Guinea",
        de: "Guinea",
        fr: "Guin�e",
        it: "Guinea",
        ptpt: "Guin�",
        ro: "Guineea",
        es: "Guinea",
        sv: "Guinea",
        pl: "Gwinea",
        ru: "&#1043;&#1074;&#1080;&#1085;&#1077;&#1103;",
        cs: "Guinea",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3585;&#3636;&#3609;&#3637;",
        id: "Guinea",
        zhhans: "&#24190;&#20839;&#20126;",
        tr: "Gine"
      },
      {
        en: "Guinea-Bissau",
        de: "Guinea-Bissau",
        fr: "Guin�e-Bissau",
        it: "Guinea- Bissau",
        ptpt: "Guin�-Bissau",
        ro: "Guineea-Bissau",
        es: "Guinea-Bissau",
        sv: "Guinea-Bissau",
        pl: "Gwinea Bissau",
        ru:
          "&#1043;&#1074;&#1080;&#1085;&#1077;&#1103;-&#1041;&#1080;&#1089;&#1072;&#1091;",
        cs: "Guinea - Bissau",
        th:
          "&#3585;&#3636;&#3609;&#3637;&#3610;&#3636;&#3626;&#3648;&#3595;&#3634;",
        id: "Guinea-Bissau",
        zhhans: "&#24190;&#20839;&#20126;&#27604;&#32057;",
        tr: "Gine Bisav"
      },
      {
        en: "Guyana",
        de: "Guyana",
        fr: "Guyane",
        it: "Guyana",
        ptpt: "Guiana",
        ro: "Guyana",
        es: "Guayana",
        sv: "Guyana",
        pl: "Gujana",
        ru: "&#1043;&#1072;&#1081;&#1072;&#1085;&#1072;",
        cs: "Guyana",
        th: "&#3585;&#3634;&#3618;&#3629;&#3634;&#3609;&#3634;",
        id: "Guyana",
        zhhans: "&#22317;&#20126;&#37027;",
        tr: "Guyana"
      },
      {
        en: "Haiti",
        de: "Haiti",
        fr: "Ha�ti",
        it: "Haiti",
        ptpt: "Haiti",
        ro: "Haiti",
        es: "Hait�",
        sv: "Haiti",
        pl: "Haiti",
        ru: "&#1043;&#1072;&#1080;&#1090;&#1080;",
        cs: "Haiti",
        th: "&#3652;&#3630;&#3605;&#3636;",
        id: "Haiti",
        zhhans: "&#28023;&#22320;",
        tr: "Haiti"
      },
      {
        en: "Holy See",
        de: "Heiligen Stuhl",
        fr: "Saint-Si�ge",
        it: "Santa Sede",
        ptpt: "Santa S�",
        ro: "Sf�ntul Scaun",
        es: "Santa Sede",
        sv: "Heliga stolen",
        pl: "Stolica Apostolska",
        ru:
          "&#1087;&#1072;&#1087;&#1089;&#1082;&#1080;&#1081; &#1087;&#1088;&#1077;&#1089;&#1090;&#1086;&#1083;",
        cs: "Svat� stolec",
        th: "&#3614;&#3619;&#3632;&#3648;&#3627;&#3655;&#3609;",
        id: "Takhta Suci",
        zhhans: "&#25945;&#24311;",
        tr: "Vatikan"
      },
      {
        en: "Honduras",
        de: "Honduras",
        fr: "Honduras",
        it: "Honduras",
        ptpt: "Honduras",
        ro: "Honduras",
        es: "Honduras",
        sv: "Honduras",
        pl: "Honduras",
        ru: "&#1043;&#1086;&#1085;&#1076;&#1091;&#1088;&#1072;&#1089;",
        cs: "Honduras",
        th: "&#3630;&#3629;&#3609;&#3604;&#3641;&#3619;&#3633;&#3626;",
        id: "Honduras",
        zhhans: "&#27946;&#37117;&#25289;&#26031;",
        tr: "Honduras"
      },
      {
        en: "Hong Kong",
        de: "Hongkong",
        fr: "Hong Kong",
        it: "Hong Kong",
        ptpt: "Hong Kong",
        ro: "Hong Kong",
        es: "Hong Kong",
        sv: "Hongkong",
        pl: "Hongkong",
        ru: "&#1043;&#1086;&#1085;&#1082;&#1086;&#1085;&#1075;",
        cs: "Hongkong",
        th: "&#3630;&#3656;&#3629;&#3591;&#3585;&#3591;",
        id: "Hong Kong",
        zhhans: "&#39321;&#28207;",
        tr: "Hong Kong"
      },
      {
        en: "Hungary",
        de: "Ungarn",
        fr: "Hongrie",
        it: "Ungheria",
        ptpt: "Hungria",
        ro: "Ungaria",
        es: "Hungr�a",
        sv: "Ungern",
        pl: "Wegry",
        ru: "&#1042;&#1077;&#1085;&#1075;&#1088;&#1080;&#1103;",
        cs: "Madarsko",
        th: "&#3630;&#3633;&#3591;&#3585;&#3634;&#3619;&#3637;",
        id: "Hongaria",
        zhhans: "&#21256;&#29273;&#21033;",
        tr: "Macaristan"
      },
      {
        en: "Iceland",
        de: "Island",
        fr: "Islande",
        it: "Islanda",
        ptpt: "Isl�ndia",
        ro: "Islanda",
        es: "Islandia",
        sv: "Island",
        pl: "Islandia",
        ru: "&#1048;&#1089;&#1083;&#1072;&#1085;&#1076;&#1080;&#1103;",
        cs: "Island",
        th: "&#3652;&#3629;&#3595;&#3660;&#3649;&#3621;&#3609;&#3604;&#3660;",
        id: "Islandia",
        zhhans: "&#20912;&#23798;",
        tr: "&#304;zlanda"
      },
      {
        en: "India",
        de: "Indien",
        fr: "Inde",
        it: "India",
        ptpt: "�ndia",
        ro: "India",
        es: "India",
        sv: "Indien",
        pl: "Indie",
        ru: "&#1048;&#1085;&#1076;&#1080;&#1103;",
        cs: "Indie",
        th: "&#3629;&#3636;&#3609;&#3648;&#3604;&#3637;&#3618;",
        id: "India",
        zhhans: "&#21360;&#24230;",
        tr: "Hindistan"
      },
      {
        en: "Indonesia",
        de: "Indonesien",
        fr: "Indon�sie",
        it: "Indonesia",
        ptpt: "Indon�sia",
        ro: "Indonezia",
        es: "Indonesia",
        sv: "Indonesien",
        pl: "Indonezja",
        ru: "&#1048;&#1085;&#1076;&#1086;&#1085;&#1077;&#1079;&#1080;&#1103;",
        cs: "Indon�sie",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3629;&#3636;&#3609;&#3650;&#3604;&#3609;&#3637;&#3648;&#3595;&#3637;&#3618;",
        id: "Indonesia",
        zhhans: "&#21360;&#23612;",
        tr: "Endonezya"
      },
      {
        en: "Iran",
        de: "Iran",
        fr: "Iran",
        it: "Iran",
        ptpt: "Ir�",
        ro: "Iran",
        es: "Ir�n",
        sv: "Iran",
        pl: "Iran",
        ru: "&#1048;&#1088;&#1072;&#1085;",
        cs: "�r�n",
        th: "&#3629;&#3636;&#3627;&#3619;&#3656;&#3634;&#3609;",
        id: "Iran",
        zhhans: "&#20234;&#26391;",
        tr: "&#304;ran"
      },
      {
        en: "Iraq",
        de: "Irak",
        fr: "Irak",
        it: "Iraq",
        ptpt: "Iraque",
        ro: "Irak",
        es: "Irak",
        sv: "Irak",
        pl: "Irak",
        ru: "&#1048;&#1088;&#1072;&#1082;",
        cs: "Ir�k",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3629;&#3636;&#3619;&#3633;&#3585;",
        id: "Irak",
        zhhans: "&#20234;&#25289;&#20811;",
        tr: "Irak"
      },
      {
        en: "Ireland",
        de: "Irland",
        fr: "Irlande",
        it: "Irlanda",
        ptpt: "Irlanda",
        ro: "Irlanda",
        es: "Irlanda",
        sv: "Irland",
        pl: "Irlandia",
        ru: "&#1048;&#1088;&#1083;&#1072;&#1085;&#1076;&#1080;&#1103;",
        cs: "Irsko",
        th: "&#3652;&#3629;&#3619;&#3660;&#3649;&#3621;&#3609;&#3604;&#3660;",
        id: "Irlandia",
        zhhans: "&#24859;&#29246;&#34349;",
        tr: "&#304;rlanda"
      },
      {
        en: "Israel",
        de: "Israel",
        fr: "Isra�l",
        it: "Israele",
        ptpt: "Israel",
        ro: "Izrael",
        es: "Israel",
        sv: "Israel",
        pl: "Izrael",
        ru: "&#1048;&#1079;&#1088;&#1072;&#1080;&#1083;&#1100;",
        cs: "Izrael",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3629;&#3636;&#3626;&#3619;&#3634;&#3648;&#3629;&#3621;",
        id: "Israel",
        zhhans: "&#20197;&#33394;&#21015;",
        tr: "&#304;srail"
      },
      {
        en: "Italy",
        de: "Italien",
        fr: "Italie",
        it: "Italia",
        ptpt: "It�lia",
        ro: "Italia",
        es: "Italia",
        sv: "Italien",
        pl: "Wlochy",
        ru: "&#1048;&#1090;&#1072;&#1083;&#1080;&#1103;",
        cs: "It�lie",
        th: "&#3629;&#3636;&#3605;&#3634;&#3621;&#3637;",
        id: "Italia",
        zhhans: "&#24847;&#22823;&#21033;",
        tr: "&#304;talya"
      },
      {
        en: "Ivory Coast",
        de: "Elfenbeink& uuml;ste",
        fr: "C�te-d'Ivoire",
        it: "Costa d'Avorio",
        ptpt: "Costa do Marfim",
        ro: "Coasta de Filde&#537;",
        es: "Costa de Marfil",
        sv: "Elfenbenkusten",
        pl: "Wybrzeze Kosci Sloniowej",
        ru:
          "&#1073;&#1077;&#1088;&#1077;&#1075; &#1057;&#1083;&#1086;&#1085;&#1086;&#1074;&#1086;&#1081; &#1050;&#1086;&#1089;&#1090;&#1080;",
        cs: "pobre�� slonoviny",
        th:
          "&#3652;&#3629;&#3623;&#3629;&#3619;&#3637;&#3656;&#3650;&#3588;&#3626;",
        id: "Pantai Gading",
        zhhans: "&#35937;&#29273;&#28023;&#23736;",
        tr: "Fildi&#351;i Sahilleri"
      },
      {
        en: "Jamaica",
        de: "Jamaica",
        fr: "Jama�que",
        it: "Giamaica",
        ptpt: "Jamaica",
        ro: "Jamaica",
        es: "Jamaica",
        sv: "Jamaica",
        pl: "Jamajka",
        ru: "&#1071;&#1084;&#1072;&#1081;&#1082;&#1072;",
        cs: "Jamaica",
        th: "&#3592;&#3634;&#3652;&#3617;&#3585;&#3657;&#3634;",
        id: "Jamaika",
        zhhans: "&#29273;&#36023;&#21152;",
        tr: "Jamaika"
      },
      {
        en: "Japan",
        de: "Japan",
        fr: "Japon",
        it: "Giappone",
        ptpt: "Jap�o",
        ro: "Japonia",
        es: "Jap�n",
        sv: "Japan",
        pl: "Japonia",
        ru: "&#1071;&#1087;&#1086;&#1085;&#1080;&#1103;",
        cs: "Japonsko",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3597;&#3637;&#3656;&#3611;&#3640;&#3656;&#3609;",
        id: "Jepang",
        zhhans: "&#26085;&#26412;",
        tr: "Japonya"
      },
      {
        en: "Jordan",
        de: "Jordan",
        fr: "Jordanie",
        it: "Giordania",
        ptpt: "Jord�nia",
        ro: "Iordania",
        es: "Jordania",
        sv: "Jordanien",
        pl: "Jordania",
        ru: "&#1048;&#1086;&#1088;&#1076;&#1072;&#1085;&#1080;&#1103;",
        cs: "Jord�n",
        th: "&#3592;&#3629;&#3619;&#3660;&#3649;&#3604;&#3609;",
        id: "Jordan",
        zhhans: "&#32004;&#26086;",
        tr: "&Uuml;rd&uuml;n"
      },
      {
        en: "Kazakhstan",
        de: "Kasachstan",
        fr: "Kazakhstan",
        it: "Kazakhstan",
        ptpt: "Cazaquist�o",
        ro: "Kazahstan",
        es: "Kazajst�n",
        sv: "Kazakstan",
        pl: "Kazachstan",
        ru: "&#1050;&#1072;&#1079;&#1072;&#1093;&#1089;&#1090;&#1072;&#1085;",
        cs: "Kazachst�n",
        th: "&#3588;&#3634;&#3595;&#3633;&#3588;&#3626;&#3606;&#3634;&#3609;",
        id: "Kazakhstan",
        zhhans: "&#21704;&#34217;&#20811;&#26031;&#22374;",
        tr: "Kazakistan"
      },
      {
        en: "Kenya",
        de: "Kenia",
        fr: "Kenya",
        it: "Kenya",
        ptpt: "Qu�nia",
        ro: "Kenia",
        es: "Kenia",
        sv: "Kenya",
        pl: "Kenia",
        ru: "&#1050;&#1077;&#1085;&#1080;&#1103;",
        cs: "Kena",
        th: "&#3648;&#3588;&#3609;&#3618;&#3634;",
        id: "Kenya",
        zhhans: "&#32943;&#23612;&#20126;",
        tr: "Kenya"
      },
      {
        en: "Kiribati",
        de: "Kiribati",
        fr: "Kiribati",
        it: "Kiribati",
        ptpt: "Kiribati",
        ro: "Kiribati",
        es: "Kiribati",
        sv: "Kiribati",
        pl: "Kiribati",
        ru: "&#1050;&#1080;&#1088;&#1080;&#1073;&#1072;&#1090;&#1080;",
        cs: "Kiribati",
        th: "&#3588;&#3636;&#3619;&#3636;&#3610;&#3634;&#3626;",
        id: "Kiribati",
        zhhans: "&#22522;&#37324;&#24052;&#26031;",
        tr: "Kiribati"
      },
      {
        en: "Kosovo",
        de: "Kosovo",
        fr: "Kosovo",
        it: "Kosovo",
        ptpt: "Kosovo",
        ro: "Kosovo",
        es: "Kosovo",
        sv: "Kosovo",
        pl: "Kosowo",
        ru: "&#1050;&#1086;&#1089;&#1086;&#1074;&#1086;",
        cs: "Kosovo",
        th: "&#3650;&#3588;&#3650;&#3595;&#3650;&#3623;",
        id: "Kosovo",
        zhhans: "&#31185;&#32034;&#27779;",
        tr: "Kosova"
      },
      {
        en: "Kuwait",
        de: "Kuwait",
        fr: "Kowe�t",
        it: "Kuwait",
        ptpt: "Kuweit",
        ro: "Kuweit",
        es: "Kuwait",
        sv: "Kuwait",
        pl: "Kuwejt",
        ru: "&#1050;&#1091;&#1074;&#1077;&#1081;&#1090;",
        cs: "Kuvajt",
        th: "&#3588;&#3641;&#3648;&#3623;&#3605;",
        id: "Kuwait",
        zhhans: "&#31185;&#23041;&#29305;",
        tr: "Kuveyt"
      },
      {
        en: "Kyrgyzstan",
        de: "Kirgisistan",
        fr: "Kirghizistan",
        it: "Kirghizistan",
        ptpt: "Quirguist�o",
        ro: "K�rg�zstan",
        es: "Kirguist�n",
        sv: "Kirgistan",
        pl: "Kirgistan",
        ru: "&#1050;&#1080;&#1088;&#1075;&#1080;&#1079;&#1080;&#1103;",
        cs: "Kyrgyzst�n",
        th: "Kyrgyzstan",
        id: "Kirgistan",
        zhhans: "&#21513;&#29246;&#21513;&#26031;&#26031;&#22374;",
        tr: "K&#305;rg&#305;zistan"
      },
      {
        en: "Laos",
        de: "Laos",
        fr: "Laos",
        it: "Laos",
        ptpt: "Laos",
        ro: "Laos",
        es: "Laos",
        sv: "Laos",
        pl: "Laos",
        ru: "&#1051;&#1072;&#1086;&#1089;",
        cs: "Laos",
        th: "&#3621;&#3634;&#3623;",
        id: "Laos",
        zhhans: "&#32769;&#25790;",
        tr: "Laos"
      },
      {
        en: "Latvia",
        de: "Lettland",
        fr: "Lettonie",
        it: "Lettonia",
        ptpt: "L�tvia",
        ro: "Letonia",
        es: "Letonia",
        sv: "Lettland",
        pl: "Lotwa",
        ru: "&#1051;&#1072;&#1090;&#1074;&#1080;&#1103;",
        cs: "Loty�sko",
        th: "&#3621;&#3633;&#3605;&#3648;&#3623;&#3637;&#3618;",
        id: "Latvia",
        zhhans: "&#25289;&#33067;&#32173;&#20126;",
        tr: "Letonya"
      },
      {
        en: "Lebanon",
        de: "Libanon",
        fr: "Liban",
        it: "Libano",
        ptpt: "L�bano",
        ro: "Liban",
        es: "L�bano",
        sv: "Libanon",
        pl: "Liban",
        ru: "&#1051;&#1080;&#1074;&#1072;&#1085;",
        cs: "Libanon",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3648;&#3621;&#3610;&#3634;&#3609;&#3629;&#3609;",
        id: "Libanon",
        zhhans: "&#40654;&#24052;&#23273;",
        tr: "L&uuml;bnan"
      },
      {
        en: "Lesotho",
        de: "Lesotho",
        fr: "Lesotho",
        it: "Lesotho",
        ptpt: "Lesoto",
        ro: "Lesotho",
        es: "Lesoto",
        sv: "Lesotho",
        pl: "Lesotho",
        ru: "&#1051;&#1077;&#1089;&#1086;&#1090;&#1086;",
        cs: "Lesotho",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3648;&#3621;&#3650;&#3595;&#3650;&#3607;",
        id: "Lesotho",
        zhhans: "&#33802;&#32034;&#25176;",
        tr: "Lesoto"
      },
      {
        en: "Liberia",
        de: "Liberia",
        fr: "Liberia",
        it: "Liberia",
        ptpt: "Lib�ria",
        ro: "Liberia",
        es: "Liberia",
        sv: "Liberia",
        pl: "Liberia",
        ru: "&#1051;&#1080;&#1073;&#1077;&#1088;&#1080;&#1103;",
        cs: "Lib�rie",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3652;&#3621;&#3610;&#3637;&#3648;&#3619;&#3637;&#3618;",
        id: "Liberia",
        zhhans: "&#21033;&#27604;&#37324;&#20126;",
        tr: "Liberya"
      },
      {
        en: "Libya",
        de: "Libyen",
        fr: "Libye",
        it: "Libia",
        ptpt: "L�bia",
        ro: "Libia",
        es: "Libia",
        sv: "Libyen",
        pl: "Libia",
        ru: "&#1051;&#1080;&#1074;&#1080;&#1103;",
        cs: "Libye",
        th: "&#3621;&#3636;&#3648;&#3610;&#3637;&#3618;",
        id: "Libya",
        zhhans: "&#21033;&#27604;&#20126;",
        tr: "Libya"
      },
      {
        en: "Liechtenstein",
        de: "Liechtenstein",
        fr: "Liechtenstein",
        it: "Liechtenstein",
        ptpt: "Liechtenstein",
        ro: "Liechtenstein",
        es: "Liechtenstein",
        sv: "Liechtenstein",
        pl: "Liechtenstein",
        ru:
          "&#1051;&#1080;&#1093;&#1090;&#1077;&#1085;&#1096;&#1090;&#1077;&#1081;&#1085;",
        cs: "Lichten�tejnsko",
        th:
          "&#3621;&#3636;&#3585;&#3648;&#3605;&#3609;&#3626;&#3652;&#3605;&#3609;&#3660;",
        id: "Liechtenstein",
        zhhans: "&#21015;&#25903;&#25958;&#22763;&#30331;",
        tr: "Lihten&#351;tayn"
      },
      {
        en: "Lithuania",
        de: "Litauen",
        fr: "Lituanie",
        it: "Lituania",
        ptpt: "Litu�nia",
        ro: "Lituania",
        es: "Lituania",
        sv: "Litauen",
        pl: "Litwa",
        ru: "&#1051;&#1080;&#1090;&#1074;&#1072;",
        cs: "Litva",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3621;&#3636;&#3608;&#3633;&#3623;&#3648;&#3609;&#3637;&#3618;",
        id: "Lithuania",
        zhhans: "&#31435;&#38518;&#23451;",
        tr: "Litvanya"
      },
      {
        en: "Luxembourg",
        de: "Luxemburg",
        fr: "Luxembourg",
        it: "Lussemburgo",
        ptpt: "Luxemburgo",
        ro: "Luxemburg",
        es: "Luxemburgo",
        sv: "Luxembourg",
        pl: "Luksemburg",
        ru:
          "&#1051;&#1102;&#1082;&#1089;&#1077;&#1084;&#1073;&#1091;&#1088;&#1075;",
        cs: "Lucembursko",
        th:
          "&#3621;&#3633;&#3585;&#3648;&#3595;&#3617;&#3648;&#3610;&#3636;&#3619;&#3660;&#3585;",
        id: "Luksemburg",
        zhhans: "&#30439;&#26862;&#22561;",
        tr: "L&uuml;ksemburg"
      },
      {
        en: "Macau",
        de: "Macau",
        fr: "Macao",
        it: "Macau",
        ptpt: "Macau",
        ro: "Macao",
        es: "Macau",
        sv: "Macau",
        pl: "Makau",
        ru: "&#1052;&#1072;&#1082;&#1072;&#1086;",
        cs: "Macau",
        th: "&#3617;&#3634;&#3648;&#3585;&#3658;&#3634;",
        id: "Macau",
        zhhans: "&#28595;&#38272;",
        tr: "Makao"
      },
      {
        en: "Macedonia",
        de: "Mazedonien",
        fr: "Mac�doine",
        it: "Macedonia",
        ptpt: "Macedonia",
        ro: "Macedonia",
        es: "Macedonia",
        sv: "Makedonien",
        pl: "Macedonia",
        ru: "&#1052;&#1072;&#1082;&#1077;&#1076;&#1086;&#1085;&#1080;&#1103;",
        cs: "Makedonie",
        th:
          "&#3617;&#3634;&#3595;&#3636;&#3650;&#3604;&#3648;&#3609;&#3637;&#3618;",
        id: "Macedonia",
        zhhans: "&#39340;&#20854;&#38931;",
        tr: "Makedonya"
      },
      {
        en: "Madagascar",
        de: "Madagaskar",
        fr: "Madagascar",
        it: "Madagascar",
        ptpt: "Madag�scar",
        ro: "Madagascar",
        es: "Madagascar",
        sv: "Madagaskar",
        pl: "Madagaskar",
        ru:
          "&#1052;&#1072;&#1076;&#1072;&#1075;&#1072;&#1089;&#1082;&#1072;&#1088;",
        cs: "Madagaskar",
        th:
          "&#3617;&#3634;&#3604;&#3634;&#3585;&#3633;&#3626;&#3585;&#3634;&#3619;&#3660;",
        id: "Madagaskar",
        zhhans: "&#39340;&#36948;&#21152;&#26031;&#21152;",
        tr: "Madagaskar"
      },
      {
        en: "Malawi",
        de: "Malawi",
        fr: "Malawi",
        it: "Malawi",
        ptpt: "Malavi",
        ro: "Malawi",
        es: "Malawi",
        sv: "Malawi",
        pl: "Malawi",
        ru: "&#1052;&#1072;&#1083;&#1072;&#1074;&#1080;",
        cs: "Malawi",
        th: "&#3617;&#3634;&#3621;&#3634;&#3623;&#3637;",
        id: "Malawi",
        zhhans: "&#39340;&#25289;&#32173;",
        tr: "Malavi"
      },
      {
        en: "Malaysia",
        de: "Malaysia",
        fr: "Malaisie",
        it: "Malaysia",
        ptpt: "Mal�sia",
        ro: "Malaezia",
        es: "Malasia",
        sv: "Malaysia",
        pl: "Malezja",
        ru: "&#1052;&#1072;&#1083;&#1072;&#1081;&#1079;&#1080;&#1103;",
        cs: "Malajsie",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3617;&#3634;&#3648;&#3621;&#3648;&#3595;&#3637;&#3618;",
        id: "Malaysia",
        zhhans: "&#39340;&#20358;&#35199;&#20126;",
        tr: "Malezya"
      },
      {
        en: "Maldives",
        de: "Malediven",
        fr: "Maldives",
        it: "Maldive",
        ptpt: "Maldivas",
        ro: "Maldive",
        es: "Maldivas",
        sv: "Maldiverna",
        pl: "Malediwy",
        ru: "&#1052;&#1072;&#1083;&#1100;&#1076;&#1080;&#1074;&#1099;",
        cs: "Maledivy",
        th: "&#3617;&#3633;&#3621;&#3604;&#3637;&#3615;&#3626;&#3660;",
        id: "Maladewa",
        zhhans: "&#39340;&#29246;&#20195;&#22827;",
        tr: "Maldivler"
      },
      {
        en: "Mali",
        de: "Mali",
        fr: "Mali",
        it: "Mali",
        ptpt: "Mali",
        ro: "Mali",
        es: "Mal�",
        sv: "Mali",
        pl: "Mali",
        ru: "&#1052;&#1072;&#1083;&#1080;",
        cs: "Mali",
        th: "&#3617;&#3634;&#3621;&#3637;",
        id: "Mali",
        zhhans: "&#39340;&#37324;",
        tr: "Mali"
      },
      {
        en: "Malta",
        de: "Malta",
        fr: "Malte",
        it: "Malta",
        ptpt: "Malta",
        ro: "Malta",
        es: "Malta",
        sv: "Malta",
        pl: "Malta",
        ru: "&#1052;&#1072;&#1083;&#1100;&#1090;&#1072;",
        cs: "Malta",
        th: "&#3648;&#3585;&#3634;&#3632;&#3617;&#3629;&#3621;&#3605;&#3634;",
        id: "Malta",
        zhhans: "&#39340;&#32819;&#20182;",
        tr: "Malta"
      },
      {
        en: "Marshall Islands",
        de: "Marshall Islands",
        fr: "�les Marshall",
        it: "Isole Marshall",
        ptpt: "Ilhas Marshall",
        ro: "Insulele Marshall",
        es: "Islas Marshall",
        sv: "Marshall& ouml;arna",
        pl: "Wyspy Marshalla",
        ru:
          "&#1052;&#1072;&#1088;&#1096;&#1072;&#1083;&#1083;&#1086;&#1074;&#1099; &#1086;&#1089;&#1090;&#1088;&#1086;&#1074;&#1072;",
        cs: "Marshallovy ostrovy",
        th:
          "&#3627;&#3617;&#3641;&#3656;&#3648;&#3585;&#3634;&#3632;&#3617;&#3634;&#3619;&#3660;&#3649;&#3594;&#3621;&#3621;&#3660;",
        id: "Kepulauan Marshall",
        zhhans: "&#39340;&#32057;&#29246;&#32676;&#23798;",
        tr: "Mar&#351;al Adalar&#305;"
      },
      {
        en: "Mauritania",
        de: "Mauretanien",
        fr: "Mauritanie",
        it: "Mauritania",
        ptpt: "Maurit�nia",
        ro: "Mauritania",
        es: "Mauritania",
        sv: "Mauretanien",
        pl: "Mauretania",
        ru:
          "&#1052;&#1072;&#1074;&#1088;&#1080;&#1090;&#1072;&#1085;&#1080;&#1103;",
        cs: "Maurit�nie",
        th:
          "&#3617;&#3629;&#3619;&#3636;&#3648;&#3605;&#3648;&#3609;&#3637;&#3618;",
        id: "Mauritania",
        zhhans: "&#27611;&#37324;&#22612;&#23612;&#20126;",
        tr: "Moritanya"
      },
      {
        en: "Mauritius",
        de: "Mauritius",
        fr: "Maurice",
        it: "Mauritius",
        ptpt: "Maur�cio",
        ro: "Mauritius",
        es: "Mauricio",
        sv: "Mauritius",
        pl: "Mauritius",
        ru: "&#1052;&#1072;&#1074;&#1088;&#1080;&#1082;&#1080;&#1081;",
        cs: "Mauritius",
        th: "&#3617;&#3629;&#3619;&#3636;&#3648;&#3594;&#3637;&#3618;&#3626;",
        id: "Mauritius",
        zhhans: "&#27611;&#37324;&#27714;&#26031;",
        tr: "Mauritius"
      },
      {
        en: "Mexico",
        de: "Mexiko",
        fr: "Mexique",
        it: "Messico",
        ptpt: "M�xico",
        ro: "Mexic",
        es: "M�xico",
        sv: "Mexiko",
        pl: "Meksyk",
        ru: "&#1052;&#1077;&#1082;&#1089;&#1080;&#1082;&#1072;",
        cs: "Mexiko",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3648;&#3617;&#3655;&#3585;&#3595;&#3636;&#3650;&#3585;",
        id: "Meksiko",
        zhhans: "&#22696;&#35199;&#21733;",
        tr: "Meksika"
      },
      {
        en: "Micronesia",
        de: "Mikronesien",
        fr: "Micron�sie",
        it: "Micronesia",
        ptpt: "Micron�sia",
        ro: "Micronezia",
        es: "Micronesia",
        sv: "Mikronesien",
        pl: "Mikronezja",
        ru:
          "&#1052;&#1080;&#1082;&#1088;&#1086;&#1085;&#1077;&#1079;&#1080;&#1103;",
        cs: "Mikron�sie",
        th:
          "&#3652;&#3617;&#3650;&#3588;&#3619;&#3609;&#3637;&#3648;&#3595;&#3637;&#3618;",
        id: "Mikronesia",
        zhhans: "&#23494;&#20811;&#32645;&#23612;&#35199;&#20126;",
        tr: "Mikronezya"
      },
      {
        en: "Moldova",
        de: "Moldawien",
        fr: "Moldavie",
        it: "Moldova",
        ptpt: "Moldova",
        ro: "Moldova",
        es: "Moldova",
        sv: "Moldavien",
        pl: "Moldawia",
        ru: "&#1052;&#1086;&#1083;&#1076;&#1086;&#1074;&#1072;",
        cs: "Moldavsko",
        th: "&#3617;&#3629;&#3621;&#3650;&#3604;&#3623;&#3634;",
        id: "Moldova",
        zhhans: "&#25705;&#29246;&#22810;&#29926;",
        tr: "Moldovya"
      },
      {
        en: "Monaco",
        de: "Monaco",
        fr: "Monaco",
        it: "Monaco",
        ptpt: "M�naco",
        ro: "Monaco",
        es: "M�naco",
        sv: "Monaco",
        pl: "Monako",
        ru: "&#1052;&#1086;&#1085;&#1072;&#1082;&#1086;",
        cs: "Monaco",
        th: "&#3650;&#3617;&#3609;&#3634;&#3650;&#3585;",
        id: "Monako",
        zhhans: "&#25705;&#32013;&#21733;",
        tr: "Monako"
      },
      {
        en: "Mongolia",
        de: "Mongolei",
        fr: "Mongolie",
        it: "Mongolia",
        ptpt: "Mong�lia",
        ro: "Mongolia",
        es: "Mongolia",
        sv: "Mongoliet",
        pl: "Mongolia",
        ru: "&#1052;&#1086;&#1085;&#1075;&#1086;&#1083;&#1080;&#1103;",
        cs: "Mongolsko",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3617;&#3629;&#3591;&#3650;&#3585;&#3648;&#3621;&#3637;&#3618;",
        id: "Mongolia",
        zhhans: "&#33945;&#21476;",
        tr: "Mo&gcirc;olistan"
      },
      {
        en: "Montenegro",
        de: "Montenegro",
        fr: "Mont�n�gro",
        it: "Montenegro",
        ptpt: "Montenegro",
        ro: "Muntenegru",
        es: "Montenegro",
        sv: "Montenegro",
        pl: "Czarnog�ra",
        ru:
          "&#1063;&#1077;&#1088;&#1085;&#1086;&#1075;&#1086;&#1088;&#1080;&#1103;",
        cs: "Cern� Hora",
        th: "&#3617;&#3629;&#3609;&#3648;&#3605;&#3648;&#3609;&#3650;&#3585;",
        id: "Montenegro",
        zhhans: "&#40657;&#23665;",
        tr: "Karada&gcirc;"
      },
      {
        en: "Morocco",
        de: "Marokko",
        fr: "Maroc",
        it: "Marocco",
        ptpt: "Marrocos",
        ro: "Maroc",
        es: "Marruecos",
        sv: "Marocko",
        pl: "Maroko",
        ru: "&#1052;&#1072;&#1088;&#1086;&#1082;&#1082;&#1086;",
        cs: "Maroko",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3650;&#3617;&#3619;&#3655;&#3629;&#3585;&#3650;&#3585;",
        id: "Kulit kambing yg halus",
        zhhans: "&#25705;&#27931;&#21733;",
        tr: "Fas"
      },
      {
        en: "Mozambique",
        de: "Mosambik",
        fr: "Mozambique",
        it: "Mozambico",
        ptpt: "Mo&ccedil;ambique",
        ro: "Mozambic",
        es: "Mozambique",
        sv: "Mocambique",
        pl: "Mozambik",
        ru: "&#1052;&#1086;&#1079;&#1072;&#1084;&#1073;&#1080;&#1082;",
        cs: "Mosambik",
        th: "&#3650;&#3617;&#3595;&#3633;&#3617;&#3610;&#3636;&#3585;",
        id: "Mozambik",
        zhhans: "&#33707;&#26705;&#27604;&#20811;",
        tr: "Mozambik"
      },
      {
        en: "Myanmar",
        de: "Myanmar",
        fr: "Myanmar",
        it: "Myanmar",
        ptpt: "Mianmar",
        ro: "Myanmar",
        es: "Myanmar",
        sv: "Myanmar",
        pl: "Myanmar",
        ru: "&#1052;&#1100;&#1103;&#1085;&#1084;&#1072;",
        cs: "Myanmar",
        th: "&#3614;&#3617;&#3656;&#3634;",
        id: "Myanmar",
        zhhans: "&#32236;&#30008;",
        tr: "Myanmar"
      },
      {
        en: "Namibia",
        de: "Namibia",
        fr: "Namibie",
        it: "Namibia",
        ptpt: "Nam�bia",
        ro: "Namibia",
        es: "Namibia",
        sv: "Namibia",
        pl: "Namibia",
        ru: "&#1053;&#1072;&#1084;&#1080;&#1073;&#1080;&#1103;",
        cs: "Namibie",
        th: "&#3609;&#3634;&#3617;&#3636;&#3648;&#3610;&#3637;&#3618;",
        id: "Namibia",
        zhhans: "&#32013;&#31859;&#27604;&#20126;",
        tr: "Namibya"
      },
      {
        en: "Nauru",
        de: "Nauru",
        fr: "Nauru",
        it: "Nauru",
        ptpt: "Nauru",
        ro: "Nauru",
        es: "Nauru",
        sv: "Nauru",
        pl: "Nauru",
        ru: "&#1053;&#1072;&#1091;&#1088;&#1091;",
        cs: "Nauru",
        th: "&#3609;&#3634;&#3629;&#3641;&#3619;&#3641;",
        id: "Nauru",
        zhhans: "&#29785;&#39791;",
        tr: "Nauru"
      },
      {
        en: "Nepal",
        de: "Nepal",
        fr: "N�pal",
        it: "Nepal",
        ptpt: "Nepal",
        ro: "Nepal",
        es: "Nepal",
        sv: "Nepal",
        pl: "Nepal",
        ru: "&#1053;&#1077;&#1087;&#1072;&#1083;",
        cs: "Nep�l",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3648;&#3609;&#3611;&#3634;&#3621;",
        id: "Nepal",
        zhhans: "&#23612;&#27850;&#29246;",
        tr: "Nepal"
      },
      {
        en: "Netherlands",
        de: "Niederlande",
        fr: "Pays-Bas",
        it: "Paesi Bassi",
        ptpt: "Holanda",
        ro: "&#538;&#259;rile de Jos",
        es: "Pa�ses Bajos",
        sv: "Nederl&auml;nderna",
        pl: "Niderlandy",
        ru:
          "&#1053;&#1080;&#1076;&#1077;&#1088;&#1083;&#1072;&#1085;&#1076;&#1099;",
        cs: "Nizozem�",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3648;&#3609;&#3648;&#3608;&#3629;&#3619;&#3660;&#3649;&#3621;&#3609;&#3604;&#3660;",
        id: "Belanda",
        zhhans: "&#33655;&#34349;",
        tr: "Hollanda"
      },
      {
        en: "Netherlands Antilles",
        de: "Niederl&auml;ndische Antillen",
        fr: "Antilles n�erlandaises",
        it: "Antille olandesi",
        ptpt: "Antilhas Holandesas",
        ro: "Antilele Olandeze",
        es: "Antillas Holandesas",
        sv: "Nederl&auml;ndska Antillerna",
        pl: "Antyle Holenderskie",
        ru:
          "&#1053;&#1080;&#1076;&#1077;&#1088;&#1083;&#1072;&#1085;&#1076;&#1089;&#1082;&#1080;&#1077; &#1040;&#1085;&#1090;&#1080;&#1083;&#1100;&#1089;&#1082;&#1080;&#1077; &#1086;&#1089;&#1090;&#1088;&#1086;&#1074;&#1072;",
        cs: "Nizozemsk� Antily",
        th:
          "&#3648;&#3609;&#3648;&#3608;&#3629;&#3619;&#3660;&#3649;&#3621;&#3609;&#3604;&#3660;",
        id: "Antillen Belanda",
        zhhans: "&#33655;&#23660;&#23433;&#30340;&#21015;&#26031;",
        tr: "Hollanda Antilleri"
      },
      {
        en: "New Zealand",
        de: "Neuseeland",
        fr: "Nouvelle-Z�lande",
        it: "Nuova Zelanda",
        ptpt: "Nova Zel�ndia",
        ro: "Noua Zeelanda",
        es: "Nueva Zelandia",
        sv: "Nya Zeeland",
        pl: "Nowa Zelandia",
        ru:
          "&#1053;&#1086;&#1074;&#1072;&#1103; &#1047;&#1077;&#1083;&#1072;&#1085;&#1076;&#1080;&#1103;",
        cs: "nov� Z�land",
        th:
          "&#3609;&#3636;&#3623;&#3595;&#3637;&#3649;&#3621;&#3609;&#3604;&#3660;",
        id: "Selandia Baru",
        zhhans: "&#26032;&#35199;&#34349;",
        tr: "Yeni Zelanda"
      },
      {
        en: "Nicaragua",
        de: "Nicaragua",
        fr: "Nicaragua",
        it: "Nicaragua",
        ptpt: "Nicar�gua",
        ro: "Nicaragua",
        es: "Nicaragua",
        sv: "Nicaragua",
        pl: "Nikaragua",
        ru: "&#1053;&#1080;&#1082;&#1072;&#1088;&#1072;&#1075;&#1091;&#1072;",
        cs: "Nikaragua",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3609;&#3636;&#3585;&#3634;&#3619;&#3634;&#3585;&#3633;&#3623;",
        id: "Nikaragua",
        zhhans: "&#23612;&#21152;&#25289;&#29916;",
        tr: "Nikaragua"
      },
      {
        en: "Niger",
        de: "Niger",
        fr: "Niger",
        it: "Niger",
        ptpt: "N�ger",
        ro: "Niger",
        es: "N�ger",
        sv: "Niger",
        pl: "Niger",
        ru: "&#1053;&#1080;&#1075;&#1077;&#1088;",
        cs: "Niger",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3652;&#3609;&#3648;&#3608;&#3629;&#3619;&#3660;",
        id: "Niger",
        zhhans: "&#23612;&#26085;&#29246;",
        tr: "Nijer"
      },
      {
        en: "Nigeria",
        de: "Nigeria",
        fr: "Nigeria",
        it: "Nigeria",
        ptpt: "Nig�ria",
        ro: "Nigeria",
        es: "Nigeria",
        sv: "Nigeria",
        pl: "Nigeria",
        ru: "&#1053;&#1080;&#1075;&#1077;&#1088;&#1080;&#1103;",
        cs: "Nig�rie",
        th: "&#3652;&#3609;&#3592;&#3637;&#3648;&#3619;&#3637;&#3618;",
        id: "Nigeria",
        zhhans: "&#23612;&#26085;&#21033;&#20126;",
        tr: "Nijerya"
      },
      {
        en: "North Korea",
        de: "Nordkorea",
        fr: "Cor�e du Nord",
        it: "Corea del Nord",
        ptpt: "Cor�ia do Norte",
        ro: "Coreea de Nord",
        es: "Corea del Norte",
        sv: "Nordkorea",
        pl: "Korea P�lnocna",
        ru:
          "&#1057;&#1077;&#1074;&#1077;&#1088;&#1085;&#1072;&#1103; &#1050;&#1086;&#1088;&#1077;&#1103;",
        cs: "Severn� Korea",
        th:
          "&#3648;&#3585;&#3634;&#3627;&#3621;&#3637;&#3648;&#3627;&#3609;&#3639;&#3629;",
        id: "Korea Utara",
        zhhans: "&#21271;&#26397;&#39854;",
        tr: "Kuzey Kore"
      },
      {
        en: "Norway",
        de: "Norwegen",
        fr: "Norv�ge",
        it: "Norvegia",
        ptpt: "Noruega",
        ro: "Norvegia",
        es: "Noruega",
        sv: "Norge",
        pl: "Norwegia",
        ru: "&#1053;&#1086;&#1088;&#1074;&#1077;&#1075;&#1080;&#1103;",
        cs: "Norsko",
        th: "&#3609;&#3629;&#3619;&#3660;&#3648;&#3623;&#3618;&#3660;",
        id: "Norwegia",
        zhhans: "&#25386;&#23041;",
        tr: "Norve&ccedil;"
      },
      {
        en: "Oman",
        de: "Oman",
        fr: "Oman",
        it: "Oman",
        ptpt: "Oman",
        ro: "Oman",
        es: "Om�n",
        sv: "Oman",
        pl: "Oman",
        ru: "&#1054;&#1084;&#1072;&#1085;",
        cs: "Om�n",
        th: "&#3650;&#3629;&#3617;&#3634;&#3609;",
        id: "Oman",
        zhhans: "&#38463;&#26364;",
        tr: "Umman"
      },
      {
        en: "Pakistan",
        de: "Pakistan",
        fr: "Pakistan",
        it: "Pakistan",
        ptpt: "Paquist�o",
        ro: "Pakistan",
        es: "Pakist�n",
        sv: "Pakistan",
        pl: "Pakistan",
        ru: "&#1055;&#1072;&#1082;&#1080;&#1089;&#1090;&#1072;&#1085;",
        cs: "P�kist�n",
        th: "&#3611;&#3634;&#3585;&#3637;&#3626;&#3606;&#3634;&#3609;",
        id: "Pakistan",
        zhhans: "&#24052;&#22522;&#26031;&#22374;",
        tr: "Pakistan"
      },
      {
        en: "Palau",
        de: "Palau",
        fr: "Palau",
        it: "Palau",
        ptpt: "Palau",
        ro: "Palau",
        es: "Palau",
        sv: "Palau",
        pl: "Palau",
        ru: "&#1055;&#1072;&#1083;&#1072;&#1091;",
        cs: "Palau",
        th: "&#3611;&#3634;&#3648;&#3621;&#3634;",
        id: "Palau",
        zhhans: "&#24085;&#21214;",
        tr: "Palau"
      },
      {
        en: "Palestinian Territories",
        de: "Pal&auml;stinensischen Gebiete",
        fr: "Territoires palestiniens",
        it: "Territori palestinesi",
        ptpt: "Territ�rios Palestinos",
        ro: "Teritoriile palestiniene",
        es: "Territorios Palestinos",
        sv: "Palestinska omr�dena",
        pl: "Terytoria Palestynskie",
        ru:
          "&#1087;&#1072;&#1083;&#1077;&#1089;&#1090;&#1080;&#1085;&#1089;&#1082;&#1080;&#1077; &#1090;&#1077;&#1088;&#1088;&#1080;&#1090;&#1086;&#1088;&#1080;&#1080;",
        cs: "palestinsk� �zem�",
        th:
          "&#3604;&#3636;&#3609;&#3649;&#3604;&#3609;&#3611;&#3634;&#3648;&#3621;&#3626;&#3652;&#3605;&#3609;&#3660;",
        id: "Wilayah Palestina",
        zhhans: "&#24052;&#21202;&#26031;&#22374;&#38936;&#22303;",
        tr: "Filistin B&ouml;lgesi"
      },
      {
        en: "Panama",
        de: "Panama",
        fr: "Panama",
        it: "Panama",
        ptpt: "Panam�",
        ro: "Panama",
        es: "Panam�",
        sv: "Panama",
        pl: "Panama",
        ru: "&#1055;&#1072;&#1085;&#1072;&#1084;&#1072;",
        cs: "Panama",
        th: "&#3611;&#3634;&#3609;&#3634;&#3617;&#3634;",
        id: "Panama",
        zhhans: "&#24052;&#25343;&#39340;",
        tr: "Panama"
      },
      {
        en: "Papua New Guinea",
        de: "Papua-Neuguinea",
        fr: "Papouasie-Nouvelle- Guin�e",
        it: "Papua Nuova Guinea",
        ptpt: "Papua Nova Guin�",
        ro: "Papua Noua Guinee",
        es: "Papua Nueva Guinea",
        sv: "Papua Nya Guinea",
        pl: "Papua-Nowa Gwinea",
        ru:
          "&#1055;&#1072;&#1087;&#1091;&#1072;-&#1053;&#1086;&#1074;&#1072;&#1103; &#1043;&#1074;&#1080;&#1085;&#1077;&#1103;",
        cs: "Papua-Nov� Guinea",
        th:
          "&#3611;&#3634;&#3611;&#3633;&#3623;&#3609;&#3636;&#3623;&#3585;&#3636;&#3609;&#3637;",
        id: "Papua Nugini",
        zhhans: "&#24052;&#24067;&#20126;&#26032;&#24190;&#20839;&#20126;",
        tr: "Papua Yeni Gine"
      },
      {
        en: "Paraguay",
        de: "Paraguay",
        fr: "Paraguay",
        it: "Paraguay",
        ptpt: "Paraguai",
        ro: "Paraguay",
        es: "Paraguay",
        sv: "Paraguay",
        pl: "Paragwaj",
        ru: "&#1055;&#1072;&#1088;&#1072;&#1075;&#1074;&#1072;&#1081;",
        cs: "Paraguay",
        th: "&#3611;&#3634;&#3619;&#3634;&#3585;&#3623;&#3633;&#3618;",
        id: "Paraguai",
        zhhans: "&#24052;&#25289;&#22317;",
        tr: "Paraguay"
      },
      {
        en: "Peru",
        de: "Peru",
        fr: "P�rou",
        it: "Per�",
        ptpt: "Peru",
        ro: "Peru",
        es: "Per�",
        sv: "Peru",
        pl: "Peru",
        ru: "&#1055;&#1077;&#1088;&#1091;",
        cs: "Peru",
        th: "&#3648;&#3611;&#3619;&#3641;",
        id: "Peru",
        zhhans: "&#31192;&#39791;",
        tr: "Peru"
      },
      {
        en: "Philippines",
        de: "Philippinen",
        fr: "Philippines",
        it: "Filippine",
        ptpt: "Filipinas",
        ro: "Filipine",
        es: "Filipinas",
        sv: "Filippinerna",
        pl: "Filipiny",
        ru: "&#1060;&#1080;&#1083;&#1080;&#1087;&#1087;&#1080;&#1085;&#1099;",
        cs: "Filip�ny",
        th:
          "&#3615;&#3636;&#3621;&#3636;&#3611;&#3611;&#3636;&#3609;&#3626;&#3660;",
        id: "Pilipina",
        zhhans: "&#33778;&#24459;&#36051;",
        tr: "Filipinler"
      },
      {
        en: "Poland",
        de: "Polen",
        fr: "Pologne",
        it: "Polonia",
        ptpt: "Pol�nia",
        ro: "Polonia",
        es: "Polonia",
        sv: "Polen",
        pl: "Polska",
        ru: "&#1055;&#1086;&#1083;&#1100;&#1096;&#1072;",
        cs: "Polsko",
        th: "&#3650;&#3611;&#3649;&#3621;&#3609;&#3604;&#3660;",
        id: "Polandia",
        zhhans: "&#27874;&#34349;",
        tr: "Polonya"
      },
      {
        en: "Portugal",
        de: "Portugal",
        fr: "Portugal",
        it: "Portogallo",
        ptpt: "Portugal",
        ro: "Portugalia",
        es: "Portugal",
        sv: "Portugal",
        pl: "Portugalia",
        ru:
          "&#1055;&#1086;&#1088;&#1090;&#1091;&#1075;&#1072;&#1083;&#1080;&#1103;",
        cs: "Portugalsko",
        th: "&#3650;&#3611;&#3619;&#3605;&#3640;&#3648;&#3585;&#3626;",
        id: "Portugal",
        zhhans: "&#33889;&#33796;&#29273;",
        tr: "Portekiz"
      },
      {
        en: "Puerto Rico",
        de: "Puerto Rico",
        fr: "Puerto Rico",
        it: "Puerto Rico",
        ptpt: "Porto Rico",
        ro: "Puerto Rico",
        es: "Puerto Rico",
        sv: "Puerto Rico",
        pl: "Portoryko",
        ru:
          "&#1055;&#1091;&#1101;&#1088;&#1090;&#1086;-&#1056;&#1080;&#1082;&#1086;",
        cs: "Portoriko",
        th:
          "&#3648;&#3611;&#3629;&#3619;&#3660;&#3650;&#3605;&#3619;&#3636;&#3650;&#3585;",
        id: "Puerto Rico",
        zhhans: "&#27874;&#22810;&#40654;&#21508;",
        tr: "Porto Riko"
      },
      {
        en: "Qatar",
        de: "Katar",
        fr: "Qatar",
        it: "Qatar",
        ptpt: "Catar",
        ro: "Qatar",
        es: "Katar",
        sv: "Qatar",
        pl: "Katar",
        ru: "&#1050;&#1072;&#1090;&#1072;&#1088;",
        cs: "Katar",
        th: "&#3585;&#3634;&#3605;&#3634;&#3619;&#3660;",
        id: "Qatar",
        zhhans: "&#21345;&#22612;&#29246;",
        tr: "Katar"
      },
      {
        en: "Romania",
        de: "Rum&auml;nien",
        fr: "Roumanie",
        it: "Romania",
        ptpt: "Rom�nia",
        ro: "Rom�nia",
        es: "Rumania",
        sv: "Rum&auml;nien",
        pl: "Rumunia",
        ru: "&#1056;&#1091;&#1084;&#1099;&#1085;&#1080;&#1103;",
        cs: "Rumunsko",
        th: "&#3650;&#3619;&#3617;&#3634;&#3648;&#3609;&#3637;&#3618;",
        id: "Rumania",
        zhhans: "&#32645;&#39340;&#23612;&#20126;",
        tr: "Romanya"
      },
      {
        en: "Russia",
        de: "Russland",
        fr: "Russie",
        it: "Russia",
        ptpt: "R�ssia",
        ro: "Rusia",
        es: "Rusia",
        sv: "Ryssland",
        pl: "Rosja",
        ru: "&#1056;&#1086;&#1089;&#1089;&#1080;&#1103;",
        cs: "Rusko",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3619;&#3633;&#3626;&#3648;&#3595;&#3637;&#3618;",
        id: "Rusia",
        zhhans: "&#20420;&#22283;",
        tr: "Rusya"
      },
      {
        en: "Rwanda",
        de: "Ruanda",
        fr: "Rwanda",
        it: "Ruanda",
        ptpt: "Ruanda",
        ro: "Rwanda",
        es: "Ruanda",
        sv: "Rwanda",
        pl: "Rwanda",
        ru: "&#1056;&#1091;&#1072;&#1085;&#1076;&#1072;",
        cs: "Rwanda",
        th: "&#3619;&#3623;&#3633;&#3609;&#3604;&#3634;",
        id: "Rwanda",
        zhhans: "&#30439;&#26106;&#36948;",
        tr: "Ruanda"
      },
      {
        en: "Saint Kitts and Nevis",
        de: "St. Kitts und Nevis",
        fr: "Saint-Kitts-et-Nevis",
        it: "Saint Kitts e Nevis",
        ptpt: "S�o Crist�v�o e Nevis",
        ro: "Sf�ntul Kitts &#537;i Nevis",
        es: "Saint Kitts y Nevis",
        sv: "Saint Kitts och Nevis",
        pl: "Saint Kitts i Nevis",
        ru:
          "&#1057;&#1077;&#1085;&#1090;-&#1050;&#1080;&#1090;&#1089; &#1080; &#1053;&#1077;&#1074;&#1080;&#1089;",
        cs: "Svat� Kry�tof a Nevis",
        th:
          "&#3648;&#3595;&#3609;&#3605;&#3660;&#3588;&#3636;&#3605;&#3626;&#3660;&#3649;&#3621;&#3632;&#3648;&#3609;&#3623;&#3636;&#3626;",
        id: "Saint Kitts dan Nevis",
        zhhans: "&#32854;&#22522;&#33576;&#21644;&#23612;&#32173;&#26031;",
        tr: "Saint Kitts ve Nevis"
      },
      {
        en: "Saint Lucia",
        de: "St. Lucia",
        fr: "Sainte-Lucie",
        it: "Santa Lucia",
        ptpt: "Santa L�cia",
        ro: "Sf�nta Lucia",
        es: "Santa Luc�a",
        sv: "Saint Lucia",
        pl: "Saint Lucia",
        ru: "&#1057;&#1077;&#1085;&#1090;-&#1051;&#1102;&#1089;&#1080;&#1103;",
        cs: "Svat� Lucie",
        th:
          "&#3648;&#3595;&#3609;&#3605;&#3660;&#3621;&#3641;&#3648;&#3595;&#3637;&#3618;",
        id: "Saint Lucia",
        zhhans: "&#32854;&#30439;&#35199;&#20126;",
        tr: "Saint Lucia"
      },
      {
        en: "Saint Vincent and the Grenadines",
        de: "St. Vincent und die Grenadinen",
        fr: "Saint-Vincent-et -les-Grenadines",
        it: "Saint Vincent e Grenadine",
        ptpt: "S�o Vicente e Granadinas",
        ro: "Sf�ntul Vincent &#537;i Grenadine",
        es: "San Vicente y las Granadinas",
        sv: "Saint Vincent och Grenadinerna",
        pl: "Saint Vincent i Grenadyny",
        ru:
          "&#1057;&#1077;&#1085;&#1090;-&#1042;&#1080;&#1085;&#1089;&#1077;&#1085;&#1090; &#1080; &#1043;&#1088;&#1077;&#1085;&#1072;&#1076;&#1080;&#1085;&#1099;",
        cs: "Svat� Vincenc a Grenadiny",
        th:
          "&#3648;&#3595;&#3609;&#3605;&#3660;&#3623;&#3636;&#3609;&#3648;&#3595;&#3609;&#3605;&#3660;&#3649;&#3621;&#3632;&#3648;&#3585;&#3619;&#3609;&#3634;&#3604;&#3637;&#3609;",
        id: "Saint Vincent dan Grenadines",
        zhhans:
          "&#32854;&#25991;&#26862;&#29305;&#21644;&#26684;&#26519;&#32013;&#19969;&#26031;",
        tr: "Saint Vincent ve Grenadinler"
      },
      {
        en: "Samoa",
        de: "Samoa",
        fr: "Samoa",
        it: "Samoa",
        ptpt: "Samoa",
        ro: "Samoa",
        es: "Samoa",
        sv: "Samoa",
        pl: "Samoa",
        ru: "&#1057;&#1072;&#1084;&#1086;&#1072;",
        cs: "Samoa",
        th: "&#3595;&#3634;&#3617;&#3633;&#3623;",
        id: "Samoa",
        zhhans: "&#34217;&#25705;&#20126;",
        tr: "Samoa"
      },
      {
        en: "San Marino",
        de: "San Marino",
        fr: "San Marino",
        it: "San Marino",
        ptpt: "San Marino",
        ro: "San Marino",
        es: "San Marino",
        sv: "San Marino",
        pl: "San Marino",
        ru: "&#1057;&#1072;&#1085;-&#1052;&#1072;&#1088;&#1080;&#1085;&#1086;",
        cs: "San Marino",
        th: "&#3595;&#3634;&#3609;&#3617;&#3634;&#3619;&#3636;&#3650;&#3609;",
        id: "San Marino",
        zhhans: "&#32854;&#39340;&#21147;&#35582;",
        tr: "San Marino"
      },
      {
        en: "Sao Tome and Principe",
        de: "Sao Tome und Principe",
        fr: "Sao Tom� et Principe",
        it: "Sao Tome e Principe",
        ptpt: "S�o Tom� e Pr�ncipe",
        ro: "Sao Tome &#537;i Principe",
        es: "Santo Tom� y Pr�ncipe",
        sv: "Sao Tom� och Principe",
        pl: "Wyspy Swietego Tomasza i Ksiazeca",
        ru:
          "&#1057;&#1072;&#1085;-&#1058;&#1086;&#1084;&#1077; &#1080; &#1055;&#1088;&#1080;&#1085;&#1089;&#1080;&#1087;&#1080;",
        cs: "Sao Tome a Principe",
        th: "Sao Tome Principe &#3649;&#3621;&#3632;",
        id: "Sao Tome dan Principe",
        zhhans:
          "&#32854;&#22810;&#32654;&#21644;&#26222;&#26519;&#35199;&#27604;",
        tr: "Sao Tome ve Principe"
      },
      {
        en: "Saudi Arabia",
        de: "Saudi-Arabien",
        fr: "Arabie Saoudite",
        it: "Arabia Saudita",
        ptpt: "Ar�bia Saudita",
        ro: "Arabia Saudit&#259;",
        es: "Arabia Saudita",
        sv: "Saudi-Arabien",
        pl: "Arabia Saudyjska",
        ru:
          "&#1057;&#1072;&#1091;&#1076;&#1086;&#1074;&#1089;&#1082;&#1072;&#1103; &#1040;&#1088;&#1072;&#1074;&#1080;&#1103;",
        cs: "Sa�dsk� Ar�bie",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3595;&#3634;&#3629;&#3640;&#3604;&#3637;&#3629;&#3634;&#3619;&#3632;&#3648;&#3610;&#3637;&#3618;",
        id: "Saudi Arabia",
        zhhans: "&#27801;&#29305;&#38463;&#25289;&#20271;",
        tr: "Suudi Arabistan"
      },
      {
        en: "Senegal",
        de: "Senegal",
        fr: "S�n�gal",
        it: "Senegal",
        ptpt: "Senegal",
        ro: "Senegal",
        es: "Senegal",
        sv: "Senegal",
        pl: "Senegal",
        ru: "&#1057;&#1077;&#1085;&#1077;&#1075;&#1072;&#1083;",
        cs: "Senegal",
        th: "&#3648;&#3595;&#3648;&#3609;&#3585;&#3633;&#3621;",
        id: "Senegal",
        zhhans: "&#22622;&#20839;&#21152;&#29246;",
        tr: "Senegal"
      },
      {
        en: "Serbia",
        de: "Serbien",
        fr: "Serbie",
        it: "Serbia",
        ptpt: "S�rvia",
        ro: "Serbia",
        es: "Serbia",
        sv: "Serbien",
        pl: "Serbia",
        ru: "&#1057;&#1077;&#1088;&#1073;&#1080;&#1103;",
        cs: "Srbsko",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3648;&#3595;&#3629;&#3619;&#3660;&#3648;&#3610;&#3637;&#3618;",
        id: "Serbia",
        zhhans: "&#22622;&#29246;&#32173;&#20126;",
        tr: "S&#305;rbistan"
      },
      {
        en: "Seychelles",
        de: "Seychellen",
        fr: "Seychelles",
        it: "Seychelles",
        ptpt: "Seychelles",
        ro: "Seychelles",
        es: "Seychelles",
        sv: "Seychellerna",
        pl: "Seszele",
        ru:
          "&#1057;&#1077;&#1081;&#1096;&#1077;&#1083;&#1100;&#1089;&#1082;&#1080;&#1077; &#1086;&#1089;&#1090;&#1088;&#1086;&#1074;&#1072;",
        cs: "Seychely",
        th: "&#3648;&#3595;&#3648;&#3594;&#3621;&#3626;&#3660;",
        id: "Seychelles",
        zhhans: "&#22622;&#33292;&#29246;",
        tr: "Sey&#351;el"
      },
      {
        en: "Sierra Leone",
        de: "Sierra Leone",
        fr: "Sierra Leone",
        it: "Sierra Leone",
        ptpt: "Serra Leoa",
        ro: "Sierra Leone",
        es: "Sierra Leona",
        sv: "Sierra Leone",
        pl: "Sierra Leone",
        ru:
          "&#1057;&#1100;&#1077;&#1088;&#1088;&#1072;-&#1051;&#1077;&#1086;&#1085;&#1077;",
        cs: "Sierra Leone",
        th:
          "&#3648;&#3595;&#3637;&#3618;&#3619;&#3660;&#3619;&#3634;&#3621;&#3637;&#3650;&#3629;&#3609;",
        id: "Sierra Leone",
        zhhans: "&#22622;&#25289;&#21033;&#26114;",
        tr: "Sierra Leone"
      },
      {
        en: "Singapore",
        de: "Singapur",
        fr: "Singapour",
        it: "Singapore",
        ptpt: "Cingapura",
        ro: "Singapur",
        es: "Singapur",
        sv: "Singapore",
        pl: "Singapur",
        ru: "&#1057;&#1080;&#1085;&#1075;&#1072;&#1087;&#1091;&#1088;",
        cs: "Singapur",
        th: "&#3626;&#3636;&#3591;&#3588;&#3650;&#3611;&#3619;&#3660;",
        id: "Singapura",
        zhhans: "&#26032;&#21152;&#22369;",
        tr: "Singapur"
      },
      {
        en: "Sint Maarten",
        de: "Sint Maarten",
        fr: "Sint Maarten",
        it: "Sint Maarten",
        ptpt: "Sint Maarten",
        ro: "Sint Maarten",
        es: "Sint Maarten",
        sv: "Sint Maarten",
        pl: "Sint Maarten",
        ru:
          "&#1057;&#1080;&#1085;&#1090;-&#1052;&#1072;&#1072;&#1088;&#1090;&#1077;&#1085;",
        cs: "Sint Maarten",
        th:
          "&#3648;&#3595;&#3609;&#3605;&#3660;&#3617;&#3634;&#3619;&#3660;&#3648;&#3607;&#3656;&#3609;",
        id: "Sint Maarten",
        zhhans: "&#32854;&#39340;&#19969;",
        tr: "Saint Martin"
      },
      {
        en: "Slovakia",
        de: "Slowakei",
        fr: "Slovaquie",
        it: "Slovacchia",
        ptpt: "Eslov�quia",
        ro: "Slovacia",
        es: "Eslovaquia",
        sv: "Slovakien",
        pl: "Slowacja",
        ru: "&#1057;&#1083;&#1086;&#1074;&#1072;&#1082;&#1080;&#1103;",
        cs: "Slovensko",
        th: "&#3626;&#3650;&#3621;&#3623;&#3634;&#3648;&#3585;&#3637;&#3618;",
        id: "Slovakia",
        zhhans: "&#26031;&#27931;&#20240;&#20811;",
        tr: "Slovakya"
      },
      {
        en: "Slovenia",
        de: "Slowenien",
        fr: "Slov�nie",
        it: "Slovenia",
        ptpt: "Eslovenia",
        ro: "Slovenia",
        es: "Eslovenia",
        sv: "Slovenien",
        pl: "Slowenia",
        ru: "&#1057;&#1083;&#1086;&#1074;&#1077;&#1085;&#1080;&#1103;",
        cs: "Slovinsko",
        th: "&#3626;&#3650;&#3621;&#3623;&#3637;&#3648;&#3609;&#3637;&#3618;",
        id: "Slovenia",
        zhhans: "&#26031;&#27931;&#25991;&#23612;&#20126;",
        tr: "Slovenya"
      },
      {
        en: "Solomon Islands",
        de: "Salomon-Inseln",
        fr: "�les Salomon",
        it: "Isole Salomone",
        ptpt: "Ilhas Salom�o",
        ro: "Insulele Solomon",
        es: "Islas Salom�n",
        sv: "Salomon&ouml;arna",
        pl: "Wyspy Salomona",
        ru:
          "&#1057;&#1086;&#1083;&#1086;&#1084;&#1086;&#1085;&#1086;&#1074;&#1099; &#1054;&#1089;&#1090;&#1088;&#1086;&#1074;&#1072;",
        cs: "�alamounovy ostrovy",
        th:
          "&#3627;&#3617;&#3641;&#3656;&#3648;&#3585;&#3634;&#3632;&#3650;&#3595;&#3650;&#3621;&#3617;&#3629;&#3609;",
        id: "Kepulauan Solomon",
        zhhans: "&#25152;&#32645;&#38272;&#32676;&#23798;",
        tr: "Solomon Adalar&#305;"
      },
      {
        en: "Somalia",
        de: "Somalia",
        fr: "Somalie",
        it: "Somalia",
        ptpt: "Som�lia",
        ro: "Somalia",
        es: "Somalia",
        sv: "Somalia",
        pl: "Somalia",
        ru: "&#1057;&#1086;&#1084;&#1072;&#1083;&#1080;",
        cs: "Som�lsko",
        th: "&#3650;&#3595;&#3617;&#3634;&#3648;&#3621;&#3637;&#3618;",
        id: "Somalia",
        zhhans: "&#32034;&#39340;&#37324;",
        tr: "Somali"
      },
      {
        en: "South Africa",
        de: "S&uuml;dafrika",
        fr: "Afrique du Sud",
        it: "Sudafrica",
        ptpt: "�frica do Sul",
        ro: "Africa de Sud",
        es: "Sud�frica",
        sv: "Sydafrika",
        pl: "Republika Poludniowej Afryki",
        ru: "&#1070;&#1040;&#1056;",
        cs: "Ji�n� Afrika",
        th:
          "&#3649;&#3629;&#3615;&#3619;&#3636;&#3585;&#3634;&#3651;&#3605;&#3657;",
        id: "Afrika Selatan",
        zhhans: "&#21335;&#38750;",
        tr: "G&uuml;ney Afrika"
      },
      {
        en: "South Korea",
        de: "S&uuml;dkorea",
        fr: "Cor�e du Sud",
        it: "Corea del Sud",
        ptpt: "Cor�ia do Sul",
        ro: "Coreea de Sud",
        es: "Corea del Sur",
        sv: "Sydkorea",
        pl: "Korea Poludniowa",
        ru:
          "&#1070;&#1078;&#1085;&#1072;&#1103; &#1050;&#1086;&#1088;&#1077;&#1103;",
        cs: "Ji�n� Korea",
        th: "&#3648;&#3585;&#3634;&#3627;&#3621;&#3637;&#3651;&#3605;&#3657;",
        id: "Korea Selatan",
        zhhans: "&#38867;&#22283;",
        tr: "G&uuml;ney Kore"
      },
      {
        en: "South Sudan",
        de: "S&uuml;dsudan",
        fr: "Sud-Soudan",
        it: "Sud Sudan",
        ptpt: "Sud�o do Sul",
        ro: "Sudanul de Sud",
        es: "Sud�n del Sur",
        sv: "Sydsudan",
        pl: "Sudan Poludniowy",
        ru:
          "&#1070;&#1078;&#1085;&#1099;&#1081; &#1057;&#1091;&#1076;&#1072;&#1085;",
        cs: "Ji�n� S�d�n",
        th: "&#3595;&#3641;&#3604;&#3634;&#3609;&#3651;&#3605;&#3657;",
        id: "Sudan Selatan",
        zhhans: "&#21335;&#34311;&#20025;",
        tr: "G&uuml;ney Sudan"
      },
      {
        en: "Spain",
        de: "Spanien",
        fr: "Espagne",
        it: "Spagna",
        ptpt: "Espanha",
        ro: "Spania",
        es: "Espa�a",
        sv: "Spanien",
        pl: "Hiszpania",
        ru: "&#1048;&#1089;&#1087;&#1072;&#1085;&#1080;&#1103;",
        cs: "�panelsko",
        th: "&#3626;&#3648;&#3611;&#3609;",
        id: "Spanyol",
        zhhans: "&#35199;&#29677;&#29273;",
        tr: "&#304;spanya"
      },
      {
        en: "Sri Lanka",
        de: "Sri Lanka",
        fr: "Sri Lanka",
        it: "Sri Lanka",
        ptpt: "Sri Lanka",
        ro: "Sri Lanka",
        es: "Sri Lanka",
        sv: "Sri Lanka",
        pl: "Sri Lanka",
        ru: "&#1064;&#1088;&#1080; &#1051;&#1072;&#1085;&#1082;&#1072;",
        cs: "Sr� Lanka",
        th: "&#3624;&#3619;&#3637;&#3621;&#3633;&#3591;&#3585;&#3634;",
        id: "Sri Lanka",
        zhhans: "&#26031;&#37324;&#34349;&#21345;",
        tr: "Sri Lanka"
      },
      {
        en: "Sudan",
        de: "Sudan",
        fr: "Soudan",
        it: "Sudan",
        ptpt: "Sud�o",
        ro: "Sudan",
        es: "Sud�n",
        sv: "Sudan",
        pl: "Sudan",
        ru: "&#1057;&#1091;&#1076;&#1072;&#1085;",
        cs: "S�d�n",
        th: "&#3595;&#3641;&#3604;&#3634;&#3609;",
        id: "Sudan",
        zhhans: "&#34311;&#20025;",
        tr: "Sudan"
      },
      {
        en: "Suriname",
        de: "Suriname",
        fr: "Suriname",
        it: "Suriname",
        ptpt: "Suriname",
        ro: "Surinam",
        es: "Suriname",
        sv: "Surinam",
        pl: "Surinam",
        ru: "&#1057;&#1091;&#1088;&#1080;&#1085;&#1072;&#1084;",
        cs: "Surinam",
        th: "&#3595;&#3641;&#3619;&#3636;&#3609;&#3634;&#3648;&#3617;",
        id: "Suriname",
        zhhans: "&#34311;&#37324;&#21335;",
        tr: "Surinam"
      },
      {
        en: "Swaziland",
        de: "Swasiland",
        fr: "Swaziland",
        it: "Swaziland",
        ptpt: "Suazil�ndia",
        ro: "Swaziland",
        es: "Swazilandia",
        sv: "Swaziland",
        pl: "Suazi",
        ru: "&#1057;&#1074;&#1072;&#1079;&#1080;&#1083;&#1077;&#1085;&#1076;",
        cs: "Svazijsko",
        th:
          "&#3626;&#3623;&#3634;&#3595;&#3636;&#3649;&#3621;&#3609;&#3604;&#3660;",
        id: "Swaziland",
        zhhans: "&#26031;&#23041;&#22763;&#34349;",
        tr: "Svaziland"
      },
      {
        en: "Sweden",
        de: "Schweden",
        fr: "Su�de",
        it: "Svezia",
        ptpt: "Su�cia",
        ro: "Suedia",
        es: "Suecia",
        sv: "Sverige",
        pl: "Szwecja",
        ru: "&#1064;&#1074;&#1077;&#1094;&#1080;&#1103;",
        cs: "�v�dsko",
        th: "&#3626;&#3623;&#3637;&#3648;&#3604;&#3609;",
        id: "Swedia",
        zhhans: "&#29790;&#20856;",
        tr: "&#304;sve&ccedil;"
      },
      {
        en: "Switzerland",
        de: "Schweiz",
        fr: "Suisse",
        it: "Svizzera",
        ptpt: "Su�&ccedil;a",
        ro: "Elve&#539;ia",
        es: "Suiza",
        sv: "Schweiz",
        pl: "Szwajcaria",
        ru: "&#1064;&#1074;&#1077;&#1081;&#1094;&#1072;&#1088;&#1080;&#1103;",
        cs: "�v�carsko",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3626;&#3623;&#3636;&#3626;&#3648;&#3595;&#3629;&#3619;&#3660;&#3649;&#3621;&#3609;&#3604;&#3660;",
        id: "Swiss",
        zhhans: "&#29790;&#22763;",
        tr: "&#304;svi&ccedil;re"
      },
      {
        en: "Syria",
        de: "Syrien",
        fr: "Syrie",
        it: "Siria",
        ptpt: "S�ria",
        ro: "Siria",
        es: "Siria",
        sv: "Syrien",
        pl: "Syria",
        ru: "&#1057;&#1080;&#1088;&#1080;&#1103;",
        cs: "S�rie",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3595;&#3637;&#3648;&#3619;&#3637;&#3618;",
        id: "Suriah",
        zhhans: "&#25944;&#21033;&#20126;",
        tr: "Suriye"
      },
      {
        en: "Taiwan",
        de: "Taiwan",
        fr: "Taiwan",
        it: "Taiwan",
        ptpt: "Taiwan",
        ro: "Taiwan",
        es: "Taiwan",
        sv: "Taiwan",
        pl: "Tajwan",
        ru: "&#1058;&#1072;&#1081;&#1074;&#1072;&#1085;&#1100;",
        cs: "Tchaj-wan",
        th: "&#3652;&#3605;&#3657;&#3627;&#3623;&#3633;&#3609;",
        id: "Taiwan",
        zhhans: "&#21488;&#28771;",
        tr: "Tayvan"
      },
      {
        en: "Tajikistan",
        de: "Tadschikistan",
        fr: "Tadjikistan",
        it: "Tagikistan",
        ptpt: "Tadjiquist�o",
        ro: "Tadjikistan",
        es: "Tayikist�n",
        sv: "Tadzjikistan",
        pl: "Tadzykistan",
        ru:
          "&#1058;&#1072;&#1076;&#1078;&#1080;&#1082;&#1080;&#1089;&#1090;&#1072;&#1085;",
        cs: "T�d�ikist�n",
        th:
          "&#3607;&#3634;&#3592;&#3636;&#3585;&#3636;&#3626;&#3606;&#3634;&#3609;",
        id: "Tajikistan",
        zhhans: "&#22612;&#21513;&#20811;&#26031;&#22374;",
        tr: "Tacikistan"
      },
      {
        en: "Tanzania",
        de: "Tansania",
        fr: "Tanzanie",
        it: "Tanzania",
        ptpt: "Tanz�nia",
        ro: "Tanzania",
        es: "Tanzania",
        sv: "Tanzania",
        pl: "Tanzania",
        ru: "&#1058;&#1072;&#1085;&#1079;&#1072;&#1085;&#1080;&#1103;",
        cs: "Tanzanie",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3649;&#3607;&#3609;&#3595;&#3634;&#3648;&#3609;&#3637;&#3618;",
        id: "Tanzania",
        zhhans: "&#22374;&#26705;&#23612;&#20126;",
        tr: "Tanzanya"
      },
      {
        en: "Thailand",
        de: "Thailand",
        fr: "Tha�lande",
        it: "Thailandia",
        ptpt: "Tail�ndia",
        ro: "Tailanda",
        es: "Tailandia",
        sv: "Thailand",
        pl: "Tajlandia",
        ru: "&#1058;&#1072;&#1080;&#1083;&#1072;&#1085;&#1076;",
        cs: "Thajsko",
        th: "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3652;&#3607;&#3618;",
        id: "Thailand",
        zhhans: "&#27888;&#22283;",
        tr: "Tayland"
      },
      {
        en: "Timor-Leste",
        de: "Timor- Leste",
        fr: "Timor-Leste",
        it: "Timor Est",
        ptpt: "Timor-Leste",
        ro: "Timorul de Est",
        es: "Timor-Leste",
        sv: "& Ouml;sttimor",
        pl: "Timor Wschodni",
        ru:
          "&#1058;&#1080;&#1084;&#1086;&#1088;-&#1051;&#1077;&#1096;&#1090;&#1080;",
        cs: "V�chodn� Timor",
        th:
          "&#3605;&#3636;&#3617;&#3629;&#3619;&#3660;&#3648;&#3621;&#3626;&#3648;&#3605;",
        id: "Timor-Leste",
        zhhans: "&#26481;&#24093;&#27766;",
        tr: "Do&gcirc;u Timor"
      },
      {
        en: "Togo",
        de: "Togo",
        fr: "Togo",
        it: "Togo",
        ptpt: "Togo",
        ro: "Togo",
        es: "Togo",
        sv: "Togo",
        pl: "Togo",
        ru: "&#1058;&#1086;&#1075;&#1086;",
        cs: "Togo",
        th: "&#3650;&#3605;&#3650;&#3585;",
        id: "Togo",
        zhhans: "&#22810;&#21733;",
        tr: "Togo"
      },
      {
        en: "Tonga",
        de: "Tonga",
        fr: "Tonga",
        it: "Tonga",
        ptpt: "Tonga",
        ro: "Tonga",
        es: "Tonga",
        sv: "Tonga",
        pl: "Tonga",
        ru: "&#1058;&#1086;&#1085;&#1075;&#1072;",
        cs: "Tonga",
        th: "&#3605;&#3629;&#3591;&#3585;&#3634;",
        id: "Tonga",
        zhhans: "&#28271;&#21152;",
        tr: "Tonga"
      },
      {
        en: "Trinidad and Tobago",
        de: "Trinidad und Tobago",
        fr: "Trinit�-et-Tobago",
        it: "Trinidad e Tobago",
        ptpt: "Trinidad e Tobago",
        ro: "Trinidad &#537;i Tobago",
        es: "Trinidad y Tobago",
        sv: "Trinidad och Tobago",
        pl: "Trynidad i Tobago",
        ru:
          "&#1058;&#1088;&#1080;&#1085;&#1080;&#1076;&#1072;&#1076; &#1080; &#1058;&#1086;&#1073;&#1072;&#1075;&#1086;",
        cs: "Trinidad a Tobago",
        th:
          "&#3605;&#3619;&#3636;&#3609;&#3636;&#3649;&#3604;&#3604;&#3649;&#3621;&#3632;&#3650;&#3605;&#3648;&#3610;&#3650;&#3585;",
        id: "Trinidad dan Tobago",
        zhhans:
          "&#29305;&#37324;&#23612;&#36948;&#21644;&#22810;&#24052;&#21733;",
        tr: "Trinidad ve Tobago"
      },
      {
        en: "Tunisia",
        de: "Tunesien",
        fr: "Tunisie",
        it: "Tunisia",
        ptpt: "Tun�sia",
        ro: "Tunisia",
        es: "T�nez",
        sv: "Tunisien",
        pl: "Tunezja",
        ru: "&#1058;&#1091;&#1085;&#1080;&#1089;",
        cs: "Tunisko",
        th: "&#3605;&#3641;&#3609;&#3636;&#3648;&#3595;&#3637;&#3618;",
        id: "Tunisia",
        zhhans: "&#31361;&#23612;&#26031;",
        tr: "Tunus"
      },
      {
        en: "Turkey",
        de: "T&uuml;rkei",
        fr: "Turquie",
        it: "Turchia",
        ptpt: "Turquia",
        ro: "Turcia",
        es: "Turqu�a",
        sv: "Kalkon",
        pl: "Turcja",
        ru: "&#1058;&#1091;&#1088;&#1094;&#1080;&#1103;",
        cs: "Turecko",
        th: "&#3605;&#3640;&#3619;&#3585;&#3637;",
        id: "Turki",
        zhhans: "&#22303;&#32819;&#20854;",
        tr: "T&uuml;rkiye"
      },
      {
        en: "Turkmenistan",
        de: "Turkmenistan",
        fr: "Turkm�nistan",
        it: "Turkmenistan",
        ptpt: "Turquemenist�o",
        ro: "Turcmenistan",
        es: "Turkmenist�n",
        sv: "Turkmenistan",
        pl: "Turkmenia",
        ru:
          "&#1058;&#1091;&#1088;&#1082;&#1084;&#1077;&#1085;&#1080;&#1089;&#1090;&#1072;&#1085;",
        cs: "Turkmenist�n",
        th:
          "&#3648;&#3605;&#3636;&#3619;&#3660;&#3585;&#3648;&#3617;&#3609;&#3636;&#3626;&#3606;&#3634;&#3609;",
        id: "Turkmenistan",
        zhhans: "&#22303;&#24235;&#26364;&#26031;&#22374;",
        tr: "T&uuml;rkmenistan"
      },
      {
        en: "Tuvalu",
        de: "Tuvalu",
        fr: "Tuvalu",
        it: "Tuvalu",
        ptpt: "Tuvalu",
        ro: "Tuvalu",
        es: "Tuvalu",
        sv: "Tuvalu",
        pl: "Tuvalu",
        ru: "&#1058;&#1091;&#1074;&#1072;&#1083;&#1091;",
        cs: "Tuvalu",
        th: "&#3605;&#3641;&#3623;&#3634;&#3621;&#3641;",
        id: "Tuvalu",
        zhhans: "&#22294;&#29926;&#30439;",
        tr: "Tuvalu"
      },
      {
        en: "Uganda",
        de: "Uganda",
        fr: "Ouganda",
        it: "Uganda",
        ptpt: "Uganda",
        ro: "Uganda",
        es: "Uganda",
        sv: "Uganda",
        pl: "Uganda",
        ru: "&#1059;&#1075;&#1072;&#1085;&#1076;&#1072;",
        cs: "Uganda",
        th: "&#3618;&#3641;&#3585;&#3633;&#3609;&#3604;&#3634;",
        id: "Uganda",
        zhhans: "&#28879;&#24178;&#36948;",
        tr: "Uganda"
      },
      {
        en: "Ukraine",
        de: "Ukraine",
        fr: "Ukraine",
        it: "Ucraina",
        ptpt: "Ucr�nia",
        ro: "Ucraina",
        es: "Ucrania",
        sv: "Ukraina",
        pl: "Ukraina",
        ru: "&#1059;&#1082;&#1088;&#1072;&#1080;&#1085;&#1072;",
        cs: "Ukrajina",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3618;&#3641;&#3648;&#3588;&#3619;&#3609;",
        id: "Ukraina",
        zhhans: "&#28879;&#20811;&#34349;",
        tr: "Ukrayna"
      },
      {
        en: "United Arab Emirates",
        de: "Vereinigte Arabische Emirate",
        fr: "�mirats arabes unis",
        it: "Emirati Arabi Uniti",
        ptpt: "Emirados �rabes Unidos",
        ro: "Emiratele Arabe Unite",
        es: "Emiratos �rabes Unidos",
        sv: "F&ouml;renade Arabemiraten",
        pl: "Emiraty Arabskie",
        ru:
          "&#1054;&#1073;&#1098;&#1077;&#1076;&#1080;&#1085;&#1077;&#1085;&#1085;&#1099;&#1077; &#1040;&#1088;&#1072;&#1073;&#1089;&#1082;&#1080;&#1077; &#1069;&#1084;&#1080;&#1088;&#1072;&#1090;&#1099;",
        cs: "Spojen� arabsk� emir�ty",
        th:
          "&#3626;&#3627;&#3619;&#3633;&#3600;&#3629;&#3634;&#3627;&#3619;&#3633;&#3610;&#3648;&#3629;&#3617;&#3636;&#3648;&#3619;&#3605;",
        id: "Uni Emirat Arab",
        zhhans: "&#38463;&#32879;&#37195;",
        tr: "Birle&#351;ik Arap Emirlikleri"
      },
      {
        en: "United Kingdom",
        de: "Gro�britannien",
        fr: "Royaume-Uni",
        it: "Regno Unito",
        ptpt: "Reino Unido",
        ro: "Regatul Unit",
        es: "Reino Unido",
        sv: "Storbritannien",
        pl: "Zjednoczone Kr�lestwo",
        ru:
          "&#1042;&#1077;&#1083;&#1080;&#1082;&#1086;&#1073;&#1088;&#1080;&#1090;&#1072;&#1085;&#1080;&#1103;",
        cs: "Spojen� kr�lovstv�",
        th:
          "&#3626;&#3627;&#3619;&#3634;&#3594;&#3629;&#3634;&#3603;&#3634;&#3592;&#3633;&#3585;&#3619;",
        id: "Inggris Raya",
        zhhans: "&#32879;&#21512;&#29579;&#22283;",
        tr: "Birle&#351;ik Krall&#305;k"
      },
      {
        en: "United States",
        de: "Vereinigte Staaten von Amerika",
        fr: "�tats-Unis",
        it: "United States",
        ptpt: "Estados Unidos",
        ro: "Statele Unite",
        es: "Estados Unidos",
        sv: "United States",
        pl: "Stany Zjednoczone",
        ru: "&#1057;&#1064;&#1040;",
        cs: "Spojen� st�ty",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3626;&#3627;&#3619;&#3633;&#3600;&#3629;&#3648;&#3617;&#3619;&#3636;&#3585;&#3634;",
        id: "AS",
        zhhans: "&#32654;&#22283;",
        tr: "Birle&#351;ik Devletler"
      },
      {
        en: "Uruguay",
        de: "Uruguay",
        fr: "Uruguay",
        it: "Uruguay",
        ptpt: "Uruguai",
        ro: "Uruguay",
        es: "Uruguay",
        sv: "Uruguay",
        pl: "Urugwaj",
        ru: "&#1059;&#1088;&#1091;&#1075;&#1074;&#1072;&#1081;",
        cs: "Uruguay",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3629;&#3640;&#3619;&#3640;&#3585;&#3623;&#3633;&#3618;",
        id: "Uruguay",
        zhhans: "&#28879;&#25289;&#22317;",
        tr: "Uruguay"
      },
      {
        en: "Uzbekistan",
        de: "Usbekistan",
        fr: "Ouzb�kistan",
        it: "Uzbekistan",
        ptpt: "Uzbequist�o",
        ro: "Uzbekistan",
        es: "Uzbekist�n",
        sv: "Uzbekistan",
        pl: "Uzbekistan",
        ru:
          "&#1059;&#1079;&#1073;&#1077;&#1082;&#1080;&#1089;&#1090;&#1072;&#1085;",
        cs: "Uzbekist�n",
        th: "Uzbekistan",
        id: "Uzbekistan",
        zhhans: "&#28879;&#33586;&#21029;&#20811;&#26031;&#22374;",
        tr: "&Ouml;zbekistan"
      },
      {
        en: "Vanuatu",
        de: "Vanuatu",
        fr: "Vanuatu",
        it: "Vanuatu",
        ptpt: "Vanuatu",
        ro: "Vanuatu",
        es: "Vanuatu",
        sv: "Vanuatu",
        pl: "Vanuatu",
        ru: "&#1042;&#1072;&#1085;&#1091;&#1072;&#1090;&#1091;",
        cs: "Vanuatu",
        th: "&#3623;&#3634;&#3609;&#3641;&#3629;&#3634;&#3605;&#3641;",
        id: "Vanuatu",
        zhhans: "&#29926;&#21162;&#38463;&#22294;",
        tr: "Vanuatu"
      },
      {
        en: "Venezuela",
        de: "Venezuela",
        fr: "Venezuela",
        it: "Venezuela",
        ptpt: "Venezuela",
        ro: "Venezuela",
        es: "Venezuela",
        sv: "Venezuela",
        pl: "Wenezuela",
        ru: "&#1042;&#1077;&#1085;&#1077;&#1089;&#1091;&#1101;&#1083;&#1072;",
        cs: "Venezuela",
        th:
          "&#3648;&#3623;&#3648;&#3609;&#3595;&#3640;&#3648;&#3629;&#3621;&#3634;",
        id: "Venezuela",
        zhhans: "&#22996;&#20839;&#29790;&#25289;",
        tr: "Venezuela"
      },
      {
        en: "Vietnam",
        de: "Vietnam",
        fr: "Vietnam",
        it: "Vietnam",
        ptpt: "Vietn�",
        ro: "Vietnam",
        es: "Vietnam",
        sv: "Vietnam",
        pl: "Wietnam",
        ru: "&#1042;&#1100;&#1077;&#1090;&#1085;&#1072;&#1084;",
        cs: "Vietnam",
        th: "&#3648;&#3623;&#3637;&#3618;&#3604;&#3609;&#3634;&#3617;",
        id: "Vietnam",
        zhhans: "&#36234;&#21335;",
        tr: "Vietnam"
      },
      {
        en: "Yemen",
        de: "Jemen",
        fr: "Y�men",
        it: "Yemen",
        ptpt: "I�men",
        ro: "Yemen",
        es: "Yemen",
        sv: "Jemen",
        pl: "Jemen",
        ru: "&#1049;&#1077;&#1084;&#1077;&#1085;",
        cs: "Jemen",
        th: "&#3648;&#3618;&#3648;&#3617;&#3609;",
        id: "Yaman",
        zhhans: "&#20063;&#38272;",
        tr: "Yemen"
      },
      {
        en: "Zambia",
        de: "Sambia",
        fr: "Zambie",
        it: "Zambia",
        ptpt: "Z�mbia",
        ro: "Zambia",
        es: "Zambia",
        sv: "Zambia",
        pl: "Zambia",
        ru: "&#1047;&#1072;&#1084;&#1073;&#1080;&#1103;",
        cs: "Zambie",
        th: "&#3649;&#3595;&#3617;&#3648;&#3610;&#3637;&#3618;",
        id: "Zambia",
        zhhans: "&#36106;&#27604;&#20126;",
        tr: "Zambiya"
      },
      {
        en: "Zimbabwe",
        de: "Simbabwe",
        fr: "Zimbabwe",
        it: "Zimbabwe",
        ptpt: "Zimb�bue",
        ro: "Zimbabwe",
        es: "Zimbabue",
        sv: "Zimbabwe",
        pl: "Zimbabwe",
        ru: "&#1047;&#1080;&#1084;&#1073;&#1072;&#1073;&#1074;&#1077;",
        cs: "Zimbabwe",
        th:
          "&#3611;&#3619;&#3632;&#3648;&#3607;&#3624;&#3595;&#3636;&#3617;&#3610;&#3633;&#3610;&#3648;&#3623;",
        id: "Zimbabwe",
        zhhans: "&#27941;&#24052;&#24067;&#38859;",
        tr: "Zimbabve"
      }
    ];

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
            .replace(/®/g, "<sup>®</sup>")
        );
      }
    );
  }
};

// NABU: SCRIPT NEEDED TO MAKE SPLIT WORK IN IE8

/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
var split;
// Avoid running twice; that would break the `nativeSplit` reference
split =
  split ||
  (function(undef) {
    var nativeSplit = String.prototype.split,
      compliantExecNpcg = /()??/.exec("")[1] === undef, // NPCG: nonparticipating capturing group
      self;
    self = function(str, separator, limit) {
      // If `separator` is not a regex, use `nativeSplit`
      if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
        return nativeSplit.call(str, separator, limit);
      }
      var output = [],
        flags =
          (separator.ignoreCase ? "i" : "") +
          (separator.multiline ? "m" : "") +
          (separator.extended ? "x" : "") + // Proposed for ES6
          (separator.sticky ? "y" : ""), // Firefox 3+
        lastLastIndex = 0,
        // Make `global` and avoid `lastIndex` issues by working with a copy
        separator = new RegExp(separator.source, flags + "g"),
        separator2,
        match,
        lastIndex,
        lastLength;
      str += ""; // Type-convert
      if (!compliantExecNpcg) {
        // Doesn't need flags gy, but they don't hurt
        separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
      }
      /* Values for `limit`, per the spec:
       * If undefined: 4294967295 // Math.pow(2, 32) - 1
       * If 0, Infinity, or NaN: 0
       * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
       * If negative number: 4294967296 - Math.floor(Math.abs(limit))
       * If other: Type-convert, then use the above rules
       */
      limit =
        limit === undef
          ? -1 >>> 0 // Math.pow(2, 32) - 1
          : limit >>> 0; // ToUint32(limit)
      while ((match = separator.exec(str))) {
        // `separator.lastIndex` is not reliable cross-browser
        lastIndex = match.index + match[0].length;
        if (lastIndex > lastLastIndex) {
          output.push(str.slice(lastLastIndex, match.index));
          // Fix browsers whose `exec` methods don't consistently return `undefined` for
          // nonparticipating capturing groups
          if (!compliantExecNpcg && match.length > 1) {
            match[0].replace(separator2, function() {
              for (var i = 1; i < arguments.length - 2; i++) {
                if (arguments[i] === undef) {
                  match[i] = undef;
                }
              }
            });
          }
          if (match.length > 1 && match.index < str.length) {
            Array.prototype.push.apply(output, match.slice(1));
          }
          lastLength = match[0].length;
          lastLastIndex = lastIndex;
          if (output.length >= limit) {
            break;
          }
        }
        if (separator.lastIndex === match.index) {
          separator.lastIndex++; // Avoid an infinite loop
        }
      }
      if (lastLastIndex === str.length) {
        if (lastLength || !separator.test("")) {
          output.push("");
        }
      } else {
        output.push(str.slice(lastLastIndex));
      }
      return output.length > limit ? output.slice(0, limit) : output;
    };
    // For convenience
    String.prototype.split = function(separator, limit) {
      return self(this, separator, limit);
    };
    return self;
  })();

// function cheat() {
//     if ($('body').hasClass('page-documents')) {
//         $('#document-list li.views-row').each(function() {
//             var k = document.domain.length + 7;
//             var str = '<ul>\n';
//             str += $(this).find('.document-pdf.german').length ? '<li lang="de"><a href="' + $(this).find('.document-pdf.german a').attr('href').slice(k) + '" target="_blank">' + $(this).find('.document-pdf.german a').text() + '</a></li>\n' : '';
//             str += $(this).find('.document-pdf.french').length ? '<li lang="fr"><a href="' + $(this).find('.document-pdf.french a').attr('href').slice(k) + '" target="_blank">' + $(this).find('.document-pdf.french a').text() + '</a></li>\n' : '';
//             str += $(this).find('.document-pdf.italian').length ? '<li lang="it"><a href="' + $(this).find('.document-pdf.italian a').attr('href').slice(k) + '" target="_blank">' + $(this).find('.document-pdf.italian a').text() + '</a></li>\n' : '';
//             str += $(this).find('.document-pdf.polish').length ? '<li lang="pl"><a href="' + $(this).find('.document-pdf.polish a').attr('href').slice(k) + '" target="_blank">' + $(this).find('.document-pdf.polish a').text() + '</a></li>\n' : '';
//             str += $(this).find('.document-pdf.portuguese').length ? '<li lang="pt-pt"><a href="' + $(this).find('.document-pdf.portuguese a').attr('href').slice(k) + '" target="_blank">' + $(this).find('.document-pdf.portuguese a').text() + '</a></li>\n' : '';
//             str += $(this).find('.document-pdf.romanian').length ? '<li lang="ro"><a href="' + $(this).find('.document-pdf.romanian a').attr('href').slice(k) + '" target="_blank">' + $(this).find('.document-pdf.romanian a').text() + '</a></li>\n' : '';
//             str += $(this).find('.document-pdf.russian').length ? '<li lang="ru"><a href="' + $(this).find('.document-pdf.russian a').attr('href').slice(k) + '" target="_blank">' + $(this).find('.document-pdf.russian a').text() + '</a></li>\n' : '';
//             str += $(this).find('.document-pdf.spanish').length ? '<li lang="es"><a href="' + $(this).find('.document-pdf.spanish a').attr('href').slice(k) + '" target="_blank">' + $(this).find('.document-pdf.spanish a').text() + '</a></li>\n' : '';
//             str += $(this).find('.document-pdf.swedish').length ? '<li lang="sv"><a href="' + $(this).find('.document-pdf.swedish a').attr('href').slice(k) + '" target="_blank">' + $(this).find('.document-pdf.swedish a').text() + '</a></li>\n' : '';
//             str += $(this).find('.document-pdf.english').length ? '<li lang="en"><a href="' + $(this).find('.document-pdf.english a').attr('href').slice(k) + '" target="_blank">' + $(this).find('.document-pdf.english a').text() + '</a></li>\n' : '';
//             str += '</ul>'
//             console.log('');
//             console.log($(this).find('.document-group-name .field').text());
//             console.log(str);
//         });
//     } else {
//         console.log('Please go to the documents page first :)');
//     };
// };
