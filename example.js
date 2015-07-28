/* Momentum Dashboard - app-min.js */
/* Copyright (c) 2013-2015 Momentum Dashboard Corp. All rights reserved. */
/* All portions of this file are the confidential and proprietary intellectual property of Momentum Dashboard Corp. */
/* Use of this file is permitted only within the Momentum Google Chrome extension as published on the Google Chrome Web Store at https://chrome.google.com/webstore/detail/momentum/laookkfknpbbblfpciffpaejjkokdgca */
function momoInit() {
    return !0
}

function validateEmail(e) {
    var t = /[^@]+@[^@]+\.[^@]+/;
    return t.test(e)
}

function getQueryParameter(e) {
    e = e.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var t = new RegExp("[\\?&]" + e + "=([^&#]*)"),
        i = t.exec(location.search);
    return null === i ? "" : decodeURIComponent(i[1].replace(/\+/g, " "))
}

function getActiveDateString() {
    var e = new Date;
    return activeDateStringForDate(e)
}

function activeDateStringForDate(e) {
    var t = new Date(e);
    t.getHours() < 5 && (t = new Date(t.getTime() - 864e5));
    var i = t.getFullYear().toString() + "-" + twoDigit(t.getMonth() + 1) + "-" + twoDigit(t.getDate());
    return i
}

function twoDigit(e) {
    var t = parseInt(e),
        i = t >= 10 ? t : "0" + t.toString();
    return i.toString()
}

function submitStats(e) {
    momoInit();
    var t = {
        eventType: e
    };
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(t),
        beforeSend: setMomentumAuthHeader,
        url: m.globals.urlRootStats + "ingest"
    }).done(function(e) {
        e && e.download && m.trigger("sync:download", e.download)
    }).fail(function() {})
}

function setMomentumAuthHeader(e) {
    if (localStorage.token && e.setRequestHeader("Authorization", "Bearer " + localStorage.token), localStorage.client_uuid && e.setRequestHeader("X-Momentum-ClientId", localStorage.client_uuid), e.setRequestHeader("X-Momentum-Version", m.globals.version), m.conditionalFeatures.featureEnabled("allowoptions")) {
        var t = localStorage.getItem("X-Momentum-Options");
        t && e.setRequestHeader("X-Momentum-Options", t)
    }
    localStorage.activeTags && e.setRequestHeader("X-Momentum-Tags", localStorage.activeTags)
}

function isDateInFuture(e) {
    return Date.parse(e) > Date.parse(new Date)
}

function setMaxWidgetHeight() {
    $(".pane").css("max-height", $(window).height() - 125)
}

function setEndOfContenteditable(e) {
    var t, i;
    document.createRange && (t = document.createRange(), t.selectNodeContents(e), t.collapse(!1), i = window.getSelection(), i.removeAllRanges(), i.addRange(t))
}
window.m = _.extend({
    $window: $(window),
    appView: "",
    globals: {},
    models: {},
    collect: {},
    views: {},
    addins: {},
    utils: {},
    bootstrappers: {}
}, Backbone.Events), Backbone.View = function(e) {
    return e.extend({
        constructor: function(t) {
            this.options = t || {}, e.apply(this, arguments)
        }
    })
}(Backbone.View);
var backboneSync = Backbone.sync;
Backbone.sync = function(e, t, i) {
        i.beforeSend = function(e) {
            setMomentumAuthHeader(e)
        }, backboneSync(e, t, i)
    }, m.globals.platform = "chrome", m.globals.googleAnalyticsCode = "UA-44319322-1", m.globals.version = "0.50.0", m.globals.urlRoot = "https://api.momentumdash.com/", m.globals.urlRootApi = "https://api.momentumdash.com/", m.globals.urlRootLogin = "https://login.momentumdash.com/", m.globals.urlRootStats = "https://stats.momentumdash.com/", m.models.SyncCoordinator = Backbone.Model.extend({
        initialize: function() {
            this.syncSettingsInProgress = !1, this.listenTo(m, "sync:download", this.doDownload), this.listenTo(m, "client:id_created", this.onClientIdCreated), this.listenTo(m, "user:successfulLogin", this.onUserLogin), this.listenTo(m, "user:successfulLogout", this.syncSettings), this.listenTo(m, "sync:downloadIfNeeded", this.doDownloadIfNeeded), this.listenTo(m.models.customization, "change", this.customizationChange)
        },
        onUserLogin: function(e) {
            this.doDownload(), this.syncSettings(e)
        },
        doDownload: function(e) {
            try {
                if (!localStorage.client_uuid) return;
                var t = m.globals.urlRootApi + "feed/bulk?syncTypes=";
                if (e) {
                    var i = [];
                    e.indexOf("quote") > -1 && (i[i.length] = "quote"), e.indexOf("background") > -1 && (i[i.length] = "background"), t += i.length > 0 ? i.join(",") : "all"
                } else t += "all";
                if (t = t + "&localDate=" + getActiveDateString(), localStorage.background) {
                    var o = m.models.activeBackground.activeBackgroundUuid();
                    o && (t = t + "&legacyBackground=" + o)
                }
                var n = this;
                $.ajax({
                    type: "GET",
                    contentType: "application/json",
                    beforeSend: setMomentumAuthHeader,
                    url: t
                }).done(function(e) {
                    e.quotes && e.quotes.length > 0 && (m.collect.shortquotes.reset(e.quotes), m.collect.shortquotes.invoke("save"), localStorage.shortquote && localStorage.removeItem("shortquote"), localStorage.setItem(n.ddlQuoteString(), Date.now())), e.backgrounds && e.backgrounds.length > 0 && (m.collect.backgrounds.reset(e.backgrounds), m.collect.backgrounds.invoke("save"), localStorage.background && (localStorage.removeItem("background"), localStorage.removeItem("backgrounds")), localStorage.setItem(n.ddlBackgroundString(), Date.now()), _.each(m.collect.backgrounds.models, n.preCacheBackgroundImage)), localStorage.setItem("firstSynchronized", Date.now())
                }).fail(function() {})
            } catch (s) {}
        },
        preCacheBackgroundImage: function(e) {
            if (e) {
                var t = e.get("filename");
                if (t && 0 === t.indexOf("http")) try {
                    var i = new Image;
                    i.addEventListener("load", function() {
                        i.removeEventListener("load", arguments.callee, !1)
                    }, !1), i.src = t
                } catch (o) {}
            }
        },
        doDownloadIfNeeded: function() {
            localStorage[this.ddlBackgroundString()] ? localStorage[this.ddlQuoteString()] || this.doDownload("quote") : localStorage[this.ddlQuoteString()] ? this.doDownload("background") : this.doDownload()
        },
        pingApi: function(e, t) {
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: m.globals.urlRootApi
            }).done(function() {
                e && e()
            }).fail(function() {
                t && t()
            })
        },
        ddlBackgroundString: function() {
            return "ddl-bg-" + getActiveDateString()
        },
        ddlQuoteString: function() {
            return "ddl-qt-" + getActiveDateString()
        },
        onClientIdCreated: function() {
            this.doDownload(), this.syncSettings()
        },
        setSyncSettingsHeaders: function(e) {
            m.utils.setMomentumAuthHeader(e);
            var t = m.models.customization.get("etag");
            t && e.setRequestHeader("X-Momentum-Settings-ETag", t)
        },
        customizationChange: function(e) {
            if (!this.syncSettingsInProgress && !m.models.customization.fetching && m.conditionalFeatures.featureEnabled("serversettings")) {
                var t = e.changedAttributes();
                1 === Object.keys(t).length && _.contains(Object.keys(t), "etag") || $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(m.models.customization),
                    beforeSend: setMomentumAuthHeader,
                    url: m.globals.urlRootApi + "settings"
                }).done(function(e) {
                    e.etag && m.models.customization.save({
                        etag: e.etag
                    })
                }).fail(function(e, t) {
                    console.log(t)
                }).always(function() {})
            }
        },
        submitFeatureAccessRequest: function(e, t, i) {
            var o = {
                feature: e
            };
            $.ajax({
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(o),
                beforeSend: setMomentumAuthHeader,
                url: m.globals.urlRootApi + "user/featurerequest"
            }).done(function() {
                t && t()
            }).fail(function() {
                i && i()
            })
        },
        syncSettings: function(callback) {
            if (localStorage.client_uuid) {
                this.syncSettingsInProgress = !0;
                var that = this;
                $.ajax({
                    type: "GET",
                    contentType: "application/json",
                    beforeSend: this.setSyncSettingsHeaders,
                    url: m.globals.urlRootApi + "settings"
                }).done(function(json) {
                    if (json && (json.greetings && (localStorage.greetings = json.greetings), json.features && m.conditionalFeatures.setFeatures(json.features), json.customization && m.models.customization.save(json.customization), json.addIns && 0 === m.addins.length)) {
                        for (i = 0; i < json.addIns.length; i++) {
                            var addInText = json.addIns[i];
                            if (addInText) try {
                                var addIn = eval(addInText);
                                m.addins.push(addIn)
                            } catch (e) {}
                        }
                        m.trigger("processAddIns")
                    }
                }).fail(function() {}).always(function() {
                    that.syncSettingsInProgress = !1
                }).always(function() {
                    callback && callback()
                })
            }
        }
    }), m.models.ConditionalFeatures = Backbone.Model.extend({
        initialize: function() {
            try {
                this.featureList = localStorage.f3t6b23d ? JSON.parse(atob(localStorage.f3t6b23d)) : []
            } catch (e) {
                this.featureList = []
            }
        },
        featureEnabled: function(e) {
            return _.contains(this.featureList, e)
        },
        setFeatures: function(e) {
            localStorage.f3t6b23d !== e && (localStorage.f3t6b23d = e, this.featureList = JSON.parse(atob(e)), m.trigger("feature:changed"))
        },
        checkFeatureAndMigrateData: function(e, t, i, o, n, s) {
            var a = null;
            if (this.featureEnabled(e)) {
                for (var l = !1, r = 0; r < localStorage.length; r++)
                    if (keyName = localStorage.key(r), 0 === keyName.indexOf(i + "-")) {
                        var l = !0;
                        break
                    }
                if (l) try {
                    for (var c = new Date, d = c.getFullYear().toString() + "-" + twoDigit(c.getMonth() + 1) + "-" + twoDigit(c.getDate()) + "-" + twoDigit(c.getHours()) + ":" + twoDigit(c.getMinutes()) + ":" + twoDigit(c.getSeconds()), u = "migrated-" + i + "-" + d, h = [], g = [], r = 0; r < localStorage.length; r++)
                        if (keyName = localStorage.key(r), 0 === keyName.indexOf(i + "-")) {
                            g.push(keyName);
                            var f = localStorage.getItem(keyName);
                            if (f) {
                                var p = JSON.parse(f);
                                h.push(p)
                            }
                        }
                    var v = {
                            items: h
                        },
                        w = JSON.stringify(v);
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        data: w,
                        beforeSend: setMomentumAuthHeader,
                        url: m.globals.urlRootApi + "migrate/" + i
                    }).done(function() {
                        localStorage.setItem(u, w);
                        for (var e in g) localStorage.removeItem(g[e]);
                        localStorage.removeItem(i), (!t || m.models.customization.get(t)) && o()
                    }).fail(function() {
                        (!t || m.models.customization.get(t)) && n()
                    })
                } catch (k) {
                    console.log(k)
                } else a = o
            } else a = n;
            a && (!t || m.models.customization.get(t) ? a() : s && s(a))
        },
        checkPreferenceForRender: function(e, t, i) {
            t && (!e || m.models.customization.get(e) ? t() : i && i(t))
        }
    }), m.models.Background = Backbone.Model.extend({
        idAttribute: "forDate"
    }), m.models.LegacyBackground = Backbone.Model.extend({
        parse: function(e) {
            this.set({
                filename: e.filename,
                title: e.title,
                source: e.source,
                sourceUrl: e.sourceUrl
            })
        }
    }), m.models.ActiveBackground = Backbone.Model.extend({
        initialize: function(e, t) {
            this.backgrounds = t.backgrounds, this.legacyBackgrounds = t.legacyBackgrounds, this.listenTo(this.backgrounds, "reset", this.collectionReady), this.listenTo(this.legacyBackgrounds, "reset", this.legacyCollectionReady), this.listenTo(m, "newDay", this.handleNewDay, this)
        },
        handleNewDay: function() {
            var e = this;
            e.intervalId = setInterval(function() {
                e.backgrounds.length > 0 && (e.checkActiveBackground(), clearInterval(e.intervalId))
            }, 50)
        },
        collectionReady: function() {
            this.checkActiveBackground()
        },
        legacyCollectionReady: function() {
            if (this.backgrounds.length > 0) {
                var e = this.backgrounds.get(getActiveDateString());
                e || this.checkActiveBackground()
            } else this.checkActiveBackground()
        },
        activeBackgroundUuid: function() {
            if (this.backgroundItem) {
                var e = this.backgroundItem.get("_id");
                if (e) return e;
                var t = this.backgroundItem.get("filename");
                if (0 === t.indexOf("http")) return null;
                var i = t.split("/");
                if (2 == i.length) {
                    var i = i[1].split(".");
                    if (2 == i.length) return i[0]
                }
            }
            return null
        },
        checkActiveBackground: function() {
            var e = null,
                t = this;
            if (this.backgrounds && this.backgrounds.length > 0 ? (e = this.backgrounds.getActiveBackground(), e || (e = this.legacyBackgrounds.getCurrentLocalBackground())) : e = this.legacyBackgrounds.getCurrentLocalBackground(), e) {
                var i = e.get("filename");
                if (0 === i.indexOf("http")) this.setActiveBackground(e);
                else {
                    $.get(i).done(function() {
                        t.setActiveBackground(e)
                    }).fail(function() {
                        return legacyItem = this.legacyBackgrounds.getCurrentLocalBackground(), legacyItem ? void t.setActiveBackground(legacyItem) : void t.listenTo(this.legacyBackgrounds, "reset", t.collectionReady)
                    })
                }
            }
        },
        setActiveBackground: function(e) {
            this.backgroundItem != e && (this.backgroundItem = e, this.trigger("background:activechanged", e))
        }
    }), m.collect.Backgrounds = Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage("momentum-background"),
        model: m.models.Background,
        getActiveBackground: function() {
            if (this.length > 0) {
                var e = getActiveDateString();
                return this.get(e)
            }
        }
    }), m.collect.LegacyBackgrounds = Backbone.Collection.extend({
        model: m.models.LegacyBackground,
        url: "app/backgrounds.json",
        parse: function(e) {
            return e.backgrounds
        },
        initialize: function() {
            localStorage.firstSynchronized || this.listenTo(this, "reset", this.initializeBackground)
        },
        initializeBackground: function() {
            this.getCurrentLocalBackground(), m.trigger("sync:downloadIfNeeded")
        },
        getCurrentLocalBackground: function() {
            if (0 === this.models.length) return null;
            var e = this,
                t = window.localStorage.background;
            (!t || Number(t) + 1 > this.models.length) && (localStorage.backgrounds = "[]", t = this.getNewIndex());
            var i = e.models[t];
            return window.localStorage.background = t, i
        },
        getNewIndex: function() {
            for (var e = localStorage.background, t = JSON.parse(localStorage.backgrounds || "[]"), i = null; null === i || Number(i) + 1 > this.models.length;) {
                0 === t.length && (t = Object.keys(this.models));
                for (var o = Math.floor(Math.random() * t.length); e === o;) o = Math.floor(Math.random() * t.length);
                i = t.splice(o, 1)[0]
            }
            return localStorage.backgrounds = JSON.stringify(t), i
        }
    }), m.views.Background = Backbone.View.extend({
        tagName: "li",
        attributes: {},
        events: {
            click: "closeTrays"
        },
        initialize: function() {
            this.listenTo(m.models.activeBackground, "background:activechanged", this.setBackground)
        },
        render: function() {
            this.model && this.model.backgroundItem && this.setBackground(this.model.backgroundItem)
        },
        setBackground: function(e) {
            var t = this,
                i = e.get("filename"),
                o = e.get("_id"),
                n = (e.get("title"), e.get("source"), e.get("sourceUrl"), (this.options.order || "append") + "To");
            $("#background").css("background-image", $("#background").find("li").css("background-image")), this.lastId = o, $("<img/>").attr("src", i).load(function() {
                o === t.lastId && (t.$el[n]("#" + t.options.region).css("background-image", "url(" + i + ")").addClass("fadein"), $(this).remove(), $(".widgets").addClass("fadein"), $(".background-overlay").addClass("fadein"))
            })
        },
        closeTrays: function() {
            $(".show").each(function() {
                removeClass("show")
            })
        }
    }), m.views.BackgroundInfo = Backbone.View.extend({
        tagName: "div",
        attributes: {
            id: "background-info",
            "class": "light"
        },
        template: Handlebars.compile($("#background-info-template").html()),
        events: {
            "click .source-url": "trackClick"
        },
        initialize: function() {
            this.listenTo(m.models.activeBackground, "background:activechanged", this.activeBackgroundReady)
        },
        parentReady: function(e) {
            this.isParentReady = !0, (this.isBackgroundReady || e) && this.render()
        },
        activeBackgroundReady: function() {
            this.isBackgroundReady = !0, this.isParentReady && this.render()
        },
        render: function() {
            this.model && this.model.backgroundItem && this.setBackground(this.model.backgroundItem)
        },
        setBackground: function(e) {
            var t = "";
            attribution = null;
            var i = "",
                o = "";
            e && (t = e.get("title"), o = e.get("sourceUrl"), attribution = e.get("attribution"), i = e.get("source"), attribution || (attribution = "Photo by " + i)), t || this.$el.addClass("title-unknown"), i || this.$el.addClass("source-unknown");
            var n = {
                    title: t,
                    source: i,
                    sourceUrl: o,
                    attribution: attribution
                },
                s = (this.options.order || "append") + "To";
            return this.$el[s]("#" + this.options.region).fadeTo(0, 0).html(this.template(n)).fadeTo(500, 1), this
        },
        trackClick: function() {
            ga("send", "event", "BackgroundInfo", "Click", localStorage.background)
        }
    }), m.views.Search = Backbone.View.extend({
        id: "search",
        className: "search top-widget",
        events: {
            "focusin .search-input": "handleFocusIn",
            "focusout .search-input": "handleFocusOut",
            "keyup .search-input": "checkForEscape",
            "submit .form": "doSearch"
        },
        initialize: function() {
            this.renderedOnce = !1, this.listenTo(m, "globalEvent:click", this.hideResults), this.listenTo(m, "globalEvent:esc", this.hide), this.listenTo(m, "globalEvent:toggleSearch", this.toggleShow), this.listenTo(m.models.customization, "change:searchVisible", this.visibleChanged), this.render()
        },
        render: function() {
            var e = '<form class="form"><span class="search-underline"></span><i class="icon-search"></i><input type="text" id="search-input" class="search-input" autocomplete="off"></form><iframe src="" class="search-results"></iframe>',
                t = (this.options.order || "append") + "To";
            return this.$el[t]("#" + this.options.region).fadeTo(0, 0).html($.trim(e)).fadeTo(500, 1), this.$input = this.$el.find("input"), this.renderedOnce = !0, this
        },
        visibleChanged: function() {
            var e = m.models.customization.get("searchVisible");
            e ? this.renderedOnce ? this.$el.fadeIn(500) : this.render() : this.$el.fadeOut(500)
        },
        doSearch: function(e) {
            e.preventDefault();
            var t = this.$el.find(".search-input")[0].value;
            if (t.length > 0) {
                var i = m.globals.urlRootApi + "search",
                    o = {
                        search: t
                    };
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(o),
                    beforeSend: m.utils.setMomentumAuthHeader,
                    url: i
                }).done(function(e) {
                    if (e && e.searchUrl) {
                        var t = e.searchUrl;
                        e.searchOutput && "redirect" == e.searchOutput ? window.location.href = t : $(".search-results").attr("src", t).attr("target", "_top").addClass("fadein").css("display", "block")
                    }
                }).fail(function() {
                    var e = "https://search.momentumdash.com/?q=" + t;
                    $(".search-results").attr("src", e).attr("target", "_top").addClass("fadein").css("display", "block")
                }), ga("send", "event", "Search", "Searched")
            }
        },
        handleFocusIn: function() {
            $(".search").addClass("active"), ga("send", "event", "Search", "Focused")
        },
        handleFocusOut: function() {
            $(".search").removeClass("active")
        },
        hideResults: function(e) {
            (!$.contains(this.el, e.target) && $(".search-results").hasClass("fadein") || 1 == e.hide) && $(".search-results").removeClass("fadein").css("display", "none")
        },
        checkForEscape: function(e) {
            27 == e.keyCode && this.hideResults({
                hide: "true"
            })
        },
        toggleShow: function() {
            this.$input.is(":focus") ? this.$input.blur() : this.$input.focus()
        },
        hide: function() {
            this.$input.is(":focus") && this.$input.blur()
        }
    }), m.bootstrappers.RenderSearch = function(e) {
        e.conditionalFeatures.checkPreferenceForRender("searchVisible", function() {
            e.views.search = new e.views.Search({
                region: "top-left",
                order: "append"
            }), e.widgets.push(e.views.search)
        }, function(t) {
            e.listenToOnce(e.models.customization, "change:searchVisible", t)
        })
    }, m.models.ShortQuote = Backbone.Model.extend({
        idAttribute: "forDate"
    }), m.collect.ShortQuotes = Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage("momentum-quote"),
        model: m.models.ShortQuote,
        getActiveQuote: function() {
            if (this.length > 0) {
                var e = getActiveDateString();
                return this.get(e)
            }
        }
    }), m.views.ShortQuote = Backbone.View.extend({
        tagName: "blockquote",
        attributes: {
            id: "shortquote"
        },
        template: Handlebars.compile($("#shortquote-template").html()),
        events: {
            "click .share-twitter": "shareTwitter"
        },
        currentlyActiveQuote: null,
        initialize: function() {
            this.renderedOnce = !1, this.listenTo(m, "newDay", this.handleNewDay, this), this.listenTo(this.collection, "reset", this.collectionReady), this.listenTo(m.models.customization, "change:quoteVisible", this.visibleChanged)
        },
        handleNewDay: function() {
            var e = this;
            e.intervalId = setInterval(function() {
                e.collection.length > 0 && (e.render(), clearInterval(e.intervalId))
            }, 50)
        },
        parentReady: function(e) {
            this.isParentReady = !0, (this.isCollectionReady || e) && this.render()
        },
        collectionReady: function() {
            this.isCollectionReady = !0, this.isParentReady && this.render()
        },
        visibleChanged: function() {
            var e = m.models.customization.get("quoteVisible");
            e ? this.renderedOnce ? this.$el.fadeIn(500) : this.render() : this.$el.fadeOut(500)
        },
        render: function(e) {
            if (0 === this.collection.length) return void m.trigger("sync:downloadIfNeeded");
            var t = this.collection.getActiveQuote();
            if (!t) return void m.trigger("sync:downloadIfNeeded");
            if (!this.currentlyActiveQuote || this.currentlyActiveQuote.get("_id") != t.get("_id")) {
                this.currentlyActiveQuote = t;
                var i = this,
                    o = t.get("body"),
                    n = t.get("source"),
                    s = t.get("twitter"),
                    a = t.get("twitterIntentUrl");
                if (!a) {
                    var l = "";
                    l = s ? '"' + o + '" —@' + s : '"' + o + '" —' + n, a = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(l) + "&via=momentumdash&related=momentumdash,levibucsis,jaywaterman"
                }
                var r = {
                        body: o,
                        source: n,
                        twitterIntentUrl: a
                    },
                    c = (this.options.order || "append") + "To";
                e ? i.$el[c]("#" + i.options.region).html(i.template(r)).fadeTo(500, 1) : i.$el[c]("#" + i.options.region).fadeTo(0, 0).html(i.template(r)).fadeTo(500, 1), this.renderedOnce = !0
            }
        },
        shareTwitter: function(e) {
            e.preventDefault();
            var t = screen.width / 2 - 272.5,
                i = screen.height / 2 - 210;
            window.open(e.currentTarget.href, "share", "left=" + t + ",top=" + i + ",width=545,height=420,resizeable=0")
        }
    }), m.bootstrappers.InitializeQuote = function(e) {
        e.collect.shortquotes = new e.collect.ShortQuotes
    }, m.bootstrappers.RenderQuote = function(e, t, i) {
        e.conditionalFeatures.checkPreferenceForRender("quoteVisible", function() {
            e.views.shortQuote = new e.views.ShortQuote({
                collection: e.collect.shortquotes,
                model: e.models.date,
                region: "bottom"
            }), e.collect.shortquotes.fetch({
                reset: !0
            }), e.views.shortQuote.parentReady(i), e.widgets.push(e.views.shortQuote)
        }, function(t) {
            e.listenToOnce(e.models.customization, "change:quoteVisible", t)
        })
    }, m.models.Focus = Backbone.Model.extend({
        defaults: {
            focus: "",
            day: "",
            forDate: null,
            archived: !1,
            createdDate: new Date,
            archivedDate: null,
            completed: !1,
            completedDate: null,
            cached: !1
        },
        saveOptions: function() {
            return this.collection.saveOptions
        },
        archive: function() {
            var e = new Date;
            this.save({
                archived: !0,
                archivedDate: e
            }, this.saveOptions())
        },
        toggleCompleted: function() {
            this.save({
                completed: !this.get("completed"),
                completedDate: this.get("completed") ? null : new Date
            }, this.saveOptions())
        }
    }), m.collect.FocusesBase = Backbone.Collection.extend({
        model: m.models.Focus,
        saveOptions: {},
        attributes: {},
        initialize: function() {
            this.loadingFromServer = !0, this.on("reset", this.onReset, this), this.on("add", this.onAdd, this), this.on("change", this.onModelChanged, this)
        },
        onReset: function() {
            this.loadingFromServer = !1, this.trigger("loadingFromServerChanged")
        },
        onModelChanged: function(e) {
            var t = e.changedAttributes(),
                i = _.keys(t),
                o = _.without(i, "archived", "archivedDate");
            o.length > 0 && this.saveCachedFocus(e)
        },
        comparator: function(e) {
            var t = e.get("createdDate");
            return t ? -Date.parse(t) : 0
        },
        activeFocus: function() {
            if (this.loadingFromServer) return this.cachedFocus();
            if (0 === this.length) return localStorage.removeItem("cachedFocus"), null;
            var e = null,
                t = getActiveDateString(),
                i = this.where({
                    completed: !1,
                    archived: !1,
                    forDate: t
                });
            if (1 === i.length) e = i[0];
            else if (0 === i.length)
                if (i = this.where({
                        completed: !0,
                        archived: !1,
                        forDate: t
                    }), 1 === i.length) e = i[0];
                else if (0 === i.length) return localStorage.removeItem("cachedFocus"), null;
            return null == e && _.each(i, function(t) {
                if (null == e) e = t;
                else {
                    var i = t.get("createdDate"),
                        o = e.get("createdDate");
                    i > o && (e = t)
                }
            }), e ? this.saveCachedFocus(e) : localStorage.removeItem("cachedFocus"), e
        },
        saveCachedFocus: function(e) {
            var t = e.get("focus"),
                i = e.get("forDate"),
                o = e.get("completed");
            localStorage.cachedFocus = JSON.stringify({
                focus: t,
                forDate: i,
                cached: !0,
                completed: o
            })
        },
        cachedFocus: function() {
            if (localStorage.cachedFocus) {
                var e = JSON.parse(localStorage.cachedFocus),
                    t = getActiveDateString();
                if (e && e.forDate === t) {
                    var i = new Backbone.Model(e);
                    return i
                }
            }
            return null
        }
    }), m.collect.Focuses = m.collect.FocusesBase.extend({
        url: m.globals.urlRoot + "focus",
        saveOptions: {
            patch: !0
        }
    }), m.collect.FocusesLegacy = m.collect.FocusesBase.extend({
        localStorage: new Backbone.LocalStorage("momentum-focus"),
        saveOptions: {},
        onReset: function() {
            this.loadingFromServer = !1, this.fixNullForDate(), this.trigger("loadingFromServerChanged")
        },
        fixNullForDate: function() {
            var e = this.where({
                archived: !1,
                forDate: null
            });
            e && e.length > 0 && _.each(e, function(e) {
                var t = e.get("createdDate");
                if (t) {
                    var i = Date.parse(t),
                        o = activeDateStringForDate(i),
                        n = getActiveDateString();
                    o != n && e.archive()
                } else e.archive()
            }, focus)
        }
    }), m.views.Focuses = Backbone.View.extend({
        attributes: {
            id: "focuses"
        },
        template: Handlebars.compile($("#focuses-template").html()),
        events: {
            dblclick: "edit",
            "mouseover .todays-focus": "onMouseOver",
            "click .todays-focus": "onClickFocus",
            "click .prompt": "onClickFocus",
            "click .retry": "retryConnection"
        },
        offline: !0,
        loading: !1,
        clickedOnce: !1,
        retrying: !0,
        initialize: function() {
            this.listenTo(m, "newDay", this.changeDay, this), this.listenTo(m, "setNewFocus", this.setNewFocus, this), this.listenTo(m.collect.focuses, "change:archived", this.todayArchived), this.listenTo(m.collect.focuses, "reset", this.collectionReady), this.listenTo(this.collection, "request", this.collectionRequest), this.listenTo(this.collection, "error", this.collectionError), this.listenTo(m.models.customization, "change:focusVisible", this.visibleChanged), this.renderedOnce = !1, this.lastStateFocused = !1, this.focusStateChanged = !0, this.render()
        },
        onMouseOver: function() {
            this.loading && this.displayConnectingText(null, !0)
        },
        onClickFocus: function() {
            this.offline && this.displayConnectingText(null, !0), this.clickedOnce = !0
        },
        visibleChanged: function() {
            var e = m.models.customization.get("focusVisible");
            e ? this.renderedOnce ? this.$el.fadeIn(500) : this.render() : this.$el.fadeOut(500)
        },
        collectionRequest: function() {
            this.loading = !0, this.clickedOnce || this.connectingTextOverride
        },
        displayConnectingText: function(e, t) {
            e && (this.connectingTextOverride = e), this.$el.find(".message").addClass("loading"), this.$el.find(".message").html(this.connectingTextOverride ? this.connectingTextOverride : '<i class="loading-icon"></i>Loading...'), t && this.$el.find(".message").fadeIn(500)
        },
        collectionError: function(e, t) {
            return 200 === t.status ? void this.successfulConnection() : void this.failedConnection()
        },
        retryConnection: function(e) {
            e.preventDefault(), e.stopPropagation(), this.displayConnectingText('<i class="loading-icon"></i>Loading...', !0), this.retrying = !0;
            var t = this;
            m.views.focusPrompt ? m.syncCoordinator.pingApi(function() {
                t.successfulConnection(), m.views.focusPrompt && m.views.focusPrompt.focusControl()
            }, function() {
                t.failedConnection(!0)
            }) : this.collection.fetch({
                reset: !0
            })
        },
        successfulConnection: function() {
            this.loading = !1, this.offline = !1, this.retrying = !1, this.dismissConnectionMessage()
        },
        failedConnection: function(e) {
            this.loading = !1, this.offline = !0, this.render(), this.displayConnectingText('Trouble connecting… <a href="" class="retry">Retry</a>', e || this.clickedOnce)
        },
        dismissConnectionMessage: function() {
            "none" != this.$(".message").css("display") && this.$(".message").fadeOut(500)
        },
        parentReady: function(e) {
            this.isParentReady = !0, (this.isCollectionReady || e) && this.render()
        },
        collectionReady: function() {
            this.isCollectionReady = !0, this.isParentReady && this.render(), this.successfulConnection()
        },
        setNewFocus: function() {
            this.render(!0)
        },
        setFocusState: function(e) {
            this.focusStateChanged = this.lastStateFocused == e ? !1 : !0, this.lastStateFocused = e
        },
        render: function(e) {
            var t = !1;
            m.views.focusPrompt && (t = m.views.focusPrompt.controlFocusedOnce);
            var i = this;
            if (this.renderedOnce) i.$el.find("li").fadeTo(0, 0).remove(), i.$el.find(".prompt").fadeTo(0, 0).remove();
            else {
                var o = (this.options.order || "append") + "To";
                this.$el[o]("#" + this.options.region).fadeTo(0, 0).html(this.template()).fadeTo(500, 1)
            }
            this.renderedOnce = !0;
            var n = null;
            return e || (n = this.collection.activeFocus()), n ? (this.setFocusState(!0), m.views.todayFocus = new m.views.Focus({
                model: n
            }), i.$el.find("ol").append(m.views.todayFocus.render().$el.fadeTo(this.focusStateChanged ? 500 : 0, 1))) : (this.setFocusState(!1), m.views.focusPrompt = new m.views.FocusPrompt({
                collection: this.collection
            }), this.$el.prepend(m.views.focusPrompt.render().$el.fadeIn(this.focusStateChanged ? 500 : 0)), t && m.views.focusPrompt.focusControl()), this
        },
        addToday: function(e) {
            ga("send", "event", "Focus", "Save"), m.views.todayFocus = new m.views.Focus({
                model: e
            }), this.$el.find("ol").append(m.views.todayFocus.render().$el.fadeTo(500, 1))
        },
        successfullyCreatedNewFocus: function() {
            m.views.focuses.successfulConnection(), this.render()
        },
        changeDay: function() {
            m.collect.focuses.fetch({
                reset: !0
            })
        },
        todayArchived: function() {
            this.render()
        },
        edit: function() {}
    }), m.views.FocusPrompt = Backbone.View.extend({
        attributes: {
            "class": "prompt"
        },
        template: Handlebars.compile($("#focus-prompt-template").html()),
        events: {
            "focus input": "handleFocus",
            "keypress input": "handleInput",
            "blur input": "handleBlur"
        },
        initialize: function() {
            this.controlFocusedOnce = !1, this.listenTo(m, "globalEvent:toggleFocus", this.toggleShow), this.listenTo(m, "globalEvent:esc", this.hide), this.render()
        },
        render: function() {
            return this.$el.html(this.template()), this.$input = this.$el.find("input"), this.collection.loadingFromServer || this.$input.focus(), this
        },
        handleFocus: function() {
            this.controlFocusedOnce = !0, m.views.focuses.displayConnectingText()
        },
        focusControl: function() {
            this.$input.focus()
        },
        handleBlur: function() {
            this.controlFocusedOnce = !1, this.$el.removeClass("loading")
        },
        handleInput: function(e) {
            this.collection.loadingFromServer && e.preventDefault(), 13 == e.keyCode && this.save()
        },
        save: function() {
            var e = this.$input[0].value.trim();
            if (e) {
                var t = this;
                m.views.focuses.displayConnectingText('<i class="loading-icon"></i>Saving...', !0);
                var i = getActiveDateString();
                m.collect.focuses.create({
                    focus: e,
                    day: "today",
                    forDate: i
                }, {
                    wait: !0,
                    success: function() {
                        m.views.focuses.successfulConnection(), t.$el.fadeTo(500, 0, function() {
                            t.remove(), m.views.focuses.successfullyCreatedNewFocus()
                        })
                    },
                    error: function() {
                        t.$input.addClass("pulse"), m.views.focuses.failedConnection(!0)
                    }
                })
            }
        },
        toggleShow: function() {
            this.$input.is(":focus") ? this.$input.blur() : this.$input.focus()
        },
        hide: function() {
            this.$input.is(":focus") && this.$input.blur()
        }
    }), m.views.Focus = Backbone.View.extend({
        tagName: "li",
        attributes: {
            "class": "focus"
        },
        template: Handlebars.compile($("#focus-template").html()),
        events: {
            "click .delete": "destroy",
            "click .checkbox": "toggleCompleted"
        },
        initialize: function() {
            this.render(), this.listenTo(this.model, "change", this.render)
        },
        render: function() {
            var e = m.utils.captionFormatter(this.model.get("focus")),
                t = {
                    focus: e,
                    day: "Today"
                };
            return this.$el.html(this.template(t)), this.$el.toggleClass("complete", this.model.get("completed")), this.$el.toggleClass("cached", this.model.get("cached")), this
        },
        destroy: function() {
            if (this.$el.hasClass("complete")) m.trigger("setNewFocus");
            else {
                ga("send", "event", "Focus", "Delete");
                var e = this;
                this.$el.fadeTo(500, 0, function() {
                    e.model.archive(), e.remove()
                })
            }
        },
        toggleCompleted: function() {
            m.views.focuses.displayConnectingText('<i class="loading-icon"></i>Saving...', !1), this.model.toggleCompleted()
        }
    }), m.bootstrappers.InitializeFocus = function() {}, m.bootstrappers.RenderFocus = function(e, t, i) {
        e.conditionalFeatures.checkFeatureAndMigrateData("serverfocus", "focusVisible", "momentum-focus", function() {
            e.collect.focuses = new e.collect.Focuses, e.views.focuses = new e.views.Focuses({
                collection: e.collect.focuses,
                model: e.models.date,
                region: "center-below",
                order: "append"
            }), e.collect.focuses.fetch({
                reset: !0
            }), e.views.focuses.parentReady(i), e.widgets.push(e.views.focuses)
        }, function() {
            e.collect.focuses = new e.collect.FocusesLegacy, e.views.focuses = new e.views.Focuses({
                collection: e.collect.focuses,
                model: e.models.date,
                region: "center-below",
                order: "append"
            }), e.collect.focuses.fetch({
                reset: !0
            }), e.views.focuses.parentReady(i), e.widgets.push(e.views.focuses)
        }, function(t) {
            e.listenToOnce(e.models.customization, "change:focusVisible", t)
        })
    }, m.models.TodoBase = Backbone.Model.extend({
        isTrue: function(e) {
            var t = this.get(e);
            return void 0 === t ? !1 : 1 == t
        },
        getValue: function(e) {
            var t = null;
            return this.attemptedSaveValues && this.attemptedSaveValues.hasOwnProperty(e) && (t = this.attemptedSaveValues[e]), t || (t = this.get(e)), t
        }
    }), m.models.Todo = m.models.TodoBase.extend({
        defaults: function() {
            return {
                title: "empty todo...",
                done: !1,
                archive: !1,
                order: 0,
                createdDate: new Date,
                archivedDate: null,
                completedDate: null,
                deleted: !1,
                deletedDate: null
            }
        },
        saveOptions: function() {
            return this.collection.saveOptions
        },
        archive: function() {
            this.save({
                archive: !0,
                archivedDate: new Date
            }, this.saveOptions())
        },
        "delete": function() {
            this.save({
                deleted: !0,
                deletedDate: new Date
            }, this.saveOptions())
        },
        comparator: "order"
    }), m.models.TodoProxy = m.models.TodoBase.extend({
        defaults: function() {
            return {
                done: !1,
                isProxy: !0,
                isLoading: !0,
                saveFailed: !1,
                proxyValid: !0
            }
        }
    }), m.collect.TodosBase = Backbone.Collection.extend({
        model: m.models.Todo,
        initialize: function() {
            localStorage.showTodoList || (localStorage.showTodoList = !1), this.listenTo(m, "newDay", this.clearCompleted), this.listenTo(this, "reset", this.clearCompleted), this.listenTo(this, "add remove change", this.collectionChanged)
        },
        clearCompleted: function() {
            var e = !1,
                t = this.completeToday();
            return _.each(t, function(t) {
                var i = t.get("completedDate");
                if (i) {
                    var o = Date.parse(i),
                        n = activeDateStringForDate(o);
                    n != getActiveDateString() && (t.archive(), e = !0)
                }
            }), e && this.trigger("reset"), !1
        },
        collectionChanged: function() {
            localStorage.setItem("todos-updated", new Date)
        },
        completeToday: function() {
            return this.where({
                done: !0,
                archive: !1,
                deleted: !1
            })
        },
        activeToday: function() {
            return this.where({
                archive: !1,
                deleted: !1
            })
        },
        done: function() {
            return this.where({
                done: !0
            })
        },
        deleted: function() {
            return this.where({
                deleted: !0
            })
        },
        remaining: function() {
            return this.where({
                archive: !1,
                deleted: !1,
                done: !1
            })
        },
        nextOrder: function() {
            return this.length ? this.last().get("order") + 1 : 1
        },
        comparator: "order",
        create: function(e, t) {
            return void 0 == e.order && (e.order = this.nextOrder()), Backbone.Collection.prototype.create.call(this, e, t)
        }
    }), m.collect.Todos = m.collect.TodosBase.extend({
        url: m.globals.urlRoot + "todos",
        saveOptions: {
            patch: !0
        }
    }), m.collect.TodosLegacy = m.collect.TodosBase.extend({
        localStorage: new Backbone.LocalStorage("momentum-todo"),
        saveOptions: {},
        isLegacy: !0
    }), m.views.Todos = Backbone.View.extend({
        attributes: {
            id: "todo",
            "class": "todo"
        },
        template: Handlebars.compile($("#todo-template").html()),
        offline: !0,
        initialFetchStarted: !1,
        renderedOnce: !1,
        loadedOnce: !1,
        events: {
            "click .todo-list-active": "openList",
            "click .todo-list-chooser": "chooseList",
            "click .todo-toggle": "toggleShow",
            "click .show-completed": "showCompleted",
            "click .retry": "onClickRetry",
            "click #clear-completed": "clearCompleted",
            "keyup #todo-new": "handleInput",
            dragover: "dragover",
            dragend: "dragend"
        },
        initialize: function() {
            this.subViews = [], this.proxyCollection = new Backbone.Collection({
                    model: m.models.TodoProxy
                }), this.show_completed = !1, _.bindAll(this, "addOne", "addAll", "dragover", "dragend", "li_index"), this.render(), this.listenTo(m, "globalEvent:esc", this.hide), this.listenTo(m, "globalEvent:toggleTodo", this.toggleShow),
                this.listenTo(this, "connectionOnline", this.connectionOnline), this.listenTo(this.collection, "add", this.addOne), this.listenTo(this.proxyCollection, "add", this.addOne), this.listenTo(this.collection, "reset", this.collectionReset), this.listenTo(this.collection, "request", this.collectionRequest), this.listenTo(this.collection, "change", this.collectionModelChanged), this.listenTo(this.collection, "error", this.collectionError), this.listenTo(m.models.customization, "change:todoVisible", this.visibleChanged), (this.collection.isLegacy || m.conditionalFeatures.featureEnabled("prefetchtodos")) && this.doFetchIfNeeded(), 1 == JSON.parse(localStorage.showTodoList) && (this.$el.toggleClass("show"), this.doFetchIfNeeded())
        },
        render: function() {
            if (!this.renderedOnce) {
                var e = (this.options.order || "append") + "To";
                this.$el[e]("#" + this.options.region).fadeTo(0, 0).html(this.template()).fadeTo(500, 1), this.$placeholder = $("<li></li>").addClass("placeholder"), this.$placeholder.appendTo(this.el), this.$placeholder.hide(), this.updateTodoCount(), setMaxWidgetHeight(), this.renderedOnce = !0
            }
            return this
        },
        visibleChanged: function() {
            var e = m.models.customization.get("todoVisible");
            e ? this.renderedOnce ? this.$el.fadeIn(500) : this.render() : this.$el.fadeOut(500)
        },
        connectionOnline: function() {
            this.retryConnection()
        },
        doFetch: function() {
            this.initialFetchStarted = !0, this.collection.fetch({
                reset: !0
            })
        },
        doFetchIfNeeded: function() {
            if (!this.initialFetchStarted && (this.doFetch(), m.conditionalFeatures.featureEnabled("localtodonotify"))) {
                var e = this;
                window.addEventListener("storage", function(t) {
                    if (t.key && 0 === t.key.indexOf("todos-updated")) {
                        if (e.fetching) return;
                        e.fetching = !0, e.collection.fetch({
                            success: function() {
                                e.fetching = !1
                            },
                            error: function() {
                                e.fetching = !1
                            },
                            reset: !0
                        })
                    }
                }, !1)
            }
        },
        initializeGreetings: function(e) {
            if (localStorage.greetings) {
                var t = JSON.parse(atob(localStorage.greetings)),
                    e = t.todo;
                e && (e.none && (this.emptyTodoGreetings = e.none), e.completed && (this.completedTodoGreetings = e.completed))
            }
            this.emptyTodoGreetings || (this.emptyTodoGreetings = [{
                caption: "Nothing to do",
                message: "One step at a time, "
            }, {
                caption: "Nothing to do",
                message: "Add a todo to get started, "
            }]), this.completedTodoGreetings || (this.completedTodoGreetings = [{
                caption: "All done",
                message: "Great work, "
            }, {
                caption: "All done",
                message: "Good job, "
            }, {
                caption: "All done",
                message: "You are awesome, "
            }, {
                caption: "All done",
                message: "Good one, "
            }, {
                caption: "All done",
                message: "Good on ya, "
            }, {
                caption: "All done",
                message: "Congratulations, "
            }, {
                caption: "All done",
                message: "You did it, "
            }])
        },
        randomEmptyTodoGreetings: function() {
            if (this.initializeGreetings(), !this.emptyTodoGreeting) {
                var e = Math.floor(Math.random() * this.emptyTodoGreetings.length);
                this.emptyTodoGreeting = this.emptyTodoGreetings.splice(e, 1)[0]
            }
            return this.emptyTodoGreeting
        },
        randomCompletedTodoGreetings: function() {
            if (this.initializeGreetings(), !this.completedTodoGreeting) {
                var e = Math.floor(Math.random() * this.completedTodoGreetings.length);
                this.completedTodoGreeting = this.completedTodoGreetings.splice(e, 1)[0]
            }
            return this.completedTodoGreeting
        },
        addOne: function(e) {
            var t = new m.views.Todo({
                model: e,
                parent: this
            });
            this.subViews.push(t), this.$(".todo-list").append(t.render().el), this.$el.find("#todo-new")[0].scrollIntoView(!1)
        },
        addAll: function() {
            _.each(this.subViews, function(e) {
                e && e.destroy()
            }), this.subViews = [], _.each(this.collection.activeToday(), this.addOne), _.each(this.proxyCollection.where({
                proxyValid: !0
            }), this.addOne), this.successfulConnection()
        },
        displayConnectingText: function(e) {
            e && (this.connectingTextOverride = e), this.$el.find(".todo-count").html(this.connectingTextOverride ? this.connectingTextOverride : '<i class="loading-icon"></i>Loading...'), this.$el.find(".todo-count").fadeIn(500)
        },
        collectionReset: function() {
            this.loadedOnce = !0, this.render(), this.addAll()
        },
        collectionRequest: function(e) {
            this.loadedOnce || this.displayConnectingText('<i class="loading-icon"></i>Loading...')
        },
        collectionError: function(e, t) {
            return 200 === t.status ? void this.successfulConnection() : void this.failedConnection()
        },
        successfulConnection: function() {
            var e = this.offline;
            this.offline = !1, this.dismissConnectionError(), this.checkEmptyPaneState(), e && this.trigger("connectionOnline")
        },
        failedConnection: function(e) {
            this.offline = !0, this.displayConnectingText(e ? e : 'Trouble connecting… <a href="" class="retry">Retry</a>'), this.checkEmptyPaneState()
        },
        handleInput: function(e) {
            13 == e.keyCode && this.createOnEnter(), 27 == e.keyCode && (e.stopPropagation(), this.$el.find("input").blur())
        },
        onClickRetry: function(e) {
            e.preventDefault(), e.stopPropagation(), this.retryConnection()
        },
        retryConnection: function() {
            var e = this;
            this.loadedOnce ? (_.each(this.proxyCollection.where({
                proxyValid: !0,
                saveFailed: !0,
                isLoading: !1
            }), function(t) {
                e.createNewModel(t, !0)
            }), _.each(this.collection.where({
                saveFailed: !0,
                isLoading: !1
            }), function(t) {
                e.saveToModel(t)
            })) : this.collection.fetch({
                reset: !0
            })
        },
        createNewModel: function(e, t) {
            var i = this;
            i.displayConnectingText(t ? '<i class="loading-icon"></i>Retrying...' : '<i class="loading-icon"></i>Saving...'), e.set({
                saveFailed: !1,
                isLoading: !0
            }), i.collection.create({
                title: e.get("title")
            }, {
                wait: !0,
                success: function() {
                    i.successfulConnection(), e.set("proxyValid", !1), ga("send", "event", "Todo", "Add")
                },
                error: function() {
                    i.failedConnection('Error saving… <a href="" class="retry">Retry</a>'), e.set({
                        saveFailed: !0,
                        isLoading: !1
                    })
                }
            })
        },
        saveToModel: function(e, t) {
            var i = this;
            i.displayConnectingText('<i class="loading-icon"></i>Saving...');
            var o = e.saveOptions();
            o.wait = !0, o.success = function() {
                var t = {};
                jQuery.extend(t, e.attemptedSaveValues), e.attemptedSaveValues = null, jQuery.extend(t, {
                    saveFailed: !1,
                    isLoading: !1
                }), setTimeout(function() {
                    e.set(t), i.successfulConnection()
                }, 50)
            }, o.error = function(t, o) {
                if (200 == o.status) {
                    var n = {};
                    jQuery.extend(n, e.attemptedSaveValues), e.attemptedSaveValues = null, jQuery.extend(n, {
                        saveFailed: !1,
                        isLoading: !1
                    }), setTimeout(function() {
                        e.set(n), i.successfulConnection()
                    }, 50)
                } else e.set({
                    saveFailed: !0,
                    isLoading: !1
                }), i.failedConnection('Error saving… <a href="" class="retry">Retry</a>')
            }, t ? (e.attemptedSaveValues ? jQuery.extend(e.attemptedSaveValues, t) : e.attemptedSaveValues = t, e.save(t, o)) : e.attemptedSaveValues && (t = e.attemptedSaveValues, e.save(e.attemptedSaveValues, o)), jQuery.extend(t, {
                saveFailed: !1,
                isLoading: !0
            }), e.set(t)
        },
        createOnEnter: function() {
            var e = this.$el.find("#todo-new")[0].value.trim();
            if (e) {
                var t = this,
                    i = new m.models.TodoProxy({
                        title: e
                    });
                this.proxyCollection.add(i), t.$el.find("#todo-new")[0].value = "", this.createNewModel(i)
            }
        },
        dragover: function(e) {
            return e.preventDefault(), e.stopPropagation(), e.originalEvent.dataTransfer.dropEffect = "move", !1
        },
        dragend: function(e) {
            return e.originalEvent.dataTransfer.dropEffect = "move", e.preventDefault(), e.stopPropagation(), "todo" == this.dragmode && (this.dragging.$el.show(), this.$placeholder.hide(), this.trigger("reorder")), !1
        },
        li_index: function(e) {
            return this.$("li").index(e)
        },
        toggleShow: function(e) {
            e && e.preventDefault(), this.doFetchIfNeeded(), ga("send", "event", "Todo", "Toggle Show"), setMaxWidgetHeight(), $("#todo").toggleClass("show"), localStorage.showTodoList = !JSON.parse(localStorage.showTodoList), this.$el.find("#todo-new").focus()
        },
        showCompleted: function(e) {
            e.preventDefault(), e.stopPropagation(), this.show_completed = !0, this.addAll()
        },
        hide: function() {
            $("#todo").hasClass("show") && this.toggleShow()
        },
        openList: function() {
            this.$el.find(".todo-list-chooser").show()
        },
        chooseList: function() {
            this.$el.find(".todo-list-chooser").hide()
        },
        revealConnectionError: function() {
            "none" === $(".error-message").css("display") && $(".error-message").slideDown("slow")
        },
        dismissConnectionError: function() {
            "none" != $(".error-message").css("display") && $(".error-message").slideUp("slow")
        },
        collectionModelChanged: function() {
            this.checkEmptyPaneState()
        },
        checkEmptyPaneState: function() {
            if (this.offline || this.show_completed) this.$el.find(".todo-pane").removeClass("is-empty");
            else if (0 === this.collection.remaining().length)
                if (this.$el.find(".todo-pane").addClass("is-empty"), 0 === this.collection.completeToday().length) {
                    var e = this.randomEmptyTodoGreetings();
                    this.$(".title").html(e.caption), m.models.customization.get("displayname") && this.$(".description").html(e.message + m.models.customization.get("displayname"))
                } else {
                    var t = this.randomCompletedTodoGreetings();
                    this.$(".title").html(t.caption), m.models.customization.get("displayname") && this.$(".description").html(t.message + m.models.customization.get("displayname") + "!")
                } else this.$el.find(".todo-pane").removeClass("is-empty");
            this.updateTodoCount()
        },
        updateTodoCount: function() {
            if (!this.offline) {
                var e = this.collection.remaining().length;
                switch (e) {
                    case 0:
                        ;
                        break;
                    case 1:
                        ;
                        break;
                    default:
                }
                this.$(".todo-count").html(e + " to do"), this.$(".todo-count").removeClass("pulsetext")
            }
        }
    }), m.views.Todo = Backbone.View.extend({
        tagName: "li",
        template: Handlebars.compile($("#todo-item-template").html()),
        events: {
            "click .toggle": "toggleDone",
            "dblclick .view": "edit",
            "click .destroy": "clear",
            "keyup .edit": "handleInput",
            "blur .edit": "abortEdit",
            "click .error-icon": "retrySave",
            dragstart: "dragstart",
            dragenter: "dragenter",
            dragleave: "dragleave"
        },
        editing: !1,
        initialize: function(e) {
            _.bindAll(this, "dragstart", "dragenter", "dragleave", "saveNewOrder"), this.parent = e.parent, this.listenTo(this.parent, "reorder", this.saveNewOrder), this.listenTo(this.model, "change", this.render)
        },
        render: function() {
            var e = "",
                t = m.utils.captionFormatter(this.model.getValue("title"));
            if (done = this.model.getValue("done"), done) var e = "checked";
            var i = {
                title: t,
                checked: e
            };
            return this.$el.html(this.template(i)), this.$el.toggleClass("done", done), this.$el.toggleClass("loading", this.model.isTrue("isLoading")), this.$el.toggleClass("failed", this.model.isTrue("saveFailed")), this.model.isTrue("isProxy") ? (this.$el.toggle(this.model.isTrue("proxyValid")), this.$el.addClass("isproxy"), this.$el.data("cid", this.model.cid)) : this.$el.prop("draggable", "true"), this
        },
        destroy: function() {
            this.remove(), this.unbind()
        },
        clear: function() {
            ga("send", "event", "Todo", "Delete"), this.model["delete"](), this.$el.hide()
        },
        abortEdit: function() {
            this.editing = !1, this.$el.find(".edit").val(this.model.get("title")), this.$el.removeClass("editing")
        },
        saveEdit: function() {
            this.editing = !1;
            var e = this.$el.find(".edit").val();
            e ? (this.$el.removeClass("editing"), m.views.todos.saveToModel(this.model, {
                title: e
            })) : this.clear()
        },
        retrySave: function() {
            this.model.isTrue("isProxy") ? m.views.todos.createNewModel(this.model, !0) : this.model.attemptedSaveValues && m.views.todos.saveToModel(this.model)
        },
        edit: function() {
            this.$el.hasClass("isproxy") || this.$el.hasClass("loading") || this.$el.hasClass("failed") || (this.editing = !0, this.$el.addClass("editing"), this.$el.find(".edit").focus(), ga("send", "event", "Todo", "Activate Edit"))
        },
        dragstart: function(e) {
            return this.editing ? !1 : (e.originalEvent.dataTransfer.effectAllowed = "move", e.originalEvent.dataTransfer.setData("text", "dummy"), this.parent.dragmode = "todo", this.parent.dragging = this, void ga("send", "event", "Todo", "Reorder"))
        },
        dragenter: function() {
            if ("todo" == this.parent.dragmode) {
                this.parent.dragging.$el.hide(), this.parent.li_index(this.parent.$placeholder) < this.parent.li_index(this.$el) ? this.$el.after(this.parent.$placeholder) : this.$el.before(this.parent.$placeholder);
                var e = this.parent.$placeholder;
                this.parent.$placeholder.css("display", "list-item"), e.height(this.$el.height()), e.after(this.parent.dragging.$el)
            }
        },
        dragleave: function() {},
        saveNewOrder: function() {
            var e = this.parent.li_index(this.$el);
            this.model.save({
                order: e
            }, this.model.saveOptions())
        },
        toggleDone: function() {
            ga("send", "event", "Todo", "Done");
            var e = !this.model.get("done");
            m.views.todos.saveToModel(this.model, {
                done: e,
                completedDate: e ? new Date : null
            })
        },
        handleInput: function(e) {
            13 == e.keyCode && (this.saveEdit(), ga("send", "event", "Todo", "Edit")), 27 == e.keyCode && (e.stopPropagation(), this.$el.find("input").blur())
        }
    }), m.views.TodosComplete = Backbone.View.extend({
        attributes: {
            id: "todo-complete",
            "class": "metric"
        },
        template: Handlebars.compile($("#todo-complete-template").html()),
        initialize: function() {
            this.listenTo(this.collection, "all", this.render), this.render()
        },
        render: function() {
            var e = this.collection.completeToday().length,
                t = "todos";
            1 == e && (t = "todo");
            var i = {
                    done: e,
                    item: t
                },
                o = (this.options.order || "append") + "To";
            return this.$el[o]("#" + this.options.region).html(this.template(i)).fadeTo(500, 1), e ? this.$el.show() : this.$el.hide(), this
        }
    }), m.bootstrappers.RenderTodos = function(e) {
        e.conditionalFeatures.checkFeatureAndMigrateData("servertodos", "todoVisible", "momentum-todo", function() {
            e.collect.todos = new e.collect.Todos, e.views.todos = new e.views.Todos({
                collection: e.collect.todos,
                region: "bottom-right",
                order: "append"
            }), e.widgets.push(e.views.todos), e.views.todosComplete = new e.views.TodosComplete({
                collection: e.collect.todos,
                region: "top-right",
                order: "prepend"
            }), e.widgets.push(e.views.todosComplete)
        }, function() {
            e.collect.todos = new e.collect.TodosLegacy, e.views.todos = new e.views.Todos({
                collection: e.collect.todos,
                region: "bottom-right",
                order: "append"
            }), e.widgets.push(e.views.todos), e.views.todosComplete = new e.views.TodosComplete({
                collection: e.collect.todos,
                region: "top-right",
                order: "prepend"
            }), e.widgets.push(e.views.todosComplete)
        }, function(t) {
            e.listenToOnce(e.models.customization, "change:todoVisible", t)
        })
    }, m.models.Weather = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage("momentum-weather"),
        defaults: {
            location: "",
            woeid: "",
            fetchUnit: "c"
        }
    }), m.views.Weather = Backbone.View.extend({
        attributes: {
            id: "weather",
            "class": "metric weather"
        },
        template: Handlebars.compile($("#weather-template").html()),
        events: {
            "dblclick .metric-stat": "toggleUnit",
            "dblclick .location": "editLocation",
            "keypress .location": "onKeypress",
            "keydown .location": "onKeydown",
            "blur .location": "saveLocation",
            "webkitAnimationEnd .location": "onAnimationEnd"
        },
        initialize: function() {
            this.renderedOnce = !1;
            var e = (this.options.order || "append") + "To";
            this.$el[e]("#" + this.options.region).fadeTo(0, 0), this.listenTo(this.model, "change:updated", this.render), this.listenTo(m.models.customization, "change:temperatureUnit", this.render), this.listenTo(this.model, "change:manualLocation", this.updateWeather), this.updateWeather(), this.render(this.options.unitClass = "hide"), this.listenTo(m.models.customization, "change:weatherVisible", this.visibleChanged);
            setInterval(function() {
                this.updateWeather()
            }.bind(this), 6e5)
        },
        render: function() {
            var e = this.calculateDisplayTemperature(),
                t = {
                    temperature: e,
                    location: this.model.get("location"),
                    unit: this.displayUnit(),
                    condition: this.model.get("condition"),
                    code: this.getConditionFromCode(this.model.get("code")),
                    unitClass: this.options.unitClass
                },
                i = (this.options.order || "append") + "To";
            return this.$el[i]("#" + this.options.region).html(this.template(t)).fadeTo(500, 1), this.$location = this.$(".location"), this.renderedOnce = !0, this
        },
        visibleChanged: function() {
            var e = m.models.customization.get("weatherVisible");
            e ? this.renderedOnce ? this.$el.fadeIn(500) : this.render() : this.$el.fadeOut(500)
        },
        calculateDisplayTemperature: function() {
            var e = this.model.get("fetchTemperature"),
                t = this.model.get("fetchUnit");
            return "c" === this.displayUnit() ? "c" === t ? e : Math.round(5 * (e - 32) / 9) : "c" === t ? Math.round(9 * e / 5 + 32) : e
        },
        displayUnit: function() {
            var e = m.models.customization.get("temperatureUnit");
            return e ? e : "c"
        },
        editLocation: function() {
            this.$el.hasClass("editing") || (this.$location.attr("contenteditable", !0).addClass("editing pulse").focus(), setEndOfContenteditable(this.$location.get(0)))
        },
        onAnimationEnd: function(e) {
            "pulse" === e.originalEvent.animationName && this.$location.removeClass("pulse")
        },
        onKeypress: function(e) {
            13 == e.keyCode && (e.preventDefault(), this.saveLocation())
        },
        onKeydown: function(e) {
            27 === e.keyCode && (this.$location.html(this.model.get("location")), this.doneEditingLocation())
        },
        saveLocation: function() {
            this.model.save("manualLocation", this.$location.html()), this.doneEditingLocation(), ga("send", "event", "Weather", "Set Manual Location")
        },
        doneEditingLocation: function() {
            this.$location.attr("contenteditable", !1).removeClass("editing").addClass("pulse")
        },
        toggleUnit: function() {
            this.options.unitClass = "", "c" === this.displayUnit() ? m.models.customization.save("temperatureUnit", "f") : m.models.customization.save("temperatureUnit", "c")
        },
        setUnit: function(e) {
            var t = ["US", "BM", "BZ", "JM", "PW"];
            t.indexOf(e) >= 0 ? this.model.save("fetchUnit", "f") : this.model.save("fetchUnit", "c")
        },
        updateWeather: function() {
            function e() {
                navigator.geolocation.getCurrentPosition(t, i)
            }

            function t(e) {
                o(e.coords.latitude + "," + e.coords.longitude)
            }

            function i(e) {
                console.log("Error getting location: " + e.code + ", msg: " + e.message), s.model.get("manualLocation") && o("")
            }

            function o(e) {
                s.model.get("manualLocation") && (e = s.model.get("manualLocation"));
                var t = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22" + encodeURIComponent(e) + "%22%20and%20gflags%3D%22R%22&format=json&diagnostics=true&callback=";
                $.getJSON(t, function(e) {
                    var t = e.query.count;
                    if (t > 1) var i = e.query.results.Result[0];
                    else if (1 == t) var i = e.query.results.Result;
                    else {
                        s.$location.append("<br>not found");
                        var i = ""
                    }
                    s.model.get("location") || s.setUnit(i.countrycode), localStorage.country = i.countrycode;
                    var o = i.city,
                        a = i.woeid;
                    s.model.save("location", o), s.model.save("woeid", a), n(a)
                }).error(function() {
                    console.log("Error getting WoeID")
                })
            }

            function n(e) {
                var t = s.displayUnit();
                t || (t = "c");
                var i = "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent("select * from weather.forecast where woeid=" + e + ' and u="' + t + '"') + "&format=json&callback=?";
                $.getJSON(i, function(e) {
                    if (e && e.query && 1 == e.query.count) {
                        var i = e.query.results.channel.item.condition;
                        i && s.model.save({
                            fetchTemperature: i.temp,
                            fetchUnit: t,
                            code: i.code,
                            condition: i.text,
                            updated: new Date
                        })
                    } else console.log("Error getting weather data: Result count not equal to one")
                }).error(function(e) {
                    console.log("Error getting weather data: " + e)
                })
            }
            var s = this;
            e()
        },
        getConditionFromCode: function(e) {
            var t = {};
            return t[0] = "F", t[1] = "F", t[2] = "F", t[3] = "O", t[4] = "P", t[5] = "X", t[6] = "X", t[7] = "X", t[8] = "X", t[9] = "Q", t[10] = "X", t[11] = "R", t[12] = "R", t[13] = "U", t[14] = "U", t[15] = "U", t[16] = "W", t[17] = "X", t[18] = "X", t[19] = "J", t[20] = "M", t[21] = "J", t[22] = "M", t[23] = "F", t[24] = "F", t[25] = "G", t[26] = "Y", t[27] = "I", t[28] = "H", t[29] = "E", t[30] = "H", t[31] = "C", t[32] = "B", t[33] = "C", t[34] = "B", t[35] = "X", t[36] = "B", t[37] = "O", t[38] = "O", t[39] = "O", t[40] = "R", t[41] = "W", t[42] = "U", t[43] = "W", t[44] = "H", t[45] = "O", t[46] = "W", t[47] = "O", t[3200] = ")", t[e]
        }
    }), m.bootstrappers.RenderWeather = function(e) {
        e.conditionalFeatures.checkPreferenceForRender("weatherVisible", function() {
            e.models.weather = new e.models.Weather({
                id: 1
            }), e.models.weather.fetch(), e.views.weather = new e.views.Weather({
                model: e.models.weather,
                region: "top-right",
                order: "append"
            }), e.widgets.push(e.views.weather)
        }, function(t) {
            e.listenToOnce(e.models.customization, "change:weatherVisible", t)
        })
    }, m.models.Message = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage("momentum-message"),
        defaults: {
            title: "",
            message: "",
            views: 0,
            viewLimit: 3,
            visible: !1,
            loginOnClick: !1
        },
        showMessage: function(e, t, i, o) {
            this.save({
                title: e,
                message: t,
                views: 0,
                viewLimit: i,
                visible: !0,
                loginOnClick: o
            })
        },
        showMessageNow: function(e, t, i, o) {
            this.save({
                title: e,
                message: t,
                views: 0,
                viewLimit: i,
                visible: !0,
                loginOnClick: o
            }), m.views.message = new m.views.Message({
                model: this,
                region: "center-above",
                order: "append"
            }), m.widgets.push(m.views.message)
        },
        dismissMessage: function() {
            this.destroy()
        }
    }), m.models.UpdateMessage = Backbone.Model.extend({
        parse: function(e) {
            this.set({
                version: e.version,
                title: e.title,
                message: e.message
            })
        }
    }), m.collect.UpdateMessages = Backbone.Collection.extend({
        model: m.models.UpdateMessage,
        url: "app/messages.json",
        parse: function(e) {
            return e.messages
        }
    }), m.views.Message = Backbone.View.extend({
        id: "message",
        attributes: {
            "class": ""
        },
        template: Handlebars.compile($("#message-template").html()),
        events: {
            "click .hide": "hideMessageClick",
            click: "messageClick"
        },
        initialize: function() {
            this.listenTo(this.model, "add", this.render), this.listenTo(this.model, "change", this.render), this.render()
        },
        render: function() {
            var e = this.model.get("visible");
            if (e) {
                this.incrementViews();
                var t = {
                        title: this.model.get("title"),
                        message: this.model.get("message")
                    },
                    i = (this.options.order || "append") + "To";
                return this.$el[i]("#" + this.options.region).fadeTo(0, 0).html(this.template(t)).fadeTo(500, 1).addClass("softpulse"), this
            }
            var o = this;
            o.$el.fadeTo(1e3, 0, function() {
                o.remove()
            });
            var n = new m.collect.UpdateMessages;
            n.fetch({
                success: function() {
                    var e = chrome.app.getDetails().version,
                        t = n.where({
                            version: e
                        })[0];
                    if (t) {
                        var i = t.get("title"),
                            o = t.get("message");
                        i !== localStorage.lastMessageClickTitle && m.models.message.showMessage(i, o, 5, !1)
                    }
                }
            })
        },
        incrementViews: function() {
            var e = this.model.get("views") + 1;
            e >= this.model.get("viewLimit") ? (localStorage.lastMessageClickTitle = this.model.get("title"), this.model.save({
                visible: !1
            })) : this.model.save({
                views: e
            }, {
                silent: !0
            })
        },
        hideMessageClick: function(e) {
            e.preventDefault(), e.stopPropagation(), localStorage.lastMessageClickTitle = this.model.get("title"), this.model.save({
                visible: !1
            })
        },
        messageClick: function(e) {
            e.preventDefault(), localStorage.lastMessageClickTitle = this.model.get("title");
            var t = this.model.get("loginOnClick");
            t !== !0 || localStorage.token || m.appView.removeAllViews(function() {
                m.views.introduction = new m.views.Introduction({
                    region: "full"
                })
            }), this.model.save({
                visible: !1
            })
        }
    }), m.models.QuickLinks = Backbone.Model.extend({
        defaults: function() {
            return {
                title: "New Link",
                url: "",
                local: !1,
                order: 0
            }
        },
        saveOptions: function() {
            return this.collection.saveOptions
        },
        saveNewOrder: function(e) {
            this.save({
                order: e
            }, this.saveOptions())
        },
        comparator: "order"
    }), m.collect.QuickLinksBase = Backbone.Collection.extend({
        model: m.models.QuickLinks,
        saveOptions: {},
        nextOrder: function() {
            return this.length ? this.last().get("order") + 1 : 1
        },
        comparator: "order"
    }), m.collect.QuickLinks = m.collect.QuickLinksBase.extend({
        url: m.globals.urlRoot + "links",
        saveOptions: {
            patch: !0
        }
    }), m.collect.QuickLinksLegacy = m.collect.QuickLinksBase.extend({
        localStorage: new Backbone.LocalStorage("momentum-quicklinks"),
        isLegacy: !0,
        fetch: function(e) {
            var t = Backbone.Collection.prototype.fetch.call(this, e);
            return 0 !== this.length || localStorage.gmailLinkAdded || (this.create({
                title: "Gmail",
                url: "http://mail.google.com/"
            }), localStorage.gmailLinkAdded = !0), t
        }
    }), m.views.QuickLinks = Backbone.View.extend({
        attributes: {
            id: "quicklinks",
            "class": "quicklinks top-widget"
        },
        template: Handlebars.compile($("#quicklinks-template").html()),
        offline: !0,
        initialFetchStarted: !1,
        events: {
            "click .quicklinks-show": "toggleShow",
            "keypress #quicklinks-new-url": "createLink",
            "keypress #quicklinks-new-title": "createLink",
            "click .add": "showAdd",
            "click .hide": "hideUsageHint",
            "click .local": "handleLocal",
            "click .retry": "retryConnection",
            "click .quicklinks-new": "inputsClicked",
            dragover: "dragover",
            dragend: "dragend"
        },
        initialize: function() {
            this.subViews = [], _.bindAll(this, "addOne", "addAll", "dragover", "dragend", "li_index"), this.renderedOnce = !1, this.render(), this.listenTo(m, "globalEvent:click globalEvent:esc", this.hide), this.listenTo(m, "globalEvent:toggleQuickLinks", this.toggleShow), this.listenTo(this.collection, "add", this.addOne), this.listenTo(this.collection, "reset", this.collectionReset), this.listenTo(this.collection, "error", this.collectionError), this.listenTo(m.models.customization, "change:linksVisible", this.visibleChanged), (this.collection.isLegacy || m.conditionalFeatures.featureEnabled("prefetchlinks")) && this.doFetchIfNeeded()
        },
        render: function() {
            var e = (this.options.order || "append") + "To";
            return this.$placeholder = $("<li></li>").addClass("placeholder"), this.$placeholder.appendTo(this.el), this.$placeholder.hide(), this.$el[e]("#" + this.options.region).html(this.template()).fadeTo(500, 1), this.renderedOnce = !0, this
        },
        destroy: function() {
            this.remove(), this.unbind()
        },
        visibleChanged: function() {
            var e = m.models.customization.get("linksVisible");
            e ? this.renderedOnce ? this.$el.fadeIn(500) : this.render() : this.$el.fadeOut(500)
        },
        doFetch: function() {
            this.initialFetchStarted = !0, this.collection.fetch({
                reset: !0
            })
        },
        doFetchIfNeeded: function() {
            this.initialFetchStarted || this.doFetch()
        },
        hideUsageHint: function(e) {
            e.preventDefault(), e.stopPropagation(), m.models.customization.save({
                linksHintHidden: !0
            }), this.checkUsageHint()
        },
        collectionError: function(e, t) {
            return 200 === t.status ? void this.successfulConnection() : void this.failedConnection()
        },
        showAdd: function(e) {
            e.preventDefault(), e.stopPropagation(), this.$el.find("#quicklinks-new-title").val(""), this.$el.find("#quicklinks-new-url").val(""), this.$el.find(".add").addClass("active"), this.$el.find(".quicklinks-new").toggle().find("#quicklinks-new-title").focus()
        },
        inputsClicked: function(e) {
            e.stopPropagation()
        },
        retryConnection: function(e) {
            e.preventDefault(), e.stopPropagation(), this.collection.fetch({
                reset: !0
            })
        },
        collectionReset: function() {
            this.addAll()
        },
        revealConnectionError: function() {
            "none" === $(".error-message").css("display") && $(".error-message").slideDown("slow")
        },
        dismissConnectionError: function() {
            "none" != $(".error-message").css("display") && $(".error-message").slideUp("slow")
        },
        addOne: function(e) {
            var t = new m.views.QuickLink({
                model: e,
                parent: this
            });
            this.subViews.push(t), this.$(".quicklinks-pane ol").append(t.render().$el)
        },
        addAll: function() {
            this.offline = !1, _.each(this.subViews, function(e) {
                e && e.destroy()
            }), this.subViews = [], this.collection.each(this.addOne), this.successfulConnection()
        },
        successfulConnection: function() {
            this.$el.find(".connection-message").hide(), this.dismissConnectionError(), this.checkUsageHint()
        },
        failedConnection: function() {
            this.$el.find(".connection-message").html('Trouble connecting… <a href="" class="retry">Retry</a>'), this.$el.find(".connection-message").show(), this.checkUsageHint()
        },
        createLink: function(e) {
            if (13 == e.keyCode) {
                var t = this.$el.find("#quicklinks-new-title")[0].value,
                    i = this.$el.find("#quicklinks-new-url")[0].value;
                if (!t) {
                    var o = this;
                    return this.$el.find("#quicklinks-new-title").addClass("pulse"), void _.delay(function() {
                        o.$el.find("#quicklinks-new-title").removeClass("pulse")
                    }, 1e3)
                }
                if (!i) {
                    var o = this;
                    return this.$el.find("#quicklinks-new-url").addClass("pulse"), void _.delay(function() {
                        o.$el.find("#quicklinks-new-url").removeClass("pulse")
                    }, 1e3)
                }
                if (this.offline) return void this.revealConnectionError();
                var n = !1;
                /^chrome|chrome-extension|chrome-search:\/\//i.test(i) && (n = !0), i = ensureUrlScheme(i), ga("send", "event", "Quick Links", "Add");
                var o = this,
                    s = 0;
                if (this.collection.length > 0) {
                    var a = this.collection.max(function(e) {
                        return e.get("order")
                    });
                    s = a.get("order") + 1
                }
                this.collection.create({
                    title: t,
                    url: i,
                    local: n,
                    order: s
                }, {
                    wait: !0,
                    success: function() {
                        o.successfulConnection(), o.$el.find(".add").removeClass("active"), o.$el.find(".quicklinks-new").css("display", "none")
                    },
                    error: function() {
                        o.failedConnection(), o.revealConnectionError()
                    }
                })
            }
        },
        dragover: function(e) {
            return e.preventDefault(), e.stopPropagation(), e.originalEvent.dataTransfer.dropEffect = "move", !1
        },
        dragend: function(e) {
            return e.originalEvent.dataTransfer.dropEffect = "move", e.preventDefault(), e.stopPropagation(), "quicklink" == this.dragmode && (this.dragging.$el.show(), this.$placeholder.hide(), this.trigger("reorder")), !1
        },
        toggleShow: function(e) {
            e && e.preventDefault(), this.doFetchIfNeeded(), ga("send", "event", "Quick Links", "Toggle Show"), setMaxWidgetHeight(), $("#quicklinks").toggleClass("show")
        },
        hide: function(e) {
            !$.contains(this.el, e.target) && $("#quicklinks").hasClass("show") && (e.preventDefault(), $("#quicklinks").removeClass("show"), this.$el.find(".quicklinks-new").css("display", "none"), this.$el.find(".add").removeClass("active"))
        },
        li_index: function(e) {
            return this.$("li").index(e)
        },
        urlInvalid: function() {
            var e = this;
            this.$el.find("#quicklinks-new-url").addClass("pulse"), _.delay(function() {
                e.$el.find("#quicklinks-new-url").removeClass("pulse")
            }, 1e3)
        },
        handleLocal: function(e) {
            e.preventDefault(), ga("send", "event", "Quick Links", "Local Link", e.currentTarget.href), chrome.tabs.update({
                url: e.currentTarget.href
            })
        },
        checkUsageHint: function() {
            var e = m.models.customization.get("linksHintHidden");
            this.offline || e ? this.$el.find(".message").hide() : this.$el.find(".message").show()
        }
    }), m.views.QuickLink = Backbone.View.extend({
        tagName: "li",
        template: Handlebars.compile($("#quicklinks-item-template").html()),
        events: {
            "keypress .todo-input": "updateOnEnter",
            "click .destroy": "delete",
            dragstart: "dragstart",
            dragenter: "dragenter",
            click: "handleClick",
            "click .local": "handleLocal"
        },
        initialize: function(e) {
            _.bindAll(this, "dragstart", "dragenter", "saveNewOrder"), this.parent = e.parent, this.listenTo(this.parent, "reorder", this.saveNewOrder), this.listenTo(this.model, "change", this.render), this.listenTo(this.model, "change:archive destroy", this.remove)
        },
        render: function() {
            var e = this,
                t = m.utils.captionFormatter(this.model.get("title")),
                i = this.model.get("url"),
                o = this.model.get("local"),
                n = new Image;
            return n.src = "http://icons.duckduckgo.com/ip2/encrypted." + detachUrlScheme(i) + ".ico", n.onload = function() {
                var s = {
                    title: t,
                    url: i,
                    local: o
                };
                s.favicon_url = 48 !== n.width ? "http://icons.duckduckgo.com/ip2/encrypted." + detachUrlScheme(i) + ".ico" : "http://icons.duckduckgo.com/ip2/" + detachUrlScheme(i) + ".ico", e.$el.html(e.template(s)), e.$el.prop("draggable", "true")
            }, e
        },
        "delete": function() {
            ga("send", "event", "Quick Links", "Delete", this.model.get("url")), this.model.destroy()
        },
        dragstart: function(e) {
            e.originalEvent.dataTransfer.effectAllowed = "move", e.originalEvent.dataTransfer.setData("text", "dummy"), this.parent.dragmode = "quicklink", this.parent.dragging = this
        },
        dragenter: function() {
            if ("quicklink" == this.parent.dragmode) {
                this.parent.dragging.$el.hide(), this.parent.li_index(this.parent.$placeholder) < this.parent.li_index(this.$el) ? this.$el.after(this.parent.$placeholder) : this.$el.before(this.parent.$placeholder);
                var e = this.parent.$placeholder;
                this.parent.$placeholder.css("display", "list-item"), e.height(this.$el.height()), e.after(this.parent.dragging.$el)
            }
        },
        saveNewOrder: function() {
            var e = this.parent.li_index(this.$el);
            this.model.saveNewOrder(e)
        },
        handleClick: function(e) {
            ga("send", "event", "Quick Links", "Click", this.model.get("url")), e.stopPropagation()
        },
        updateOnEnter: function(e) {
            13 == e.keyCode && this.close($(e.currentTarget).data("field"))
        }
    }), m.bootstrappers.RenderQuickLinks = function(e) {
        e.conditionalFeatures.checkFeatureAndMigrateData("serverlinks", "linksVisible", "momentum-quicklinks", function() {
            e.collect.quicklinks = new e.collect.QuickLinks, e.views.quicklinks = new e.views.QuickLinks({
                collection: e.collect.quicklinks,
                region: "top-left",
                order: "prepend"
            }), e.widgets.push(e.views.quicklinks)
        }, function() {
            e.collect.quicklinks = new e.collect.QuickLinksLegacy, e.views.quicklinks = new e.views.QuickLinks({
                collection: e.collect.quicklinks,
                region: "top-left",
                order: "prepend"
            }), e.widgets.push(e.views.quicklinks)
        }, function(t) {
            e.listenToOnce(e.models.customization, "change:linksVisible", t)
        })
    }, m.views.Gravatar = Backbone.View.extend({
        className: "avatar",
        tagName: "img",
        render: function() {
            var e = this.options.email,
                t = this.options.size,
                i = this.$el.attr({
                    src: "http://www.gravatar.com/avatar/" + md5(e) + "?s=" + t + "&d=mm"
                });
            return this.$el.html(i), this
        }
    }), m.models.Customization = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage("momentum-customization"),
        defaults: {
            linksVisible: !0,
            focusVisible: !0,
            todoVisible: !0,
            weatherVisible: !0,
            quoteVisible: !0,
            searchVisible: !0,
            requestSync: !1
        },
        initialize: function() {
            var e = this;
            e.fetching = !1, this.listenToOnce(this, "sync", this.migrateOldSettings), window.addEventListener("storage", function(t) {
                t.key && 0 === t.key.indexOf("momentum-customization-1") && (e.fetching = !0, e.fetch({
                    success: function() {
                        e.fetching = !1
                    },
                    error: function() {
                        e.fetching = !1
                    },
                    reset: !0
                }))
            }, !1)
        },
        migrateOldSettings: function() {
            if (void 0 === this.get("hour12clock") && (localStorage.hour12clock ? (this.save({
                    hour12clock: JSON.parse(localStorage.hour12clock || !0)
                }), localStorage.removeItem("hour12clock")) : this.save({
                    hour12clock: !0
                })), void 0 === this.get("displayname") && (localStorage.name ? (this.save({
                    displayname: localStorage.name
                }), localStorage.removeItem("name")) : this.save({
                    displayname: null
                })), void 0 === this.get("linksHintHidden") && (localStorage.linksHintHidden ? (this.save({
                    linksHintHidden: JSON.parse(localStorage.linksHintHidden || !1)
                }), localStorage.removeItem("linksHintHidden")) : this.save({
                    linksHintHidden: !1
                })), void 0 === this.get("temperatureUnit")) {
                var e = JSON.parse(localStorage.getItem("momentum-weather-1"));
                if (e) {
                    var t = e.unit;
                    this.save(t ? {
                        temperatureUnit: t
                    } : {
                        temperatureUnit: "c"
                    })
                } else this.save({
                    temperatureUnit: "c"
                })
            }
        }
    }), m.views.Preferences = Backbone.View.extend({
        attributes: {
            id: "preferences"
        },
        template: Handlebars.compile($("#preferences-template").html()),
        events: {
            "click .toggle": "toggleShow"
        },
        initialize: function() {
            this.listenTo(m, "globalEvent:click globalEvent:esc", this.hideTray), this.listenTo(m, "globalEvent:toggleSettings", this.toggleShow), this.renderedOnce = !1, this.render()
        },
        render: function() {
            var e = (this.options.order || "append") + "To";
            this.$el[e]("#" + this.options.region).fadeTo(0, 0).html(this.template()).fadeTo(500, 1), this.renderedOnce = !0
        },
        toggleShow: function(e) {
            e && e.preventDefault(), this.showList(), $("#preferences").toggleClass("show")
        },
        showList: function() {
            var e = new m.views.PreferenceList;
            this.$el.find(".pane").html(e.render().$el)
        },
        showAbout: function() {
            var e = new m.views.PreferenceAbout;
            this.$el.find(".pane").html(e.render().$el), ga("send", "event", "Settings", "About", "Show")
        },
        showCustomize: function() {
            var e = new m.views.PreferenceCustomize({
                model: m.models.customization
            });
            this.$el.find(".pane").html(e.render().$el), ga("send", "event", "Settings", "Customize", "Show")
        },
        handleCtaClick: function(e) {
            var t = m.models.customization.get("requestSync");
            localStorage.token ? t ? e && e() : m.syncCoordinator.submitFeatureAccessRequest("sync-early-access", function() {
                m.models.customization.save({
                    requestSync: !0
                }), e && e()
            }, function() {
                m.models.message.showMessageNow("Account Sync Access Request Failed", "Be sure that you are connected to the Internet and that you're logged into your Momentum Account, then come back to enable this feature.", 2, !1), e && e()
            }) : (m.models.message.showMessageNow("Login required for Account Sync", "You must be logged into your Momentum account to enable Account Sync. Click on this message to create an account or log into your existing account, then come back to enable this feature.", 2, !0), e && e())
        },
        showHelp: function() {
            var e = new m.views.PreferenceHelp;
            this.$el.find(".pane").html(e.render().$el), ga("send", "event", "Settings", "Help", "Show")
        },
        hideTray: function(e) {
            !$.contains(this.el, e.target) && $("#preferences").hasClass("show") && $("#preferences").removeClass("show")
        },
        logout: function() {
            if (ga("send", "event", "Settings", "Logout", "Clicked"), this.toggleShow(), localStorage.token && localStorage.token_uuid) {
                var e = {
                    token: localStorage.token,
                    token_uuid: localStorage.token_uuid
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(e),
                    beforeSend: setMomentumAuthHeader,
                    url: m.globals.urlRootLogin + "user/logout"
                }).done(function(e) {
                    e.success && 1 == e.success && (m.models.message.showMessage("Logged out", "You have been logged out.", 2, !1), localStorage.removeItem("token"), localStorage.removeItem("token_uuid"), m.models.customization.save("requestSync", !1), m.trigger("user:successfulLogout"), m.views.preferences.render())
                }).fail(function() {
                    m.models.message.showMessage("Problem Logging out", "You have not been logged out.", 15, !1)
                })
            } else localStorage.removeItem("token"), m.trigger("user:successfulLogout"), msg.success && 1 == msg.success && m.models.message.showMessage("Logged out", "You have been logged out.", 12, !1), this.render()
        }
    }), m.views.PreferenceList = Backbone.View.extend({
        id: "preferences-list",
        tagName: "ul",
        className: "content light",
        template: Handlebars.compile($("#preferences-list-template").html()),
        preferences: [],
        events: {
            "click #preferences-logout": "logoutClicked",
            "click .preferences-item": "preferenceItemClicked",
            "click .cta": "ctaClicked"
        },
        render: function() {
            var e = this;
            context = {
                preferences: [{
                    id: "preferences-customize",
                    name: "Customize",
                    action: function() {
                        m.views.preferences.showCustomize()
                    }
                }, {
                    id: "preferences-about",
                    name: "About",
                    action: function() {
                        m.views.preferences.showAbout()
                    }
                }, {
                    id: "preferences-help",
                    name: "Help",
                    action: function() {
                        m.views.preferences.showHelp()
                    }
                }]
            }, m.conditionalFeatures.featureEnabled("serverfocus") || m.conditionalFeatures.featureEnabled("servertodos") || m.conditionalFeatures.featureEnabled("serverlinks") ? (context.ctaCaption = "Account Sync Enabled", context.ctaDescription = "Your account will now sync") : m.models.customization.get("requestSync") && localStorage.token ? (context.ctaCaption = "Account Sync Requested", context.ctaDescription = "We'll notify you when activated") : (context.ctaCaption = "Request Account Sync", context.ctaDescription = "Join the account sync beta");
            var t = !!localStorage.token;
            return t ? (context.preferences.push({
                id: "preferences-logout",
                name: "Logout"
            }), loggedInItem = new m.views.PreferenceLoggedInItem, this.$el.html(loggedInItem.render().$el), this.$el.append(this.template(context))) : (loggedOutItem = new m.views.PreferenceLoggedOutItem, this.$el.html(loggedOutItem.render().$el), this.$el.append(this.template(context))), this.preferences = {}, _.each(context.preferences, function(t) {
                e.preferences[t.id] = t
            }), this
        },
        preferenceItemClicked: function(e) {
            var t = e.target.id,
                i = this.preferences[t];
            i && i.action && (e.preventDefault(), e.stopPropagation(), i.action())
        },
        aboutClicked: function(e) {
            e.preventDefault(), e.stopPropagation(), this.remove(), m.views.preferences.showAbout()
        },
        customizeClicked: function(e) {
            e.preventDefault(), e.stopPropagation(), this.remove(), m.views.preferences.showCustomize()
        },
        helpClicked: function(e) {
            e.preventDefault(), e.stopPropagation(), this.remove(), m.views.preferences.showHelp()
        },
        logoutClicked: function(e) {
            e.preventDefault(), e.stopPropagation(), m.views.preferences.logout()
        },
        ctaClicked: function(e) {
            e.preventDefault(), e.stopPropagation();
            var t = this;
            m.views.preferences.handleCtaClick(function() {
                t.render()
            })
        }
    }), m.views.PreferenceLoggedOutItem = Backbone.View.extend({
        className: "user loggedOut",
        tagName: "li",
        events: {
            click: "clicked"
        },
        render: function() {
            return html = '<a href="">Login</a>', this.$el.html(html), this
        },
        clicked: function(e) {
            e.preventDefault(), m.appView.removeAllViews(function() {
                m.views.introduction = new m.views.Introduction({
                    region: "full"
                })
            }), ga("send", "event", "Settings", "Login", "Clicked")
        }
    }), m.views.PreferenceLoggedInItem = Backbone.View.extend({
        className: "user loggedin",
        tagName: "li",
        render: function() {
            var e = m.models.customization.get("displayname"),
                t = localStorage.email || "",
                i = new m.views.Gravatar({
                    email: t,
                    size: 50
                });
            return this.$el.append(i.render().$el), this.$el.append(e), this
        }
    }), m.views.PreferenceAbout = Backbone.View.extend({
        className: "about",
        id: "preferences-about",
        template: Handlebars.compile($("#preferences-about-template").html()),
        events: {
            "click #preferences-back": "back"
        },
        render: function() {
            var e = {
                version: m.globals.version
            };
            return this.$el.html(this.template(e)), this
        },
        back: function(e) {
            e.preventDefault(), e.stopPropagation(), this.remove(), m.views.preferences.showList()
        }
    }), m.views.PreferenceHelp = Backbone.View.extend({
        className: "help",
        id: "preferences-help",
        template: Handlebars.compile($("#preferences-help-template").html()),
        events: {
            "click #preferences-back": "back"
        },
        render: function() {
            var e = {
                version: m.globals.version
            };
            return this.$el.html(this.template(e)), this
        },
        back: function(e) {
            e.preventDefault(), e.stopPropagation(), this.remove(), m.views.preferences.showList()
        }
    }), m.views.PreferenceCustomize = Backbone.View.extend({
        className: "customize",
        id: "preferences-customize",
        template: Handlebars.compile($("#preferences-customize-template").html()),
        events: {
            "click #preferences-back": "back",
            "click .slide-toggle": "toggle"
        },
        initialize: function() {
            this.listenTo(m.models.customization, "change", this.customizationModelChanged)
        },
        render: function() {
            this.model.get("focusVisible"), this.model.get("linksVisible"), this.model.get("todoVisible"), this.model.get("weatherVisible"), this.model.get("quoteVisible"), this.model.get("searchVisible");
            return context = {
                customizeItems: [{
                    name: "Show Focus",
                    widget: "focusVisible"
                }, {
                    name: "Show Quick Links",
                    widget: "linksVisible"
                }, {
                    name: "Show Todo",
                    widget: "todoVisible"
                }, {
                    name: "Show Weather",
                    widget: "weatherVisible"
                }, {
                    name: "Show Quote",
                    widget: "quoteVisible"
                }, {
                    name: "Show Search",
                    widget: "searchVisible"
                }]
            }, this.$el.html(this.template(context)), this.updateControlStates(_.pluck(context.customizeItems, "widget")), this
        },
        customizationModelChanged: function(e) {
            var t = e.changedAttributes(),
                i = _.keys(t);
            this.updateControlStates(i)
        },
        updateControlStates: function(e) {
            var t = this;
            _.each(e, function(e) {
                var i = t.$el.find("[data-related-widget='" + e + "']");
                if (i && 1 === i.length) {
                    var o = i.first();
                    o.toggleClass("on", t.model.get(e))
                }
            })
        },
        back: function(e) {
            e.preventDefault(), e.stopPropagation(), this.remove(), m.views.preferences.showList()
        },
        toggle: function(e) {
            e.stopPropagation();
            var t = $(e.currentTarget).attr("data-related-widget");
            switch (t) {
                case "focusVisible":
                    var i = !this.model.get("focusVisible");
                    this.model.save({
                        focusVisible: i
                    }), ga("send", "event", "Customize", "Focus", i);
                    break;
                case "linksVisible":
                    var i = !this.model.get("linksVisible");
                    this.model.save({
                        linksVisible: i
                    }), ga("send", "event", "Customize", "Quick Links", i);
                    break;
                case "todoVisible":
                    var i = !this.model.get("todoVisible");
                    this.model.save({
                        todoVisible: i
                    }), ga("send", "event", "Customize", "Todo", i);
                    break;
                case "weatherVisible":
                    var i = !this.model.get("weatherVisible");
                    this.model.save({
                        weatherVisible: i
                    }), ga("send", "event", "Customize", "Weather", i);
                    break;
                case "quoteVisible":
                    var i = !this.model.get("quoteVisible");
                    this.model.save({
                        quoteVisible: i
                    }), ga("send", "event", "Customize", "Quote", i);
                    break;
                case "searchVisible":
                    var i = !this.model.get("searchVisible");
                    this.model.save({
                        searchVisible: i
                    }), ga("send", "event", "Customize", "Search", i)
            }
        }
    }), m.views.Introduction = Backbone.View.extend({
        attributes: {
            id: "introduction",
            "class": "light"
        },
        template: Handlebars.compile($("#introduction-template").html()),
        initialize: function() {
            this.activeView = null, this.render()
        },
        render: function() {
            var e = (this.options.order || "append") + "To";
            this.$el[e]("#" + this.options.region).fadeTo(0, 0).html(this.template()).fadeTo(1e3, 1), m.models.customization.get("displayname") ? this.promptForEmail() : this.promptForName()
        },
        promptForName: function() {
            ga("send", "event", "Introduction", "Name", "Show"), m.views.namePrompt = new m.views.NamePrompt, this.activeView = m.views.namePrompt, this.$el.find(".content").append(m.views.namePrompt.render().$el.fadeTo(1e3, 1)), this.$el.find("#introduction-input").focus()
        },
        promptForEmail: function() {
            ga("send", "event", "Introduction", "Email", "Show"), m.views.emailPrompt = new m.views.EmailPrompt, this.activeView = m.views.emailPrompt, this.$el.find(".content").append(m.views.emailPrompt.render().$el.fadeTo(1e3, 1)), this.$el.find("#introduction-input").focus()
        },
        promptForPaswordLogin: function() {
            ga("send", "event", "Introduction", "Password For Login", "Show"), m.views.loginPasswordPrompt = new m.views.LoginPasswordPrompt, this.activeView = m.views.loginPasswordPrompt, this.$el.find(".content").append(m.views.loginPasswordPrompt.render().$el.fadeTo(1e3, 1)), this.$el.find("#introduction-input").focus()
        },
        promptForPaswordCreate: function() {
            ga("send", "event", "Introduction", "Password For Create", "Show"), m.views.createPasswordPrompt = new m.views.CreatePasswordPrompt, this.activeView = m.views.createPasswordPrompt, this.$el.find(".content").append(m.views.createPasswordPrompt.render().$el.fadeTo(1e3, 1)), this.$el.find("#introduction-input").focus()
        },
        promptForPaswordReset: function() {
            ga("send", "event", "Introduction", "Password For Reset", "Show"), m.views.resetPasswordPrompt = new m.views.ResetPasswordPrompt, this.activeView = m.views.resetPasswordPrompt, this.$el.find(".content").append(m.views.resetPasswordPrompt.render().$el.fadeTo(1e3, 1)), this.$el.find("#introduction-input").focus()
        },
        doneIntroductionWithMessage: function() {
            this.$el.fadeTo(1e3, 0, function() {
                m.appView.render(!0)
            })
        },
        showLoading: function() {
            this.$el.find(".tip").html('<div class="loading"><span class="loading-icon"></span>Loading...</div>').css("opacity", "0").fadeTo(500, 1)
        },
        hideLoading: function() {}
    }), m.views.NamePrompt = Backbone.View.extend({
        tagName: "span",
        template: Handlebars.compile($("#introduction-content-template").html()),
        events: {
            "keypress input": "updateOnEnter"
        },
        render: function() {
            var e = "Hello, what's your name?",
                t = {
                    message: e
                };
            return this.$el.html(this.template(t)), this
        },
        updateOnEnter: function(e) {
            13 == e.keyCode && this.save()
        },
        save: function() {
            ga("send", "event", "Introduction", "Name", "Submit");
            var e = this,
                t = this.$el.find("input")[0].value.trim();
            t.length < 1 || (m.models.customization.save({
                displayname: t
            }), this.$el.fadeTo(1e3, 0, function() {
                e.remove(), m.views.introduction.promptForEmail()
            }))
        }
    }), m.views.EmailPrompt = Backbone.View.extend({
        tagName: "span",
        template: Handlebars.compile($("#introduction-content-template").html()),
        events: {
            "keypress input": "updateOnEnter"
        },
        initialize: function() {
            this.listenTo(m, "globalEvent:esc", this.handleBack), this.loading = !1
        },
        render: function() {
            var e = this,
                t = "What's your email, " + m.models.customization.get("displayname") + "?",
                i = {
                    message: t
                },
                o = new m.views.IntroductionButton({
                    value: "Stay logged out",
                    clicked: function() {
                        return e.stayOffline()
                    }
                });
            return this.$el.html(this.template(i)), this.$el.find(".buttons").append("Or would you rather stay logged out?").append(o.render().$el), this.$el.find("input")[0].focus(), this
        },
        handleBack: function() {
            ga("send", "event", "Introduction", "Email", "Escape Pressed"), this.stayOffline()
        },
        updateOnEnter: function(e) {
            13 == e.keyCode && this.checkEmail()
        },
        stayOffline: function() {
            ga("send", "event", "Introduction", "Email", "Stay Offline Clicked"), localStorage.stayOffline = !0, m.views.introduction.doneIntroductionWithMessage()
        },
        checkEmail: function() {
            ga("send", "event", "Introduction", "Email", "Submit");
            var e = this,
                t = this.$el.find("input")[0].value.trim();
            if (!(t.length < 1)) {
                var i = validateEmail(t);
                if (!i) {
                    var o = new m.views.IntroductionTip({
                        value: "Sorry, " + t + " doesn't seem to be a valid email address. Please try again."
                    });
                    return void this.$el.find(".tip").html(o.render().$el.fadeTo(500, 1))
                }
                e.loading || (e.loading = !0, localStorage.email = t, m.views.introduction.showLoading(), $.ajax({
                    type: "HEAD",
                    url: m.globals.urlRootLogin + "user/" + t
                }).done(function() {
                    e.$el.fadeTo(1e3, 0, function() {
                        e.remove(), m.views.introduction.promptForPaswordLogin()
                    })
                }).fail(function(t) {
                    404 === t.status && e.$el.fadeTo(1e3, 0, function() {
                        e.remove(), m.views.introduction.promptForPaswordCreate()
                    })
                }).always(function() {
                    m.views.introduction.hideLoading(), e.loading = !1
                }))
            }
        }
    }), m.views.LoginPasswordPrompt = Backbone.View.extend({
        tagName: "span",
        template: Handlebars.compile($("#introduction-content-template").html()),
        events: {
            "keypress input": "updateOnEnter"
        },
        initialize: function() {
            this.listenTo(m, "globalEvent:esc", this.handleBack), this.loading = !1
        },
        render: function() {
            var e = this,
                t = "What's your password?",
                i = {
                    message: t
                },
                o = new m.views.IntroductionButton({
                    value: "Use a different email address",
                    clicked: function() {
                        return e.changeEmail()
                    }
                }),
                n = new m.views.IntroductionButton({
                    value: "Change your password",
                    clicked: function() {
                        return e.resetPassword()
                    }
                });
            return this.$el.html(this.template(i)), this.$el.find(".buttons").append(o.render().$el), this.$el.find(".buttons").append(n.render().$el), this.$el.find("input").attr("type", "password").focus(), this
        },
        handleBack: function(e) {
            ga("send", "event", "Introduction", "Password For Login", "Escape Pressed"), this.changeEmail(e)
        },
        updateOnEnter: function(e) {
            13 == e.keyCode && this.login()
        },
        changeEmail: function() {
            ga("send", "event", "Introduction", "Password For Login", "Change Email Clicked");
            var e = this;
            e.$el.fadeTo(1e3, 0, function() {
                e.remove(), m.views.introduction.promptForEmail()
            })
        },
        resetPassword: function() {
            ga("send", "event", "Introduction", "Password For Login", "Reset Password Clicked");
            var e = this;
            e.$el.fadeTo(1e3, 0, function() {
                e.remove(), m.views.introduction.promptForPaswordReset()
            })
        },
        login: function() {
            ga("send", "event", "Introduction", "Password For Login", "Submit");
            var e = this,
                t = localStorage.email,
                i = this.$el.find("input")[0].value;
            if (i.length < 6) {
                var o = new m.views.IntroductionTip({
                    value: "Passwords need to be at least 6 characters long."
                });
                return void e.$el.find(".tip").html(o.render().$el.fadeTo(500, 1))
            }
            e.loading || (e.loading = !0, m.views.introduction.showLoading(), $.ajax({
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    username: t,
                    password: i
                }),
                beforeSend: setMomentumAuthHeader,
                url: m.globals.urlRootLogin + "user/authenticate"
            }).done(function(e) {
                e.token && (m.models.message.dismissMessage(), localStorage.token = e.token, e.token_uuid && (localStorage.token_uuid = e.token_uuid), e.features && m.conditionalFeatures.setFeatures(e.features), m.trigger("user:successfulLogin", function() {
                    m.views.introduction.doneIntroductionWithMessage()
                }))
            }).fail(function(t) {
                if (400 === t.status) {
                    var i = new m.views.IntroductionTip({
                        value: "The password you entered for the email " + localStorage.email + " isn't right."
                    });
                    e.$el.find(".tip").html(i.render().$el.fadeTo(500, 1))
                } else m.views.introduction.doneIntroductionWithMessage()
            }).always(function() {
                m.views.introduction.hideLoading(), e.loading = !1
            }))
        }
    }), m.views.CreatePasswordPrompt = Backbone.View.extend({
        tagName: "span",
        template: Handlebars.compile($("#introduction-content-template").html()),
        events: {
            "keypress input": "updateOnEnter"
        },
        initialize: function() {
            this.listenTo(m, "globalEvent:esc", this.handleBack), this.loading = !1
        },
        render: function() {
            var e = this,
                t = "Please choose a password.",
                i = {
                    message: t
                },
                o = new m.views.IntroductionButton({
                    value: "Use a different email address",
                    clicked: function() {
                        return e.changeEmail()
                    }
                });
            return this.$el.html(this.template(i)), this.$el.find("input").attr("type", "password").focus(), this.$el.find(".buttons").append(o.render().$el), this
        },
        updateOnEnter: function(e) {
            13 == e.keyCode && this.create()
        },
        handleBack: function(e) {
            ga("send", "event", "Introduction", "Password For Create", "Escape Pressed"), this.changeEmail(e)
        },
        changeEmail: function() {
            ga("send", "event", "Introduction", "Password For Create", "Change Email Clicked");
            var e = this;
            e.$el.fadeTo(1e3, 0, function() {
                e.remove(), m.views.introduction.promptForEmail()
            })
        },
        create: function() {
            ga("send", "event", "Introduction", "Password For Create", "Submit");
            var e = this,
                t = localStorage.email,
                i = this.$el.find("input")[0].value;
            if (i.length < 6) {
                var o = new m.views.IntroductionTip({
                    value: "Passwords need to be at least 6 characters long."
                });
                return void e.$el.find(".tip").html(o.render().$el.fadeTo(500, 1))
            }
            e.loading || (e.loading = !0, m.views.introduction.showLoading(), $.ajax({
                type: "POST",
                contentType: "application/json",
                beforeSend: setMomentumAuthHeader,
                data: JSON.stringify({
                    name: m.models.customization.get("displayname"),
                    email: t,
                    password: i,
                    version: m.globals.version
                }),
                url: m.globals.urlRootLogin + "user/register"
            }).done(function(e) {
                e.token ? (localStorage.token = e.token, e.token_uuid && (localStorage.token_uuid = e.token_uuid)) : e.first_time_key && (localStorage.first_time_key = e.first_time_key, localStorage.next_login_attempt = Date.now(), e.token_uuid && (localStorage.token_uuid = e.token_uuid)), m.models.message.showMessage("Account almost ready", "Your activation email should arrive in a few moments.", 10, !1), m.views.introduction.doneIntroductionWithMessage()
            }).fail(function() {}).always(function() {
                m.views.introduction.hideLoading(), e.loading = !1
            }))
        }
    }), m.views.ResetPasswordPrompt = Backbone.View.extend({
        tagName: "span",
        template: Handlebars.compile($("#introduction-content-template").html()),
        events: {
            "keypress input": "updateOnEnter"
        },
        initialize: function() {
            this.listenTo(m, "globalEvent:esc", this.handleBack), this.loading = !1
        },
        render: function() {
            var e = this,
                t = "What would you like your new password to be?",
                i = {
                    message: t
                },
                o = new m.views.IntroductionButton({
                    value: "Use a different email address",
                    clicked: function() {
                        return e.changeEmail()
                    }
                });
            return this.$el.html(this.template(i)), this.$el.find(".buttons").append("Changing password for " + localStorage.email).append(o.render().$el), this.$el.find("input").attr("type", "password").focus(), this
        },
        handleBack: function(e) {
            ga("send", "event", "Introduction", "Password For Reset", "Escape Pressed"), this.changeEmail(e)
        },
        changeEmail: function() {
            ga("send", "event", "Introduction", "Password For Reset", "Change Email Clicked");
            var e = this;
            e.$el.fadeTo(1e3, 0, function() {
                e.remove(), m.views.introduction.promptForEmail()
            })
        },
        updateOnEnter: function(e) {
            13 == e.keyCode && this.reset()
        },
        reset: function() {
            ga("send", "event", "Introduction", "Password For Reset", "Submit");
            var e = this,
                t = localStorage.email,
                i = this.$el.find("input")[0].value;
            if (i.length < 6) {
                var o = new m.views.IntroductionTip({
                    value: "Passwords need to be at least 6 characters long."
                });
                return void e.$el.find(".tip").html(o.render().$el.fadeTo(500, 1))
            }
            e.loading || (e.loading = !0, m.views.introduction.showLoading(), $.ajax({
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    name: m.models.customization.get("displayname"),
                    email: t,
                    password: i
                }),
                beforeSend: setMomentumAuthHeader,
                url: m.globals.urlRootLogin + "user/forgot"
            }).done(function() {
                m.models.message.showMessage("Password change started", "Check your email to change your password. Your password change email may take a few moments to arrive.", 10, !1), m.views.introduction.doneIntroductionWithMessage()
            }).fail(function() {}).always(function() {
                e.loading = !1, m.views.introduction.hideLoading()
            }))
        }
    }), m.views.IntroductionTip = Backbone.View.extend({
        template: Handlebars.compile($("#introduction-tip-template").html()),
        render: function() {
            var e = {
                value: this.options.value
            };
            return this.setElement($($.trim(this.template(e)))), this
        }
    }), m.views.IntroductionButton = Backbone.View.extend({
        template: Handlebars.compile($("#introduction-button-template").html()),
        events: {
            click: "clicked"
        },
        render: function() {
            var e = {
                value: this.options.value
            };
            return this.setElement($($.trim(this.template(e)))), this
        },
        clicked: function() {
            this.options.clicked()
        }
    }), m.isValidDate = function(e) {
        return "[object Date]" !== Object.prototype.toString.call(e) ? !1 : !isNaN(e.getTime())
    }, m.models.Date = Backbone.Model.extend({
        defaults: function() {
            var e = new Date;
            return {
                date: e
            }
        },
        initialize: function() {
            this.listenTo(this, "change:date", this.updateTime, this)
        },
        getTimeString: function(e) {
            var t = m.models.customization.get("hour12clock");
            e = e || this.get("date");
            var i = e.getHours(),
                o = e.getMinutes();
            return 1 == t && (i = (i + 11) % 12 + 1), 10 > i && !t && (i = "0" + i), 10 > o && (o = "0" + o), i + ":" + o
        },
        getTimePeriod: function() {
            return this.get("date").getHours() >= 12 ? "PM" : "AM"
        },
        updateTime: function() {
            var e = this.getTimeString();
            this.get("time") != e && this.set("time", e)
        }
    }), m.views.CenterClock = Backbone.View.extend({
        id: "centerclock",
        template: Handlebars.compile($("#centerclock-template").html()),
        events: {
            dblclick: "toggleFormat"
        },
        initialize: function() {
            this.render(), this.listenTo(this.model, "change:time", this.updateTime, this)
        },
        render: function() {
            var e = this.model.getTimeString(),
                t = {
                    time: e
                },
                i = (this.options.order || "append") + "To";
            this.$el[i]("#" + this.options.region).fadeTo(0, 0).html(this.template(t)).fadeTo(500, 1), this.$time = this.$(".time"), this.$format = this.$(".format")
        },
        toggleFormat: function() {
            var e = m.models.customization.get("hour12clock");
            e = !e, m.models.customization.save({
                hour12clock: e
            }), e ? (setTimeout(function() {
                $(".format").addClass("show")
            }, 40), this.$format.html(this.model.getTimePeriod())) : $(".format").removeClass("show")
        },
        updateTime: function() {
            this.$time.html(this.model.getTimeString())
        }
    }), m.views.Greeting = Backbone.View.extend({
        id: "greeting",
        template: Handlebars.compile($("#greeting-template").html()),
        events: {
            "dblclick .name": "editName",
            "keypress .name": "onKeypress",
            "keydown .name": "onKeydown",
            "blur .name": "saveName",
            "webkitAnimationEnd .name": "onAnimationEnd"
        },
        initialize: function() {
            this.render(), this.listenTo(this.model, "change:time", this.updatePeriod, this), this.listenTo(m.models.customization, "change:displayname", this.onUpdateName)
        },
        render: function() {
            var e = this.getPeriod(),
                t = m.models.customization.get("displayname"),
                i = {
                    period: e,
                    name: t
                },
                o = (this.options.order || "append") + "To";
            this.$el[o]("#" + this.options.region).fadeTo(0, 0).html(this.template(i)).fadeTo(500, 1), this.$period = this.$(".period"), this.$name = this.$(".name")
        },
        getPeriod: function() {
            var e, t = this.model.get("date"),
                i = t.getHours();
            return i >= 3 && 12 > i && (e = "morning"), i >= 12 && 17 > i && (e = "afternoon"), (i >= 17 || 3 > i) && (e = "evening"), e
        },
        updatePeriod: function() {
            this.$period.html(this.getPeriod())
        },
        editName: function() {
            this.$name.hasClass("editing") || (this.$name.attr("contenteditable", !0).addClass("editing pulse").focus(), setEndOfContenteditable(this.$name.get(0)))
        },
        onUpdateName: function() {
            this.$name.html(m.models.customization.get("displayname")), this.$name.attr("contenteditable", !1).addClass("pulse")
        },
        onAnimationEnd: function(e) {
            "pulse" === e.originalEvent.animationName && this.$name.removeClass("pulse")
        },
        onKeypress: function(e) {
            13 == e.keyCode && (e.preventDefault(), this.saveName())
        },
        onKeydown: function(e) {
            27 === e.keyCode && (this.$name.html(m.models.customization.get("displayname")), this.doneEditingName())
        },
        saveName: function() {
            var e = this.$name.html();
            "" === e ? this.$name.html(m.models.customization.get("displayname")) : m.models.customization.save({
                displayname: e
            }), this.doneEditingName()
        },
        doneEditingName: function() {
            this.$name.attr("contenteditable", !1).removeClass("editing").addClass("pulse")
        }
    }), m.views.Dashboard = Backbone.View.extend({
        initialize: function() {
            m.widgets = [], m.addins = [], m.models.customization = new m.models.Customization({
                id: 1
            }), m.models.customization.fetch({
                error: function() {
                    m.models.customization.save()
                }
            }), this.listenTo(m, "processAddIns", this.processAddIns), m.models.date = new m.models.Date, m.collect.backgrounds = new m.collect.Backgrounds, m.collect.legacyBackgrounds = new m.collect.LegacyBackgrounds, m.models.activeBackground = new m.models.ActiveBackground({}, {
                backgrounds: m.collect.backgrounds,
                legacyBackgrounds: m.collect.legacyBackgrounds
            }), m.views.background = new m.views.Background({
                model: m.models.activeBackground,
                region: "background"
            }), m.views.backgroundInfo = new m.views.BackgroundInfo({
                model: m.models.activeBackground,
                region: "bottom-left"
            }), m.collect.backgrounds.fetch({
                reset: !0
            }), m.collect.legacyBackgrounds.fetch({
                reset: !0
            }), m.models.message = new m.models.Message({
                id: 1
            }), m.models.message.fetch(), m.bootstrappers.InitializeFocus(m, $), m.bootstrappers.InitializeQuote(m, $), this.dateIntervalId = setInterval(function() {
                m.models.date.set("date", new Date)
            }, 100), this.newDayIntervalId = setInterval(function() {
                localStorage.activeDate ? localStorage.activeDate != getActiveDateString() && (localStorage.activeDate = getActiveDateString(), m.trigger("newDay")) : localStorage.activeDate = getActiveDateString()
            }, 1e3), m.models.customization.get("displayname") ? this.render() : m.views.introduction = new m.views.Introduction({
                region: "full"
            }), this.initializeCompleted = !0
        },
        processAddIns: function() {
            var e = this;
            e.processAddInsIntervalId = setInterval(function() {
                if (e.initializeCompleted)
                    for (clearInterval(e.processAddInsIntervalId), i = 0; i < m.addins.length; i++) try {
                        m.addins[i](m, $)
                    } catch (t) {
                        console.log(t)
                    }
            }, 50)
        },
        render: function(e) {
            m.bootstrappers.RenderQuote(m, $, e), m.bootstrappers.RenderFocus(m, $, e), m.views.backgroundInfo && (m.views.backgroundInfo.parentReady(e), m.widgets.push(m.views.backgroundInfo)), m.views.preferences = new m.views.Preferences({
                region: "bottom-left",
                order: "prepend"
            }), m.widgets.push(m.views.preferences), m.bootstrappers.RenderSearch(m, $), m.bootstrappers.RenderQuickLinks(m, $), m.views.greeting = new m.views.Greeting({
                model: m.models.date,
                region: "center",
                order: "prepend"
            }), m.widgets.push(m.views.greeting), m.views.centerClock = new m.views.CenterClock({
                model: m.models.date,
                region: "center",
                order: "prepend"
            }), m.widgets.push(m.views.centerClock), m.bootstrappers.RenderTodos(m, $), m.bootstrappers.RenderWeather(m, $), m.models.message = new m.models.Message({
                id: 1
            }), m.models.message.fetch(), m.views.message = new m.views.Message({
                model: m.models.message,
                region: "center-above",
                order: "append"
            }), m.widgets.push(m.views.message)
        },
        getViewById: function(e) {
            var t = null;
            return _.each(m.widgets, function(i) {
                i.el.id === e && (t = i)
            }), t
        },
        removeView: function(e) {
            _.each(m.widgets, function(t) {
                t.el.id === e && t.$el.fadeTo(500, 0, function() {
                    t.remove(), m.widgets.splice(m.widgets.indexOf(t), 1)
                })
            })
        },
        removeAllViews: function(e) {
            _.each(m.widgets, function(e) {
                e.$el.fadeTo(500, 0, function() {
                    e.remove()
                })
            }), m.widgets = [], _.delay(e, 475)
        }
    }), $(function() {
        m.utils.captionFormatter = function(e) {
            return e
        }, m.utils.setMomentumAuthHeader = setMomentumAuthHeader, m.utils.validateEmail = validateEmail, m.utils.getQueryParameter = getQueryParameter, m.utils.getActiveDateString = getActiveDateString, m.utils.activeDateStringForDate = activeDateStringForDate, m.utils.twoDigit = twoDigit, m.conditionalFeatures = new m.models.ConditionalFeatures, $(document).click(function(e) {
            m.trigger("globalEvent:click", e)
        }), $(document).keyup(function(e) {
            switch (e.which) {
                case 27:
                    m.trigger("globalEvent:esc", e)
            }
        }), $(document).keydown(function(e) {
            if (!(e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) && "INPUT" != document.activeElement.tagName && 1 != document.activeElement.isContentEditable) {
                if (76 == e.keyCode) var t = "Quick Links";
                else if (70 == e.keyCode) var t = "Focus";
                else if (84 == e.keyCode) var t = "Todo";
                else if (83 == e.keyCode) var t = "Search";
                else if (188 == e.keyCode) var t = "Settings";
                else if (67 == e.keyCode) {
                    var t = "Chrome Tab";
                    return ga("send", "event", t, "Hotkey"), void chrome.tabs.update({
                        url: "chrome-search://local-ntp/local-ntp.html"
                    })
                }
                t && (m.trigger("globalEvent:toggle" + t.replace(/\s+/g, "")), ga("send", "event", t, "Toggle Show", "Hotkey"), e.preventDefault())
            }
        }), "safari" == m.globals.platform && $("a").on("click", function() {
            safari.self.tab.dispatchMessage("sendClick", {
                link: this.href,
                time: (new Date).getTime()
            })
        }), m.listenTo(m, "user:successfulLogout", function() {
            m.appView.removeAllViews(function() {
                m.appView = new m.views.Dashboard
            })
        }), m.appView = new m.views.Dashboard, $(window).resize(function() {
            setMaxWidgetHeight()
        }), localStorage.client_uuid || $.ajax({
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                action: "registerClient"
            }),
            beforeSend: setMomentumAuthHeader,
            url: m.globals.urlRootLogin + "user/client"
        }).done(function(e) {
            e.client_uuid && localStorage.client_uuid != e.client_uuid && (localStorage.client_uuid = e.client_uuid, m.trigger("client:id_created"))
        }).fail(function() {}), m.syncCoordinator = new m.models.SyncCoordinator, window.addEventListener("storage", function(e) {
            "activeDate" == e.key && e.oldValue != e.newValue && m.trigger("newDay")
        }), localStorage.firstSynchronized && m.trigger("sync:downloadIfNeeded"), ga("create", m.globals.googleAnalyticsCode, "auto"), ga("set", "checkProtocolTask", function() {}), ga("require", "displayfeatures"), ga("send", "pageview", "/dashboard.html?v=" + m.globals.version), submitStats("pageview"), m.syncCoordinator.syncSettings()
    }),
    function(e, t, i, o, n, s, a) {
        e.GoogleAnalyticsObject = n, e[n] = e[n] || function() {
            (e[n].q = e[n].q || []).push(arguments)
        }, e[n].l = 1 * new Date, s = t.createElement(i), a = t.getElementsByTagName(i)[0], s.async = 1, s.src = o, a.parentNode.insertBefore(s, a)
    }(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga");