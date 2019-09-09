
  // highlight banner

  // if ($("#banners").length) {
  //   // temporary -------------
  //
  //   var lang = $("html").attr("lang");
  //   // $('#banners .stage').html('<a href="/en/solder-pastes"><article id="productronica-2015" class="bg-9 image-done"><img src="/sites/all/themes/zen_interflux/images/banner-DP5600.jpg" width:"958" height="220" style="opacity: 1;"></article></a>');
  //
  //   //<a href="/' + lang + '/solder-pastes"></a>
  //
  //   var language = $("html")
  //     .attr("lang")
  //     .replace(/-/g, "");
  //   var translation = {
  //     en: "Read more ...",
  //     de: "mehr lesen…",
  //     fr: "En savoir plus …",
  //     it: "Leggi ancora….",
  //     ptpt: "mais informação",
  //     ro: "Citeste mai multe...",
  //     es: "más información",
  //     sv: "Läs mer...",
  //     pl: "Czytaj więcej...",
  //     ru: "Подробнее …",
  //     cs: "Číst více ...",
  //     th: "อ่านเพิ่มเติม ...",
  //     id: "Baca lebih lanjut ...",
  //     zhhans: "更多…",
  //     tr: "Daha fazla bilgi�"
  //   };
  //
  //   $("#banners article").append(
  //     ' <a href="/' +
  //       lang +
  //       '/solder-pastes" class"read-more"> ' +
  //       translation[language] +
  //       "</a>"
  //   );
  //
  //   // -----------------------
  //
  //   // nabu.banners.prepare();
  //   // nabu.banners.preload();
  //   // nabu.banners.rotateTo(1, 'easeInOutQuart');
  //   // nabu.banners.startTimer();
  //   // $('#banners #prev').on('click', function() {
  //   //     nabu.banners.rotateTo('prev');
  //   //     nabu.banners.pauseTimer();
  //   // });
  //   // $('#banners #next').on('click', function() {
  //   //     nabu.banners.rotateTo('next');
  //   //     nabu.banners.pauseTimer();
  //   // });
  //   // $('#banners nav li').each(function() {
  //   //     $(this).on('click', function() {
  //   //         nabu.banners.rotateTo($(this).index());
  //   //         nabu.banners.pauseTimer();
  //   //     });
  //   // });
  // }
  //
  // // product & process pages
  //
  // if ($("body").hasClass("page-products")) {
  //   nabu.products.addReadMore();
  //   nabu.products.wrapTooltips();
  //   nabu.products.translateContactLinks();
  //   nabu.products.animateHighlight();
  //   $(".product-row").on("click", function() {
  //     $(this).expand();
  //   });
  //   $(".read-more").on("click", function(e) {
  //     e.preventDefault();
  //     $(this)
  //       .parents(".product-row")
  //       .expand();
  //   });
  //   $(".product-document-link a, .product-contact-link a")
  //     .attr("target", "_blank")
  //     .click(function(e) {
  //       e.stopPropagation();
  //     });
  // }
  //
  // // hashtag links
  //
  // if (nabu.link.hasValidHashTag()) {
  //   nabu.link.scrollToTarget();
  // }
  //
  // // all other stuff
  //
  // nabu.allPages();
  // nabu.languageBlock();
  // nabu.navigationBlock();
  //
  // if ($("body").hasClass("page-home")) {
  //   nabu.homePage();
  // }
  // if ($("body").hasClass("page-documents")) {
  //   nabu.documentsPage();
  // }
  // if ($("body").hasClass("page-contact")) {
  //   nabu.contactPage();
  // }
}
