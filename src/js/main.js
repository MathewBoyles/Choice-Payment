var app;

$(document).ready(function() {
  setTimeout(function() {
    window.scrollTo(0, 1);
  }, 100);

  app = {
    globals: {
      logo: "/src/images/logo.png",
      version: "v0.3.6",
      merchant: "",
      charities: {},
      items: [],
      total: 0,
      contribution: 0,
      charity: "",
      email: ""
    },
    history: [],
    init: function() {
      app.backgroundGradient = new Granim({
        element: "#background-gradient",
        name: "background-gradient",
        direction: "diagonal",
        opacity: [1, 1],
        isPausedWhenNotInView: true,
        stateTransitionSpeed: 500,
        states: {
          "default-state": {
            gradients: [
              ["#4FACFE", "#00F2FE"]
            ],
            transitionSpeed: 10000
          },
          "second-state": {
            gradients: [
              ["#43E97B", "#38F9D7"]
            ],
            transitionSpeed: 10000
          },
          "third-state": {
            gradients: [
              ["#A1C4FD", "#C2E9FB"]
            ],
            transitionSpeed: 10000
          },
          "red-state": {
            gradients: [
              ["#E56274", "#FF5F3B"]
            ],
            transitionSpeed: 10000
          },

          "all": {
            gradients: [
              ["#4FACFE", "#00F2FE"],
              ["#43E97B", "#38F9D7"],
              ["#A1C4FD", "#C2E9FB"],
              ["#E56274", "#FF5F3B"]
            ],
            transitionSpeed: 10000
          }
        }
      });

      app.invoiceKey = window.location.hash;
      app.invoiceKey = window.location.hash.substr(3);
      app.invoiceKey = app.invoiceKey || "0001";

      app.preload(app.globals.logo, {
        "as": "image"
      });

      if (!app.invoiceKey) {
        $("#loader").fadeOut();
        app.changePage("error");
      } else if (!app.invoiceKey.match(/^[0-9a-zA-Z]+$/)) {
        $("#loader").fadeOut();
        app.changePage("error");
      } else {
        $.ajax({
          url: "/src/orders/" + app.invoiceKey + ".json",
          success: function(data) {
            $.extend(app.globals, data);

            if (app.globals.contribution >= 100) {
              app.globals.contribution_text = "$" + (app.globals.contribution / 100).toFixed(2);
            } else {
              app.globals.contribution_text = app.globals.contribution + "&cent;";
            }

            $.each(app.globals.charities, function(i, d) {
              app.preload(d.image, {
                "as": "image"
              });
            });

            app.load();
            app.ready();

            setTimeout(function() {
              $("#loader").fadeOut();
            }, 500);
            app.changePage("invoice");
          },
          error: function() {
            $("#loader").fadeOut();
            app.load();
            app.changePage("error");
          }
        });
      }
    },
    preload: function(file, data) {
      $el = $("<link />");
      $el.attr("rel", "preload");
      $el.attr("href", file);
      $el.attr(data);

      $("head").append($el);
    },
    load: function() {
      $(".boxes .box").each(function() {
        $(this).hide();

        var boxConfig = $(this).attr("data-box");
        boxConfig = boxConfig.replace(/\'/g, "\"");
        boxConfig = JSON.parse(boxConfig);

        $(this).data("box", boxConfig).removeAttr("data-box");
      });

      $("[data-change]").each(function() {
        $(this).data("doChange", $(this).attr("data-change")).removeAttr("data-change");

        $(this).click(function(ev) {
          app.changePage($(this).data("doChange"), true);

          ev.preventDefault();
        });
      });

      $("[data-value]").each(function() {
        var valueConfig = $(this).attr("data-value");
        valueConfig = valueConfig.replace(/\'/g, "\"");
        valueConfig = JSON.parse(valueConfig);

        $(this).data("valueConfig", valueConfig).removeAttr("data-value").addClass("doValue");
      });

      app.setGlobals();
    },
    ready: function() {
      if (typeof Storage !== "undefined") {
        if (localStorage.getItem("choice__charity")) {
          if (localStorage.getItem("choice__charity")) {
            app.globals.charity = app.globals.charities[localStorage.getItem("choice__charity")].name;
            app.globals.charity_id = localStorage.getItem("choice__charity");
          }

          if (localStorage.getItem("choice__email")) {
            app.globals.email = localStorage.getItem("choice__email");
          }
        }
      }

      $("script[type=\"text/template7\"]").each(function() {
        var compiledTemplate = Template7.compile($(this).html());
        var html = compiledTemplate(app.globals);

        $el = $("<tmpl-block />");
        $el.html(html);
        $(this).before($el);
      });

      $("[data-charity]").each(function() {
        $(this).data("doCharity", $(this).attr("data-charity")).removeAttr("data-charity");

        $(this).click(function() {
          app.setGlobals("charity", app.globals.charities[$(this).data("doCharity")].name);
          app.setGlobals("charity_id", $(this).data("doCharity"));

          if (typeof Storage !== "undefined") {
            localStorage.setItem("choice__charity", $(this).data("doCharity"));
          }

          app.changePage(app.globals.email ? "confirm" : "email", true);
        });
      });

      $("#saveEmail").click(function(ev) {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if (reg.test($("#emailAddress").val()) == false) {
          $("#emailError").show();
          return false;
        }

        $("#emailError").hide();
        app.setGlobals("email", $("#emailAddress").val());

        if (typeof Storage !== "undefined") {
          localStorage.setItem("choice__email", $("#emailAddress").val());
        }

        app.changePage("confirm", true);
        ev.preventDefault();
      });

      $("#invoiceButton").click(function(ev) {
        app.changePage(app.globals.email ? "confirm" : "charity", true);
        ev.preventDefault();
      });

      $("#confirmPayment").click(function(ev) {
        $("#loader").fadeIn(500, function() {
          $.ajax({
            url: "/src/ajax/payment.php",
            method: "POST",
            data: {
              order: app.invoiceKey,
              email: app.globals.email,
              charity: app.globals.charity_id
            },
            success: function() {
              $("#loader").fadeOut();
              app.changePage("success", false);
            },
            error: function() {
              $("#loader").fadeOut();
              app.changePage("error", false);
            }
          });
        });

        ev.preventDefault();
      });

      app.changePage(app.globals.charity && app.globals.email ? "confirm" : "invoice", false);
      app.setGlobals();
    },
    changePage: function(pageName, doAnimate) {
      if (pageName == "#back") {
        app.history.pop();
        app.changePage(app.history[app.history.length - 1], doAnimate);
        app.history.pop();

        return false;
      }
      if (pageName == "#previous") {
        app.changePage(app.globals.previous, doAnimate);
        return false;
      }
      if (pageName == "#reload") {
        window.location.reload();
        return false;
      }

      app.history.push(pageName);
      app.globals.previous = app.globals.previousTo;

      if (doAnimate) {
        $(".boxes .box").css("z-index", "10");
        $(".boxes .box:visible").css("z-index", "11").addClass("animating").animate({
          "top": "60%"
        }, 300, function() {
          $(this).animate({
            "top": "-100%"
          }, 250, function() {
            $(this).removeClass("animating").hide().css("top", "50%");
          });
        });
      }

      var hasPage = false;
      $(".boxes .box").each(function() {
        if (!doAnimate) {
          $(this).hide();
        }

        if ($(this).data("box").name == pageName) {
          hasPage = true;
          app.backgroundGradient.changeState($(this).data("box").background || "default-state");

          app.globals.previousTo = pageName;

          var checkSize = function($el) {
            if ($(window).height() < ($el.show().innerHeight() + 100)) {
              $(".boxes .box").hide();
              $(".boxes").addClass("overflow");
            } else {
              $(".boxes").removeClass("overflow");
            }
            $el.hide();
          };

          if (doAnimate) {
            setTimeout(function($el) {
              checkSize($el);
              $el.fadeIn();
            }, 500, $(this));
          } else {
            checkSize($(this));
            $(this).show();
          }

        }
      });

      if (!hasPage) {
        app.changePage("error", false);
      }
    },
    setGlobals: function(gName, gValue) {
      if (gName) {
        app.globals[gName] = gValue;
      }

      $(".doValue").each(function() {
        var valueConfig = $(this).data("valueConfig");
        var $el = $(this);

        $.each(valueConfig, function(gType, gName) {
          var gValue = app.globals[gName];
          if (gName == "total") {
            gValue /= 100;
            gValue = gValue.toFixed(2);
          }

          switch (gType) {
            case "html":
              $el.html(gValue);
              break;
            case "value":
              $el.val(gValue);
              break;
            default:
              $el.attr(gType, gValue);
          }
        });
      });
    }
  };

  app.init();

  var fonts = (function() {
    var families = ["Playfair+Display:400,400italic,700,700italic:latin", "Montserrat:700,400:latin"];

    function load() {
      WebFont.load({
        google: {
          families: families
        }
      });
    }
    return {
      load: load
    };
  }());
  fonts.load();

});
