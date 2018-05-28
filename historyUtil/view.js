(window.constructQZFL = function () {
    window.QZFL = window.QZONE = window.QZFL || window.QZONE || {};
    QZFL.version = "2.1.60";
    QZFL._qzfl = 2.151;
    QZFL.emptyFn = function () {
    };
    QZFL.returnFn = function (e) {
        return e
    };
    (function () {
        var e = QZFL.userAgent = {}, t = navigator.userAgent, n = navigator.appVersion, r, i, o;
        e.adjustBehaviors = QZFL.emptyFn;
        if (window.ActiveXObject || window.msIsStaticHTML) {
            e.ie = 6;
            (window.XMLHttpRequest || t.indexOf("MSIE 7.0") > -1) && (e.ie = 7);
            (window.XDomainRequest || t.indexOf("Trident/4.0") > -1) && (e.ie = 8);
            t.indexOf("Trident/5.0") > -1 && (e.ie = 9);
            t.indexOf("Trident/6.0") > -1 && (e.ie = 10);
            t.indexOf("Trident/7.0") > -1 && (e.ie = 11);
            e.isBeta = navigator.appMinorVersion && navigator.appMinorVersion.toLowerCase().indexOf("beta") > -1;
            if (e.ie < 7) {
                try {
                    document.execCommand("BackgroundImageCache", false, true)
                } catch (e) {
                }
            }
            QZFL._doc = document;
            o = function (e) {
                return function (t, n) {
                    var r;
                    if (typeof t == "string") {
                        return e(t, n)
                    } else {
                        r = Array.prototype.slice.call(arguments, 2);
                        return e(function () {
                            t.apply(null, r)
                        }, n)
                    }
                }
            }
            ;window.setTimeout = QZFL._setTimeout = o(window.setTimeout);
            window.setInterval = QZFL._setInterval = o(window.setInterval)
        } else if (document.getBoxObjectFor || typeof window.mozInnerScreenX != "undefined") {
            r = /(?:Firefox|GranParadiso|Iceweasel|Minefield).(\d+\.\d+)/i;
            e.firefox = parseFloat((r.exec(t) || r.exec("Firefox/3.3"))[1], 10)
        } else if (!navigator.taintEnabled) {
            i = /AppleWebKit.(\d+\.\d+)/i.exec(t);
            e.webkit = i ? parseFloat(i[1], 10) : document.evaluate ? document.querySelector ? 525 : 420 : 419;
            if ((i = /Chrome.(\d+\.\d+)/i.exec(t)) || window.chrome) {
                e.chrome = i ? parseFloat(i[1], 10) : "2.0"
            } else if ((i = /Version.(\d+\.\d+)/i.exec(t)) || window.safariHandler) {
                e.safari = i ? parseFloat(i[1], 10) : "3.3"
            }
            e.air = t.indexOf("AdobeAIR") > -1 ? 1 : 0;
            e.isiPod = t.indexOf("iPod") > -1;
            e.isiPad = t.indexOf("iPad") > -1;
            e.isiPhone = t.indexOf("iPhone") > -1
        } else if (window.opera) {
            e.opera = parseFloat(window.opera.version(), 10)
        } else {
            e.ie = 6
        }
        if (!(e.macs = t.indexOf("Mac OS X") > -1)) {
            e.windows = (i = /Windows.+?(\d+\.\d+)/i.exec(t), i && parseFloat(i[1], 10))
            ;e.linux = t.indexOf("Linux") > -1;
            e.android = t.indexOf("Android") > -1
        }
        e.iOS = t.indexOf("iPhone OS") > -1;
        !e.iOS && (i = /OS (\d+(?:_\d+)*) like Mac OS X/i.exec(t), e.iOS = i && i[1] ? true : false)
    })();
    QZFL.object = {
        map: function (e, t) {
            return QZFL.object.extend(t || window, e)
        }, extend: function () {
            var e = arguments, t = arguments.length, n = false, r = 1, i = e[0], o, a, s, u;
            if (typeof i === "boolean") {
                n = i;
                i = arguments[1] || {};
                r = 2
            }
            if (typeof i !== "object" && typeof i !== "function") {
                i = {}
            }
            if (t === r) {
                i = QZFL;
                --r
            }
            for (; r < t; r++) {
                if ((o = arguments[r]) != null) {
                    for (var l in o) {
                        a = i[l];
                        u = o[l];
                        if (i === u) {
                            continue
                        }
                        if (n && u && typeof u === "object" && !u.nodeType) {
                            if (a) {
                                s = a
                            } else if (QZFL.lang.isArray(u)) {
                                s = []
                            } else if (QZFL.object.getType(u) === "object") {
                                s = {}
                            } else {
                                s = u
                            }
                            i[l] = QZFL.object.extend(n, s, u)
                        } else if (u !== undefined) {
                            i[l] = u
                        }
                    }
                }
            }
            return i
        }, each: function (e, t) {
            var n, r = 0, i = e.length, o = i === undefined || typeof e == "function";
            if (o) {
                for (var a in e) {
                    if (t.call(e[a], e[a], a, e) === false) {
                        break
                    }
                }
            } else {
                for (n = e[0]; r < i && false !== t.call(n, n, r, e); n = e[++r]) {
                }
            }
            return e
        }, getType: function (e) {
            return e === null ? "null" : e === undefined ? "undefined" : Object.prototype.toString.call(e).slice(8, -1).toLowerCase()
        }, routeRE: /([\d\w_]+)/g, route: function (e, t) {
            e = e || {};
            t = String(t);
            var n = QZFL.object.routeRE, r;
            n.lastIndex = 0;
            while ((r = n.exec(t)) !== null) {
                e = e[r[0]];
                if (e === undefined || e === null) {
                    break
                }
            }
            return e
        }, bind: function (e, t) {
            var n = Array.prototype.slice, r = n.call(arguments, 2);
            return function () {
                e = e || this;
                t = typeof t == "string" ? e[t] : t;
                t = typeof t == "function" ? t : QZFL.emptyFn;
                return t.apply(e, r.concat(n.call(arguments, 0)))
            }
        }, ease: function (e, t, n) {
            if (t) {
                if (typeof n != "function") {
                    n = QZFL.object._eachFn
                }
                QZFL.object.each(e, function (e, r) {
                    if (typeof e == "function") {
                        t[n(r)] = e
                    }
                })
            }
        }, _easeFn: function (e) {
            return "$" + e
        }
    };
    QZFL.namespace = QZFL.object;
    QZFL.runTime = {isDebugMode: false, error: QZFL.emptyFn, warn: QZFL.emptyFn};
    QZFL.console = window.console || {};
    QZFL.console.log = QZFL.console.log || function () {
    };
    QZFL.console.print = QZFL.console.log;
    QZFL.widget = {};
    QZFL.object.map(QZFL.object, QZFL);
    (function (e) {
        QZFL.config = QZFL.config || {}
        ;var t, n = e;
        do {
            try {
                n.siDomain && (QZFL.config.resourceDomain = n.siDomain.replace("http://", "").split("/")[0]);
                n.imgcacheDomain && (QZFL.config.domain = n.imgcacheDomain.replace("http://", "").split("/")[0])
            } catch (e) {
                break
            }
        } while (n !== n.parent && (n = n.parent));
        QZFL.config.defaultMediaRate = 2
    })(window);
    QZFL.config = QZFL.config || {};
    typeof QZFL.config.debugLevel == "undefined" && (QZFL.config.debugLevel = 0);
    typeof QZFL.config.defaultDataCharacterSet == "undefined" && (QZFL.config.defaultDataCharacterSet = "GB2312");
    typeof QZFL.config.DCCookieDomain == "undefined" && (QZFL.config.DCCookieDomain = "qzone.qq.com");
    typeof QZFL.config.domainPrefix == "undefined" && (QZFL.config.domainPrefix = "qq.com");
    typeof QZFL.config.domain == "undefined" && (QZFL.config.domain = "qzs.qq.com");
    typeof QZFL.config.resourceDomain == "undefined" && (QZFL.config.resourceDomain = "qzonestyle.gtimg.cn");
    QZFL.config.gbEncoderPath = "http://" + QZFL.config.domain + "/qzone/v5/toolpages/"
    ;QZFL.config.FSHelperPage = "http://" + QZFL.config.domain + "/qzone/v5/toolpages/fp_gbk.html";
    QZFL.config.defaultShareObject = "http://" + QZFL.config.resourceDomain + "/qzone/v5/toolpages/getset.swf";
    QZFL.config.staticServer = "http://" + QZFL.config.resourceDomain + "/ac/qzone/qzfl/lc/";
    QZFL.css = {
        classFileNameCache: {}, convertHexColor: function (e) {
            e = String(e || "");
            e.charAt(0) == "#" && (e = e.substring(1));
            e.length == 3 && (e = e.replace(/([0-9a-f])/gi, "$1$1"));
            return e.length == 6 ? [parseInt(e.substr(0, 2), 16), parseInt(e.substr(2, 2), 16), parseInt(e.substr(4, 2), 16)] : [0, 0, 0]
        }, rgb2hsl: function (e, t, n) {
            var r, i = Math.max(e / 255, 0), o = Math.max(t / 255, 0), a = Math.max(n / 255, 0), s = Math.max(i, o, a),
                u = Math.min(i, o, a), l = {h: 0, s: 0, l: Math.max((s + u) / 2, 0)};
            if (s != u) {
                if (s == i) {
                    l.h = (r = 60 * ((o - a) / (s - u))) < 0 ? r + 360 : r
                } else if (s == o) {
                    l.h = 60 * ((a - i) / (s - u)) + 120
                } else if (s == a) {
                    l.h = 60 * ((i - o) / (s - u)) + 240
                }
                if (l.l <= .5) {
                    l.s = (s - u) / (2 * l.l)
                } else if (.5 < l.l) {
                    l.s = (s - u) / (2 - 2 * l.l)
                }
                l.h = Math.round(l.h);
                l.s = Math.round(l.s * 100) / 100;
                l.l = Math.round(l.l * 100) / 100
            }
            return l
        },
        getStyleSheetById: function (e) {
            var t;
            return (t = QZFL.dom.get(e)) && t.sheet || (t = document.styleSheets) && t[e]
        }, getRulesBySheet: function (e) {
            var t = typeof e == "object" ? e : QZFL.css.getStyleSheetById(e), n = {}, r, i;
            if (t && !(n = t.cssRules || t.rules)) {
                if (r = document.getElementsByTagName("head")[0]) {
                    if (i = r.getElementsByTagName("base")[0]) {
                        QZFL.dom.removeElement(i);
                        n = t.cssRules;
                        r.appendChild(i)
                    }
                }
            }
            return n
        }, getRuleBySelector: function (e, t) {
            t = String(t).toLowerCase();
            var n = QZFL.css.getStyleSheetById(e), r = QZFL.css.getRulesBySheet(n);
            for (var i = 0, o = r.length; i < o; ++i) {
                if (t == r[i].selectorText.toLowerCase()) {
                    return r[i]
                }
            }
            return null
        }, insertCSSLink: function (e, t) {
            var n, r, i, o, a;
            if (QZFL.css.classFileNameCache[e]) {
                return
            }
            if (typeof t == "string") {
                n = t
            }
            t = typeof t == "object" ? t : {};
            n = t.linkID || n;
            r = t.doc || document;
            a = r.getElementsByTagName("head")[0];
            o = (i = r.getElementById(n)) && i.nodeName == "LINK" ? i : null;
            if (!o) {
                o = r.createElement("link");
                n && (o.id = n);
                o.rel = o.rev = "stylesheet";
                o.type = "text/css";
                o.media = t.media || "screen";
                a.appendChild(o)
            }
            try {
                e && (o.href = e.replace(/^http:\/\//, window.location.protocol + "//"))
            } catch (e) {
            }
            QZFL.css.classFileNameCache[e] = true;
            return QZFL.userAgent.ie < 9 && o.sheet || o
        }, insertStyleSheet: function (e, t) {
            var n = document.createElement("style");
            n.type = "text/css";
            e && (n.id = e);
            document.getElementsByTagName("head")[0].appendChild(n);
            if (t) {
                if (n.styleSheet) {
                    n.styleSheet.cssText = t
                } else {
                    n.appendChild(document.createTextNode(t))
                }
            }
            return n.sheet || n
        }, removeStyleSheet: function (e) {
            var t = QZFL.css.getStyleSheetById(e);
            t && QZFL.dom.removeElement(t.owningElement || t.ownerNode)
        }, _reClassToken: /\s+/, updateClassName: function (e, t, n) {
            if (!e || e.nodeType != 1) {
                return ""
            }
            var r = e.className, i = QZFL.css, o, a;
            if (t && typeof t == "string" || n && typeof n == "string") {
                if (t == "*") {
                    r = ""
                } else {
                    o = r.split(i._reClassToken);
                    var s = 0, u = o.length, l;
                    r = {};
                    for (; s < u; ++s) {
                        o[s] && (r[o[s]] = true)
                    }
                    if (n) {
                        o = n.split(i._reClassToken);
                        u = o.length;
                        for (s = 0; s < u; ++s) {
                            (l = o[s]) && !r[l] && (a = r[l] = true)
                        }
                    }
                    if (t) {
                        o = t.split(i._reClassToken);
                        u = o.length;
                        for (s = 0; s < u; s++) {
                            (l = o[s]) && r[l] && (a = true) && delete r[l]
                        }
                    }
                }
                if (a) {
                    o.length = 0;
                    for (var c in r) {
                        o.push(c)
                    }
                    r = o.join(" ");
                    e.className = r
                }
            }
            return r
        }, hasClassName: function (e, t) {
            return e && t ? e.classList ? e.classList.contains(t) : t && (" " + e.className + " ").indexOf(" " + t + " ") > -1 : false
        }, addClassName: function (e, t) {
            var n = QZFL.css;
            return t && (e && e.classList && !n._reClassToken.test(t) ? e.classList.add(t) : n.updateClassName(e, null, t))
        }, removeClassName: function (e, t) {
            var n = QZFL.css;
            return t && (e && e.classList && !n._reClassToken.test(t) ? e.classList.remove(t) : n.updateClassName(e, t))
        }, replaceClassName: function (e, t, n) {
            QZFL.css.swapClassName(e, t, n, true)
        }, swapClassName: function (e, t, n, r) {
            if (e && typeof e == "object") {
                if (e.length === undefined) {
                    e = [e]
                }
                for (var i, o = 0, a = e.length; o < a; ++o) {
                    if ((i = e[o]) && i.nodeType == 1) {
                        if (QZFL.css.hasClassName(i, t)) {
                            QZFL.css.updateClassName(i, t, n)
                        } else if (!r && QZFL.css.hasClassName(i, n)) {
                            QZFL.css.updateClassName(i, n, t)
                        }
                    }
                }
            }
        }, toggleClassName: function (e, t) {
            if (!e || e.nodeType != 1) {
                return
            }
            var n = QZFL.css
            ;
            if (e.classList && t && !n._reClassToken.test(t)) {
                return e.classList.toggle(t)
            }
            if (n.hasClassName(e, t)) {
                n.updateClassName(e, t)
            } else {
                n.updateClassName(e, null, t)
            }
        }
    };
    QZFL.dom = {
        getById: function (e) {
            return document.getElementById(e)
        }, getByName: function (e, t, n) {
            return QZFL.selector((t || "") + '[name="' + e + '"]', n)
        }, get: function (e) {
            return typeof e == "string" ? document.getElementById(e) : e
        }, getNode: function (e) {
            return e && (e.nodeType || e.item) ? e : document.getElementById(e)
        }, removeElement: function (e) {
            if (e = QZFL.dom.get(e)) {
                if (QZFL.userAgent.ie > 8 && e.tagName == "SCRIPT") {
                    e.src = ""
                }
                e.removeNode ? e.removeNode(true) : e.parentNode && e.parentNode.removeChild(e)
            }
            return e = null
        }, searchChain: function (e, t, n) {
            t = t || "parentNode";
            while (e && e.nodeType && e.nodeType == 1) {
                if (!n || n.call(e, e)) {
                    return e
                }
                e = e[t]
            }
            return null
        }, searchElementByClassName: function (e, t) {
            e = QZFL.dom.get(e);
            return QZFL.dom.searchChain(e, "parentNode", function (e) {
                return QZFL.css.hasClassName(e, t)
            })
        }, getElementsByClassName: function (e, t, n) {
            return QZFL.selector((t || "") + "." + e, QZFL.dom.get(n))
        }, isAncestor: function (e, t) {
            return e && t && e != t && QZFL.dom.contains(e, t)
        }, getAncestorBy: function (e, t) {
            e = QZFL.dom.get(e);
            return QZFL.dom.searchChain(e.parentNode, "parentNode", function (e) {
                return e.nodeType == 1 && (!t || t(e))
            })
        }, getFirstChild: function (e) {
            e = QZFL.dom.get(e);
            return e.firstElementChild || QZFL.dom.searchChain(e && e.firstChild, "nextSibling", function (e) {
                return e.nodeType == 1
            })
        }, getLastChild: function (e) {
            e = QZFL.dom.get(e);
            return e.lastElementChild || QZFL.dom.searchChain(e && e.lastChild, "previousSibling", function (e) {
                return e.nodeType == 1
            })
        }, getNextSibling: function (e) {
            e = QZFL.dom.get(e);
            return e.nextElementSibling || QZFL.dom.searchChain(e && e.nextSibling, "nextSibling", function (e) {
                return e.nodeType == 1
            })
        }, getPreviousSibling: function (e) {
            e = QZFL.dom.get(e);
            return e.previousElementSibling || QZFL.dom.searchChain(e && e.previousSibling, "previousSibling", function (e) {
                return e.nodeType == 1
            })
        }, swapNode: function (e, t) {
            if (e.swapNode) {
                e.swapNode(t)
            } else {
                var n = t.parentNode, r = t.nextSibling;
                if (r == e) {
                    n.insertBefore(e, t)
                } else if (t == e.nextSibling) {
                    n.insertBefore(t, e)
                } else {
                    e.parentNode.replaceChild(t, e);
                    n.insertBefore(e, r)
                }
            }
        }, createElementIn: function (e, t, n, r) {
            var i = (t = QZFL.dom.get(t) || document.body).ownerDocument.createElement(e || "div"), o;
            if (typeof r == "object") {
                for (o in r) {
                    if (o == "class") {
                        i.className = r[o]
                    } else if (o == "style") {
                        i.style.cssText = r[o]
                    } else {
                        i[o] = r[o]
                    }
                }
            }
            n ? t.insertBefore(i, t.firstChild) : t.appendChild(i);
            return i
        }, getStyle: function (e, t) {
            e = QZFL.dom.get(e);
            if (!e || e.nodeType == 9) {
                return null
            }
            var n = document.defaultView && document.defaultView.getComputedStyle,
                r = !n ? null : document.defaultView.getComputedStyle(e, ""), i = "";
            switch (t) {
                case"float":
                    t = n ? "cssFloat" : "styleFloat";
                    break;
                case"opacity":
                    if (!n) {
                        var o = 100;
                        try {
                            o = e.filters["DXImageTransform.Microsoft.Alpha"].opacity
                        } catch (t) {
                            try {
                                o = e.filters("alpha").opacity
                            } catch (e) {
                            }
                        }
                        return o / 100
                    } else {
                        return parseFloat((r || e.style)[t])
                    }
                    break;
                case"backgroundPositionX":
                    if (n) {
                        t = "backgroundPosition"
                        ;
                        return (r || e.style)[t].split(" ")[0]
                    }
                    break;
                case"backgroundPositionY":
                    if (n) {
                        t = "backgroundPosition";
                        return (r || e.style)[t].split(" ")[1]
                    }
                    break
            }
            if (n) {
                return (r || e.style)[t]
            } else {
                return e.currentStyle[t] || e.style[t]
            }
        }, setStyle: function (e, t, n) {
            var r = QZFL.dom;
            if (!(e = r.get(e)) || e.nodeType != 1) {
                return false
            }
            var i, o = true, a;
            if (typeof t == "string") {
                i = t;
                t = {};
                t[i] = n
            }
            for (var s in t) {
                n = t[s];
                a = r.convertStyle(e, s, n);
                s = a.prop;
                n = a.value;
                if (typeof e.style[s] != "undefined") {
                    e.style[s] = n;
                    o = o && true
                } else {
                    o = o && false
                }
            }
            return o
        }, convertStyle: function (e, t, n) {
            var r = QZFL.dom, i, o = /z-?index|font-?weight|opacity|zoom|line-?height/i, a;
            a = (i = document.defaultView) && i.getComputedStyle;
            if (t == "float") {
                t = a ? "cssFloat" : "styleFloat"
            } else if (t == "opacity") {
                if (!a) {
                    t = "filter";
                    n = n >= 1 ? "" : "alpha(opacity=" + Math.round(n * 100) + ")"
                }
            } else if (t == "backgroundPositionX" || t == "backgroundPositionY") {
                i = t.slice(-1) == "X" ? "Y" : "X";
                if (a) {
                    var s = QZFL.dom.getStyle(e, "backgroundPosition" + i);
                    t = "backgroundPosition";
                    typeof n == "number" && (n = n + "px")
                    ;n = i == "Y" ? n + " " + (s || "top") : (s || "left") + " " + n
                }
            }
            n += typeof n === "number" && !o.test(t) ? "px" : "";
            return {prop: t, value: n}
        }, createNamedElement: function (e, t, n) {
            var r = n || document, i;
            try {
                i = r.createElement("<" + e + ' name="' + t + '">')
            } catch (e) {
            }
            if (!i) {
                i = r.createElement(e)
            }
            if (!i.name) {
                i.name = t
            }
            return i
        }, getRect: function (e) {
            if (e = QZFL.dom.get(e)) {
                var t = QZFL.object.extend({}, e.getBoundingClientRect());
                if (typeof t.width == "undefined") {
                    t.width = t.right - t.left;
                    t.height = t.bottom - t.top
                }
                return t
            }
        }, getPosition: function (e) {
            var t, n, r;
            if (t = QZFL.dom.getRect(e)) {
                if (n = QZFL.dom.getScrollLeft(r = e.ownerDocument)) {
                    t.left += n, t.right += n
                }
                if (n = QZFL.dom.getScrollTop(r)) {
                    t.top += n, t.bottom += n
                }
                return t
            }
        }, setPosition: function (e, t) {
            QZFL.dom.setXY(e, t["left"], t["top"]);
            QZFL.dom.setSize(e, t["width"], t["height"])
        }, getXY: function (e) {
            var t = QZFL.dom.getPosition(e) || {left: 0, top: 0};
            return [t.left, t.top]
        }, getSize: function (e) {
            var t = QZFL.dom.getPosition(e) || {width: -1, height: -1};
            return [t.width, t.height]
        }, setXY: function (e, t, n) {
            var r = parseInt(QZFL.dom.getStyle(e, "marginLeft")) || 0,
                i = parseInt(QZFL.dom.getStyle(e, "marginTop")) || 0;
            QZFL.dom.setStyle(e, {left: (parseInt(t, 10) || 0) - r + "px", top: (parseInt(n, 10) || 0) - i + "px"})
        }, getScrollLeft: function (e) {
            var t = e || document;
            return t.defaultView && t.defaultView.pageXOffset || Math.max(t.documentElement.scrollLeft, t.body.scrollLeft)
        }, getScrollTop: function (e) {
            var t = e || document;
            return t.defaultView && t.defaultView.pageYOffset || Math.max(t.documentElement.scrollTop, t.body.scrollTop)
        }, getScrollHeight: function (e) {
            var t = e || document;
            return Math.max(t.documentElement.scrollHeight, t.body.scrollHeight)
        }, getScrollWidth: function (e) {
            var t = e || document;
            return Math.max(t.documentElement.scrollWidth, t.body.scrollWidth)
        }, setScrollLeft: function (e, t) {
            var n = t || document;
            n[n.compatMode == "CSS1Compat" && !QZFL.userAgent.webkit ? "documentElement" : "body"].scrollLeft = e
        }, setScrollTop: function (e, t) {
            var n = t || document;
            n[n.compatMode == "CSS1Compat" && !QZFL.userAgent.webkit ? "documentElement" : "body"].scrollTop = e
        },
        getClientHeight: function (e) {
            var t = e || document;
            return t.compatMode == "CSS1Compat" ? t.documentElement.clientHeight : t.body.clientHeight
        }, getClientWidth: function (e) {
            var t = e || document;
            return t.compatMode == "CSS1Compat" ? t.documentElement.clientWidth : t.body.clientWidth
        }, _SET_SIZE_RE: /^\d+(?:\.\d*)?(px|%|em|in|cm|mm|pc|pt)?$/, setSize: function (e, t, n) {
            e = QZFL.dom.get(e);
            var r = QZFL.dom._SET_SIZE_RE, i;
            QZFL.dom.setStyle(e, "width", (i = r.exec(t)) ? i[1] ? t : parseInt(t, 10) + "px" : "auto");
            QZFL.dom.setStyle(e, "height", (i = r.exec(n)) ? i[1] ? n : parseInt(n, 10) + "px" : "auto")
        }, getDocumentWindow: function (e) {
            var t = e || document;
            return t.parentWindow || t.defaultView
        }, getElementsByTagNameNS: function (e, t, n) {
            e = e || document;
            var r = [];
            if (e.getElementsByTagNameNS) {
                return e.getElementsByTagName(t + ":" + n)
            } else if (e.getElementsByTagName) {
                var i = document.namespaces;
                if (i.length > 0) {
                    var o = e.getElementsByTagName(n);
                    for (var a = 0, s = o.length; a < s; ++a) {
                        if (o[a].scopeName == t) {
                            r.push(o[a])
                        }
                    }
                }
            }
            return r
        }, getElementByTagNameBubble: function (e, t) {
            if (!t) {
                return null
            }
            var n = 15;
            t = String(t).toUpperCase();
            if (t == "BODY") {
                return document.body
            }
            e = QZFL.dom.searchChain(e = QZFL.dom.get(e), "parentNode", function (e) {
                return e.tagName == t || e.tagName == "BODY" || --n < 0
            });
            return !e || n < 0 ? null : e
        }, insertAdjacent: function (e, t, n, r) {
            var i, o = ["beforeBegin", "afterBegin", "beforeEnd", "afterEnd"], a;
            if (QZFL.lang.isElement(e) && o[t] && (QZFL.lang.isString(n) || QZFL.lang.isElement(n))) {
                if (e.insertAdjacentHTML && e.insertAdjacentElement && e.insertAdjacentText) {
                    e["insertAdjacent" + (typeof n == "object" ? "Element" : r ? "Text" : "HTML")](o[t], n)
                } else {
                    i = (a = e.ownerDocument).createRange();
                    i[t == 1 || t == 2 ? "selectNodeContents" : "selectNode"](e);
                    i.collapse(t < 2);
                    i.insertNode(typeof n != "string" ? n : r ? a.createTextNode(n) : i.createContextualFragment(n))
                }
                return true
            }
            return false
        }
    };
    QZFL.event = {
        KEYS: {BACKSPACE: 8, TAB: 9, RETURN: 13, ESC: 27, SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, DELETE: 46},
        _eventListDictionary: {},
        _fnSeqUID: 0,
        _objSeqUID: 0,
        addEvent: function (e, t, n, r) {
            var i, o = false, a, s, u, l;
            if (!e) {
                return o
            }
            if (!e.eventsListUID) {
                e.eventsListUID = "e" + ++QZFL.event._objSeqUID
            }
            if (!(a = QZFL.event._eventListDictionary[e.eventsListUID])) {
                a = QZFL.event._eventListDictionary[e.eventsListUID] = {}
            }
            if (!n.__elUID) {
                n.__elUID = "e" + ++QZFL.event._fnSeqUID + e.eventsListUID
            }
            if (QZFL.userAgent.isiPad && (t == "mouseover" || t == "mouseout")) {
                i = function (e) {
                    l = (new Date).getTime()
                };
                a["_" + t] = n;
                if (a._ipadBind) {
                    return false
                }
                t = "touchstart";
                a._ipadBind = 1;
                u = function (t) {
                    var n = (new Date).getTime() - l, i;
                    if (n < 700) {
                        i = a._mouseover;
                        if (a._ismouseover) {
                            i = a._mouseout;
                            a._ismouseover = 0
                        } else {
                            a._ismouseover = 1
                        }
                        QZFL.event.preventDefault(t);
                        return i && i.apply(e, !r ? [QZFL.event.getEvent(t)] : [QZFL.event.getEvent(t)].concat(r))
                    }
                    return true
                };
                QZFL.event.addEvent(e, "touchend", u)
            }
            if (!a[t]) {
                a[t] = {}
            }
            if (!a[t].handlers) {
                a[t].handlers = {}
            }
            s = a[t].handlers;
            if (typeof s[n.__elUID] == "function") {
                return false
            }
            i = i || function (t) {
                return n.apply(e, !r ? [QZFL.event.getEvent(t)] : [QZFL.event.getEvent(t)].concat(r))
            };
            if (e.addEventListener) {
                e.addEventListener(t, i, false);
                o = true
            } else if (e.attachEvent) {
                o = e.attachEvent("on" + t, i)
            } else {
                o = false
            }
            if (o) {
                s[n.__elUID] = i
            }
            return o
        },
        trigger: function (e, t) {
            var n = e && QZFL.event._eventListDictionary[e.eventsListUID], r = n && n[t] && n[t].handlers, i;
            if (r) {
                try {
                    for (i in r) {
                        r[i].call(window, {})
                    }
                } catch (e) {
                    QZFL.console.print("QZFL.event.trigger error")
                }
            }
        },
        removeEvent: function (e, t, n) {
            var r = n, i = false, o = QZFL.event._eventListDictionary, a;
            if (!e) {
                return i
            }
            if (!n) {
                return QZFL.event.purgeEvent(e, t)
            }
            if (e.eventsListUID && o[e.eventsListUID] && o[e.eventsListUID][t]) {
                o = o[e.eventsListUID][t].handlers;
                if (o && o[n.__elUID]) {
                    r = o[n.__elUID];
                    a = o
                }
            }
            if (e.removeEventListener) {
                e.removeEventListener(t, r, false);
                i = true
            } else if (e.detachEvent) {
                e.detachEvent("on" + t, r);
                i = true
            } else {
                return false
            }
            if (i && a && a[n.__elUID]) {
                delete a[n.__elUID]
            }
            return i
        },
        purgeEvent: function (e, t) {
            var n, r;
            if (e.eventsListUID && (n = QZFL.event._eventListDictionary[e.eventsListUID]) && n[t] && (r = n[t].handlers)) {
                for (var i in r) {
                    if (e.removeEventListener) {
                        e.removeEventListener(t, r[i], false)
                    } else if (e.detachEvent) {
                        e.detachEvent("on" + t, r[i])
                    }
                }
            }
            if (e["on" + t]) {
                e["on" + t] = null
            }
            if (r) {
                n[t].handlers = null;
                delete n[t].handlers
            }
            return true
        },
        getEvent: function (e) {
            var e = window.event || e || null, t, n = QZFL.event.getEvent, r = 0;
            if (!e) {
                t = arguments.callee;
                while (t && r < n.MAX_LEVEL) {
                    if (t.arguments && (e = t.arguments[0]) && (typeof e.button != "undefined" && typeof e.ctrlKey != "undefined")) {
                        break
                    }
                    ++r;
                    t = t.caller
                }
            }
            return e
        },
        getButton: function (e) {
            var t = QZFL.event.getEvent(e);
            if (!t) {
                return -1
            }
            if (QZFL.userAgent.ie) {
                return t.button - Math.ceil(t.button / 2)
            } else {
                return t.button
            }
        },
        getTarget: function (e) {
            var t = QZFL.event.getEvent(e);
            if (t) {
                return t.srcElement || t.target
            } else {
                return null
            }
        },
        getCurrentTarget: function (e) {
            var t = QZFL.event.getEvent(e);
            if (t) {
                return t.currentTarget || document.activeElement
            } else {
                return null
            }
        },
        cancelBubble: function (e) {
            e = QZFL.event.getEvent(e);
            if (!e) {
                return false
            }
            if (e.stopPropagation) {
                e.stopPropagation()
            } else {
                if (!e.cancelBubble) {
                    e.cancelBubble = true
                }
            }
        },
        preventDefault: function (e) {
            e = QZFL.event.getEvent(e)
            ;
            if (!e) {
                return false
            }
            if (e.preventDefault) {
                e.preventDefault()
            } else {
                e.returnValue = false
            }
        },
        mouseX: function (e) {
            e = QZFL.event.getEvent(e);
            return e.pageX || e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)
        },
        mouseY: function (e) {
            e = QZFL.event.getEvent(e);
            return e.pageY || e.clientY + (document.documentElement.scrollTop || document.body.scrollTop)
        },
        getRelatedTarget: function (e) {
            e = QZFL.event.getEvent(e);
            var t = e.relatedTarget;
            if (!t) {
                if (e.type == "mouseout") {
                    t = e.toElement
                } else if (e.type == "mouseover") {
                    t = e.fromElement
                } else {
                }
            }
            return t
        },
        onDomReady: function (e) {
            var t = QZFL.event.onDomReady;
            QZFL.event._bindReady();
            t.pool.push(e)
        },
        _bindReady: function () {
            var e = QZFL.event.onDomReady;
            if (typeof e.pool != "undefined") {
                return
            }
            e.pool = e.pool || [];
            if (document.readyState === "complete") {
                return setTimeout(QZFL.event._readyFn, 1)
            }
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", QZFL.event._domReady, false);
                window.addEventListener("load", QZFL.event._readyFn, false)
            } else if (document.attachEvent) {
                document.attachEvent("onreadystatechange", QZFL.event._domReady);
                window.attachEvent("onload", QZFL.event._readyFn);
                var t = false;
                try {
                    t = window.frameElement == null
                } catch (e) {
                }
                if (document.documentElement.doScroll && t) {
                    QZFL.event._ieScrollCheck()
                }
            }
        },
        _readyFn: function () {
            var e = QZFL.event.onDomReady;
            e.isReady = true;
            while (e.pool.length) {
                var t = e.pool.shift();
                QZFL.lang.isFunction(t) && t()
            }
            e.pool.length == 0 && (e._fn = null)
        },
        _domReady: function () {
            if (document.addEventListener) {
                document.removeEventListener("DOMContentLoaded", QZFL.event._domReady, false);
                QZFL.event._readyFn()
            } else if (document.attachEvent) {
                if (document.readyState === "complete") {
                    document.detachEvent("onreadystatechange", QZFL.event._domReady);
                    QZFL.event._readyFn()
                }
            }
        },
        _ieScrollCheck: function () {
            if (QZFL.event.onDomReady.isReady) {
                return
            }
            try {
                document.documentElement.doScroll("left")
            } catch (e) {
                setTimeout(QZFL.event._ieScrollCheck, 1);
                return
            }
            QZFL.event._readyFn()
        },
        delegate: function (e, t, n, r, i) {
            var o, a, s, u, l, c = false, f = QZFL.event
            ;
            if (!e || !t || !n || !r) {
                return c
            }
            if (!e.eventsListUID) {
                e.eventsListUID = "e" + ++f._objSeqUID
            }
            if (!(o = f._eventListDictionary[e.eventsListUID])) {
                o = f._eventListDictionary[e.eventsListUID] = {}
            }
            if (!r.__elUID) {
                r.__elUID = "e" + ++f._fnSeqUID + e.eventsListUID
            }
            l = (f.delegate._specialEvent[n] || {}).delegateType || n;
            if (!o[l]) {
                o[l] = {}
            }
            a = o.delegateHandler;
            if (!a) {
                a = o.delegateHandler = function (t) {
                    f.delegate._dispatch.apply(e, arguments)
                }
            }
            u = o[l].delegateHandlers;
            if (!u) {
                u = o[l].delegateHandlers = [];
                o.delegateCount = (o.delegateCount || 0) + 1;
                if (e.addEventListener) {
                    e.addEventListener(l, a, false);
                    c = true
                } else if (e.attachEvent) {
                    e.attachEvent("on" + l, a);
                    c = true
                } else {
                    return c
                }
            } else {
                for (var d = 0, p = u.length; d < p; d++) {
                    if (u[d].guid === r.__elUID) {
                        return false
                    }
                }
                c = true
            }
            s = {
                selector: t,
                guid: r.__elUID,
                handler: r,
                delegateType: l,
                argsArray: i,
                origType: n,
                quick: f.delegate._quickParse(t)
            };
            u.push(s);
            return c
        },
        undelegate: function (e, t, n, r) {
            var i, o, a, s = QZFL.event, u;
            i = s._eventListDictionary[(e || {}).eventsListUID];
            if (!i) {
                return
            }
            if (arguments.length === 2) {
                n = t;
                t == ""
            }
            if (!n) {
                for (var l in i) {
                    arguments.callee(e, t, l, r)
                }
                return
            }
            n = (s.delegate._specialEvent[n] || {}).delegateType || n;
            o = (i[n] || {}).delegateHandlers;
            if (!o) {
                return
            }
            u = o.length;
            if (r || t) {
                for (var c = 0, f; c < o.length;) {
                    f = o[c];
                    if (typeof r == "function" && f.guid === r.__elUID || t === f.selector) {
                        o.splice(c, 1)
                    } else {
                        c++
                    }
                }
            } else {
                o.length = 0
            }
            if (o.length === 0 && u !== 0) {
                a = (s.delegate._specialEvent[n] || {}).delegateType || n;
                if (e.removeEventListener) {
                    e.removeEventListener(a, i.delegateHandler, false)
                } else if (e.detachEvent) {
                    e.detachEvent("on" + a, i.delegateHandler)
                }
                o = null;
                delete i[n].delegateHandlers;
                i.delegateCount--;
                if (i.delegateCount === 0) {
                    delete i.delegateHandler;
                    delete i.delegateCount
                }
            }
        }
    };
    QZFL.event.on = QZFL.event.addEvent;
    QZFL.event.bind = QZFL.object.bind;
    QZFL.event.getEvent.MAX_LEVEL = 10;
    QZFL.event.delegate._quickParse = function (e) {
        var t = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/, n = t.exec(e);
        if (n) {
            n[1] = (n[1] || "").toLowerCase();
            n[3] = n[3] && new RegExp("(?:^|\\s)" + n[3] + "(?:\\s|$)")
        }
        return n
    }
    ;QZFL.event.delegate._isQuickMatch = function (e, t) {
        return (!t[1] || e.nodeName.toLowerCase() === t[1]) && (!t[2] || e.id === t[2]) && (!t[3] || t[3].test(e.className))
    };
    QZFL.event.delegate._specialEvent = {};
    QZFL.object.each({mouseenter: "mouseover", mouseleave: "mouseout"}, function (e, t) {
        QZFL.event.delegate._specialEvent[t] = {
            delegateType: e, handler: function (e, t) {
                var n = this, r = QZFL.event.getRelatedTarget(e);
                if (n !== r && !QZFL.dom.isAncestor(n, r)) {
                    t.handler.apply(this, [e].concat(t.argsArray))
                }
            }
        }
    });
    QZFL.event.delegate._dispatch = function (e) {
        var t = QZFL.event, e = t.getEvent(e), n = e.type, r, i, o, a, s, u;
        r = t._eventListDictionary[this.eventsListUID] || {};
        i = (r[n] || {}).delegateHandlers || [];
        for (a = t.getTarget(e); a != this; a = a.parentNode || this) {
            for (var l = 0, c = i.length, f; l < c; l++) {
                f = i[l];
                u = f.selector;
                o = f.quick ? t.delegate._isQuickMatch(a, f.quick) : Sizzle && Sizzle.matchesSelector(a, u);
                if (o) {
                    s = (t.delegate._specialEvent[f.origType] || {}).handler;
                    if (s) {
                        s.apply(a, [e, f])
                    } else {
                        f.handler.apply(a, [e].concat(f.argsArray))
                    }
                }
            }
        }
    };
    QZFL.queue = function () {
        var e = QZFL.object;
        var t = {};
        var n = function (r, i) {
            if (this instanceof arguments.callee) {
                this._qz_queuekey = r;
                return this
            }
            if (e.getType(i = i || []) == "array") {
                t[r] = i
            }
            return new n(r)
        };
        var r = {
            push: function (e, n) {
                n = this._qz_queuekey ? e : n;
                t[this._qz_queuekey || e].push(n)
            },
            shift: function (e) {
                var n = t[this._qz_queuekey || e];
                if (n) {
                    return QZFL.queue._exec(n.shift())
                }
            },
            getLen: function (e) {
                return t[this._qz_queuekey || e].length
            },
            run: function (n) {
                var r = t[this._qz_queuekey || n];
                if (r) {
                    e.each(r, QZFL.queue._exec)
                }
            },
            timedChunk: function (e, n) {
                var r = t[this._qz_queuekey || e], i;
                if (r) {
                    i = QZFL.lang.propertieCopy(n, QZFL.queue._tcCof, null, true);
                    setTimeout(function () {
                        var t = +new Date;
                        do {
                            QZFL.queue.shift(e)
                        } while (QZFL.queue.getLen(e) > 0 && +new Date - t < i.runTime);
                        if (QZFL.queue.getLen(e) > 0) {
                            setTimeout(arguments.callee, i.waitTime);
                            i.onWait()
                        } else {
                            i.onRunEnd()
                        }
                    }, 0)
                }
            },
            _tcCof: {runTime: 50, waitTime: 25, onRunEnd: QZFL.emptyFn, onWait: QZFL.emptyFn},
            _exec: function (t, n, r) {
                if (!t || e.getType(t) != "function") {
                    if (e.getType(n) == "number") {
                        r[n] = null
                    }
                    return false
                }
                try {
                    return t()
                } catch (e) {
                    QZFL.console.print("QZFL Queue Got An Error: [" + e.name + "]  " + e.message, 1)
                }
            }
        };
        e.extend(n.prototype, r);
        e.extend(n, r);
        return n
    }();
    QZFL.string = {
        RegExps: {
            trim: /^\s+|\s+$/g,
            ltrim: /^\s+/,
            rtrim: /\s+$/,
            nl2br: /\n/g,
            s2nb: /[\x20]{2}/g,
            URIencode: /[\x09\x0A\x0D\x20\x21-\x29\x2B\x2C\x2F\x3A-\x3F\x5B-\x5E\x60\x7B-\x7E]/g,
            escHTML: {re_amp: /&/g, re_lt: /</g, re_gt: />/g, re_apos: /\x27/g, re_quot: /\x22/g},
            escString: {bsls: /\\/g, sls: /\//g, nl: /\n/g, rt: /\r/g, tab: /\t/g},
            restXHTML: {
                re_amp: /&amp;/g,
                re_lt: /&lt;/g,
                re_gt: /&gt;/g,
                re_apos: /&(?:apos|#0?39);/g,
                re_quot: /&quot;/g
            },
            write: /\{(\d{1,2})(?:\:([xodQqb]))?\}/g,
            isURL: /^(?:ht|f)tp(?:s)?\:\/\/(?:[\w\-\.]+)\.\w+/i,
            cut: /[\x00-\xFF]/,
            getRealLen: {r0: /[^\x00-\xFF]/g, r1: /[\x00-\xFF]/g},
            format: /\{([\d\w\.]+)\}/g
        }, commonReplace: function (e, t, n) {
            return e.replace(t, n)
        }, listReplace: function (e, t) {
            if (QZFL.lang.isHashMap(t)) {
                for (var n in t) {
                    e = QZFL.string.commonReplace(e, t[n], n)
                }
                return e
            } else {
                return e + ""
            }
        }, trim: function (e) {
            return QZFL.string.commonReplace(e + "", QZFL.string.RegExps.trim, "")
        }, ltrim: function (e) {
            return QZFL.string.commonReplace(e + "", QZFL.string.RegExps.ltrim, "")
        }, rtrim: function (e) {
            return QZFL.string.commonReplace(e + "", QZFL.string.RegExps.rtrim, "")
        }, nl2br: function (e) {
            return QZFL.string.commonReplace(e + "", QZFL.string.RegExps.nl2br, "<br />")
        }, s2nb: function (e) {
            return QZFL.string.commonReplace(e + "", QZFL.string.RegExps.s2nb, "&nbsp;&nbsp;")
        }, URIencode: function (e) {
            var t, n;
            return (e + "").replace(QZFL.string.RegExps.URIencode, function (e) {
                if (e == " ") {
                    return "+"
                } else if (e == "\r") {
                    return ""
                }
                t = e.charCodeAt(0);
                n = t.toString(16);
                return "%" + (t < 16 ? "0" + n : n)
            })
        }, escHTML: function (e) {
            var t = QZFL.string.RegExps.escHTML;
            return QZFL.string.listReplace(e + "", {
                "&amp;": t.re_amp,
                "&lt;": t.re_lt,
                "&gt;": t.re_gt,
                "&#039;": t.re_apos,
                "&quot;": t.re_quot
            })
        }, escString: function (e) {
            var t = QZFL.string.RegExps.escString, n = QZFL.string.RegExps.escHTML;
            return QZFL.string.listReplace(e + "", {
                "\\\\": t.bsls, "\\n": t.nl, "": t.rt, "\\t": t.tab, "\\/": t.sls,
                "\\'": n.re_apos, '\\"': n.re_quot
            })
        }, restXHTML: function (e) {
            var t = QZFL.string.RegExps.restXHTML;
            return QZFL.string.listReplace(e + "", {
                "<": t.re_lt,
                ">": t.re_gt,
                "'": t.re_apos,
                '"': t.re_quot,
                "&": t.re_amp
            })
        }, write: function (e, t) {
            if (arguments.length < 1 || !QZFL.lang.isString(e)) {
                return ""
            }
            var n = QZFL.lang.arg2arr(arguments), r = n.shift(), i;
            return r.replace(QZFL.string.RegExps.write, function (e, t, r) {
                t = parseInt(t, 10);
                if (t < 0 || typeof n[t] == "undefined") {
                    return "(n/a)"
                } else {
                    if (!r) {
                        return n[t]
                    } else {
                        switch (r) {
                            case"x":
                                return "0x" + n[t].toString(16);
                            case"o":
                                return "o" + n[t].toString(8);
                            case"d":
                                return n[t].toString(10);
                            case"Q":
                                return '"' + n[t].toString(16) + '"';
                            case"q":
                                return "`" + n[t].toString(16) + "'";
                            case"b":
                                return "<" + !!n[t] + ">"
                        }
                    }
                }
            })
        }, isURL: function (e) {
            return QZFL.string.RegExps.isURL.test(e)
        }, escapeURI: function (e) {
            if (window.encodeURIComponent) {
                return encodeURIComponent(e)
            }
            if (window.escape) {
                return escape(e)
            }
            return ""
        }, fillLength: function (e, t, n, r) {
            if ((e = String(e)).length < t) {
                var i = new Array(t - e.length);
                i[r ? "unshift" : "push"](e)
                ;e = i.join(n || "0")
            }
            return e
        }, cut: function (e, t, n) {
            e = String(e);
            t -= 0;
            n = n || "";
            if (isNaN(t)) {
                return e
            }
            var r = e.length, i = Math.min(Math.floor(t / 2), r), o = QZFL.string.getRealLen(e.slice(0, i));
            for (; i < r && o < t; i++) {
                o += 1 + (e.charCodeAt(i) > 255)
            }
            return e.slice(0, o > t ? i - 1 : i) + (i < r ? n : "")
        }, getRealLen: function (e, t) {
            if (typeof e != "string") {
                return 0
            }
            if (!t) {
                return e.replace(QZFL.string.RegExps.getRealLen.r0, "**").length
            } else {
                var n = e.replace(QZFL.string.RegExps.getRealLen.r1, "");
                return e.length - n.length + encodeURI(n).length / 3
            }
        }, format: function (e) {
            var t = Array.prototype.slice.call(arguments), n;
            e = String(t.shift());
            if (t.length == 1 && typeof t[0] == "object") {
                t = t[0]
            }
            QZFL.string.RegExps.format.lastIndex = 0;
            return e.replace(QZFL.string.RegExps.format, function (e, r) {
                n = QZFL.object.route(t, r);
                return n === undefined ? e : n
            })
        }
    };
    QZFL.string.restHTML = QZFL.string.restXHTML;
    QZFL.util = {
        buildUri: function (e) {
            return new QZFL.util.URI(e)
        }, URI: function (e) {
            if (!(QZFL.object.getType(e) == "string")) {
                return null
            }
            if (e.indexOf("//") == 0) {
                e = window.location.protocol + e
            }
            if (e.indexOf("://") < 1) {
                e = location.protocol + "//" + location.host + (e.indexOf("/") == 0 ? "" : location.pathname.substr(0, location.pathname.lastIndexOf("/") + 1)) + e
            }
            var t = e.split("://");
            if (QZFL.object.getType(t) == "array" && t.length > 1 && /^[a-zA-Z]+$/.test(t[0])) {
                this.protocol = t[0].toLowerCase();
                var n = t[1].split("/");
                if (QZFL.object.getType(n) == "array") {
                    this.host = n[0];
                    this.pathname = "/" + n.slice(1).join("/").replace(/(\?|\#).+/i, "");
                    this.href = e;
                    var r = t[1].lastIndexOf("?"), i = t[1].lastIndexOf("#");
                    this.search = r >= 0 ? t[1].substring(r) : "";
                    this.hash = i >= 0 ? t[1].substring(i) : "";
                    if (this.search.length > 0 && this.hash.length > 0) {
                        if (i < r) {
                            this.search = ""
                        } else {
                            this.search = t[1].substring(r, i)
                        }
                    }
                    return this
                } else {
                    return null
                }
            } else {
                return null
            }
        }
    };
    QZFL.lang = {
        isString: function (e) {
            return QZFL.object.getType(e) == "string"
        }, isArray: function (e) {
            return QZFL.object.getType(e) == "array"
        }, isFunction: function (e) {
            return QZFL.object.getType(e) == "function"
        }, isHashMap: function (e) {
            return QZFL.object.getType(e) == "object"
        }, isNode: function (e) {
            return e && (typeof e.nodeName != "undefined" || typeof e.nodeType != "undefined")
        }, isElement: function (e) {
            return e && e.nodeType == 1
        }
    };
    (function () {
        var e = 0, t = 0;
        QZFL.object.extend(QZFL.util, {
            copyToClip: function (e) {
                if (QZFL.userAgent.ie) {
                    return clipboardData.setData("Text", e)
                } else {
                    var t = QZFL.shareObject.getValidSO();
                    return t ? t.setClipboard(e) : false
                }
            }, evalGlobal: function (t) {
                t = String(t);
                var n = document.createElement("script"),
                    r = document.documentElement || document.getElementsByTagName("head")[0];
                n.type = "text/javascript";
                n.id = "__evalGlobal_" + e;
                try {
                    n.innerHTML = t
                } catch (e) {
                    n.text = t
                }
                r.insertBefore(n, r.firstChild);
                e++;
                setTimeout(function () {
                    QZFL.dom.removeElement(n)
                }, 50)
            }, runStyleGlobal: function (e) {
                if (QZFL.userAgent.safari) {
                    var n = document.createElement("style");
                    n.type = "text/css";
                    n.id = "__runStyle_" + t;
                    try {
                        n.textContent = e
                    } catch (e) {
                        alert(e.message)
                    }
                    var r = document.getElementsByTagName("head")[0];
                    if (r) {
                        r.appendChild(n);
                        t++
                    }
                } else {
                }
            }, genHttpParamString: function (e) {
                return QZFL.util.commonDictionaryJoin(e, null, null, null, window.encodeURIComponent)
            }, splitHttpParamString: function (e) {
                return QZFL.util.commonDictionarySplit(e)
            }, commonDictionarySplit: function (e, t, n, r) {
                var i = {}, o, a, s, u;
                if (!e || typeof e != "string") {
                    return i
                }
                if (typeof t != "string") {
                    t = "&"
                }
                if (typeof n != "string") {
                    n = ""
                }
                if (typeof r != "string") {
                    r = "="
                }
                o = e.split(t);
                if (o && o.length) {
                    for (var l = 0, c = o.length; l < c; ++l) {
                        a = o[l].split(r);
                        if (a.length > 1) {
                            u = a.slice(1).join(r);
                            s = u.split(n);
                            i[a[0]] = s.slice(n.length, s.length - n.length).join(n)
                        } else {
                            a[0] && (i[a[0]] = true)
                        }
                    }
                }
                return i
            }, commonDictionaryJoin: function (e, t, n, r, i) {
                var o = [], a;
                if (!e || typeof e != "object") {
                    return ""
                }
                if (typeof e == "string") {
                    return e
                }
                if (typeof t != "string") {
                    t = "&"
                }
                if (typeof n != "string") {
                    n = ""
                }
                if (typeof r != "string") {
                    r = "="
                }
                for (var s in e) {
                    o.push(s + r + n + (typeof i == "function" ? i(e[s]) : e[s]) + n)
                }
                return o.join(t)
            }
        })
    })();
    QZFL.lang.isValidXMLdom = function (e) {
        return !!(e && e.xml && /^<\?xml/.test(e.xml))
    };
    QZFL.lang.arg2arr = function (e, t) {
        return Array.prototype.slice.call(e, t || 0)
    };
    QZFL.lang.getObjByNameSpace = function (e, t) {
        if (typeof e != "string") {
            return e
        }
        var n = e.split("."), r = window;
        try {
            for (var i = 0, o = n.length; i < o; ++i) {
                if (typeof r[n[i]] == "undefined") {
                    if (t) {
                        r[n[i]] = {}
                    } else {
                        return
                    }
                }
                r = r[n[i]]
            }
            return r
        } catch (e) {
            return
        }
    };
    QZFL.lang.objectClone = function (e, t) {
        if (typeof e == "object") {
            var n = QZFL.lang.isArray(e) ? [] : {};
            for (var r in e) {
                if (r != t) n[r] = QZFL.lang.objectClone(e[r], t)
            }
            return n
        } else if (typeof e == "function") {
            return Object
        }
        return e
    };
    QZFL.lang.obj2str = function (e) {
        var t, n;
        if (typeof e == "object") {
            if (e === null) {
                return "null"
            }
            if (window.JSON && window.JSON.stringify) {
                return JSON.stringify(e)
            }
            n = QZFL.lang.isArray(e);
            t = [];
            for (var r in e) {
                t.push((n ? "" : '"' + QZFL.string.escString(r) + '":') + obj2str(e[r]))
            }
            t = t.join();
            return n ? "[" + t + "]" : "{" + t + "}"
        } else if (typeof e == "undefined") {
            return "undefined"
        } else if (typeof e == "number" || typeof e == "function") {
            return e.toString()
        }
        return !e ? '""' : '"' + QZFL.string.escString(e) + '"'
    }
    ;QZFL.lang.propertieCopy = function (e, t, n, r) {
        var i = !n || typeof n != "object" ? t : n;
        e = e || {};
        for (var o in i) {
            if (!r || !(o in e)) {
                e[o] = i[o]
            }
        }
        return e
    };
    QZFL.lang.tryThese = function () {
        for (var e = 0, t = arguments.length; e < t; ++e) {
            try {
                return arguments[e]()
            } catch (e) {
            }
        }
        return
    };
    QZFL.lang.chain = function (e, t) {
        var n = QZFL.lang.arg2arr(arguments);
        return function () {
            for (var e = 0, t = n.length; e < t; ++e) {
                if (n[e] && n[e].apply(null, arguments) === false) {
                    return false
                }
            }
            return true
        }
    };
    QZFL.lang.uniqueArray = function (e) {
        if (!QZFL.lang.isArray(e)) {
            return e
        }
        var t = {}, n = 0;
        while (n < e.length) {
            if (t[e[n]] == typeof e[n]) {
                e.splice(n, 1);
                continue
            }
            t[e[n].toString()] = typeof e[n];
            ++n
        }
        return e
    };
    QZFL.enviroment = function () {
        var e = {}, t = {};

        function n(t) {
            return e[t]
        }

        function r(t) {
            delete e[t];
            return true
        }

        function i(t, n) {
            if (typeof n == "undefined") {
                if (typeof t == "undefined") {
                    return false
                } else if (!(e[t] === undefined)) {
                    return false
                }
            } else {
                e[t] = n;
                return true
            }
        }

        return {get: n, set: i, del: r, hookPool: t}
    }();
    QZFL.pageEvents = function () {
        function _ihp() {
            var e = location.search.substring(1), t = location.hash.substring(1), n, r, i;
            ENV.set("_queryString", e);
            ENV.set("_queryHash", t);
            ENV.set("queryString", n = QZFL.util.splitHttpParamString(e));
            ENV.set("queryHash", r = QZFL.util.splitHttpParamString(t));
            if (n && n.DEBUG) {
                i = parseInt(n.DEBUG, 10);
                if (!isNaN(i)) {
                    QZFL.config.debugLevel = i
                }
            }
        }

        function _bootStrap() {
            if (QZFL.event.onDomReady.isReady) {
                setTimeout(_onloadHook, 1)
            } else if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", _onloadHook, true)
            } else {
                var e = window.location.protocol == "https:" ? "//:" : "javascript:void(0)";
                document.write('<script onreadystatechange="if(this.readyState==\'complete\'){this.parentNode.removeChild(this);QZFL.pageEvents._onloadHook();}" defer="defer" src="' + e + '"><\/script>')
            }
            window.onload = QZFL.lang.chain(window.onload, function () {
                _onloadHook();
                _runHooks("onafterloadhooks")
            });
            window.onbeforeunload = function () {
                return _runHooks("onbeforeunloadhooks")
            };
            window.onunload = QZFL.lang.chain(window.onunload, function () {
                _runHooks("onunloadhooks")
            })
        }

        function _onloadHook() {
            _runHooks("onloadhooks");
            QZFL.enviroment.loaded = true;
            QZFL.event.onDomReady.isReady = true
        }

        function _runHook(e) {
            try {
                e()
            } catch (e) {
            }
        }

        function _runHooks(e) {
            if (!window.ENV) {
                return
            }
            var t = e == "onbeforeunloadhooks", n = null, r = window.ENV.hookPool;
            do {
                var i = r[e];
                if (!t) {
                    r[e] = null
                }
                if (!i) {
                    break
                }
                for (var o = 0; o < i.length; o++) {
                    if (t) {
                        n = n || i[o]()
                    } else {
                        i[o]()
                    }
                }
                if (t) {
                    break
                }
            } while (r[e]);
            if (t) {
                if (n) {
                    return n
                } else {
                    QZFL.enviroment.loaded = false
                }
            }
        }

        function _addHook(e, t) {
            var n = window.ENV.hookPool;
            (n[e] ? n[e] : n[e] = []).push(t)
        }

        function _insertHook(e, t, n) {
            var r = window.ENV.hookPool;
            if (typeof n == "number" && n >= 0) {
                if (!r[e]) {
                    r[e] = []
                }
                r[e].splice(n, 0, t)
            } else {
                return false
            }
        }

        function _lr(e) {
            QZFL.enviroment.loaded ? _runHook(e) : _addHook("onloadhooks", e)
        }

        function _bulr(e) {
            _addHook("onbeforeunloadhooks", e)
        }

        function _ulr(e) {
            _addHook("onunloadhooks", e)
        }

        function pinit() {
            _bootStrap();
            _ihp();
            var _dt;
            if (_dt = document.getElementById("__DEBUG_out")) {
                ENV.set("dout", _dt)
            }
            var __dalert
            ;
            if (!ENV.get("alertConverted")) {
                __dalert = alert;
                eval("var alert=function(msg){if(msg!=undefined){__dalert(msg);return msg;}}");
                ENV.set("alertConverted", true)
            }
            var t = ENV.get("queryHash");
            if (t && t.DEBUG) {
                QZFL.config.debugLevel = 2
            }
        }

        return {
            onloadRegister: _lr,
            onbeforeunloadRegister: _bulr,
            onunloadRegister: _ulr,
            initHttpParams: _ihp,
            bootstrapEventHandlers: _bootStrap,
            _onloadHook: _onloadHook,
            insertHooktoHooksQueue: _insertHook,
            pageBaseInit: pinit
        }
    }();
    QZFL.string = QZONE.string || {};
    QZFL.string.parseXML = function (e) {
        var t;
        if (window.ActiveXObject) {
            t = QZFL.lang.tryThese(function () {
                return new ActiveXObject("MSXML2.DOMDocument.6.0")
            }, function () {
                return new ActiveXObject("MSXML2.DOMDocument.5.0")
            }, function () {
                return new ActiveXObject("MSXML2.DOMDocument.4.0")
            }, function () {
                return new ActiveXObject("MSXML2.DOMDocument.3.0")
            }, function () {
                return new ActiveXObject("MSXML2.DOMDocument")
            }, function () {
                return new ActiveXObject("Microsoft.XMLDOM")
            });
            t.async = "false";
            t.loadXML(e);
            if (t.parseError.reason) {
                return null
            }
        } else {
            var n = new DOMParser;
            t = n.parseFromString(e, "text/xml");
            if (t.documentElement.nodeName == "parsererror") {
                return null
            }
        }
        return t.documentElement
    };
    QZFL.string.timeFormatString = function (e, t, n) {
        try {
            e = e.getTime ? e : new Date(e)
        } catch (e) {
            return ""
        }
        var r = QZFL.string.timeFormatString, i = r._map, o = r._units, a = false, s, u, l;
        if (!t) {
            n = n || new Date;
            u = Math.abs(e - n);
            for (var c = 0, f = o.length; c < f; ++c) {
                s = i[o[c]];
                if (u > s[1]) {
                    return Math.floor(u / s[1]) + s[2]
                }
            }
            return "刚刚"
        } else {
            return t.replace(r._re, function (t, r, o) {
                (a = r.charAt(0) == "_") && (r = r.charAt(1));
                if (!i[r]) {
                    return t
                }
                if (!a) {
                    l = e[i[r][0]]();
                    r == "y" && (l %= 100);
                    r == "M" && l++;
                    return l < 10 ? QZFL.string.fillLength(l, 2, o) : l.toString()
                } else {
                    return Math.floor(Math.abs(e - n) / i[r][1])
                }
            })
        }
    };
    QZFL.string.timeFormatString._re = /\{([_yYMdhms]{1,2})(?:\:([\d\w\s]))?\}/g;
    QZFL.string.timeFormatString._map = {
        y: ["getYear", 31104e6],
        Y: ["getFullYear", 31104e6, "年前"],
        M: ["getMonth", 2592e6, "个月前"],
        d: ["getDate", 864e5, "天前"],
        h: ["getHours", 36e5, "小时前"],
        m: ["getMinutes", 6e4, "分钟前"],
        s: ["getSeconds", 1e3, "秒前"]
    }
    ;QZFL.string.timeFormatString._units = ["Y", "M", "d", "h", "m", "s"];
    QZFL.string.StringBuilder = function () {
        this._strList = QZFL.lang.arg2arr(arguments)
    };
    QZFL.string.StringBuilder.prototype = {
        append: function (e) {
            this._strList.push(String(e))
        }, insertFirst: function (e) {
            this._strList.unshift(String(e))
        }, appendArray: function (e) {
            this._strList = this._strList.concat(e)
        }, toString: function (e) {
            return this._strList.join(e || "")
        }, clear: function () {
            this._strList.splice(0, this._strList.length)
        }
    };
    (function () {
        var e = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
            t = 0, n = Object.prototype.toString, r = false, i = true, o = /\\/g, a = /\W/, s,
            u = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)|^(\w+)\.([\w\-]+$)/;
        [0, 0].sort(function () {
            i = false;
            return 0
        });
        var l = function (t, r, i, o) {
            i = i || [];
            r = r || document;
            var a = r;
            if (r.nodeType !== 1 && r.nodeType !== 9) {
                return []
            }
            if (!t || typeof t !== "string") {
                return i
            }
            var d, p, h, g, L, F, Z, v, y = true, _ = l.isXML(r), w = [], b = t, S;
            if (!_) {
                S = u.exec(t);
                if (S) {
                    if (r.nodeType === 1 || r.nodeType === 9) {
                        if (S[1]) {
                            return m(r.getElementsByTagName(t), i)
                        } else if (S[2] || S[4] && S[5]) {
                            if (r.getElementsByClassName && S[2]) {
                                return m(r.getElementsByClassName(S[2]), i)
                            } else {
                                var T = r.getElementsByTagName(S[4] || "*"), x = [], C, E = " " + (S[2] || S[5]) + " ";
                                for (var N = 0, D = T.length; N < D; ++N) {
                                    C = T[N];
                                    (" " + C.className + " ").indexOf(E) > -1 && x.push(C)
                                }
                                return m(x, i)
                            }
                        }
                    }
                    if (r.nodeType === 9) {
                        if ((t === "body" || t.toLowerCase() === "body") && r.body) {
                            return m([r.body], i)
                        } else if (S[3]) {
                            return (s = r.getElementById(S[3])) ? m([s], i) : m([], i)
                        }
                    }
                }
            }
            do {
                e.exec("");
                d = e.exec(b);
                if (d) {
                    b = d[3];
                    w.push(d[1]);
                    if (d[2]) {
                        g = d[3];
                        break
                    }
                }
            } while (d);
            if (w.length > 1 && f.exec(t)) {
                if (w.length === 2 && c.relative[w[0]]) {
                    p = Q(w[0] + w[1], r)
                } else {
                    p = c.relative[w[0]] ? [r] : l(w.shift(), r);
                    while (w.length) {
                        t = w.shift();
                        if (c.relative[t]) {
                            t += w.shift()
                        }
                        p = Q(t, p)
                    }
                }
            } else {
                if (!o && w.length > 1 && r.nodeType === 9 && !_ && c.match.ID.test(w[0]) && !c.match.ID.test(w[w.length - 1])) {
                    L = l.find(w.shift(), r, _);
                    r = L.expr ? l.filter(L.expr, L.set)[0] : L.set[0]
                }
                if (r) {
                    L = o ? {
                        expr: w.pop(), set: m(o)
                    } : l.find(w.pop(), w.length === 1 && (w[0] === "~" || w[0] === "+") && r.parentNode ? r.parentNode : r, _);
                    p = L.expr ? l.filter(L.expr, L.set) : L.set;
                    if (w.length > 0) {
                        h = m(p)
                    } else {
                        y = false
                    }
                    while (w.length) {
                        F = w.pop();
                        Z = F;
                        if (!c.relative[F]) {
                            F = ""
                        } else {
                            Z = w.pop()
                        }
                        if (Z == null) {
                            Z = r
                        }
                        c.relative[F](h, Z, _)
                    }
                } else {
                    h = w = []
                }
            }
            if (!h) {
                h = p
            }
            if (!h) {
                l.error(F || t)
            }
            if (n.call(h) === "[object Array]") {
                if (!y) {
                    i.push.apply(i, h)
                } else if (r && r.nodeType === 1) {
                    for (v = 0; h[v] != null; v++) {
                        if (h[v] && (h[v] === true || h[v].nodeType === 1 && l.contains(r, h[v]))) {
                            i.push(p[v])
                        }
                    }
                } else {
                    for (v = 0; h[v] != null; v++) {
                        if (h[v] && h[v].nodeType === 1) {
                            i.push(p[v])
                        }
                    }
                }
            } else {
                m(h, i)
            }
            if (g) {
                l(g, a, i, o);
                l.uniqueSort(i)
            }
            return i
        };
        l.uniqueSort = function (e) {
            if (h) {
                r = i;
                e.sort(h);
                if (r) {
                    for (var t = 1; t < e.length; t++) {
                        if (e[t] === e[t - 1]) {
                            e.splice(t--, 1)
                        }
                    }
                }
            }
            return e
        };
        l.matches = function (e, t) {
            return l(e, null, null, t)
        };
        l.matchesSelector = function (e, t) {
            return l(t, null, null, [e]).length > 0
        };
        l.find = function (e, t, n) {
            var r;
            if (!e) {
                return []
            }
            for (var i = 0, a = c.order.length; i < a; i++) {
                var s, u = c.order[i]
                ;
                if (s = c.leftMatch[u].exec(e)) {
                    var l = s[1];
                    s.splice(1, 1);
                    if (l.substr(l.length - 1) !== "\\") {
                        s[1] = (s[1] || "").replace(o, "");
                        r = c.find[u](s, t, n);
                        if (r != null) {
                            e = e.replace(c.match[u], "");
                            break
                        }
                    }
                }
            }
            if (!r) {
                r = typeof t.getElementsByTagName !== "undefined" ? t.getElementsByTagName("*") : []
            }
            return {set: r, expr: e}
        };
        l.filter = function (e, t, n, r) {
            var i, o, a = e, s = [], u = t, f = t && t[0] && l.isXML(t[0]);
            while (e && t.length) {
                for (var d in c.filter) {
                    if ((i = c.leftMatch[d].exec(e)) != null && i[2]) {
                        var p, m, h = c.filter[d], g = i[1];
                        o = false;
                        i.splice(1, 1);
                        if (g.substr(g.length - 1) === "\\") {
                            continue
                        }
                        if (u === s) {
                            s = []
                        }
                        if (c.preFilter[d]) {
                            i = c.preFilter[d](i, u, n, s, r, f);
                            if (!i) {
                                o = p = true
                            } else if (i === true) {
                                continue
                            }
                        }
                        if (i) {
                            for (var L = 0; (m = u[L]) != null; L++) {
                                if (m) {
                                    p = h(m, i, L, u);
                                    var F = r ^ !!p;
                                    if (n && p != null) {
                                        if (F) {
                                            o = true
                                        } else {
                                            u[L] = false
                                        }
                                    } else if (F) {
                                        s.push(m);
                                        o = true
                                    }
                                }
                            }
                        }
                        if (p !== undefined) {
                            if (!n) {
                                u = s
                            }
                            e = e.replace(c.match[d], "");
                            if (!o) {
                                return []
                            }
                            break
                        }
                    }
                }
                if (e === a) {
                    if (o == null) {
                        l.error(e)
                    } else {
                        break
                    }
                }
                a = e
            }
            return u
        };
        l.error = function (e) {
            throw"Syntax error, unrecognized expression: " + e
        };
        var c = l.selectors = {
            order: ["ID", "NAME", "TAG"],
            match: {
                ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
                ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
                TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
                CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
                POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
                PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
            },
            leftMatch: {},
            attrMap: {class: "className", for: "htmlFor"},
            attrHandle: {
                href: function (e) {
                    return e.getAttribute("href")
                }, type: function (e) {
                    return e.getAttribute("type")
                }
            },
            relative: {
                "+": function (e, t) {
                    var n = typeof t === "string", r = n && !a.test(t), i = n && !r;
                    if (r) {
                        t = t.toLowerCase()
                    }
                    for (var o = 0, s = e.length, u; o < s; o++) {
                        if (u = e[o]) {
                            while ((u = u.previousSibling) && u.nodeType !== 1) {
                            }
                            e[o] = i || u && u.nodeName.toLowerCase() === t ? u || false : u === t
                        }
                    }
                    if (i) {
                        l.filter(t, e, true)
                    }
                }, ">": function (e, t) {
                    var n, r = typeof t === "string", i = 0, o = e.length;
                    if (r && !a.test(t)) {
                        t = t.toLowerCase();
                        for (; i < o; i++) {
                            n = e[i];
                            if (n) {
                                var s = n.parentNode;
                                e[i] = s.nodeName.toLowerCase() === t ? s : false
                            }
                        }
                    } else {
                        for (; i < o; i++) {
                            n = e[i];
                            if (n) {
                                e[i] = r ? n.parentNode : n.parentNode === t
                            }
                        }
                        if (r) {
                            l.filter(t, e, true)
                        }
                    }
                }, "": function (e, n, r) {
                    var i, o = t++, s = F;
                    if (typeof n === "string" && !a.test(n)) {
                        n = n.toLowerCase();
                        i = n;
                        s = L
                    }
                    s("parentNode", n, o, e, i, r)
                }, "~": function (e, n, r) {
                    var i, o = t++, s = F;
                    if (typeof n === "string" && !a.test(n)) {
                        n = n.toLowerCase();
                        i = n;
                        s = L
                    }
                    s("previousSibling", n, o, e, i, r)
                }
            },
            find: {
                ID: function (e, t, n) {
                    if (typeof t.getElementById !== "undefined" && !n) {
                        var r = t.getElementById(e[1]);
                        return r && r.parentNode ? [r] : []
                    }
                }, NAME: function (e, t) {
                    if (typeof t.getElementsByName !== "undefined") {
                        var n = [], r = t.getElementsByName(e[1]);
                        for (var i = 0, o = r.length; i < o; i++) {
                            if (r[i].getAttribute("name") === e[1]) {
                                n.push(r[i])
                            }
                        }
                        return n.length === 0 ? null : n
                    }
                }, TAG: function (e, t) {
                    if (typeof t.getElementsByTagName !== "undefined") {
                        return t.getElementsByTagName(e[1])
                    }
                }
            },
            preFilter: {
                CLASS: function (e, t, n, r, i, a) {
                    e = " " + e[1].replace(o, "") + " ";
                    if (a) {
                        return e
                    }
                    for (var s = 0, u; (u = t[s]) != null; s++) {
                        if (u) {
                            if (i ^ (u.className && (" " + u.className + " ").replace(/[\t\n\r]/g, " ").indexOf(e) >= 0)) {
                                if (!n) {
                                    r.push(u)
                                }
                            } else if (n) {
                                t[s] = false
                            }
                        }
                    }
                    return false
                }, ID: function (e) {
                    return e[1].replace(o, "")
                }, TAG: function (e, t) {
                    return e[1].replace(o, "").toLowerCase()
                }, CHILD: function (e) {
                    if (e[1] === "nth") {
                        if (!e[2]) {
                            l.error(e[0])
                        }
                        e[2] = e[2].replace(/^\+|\s*/g, "");
                        var n = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(e[2] === "even" && "2n" || e[2] === "odd" && "2n+1" || !/\D/.test(e[2]) && "0n+" + e[2] || e[2]);
                        e[2] = n[1] + (n[2] || 1) - 0;
                        e[3] = n[3] - 0
                    } else if (e[2]) {
                        l.error(e[0])
                    }
                    e[0] = t++;
                    return e
                }, ATTR: function (e, t, n, r, i, a) {
                    var s = e[1] = e[1].replace(o, "");
                    if (!a && c.attrMap[s]) {
                        e[1] = c.attrMap[s]
                    }
                    e[4] = (e[4] || e[5] || "").replace(o, "");
                    if (e[2] === "~=") {
                        e[4] = " " + e[4] + " "
                    }
                    return e
                }, PSEUDO: function (t, n, r, i, o) {
                    if (t[1] === "not") {
                        if ((e.exec(t[3]) || "").length > 1 || /^\w/.test(t[3])) {
                            t[3] = l(t[3], null, null, n)
                        } else {
                            var a = l.filter(t[3], n, r, true ^ o);
                            if (!r) {
                                i.push.apply(i, a)
                            }
                            return false
                        }
                    } else if (c.match.POS.test(t[0]) || c.match.CHILD.test(t[0])) {
                        return true
                    }
                    return t
                }, POS: function (e) {
                    e.unshift(true);
                    return e
                }
            },
            filters: {
                enabled: function (e) {
                    return e.disabled === false && e.type !== "hidden"
                }, disabled: function (e) {
                    return e.disabled === true
                }, checked: function (e) {
                    return e.checked === true
                }, selected: function (e) {
                    if (e.parentNode) {
                        e.parentNode.selectedIndex
                    }
                    return e.selected === true
                }, parent: function (e) {
                    return !!e.firstChild
                }, empty: function (e) {
                    return !e.firstChild
                }, has: function (e, t, n) {
                    return !!l(n[3], e).length
                }, header: function (e) {
                    return /h\d/i.test(e.nodeName)
                }, text: function (e) {
                    return "text" === e.getAttribute("type")
                }, radio: function (e) {
                    return "radio" === e.type
                }, checkbox: function (e) {
                    return "checkbox" === e.type
                }, file: function (e) {
                    return "file" === e.type
                }, password: function (e) {
                    return "password" === e.type
                }, submit: function (e) {
                    return "submit" === e.type
                },
                image: function (e) {
                    return "image" === e.type
                }, reset: function (e) {
                    return "reset" === e.type
                }, button: function (e) {
                    return "button" === e.type || e.nodeName.toLowerCase() === "button"
                }, input: function (e) {
                    return /input|select|textarea|button/i.test(e.nodeName)
                }
            },
            setFilters: {
                first: function (e, t) {
                    return t === 0
                }, last: function (e, t, n, r) {
                    return t === r.length - 1
                }, even: function (e, t) {
                    return t % 2 === 0
                }, odd: function (e, t) {
                    return t % 2 === 1
                }, lt: function (e, t, n) {
                    return t < n[3] - 0
                }, gt: function (e, t, n) {
                    return t > n[3] - 0
                }, nth: function (e, t, n) {
                    return n[3] - 0 === t
                }, eq: function (e, t, n) {
                    return n[3] - 0 === t
                }
            },
            filter: {
                PSEUDO: function (e, t, n, r) {
                    var i = t[1], o = c.filters[i];
                    if (o) {
                        return o(e, n, t, r)
                    } else if (i === "contains") {
                        return (e.textContent || e.innerText || l.getText([e]) || "").indexOf(t[3]) >= 0
                    } else if (i === "not") {
                        var a = t[3];
                        for (var s = 0, u = a.length; s < u; s++) {
                            if (a[s] === e) {
                                return false
                            }
                        }
                        return true
                    } else {
                        l.error(i)
                    }
                }, CHILD: function (e, t) {
                    var n = t[1], r = e;
                    switch (n) {
                        case"only":
                        case"first":
                            while (r = r.previousSibling) {
                                if (r.nodeType === 1) {
                                    return false
                                }
                            }
                            if (n === "first") {
                                return true
                            }
                            r = e;
                        case"last":
                            while (r = r.nextSibling) {
                                if (r.nodeType === 1) {
                                    return false
                                }
                            }
                            return true;
                        case"nth":
                            var i = t[2], o = t[3];
                            if (i === 1 && o === 0) {
                                return true
                            }
                            var a = t[0], s = e.parentNode;
                            if (s && (s.sizcache !== a || !e.nodeIndex)) {
                                var u = 0;
                                for (r = s.firstChild; r; r = r.nextSibling) {
                                    if (r.nodeType === 1) {
                                        r.nodeIndex = ++u
                                    }
                                }
                                s.sizcache = a
                            }
                            var l = e.nodeIndex - o;
                            if (i === 0) {
                                return l === 0
                            } else {
                                return l % i === 0 && l / i >= 0
                            }
                    }
                }, ID: function (e, t) {
                    return e.nodeType === 1 && e.getAttribute("id") === t
                }, TAG: function (e, t) {
                    return t === "*" && e.nodeType === 1 || e.nodeName.toLowerCase() === t
                }, CLASS: function (e, t) {
                    return (" " + (e.className || e.getAttribute("class")) + " ").indexOf(t) > -1
                }, ATTR: function (e, t) {
                    var n = t[1], r = c.attrHandle[n] ? c.attrHandle[n](e) : e[n] != null ? e[n] : e.getAttribute(n),
                        i = r + "", o = t[2], a = t[4];
                    return r == null ? o === "!=" : o === "=" ? i === a : o === "*=" ? i.indexOf(a) >= 0 : o === "~=" ? (" " + i + " ").indexOf(a) >= 0 : !a ? i && r !== false : o === "!=" ? i !== a : o === "^=" ? i.indexOf(a) === 0 : o === "$=" ? i.substr(i.length - a.length) === a : o === "|=" ? i === a || i.substr(0, a.length + 1) === a + "-" : false
                },
                POS: function (e, t, n, r) {
                    var i = t[2], o = c.setFilters[i];
                    if (o) {
                        return o(e, n, t, r)
                    }
                }
            }
        };
        var f = c.match.POS, d = function (e, t) {
            return "\\" + (t - 0 + 1)
        };
        for (var p in c.match) {
            c.match[p] = new RegExp(c.match[p].source + /(?![^\[]*\])(?![^\(]*\))/.source);
            c.leftMatch[p] = new RegExp(/(^(?:.|\r|\n)*?)/.source + c.match[p].source.replace(/\\(\d+)/g, d))
        }
        var m = function (e, t) {
            e = Array.prototype.slice.call(e, 0);
            if (t) {
                t.push.apply(t, e);
                return t
            }
            return e
        };
        try {
            Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType
        } catch (e) {
            m = function (e, t) {
                var r = 0, i = t || [];
                if (n.call(e) === "[object Array]") {
                    Array.prototype.push.apply(i, e)
                } else {
                    if (typeof e.length === "number") {
                        for (var o = e.length; r < o; r++) {
                            i.push(e[r])
                        }
                    } else {
                        for (; e[r]; r++) {
                            i.push(e[r])
                        }
                    }
                }
                return i
            }
        }
        var h, g;
        if (document.documentElement.compareDocumentPosition) {
            h = function (e, t) {
                if (e === t) {
                    r = true;
                    return 0
                }
                if (!e.compareDocumentPosition || !t.compareDocumentPosition) {
                    return e.compareDocumentPosition ? -1 : 1
                }
                return e.compareDocumentPosition(t) & 4 ? -1 : 1
            }
        } else {
            h = function (e, t) {
                var n, i, o = [], a = [], s = e.parentNode, u = t.parentNode, l = s;
                if (e === t) {
                    r = true;
                    return 0
                } else if (s === u) {
                    return g(e, t)
                } else if (!s) {
                    return -1
                } else if (!u) {
                    return 1
                }
                while (l) {
                    o.unshift(l);
                    l = l.parentNode
                }
                l = u;
                while (l) {
                    a.unshift(l);
                    l = l.parentNode
                }
                n = o.length;
                i = a.length;
                for (var c = 0; c < n && c < i; c++) {
                    if (o[c] !== a[c]) {
                        return g(o[c], a[c])
                    }
                }
                return c === n ? g(e, a[c], -1) : g(o[c], t, 1)
            };
            g = function (e, t, n) {
                if (e === t) {
                    return n
                }
                var r = e.nextSibling;
                while (r) {
                    if (r === t) {
                        return -1
                    }
                    r = r.nextSibling
                }
                return 1
            }
        }
        l.getText = function (e) {
            var t = "", n;
            for (var r = 0; e[r]; r++) {
                n = e[r];
                if (n.nodeType === 3 || n.nodeType === 4) {
                    t += n.nodeValue
                } else if (n.nodeType !== 8) {
                    t += l.getText(n.childNodes)
                }
            }
            return t
        };
        (function () {
            var e = document.createElement("div"), t = "script" + (new Date).getTime(), n = document.documentElement;
            e.innerHTML = "<a name='" + t + "'/>";
            n.insertBefore(e, n.firstChild);
            if (document.getElementById(t)) {
                c.find.ID = function (e, t, n) {
                    if (typeof t.getElementById !== "undefined" && !n) {
                        var r = t.getElementById(e[1])
                        ;
                        return r ? r.id === e[1] || typeof r.getAttributeNode !== "undefined" && r.getAttributeNode("id").nodeValue === e[1] ? [r] : undefined : []
                    }
                };
                c.filter.ID = function (e, t) {
                    var n = typeof e.getAttributeNode !== "undefined" && e.getAttributeNode("id");
                    return e.nodeType === 1 && n && n.nodeValue === t
                }
            }
            n.removeChild(e);
            n = e = null
        })();
        (function () {
            var e = document.createElement("div");
            e.appendChild(document.createComment(""));
            if (e.getElementsByTagName("*").length > 0) {
                c.find.TAG = function (e, t) {
                    var n = t.getElementsByTagName(e[1]);
                    if (e[1] === "*") {
                        var r = [];
                        for (var i = 0; n[i]; i++) {
                            if (n[i].nodeType === 1) {
                                r.push(n[i])
                            }
                        }
                        n = r
                    }
                    return n
                }
            }
            e.innerHTML = "<a href='#'></a>";
            if (e.firstChild && typeof e.firstChild.getAttribute !== "undefined" && e.firstChild.getAttribute("href") !== "#") {
                c.attrHandle.href = function (e) {
                    return e.getAttribute("href", 2)
                }
            }
            e = null
        })();
        if (document.querySelectorAll) {
            (function () {
                var e = l, t = "__sizzle__";
                l = function (n, r, i, o) {
                    r = r || document;
                    if (!o && !l.isXML(r)) {
                        var a = u.exec(n);
                        if (a && (r.nodeType === 1 || r.nodeType === 9)) {
                            if (a[1]) {
                                return m(r.getElementsByTagName(n), i)
                            } else if (a[2] && c.find.CLASS && r.getElementsByClassName) {
                                return m(r.getElementsByClassName(a[2]), i)
                            }
                        }
                        if (r.nodeType === 9) {
                            if (n === "body" && r.body) {
                                return m([r.body], i)
                            } else if (a && a[3]) {
                                var s = r.getElementById(a[3]);
                                if (s && s.parentNode) {
                                    if (s.id === a[3]) {
                                        return m([s], i)
                                    }
                                } else {
                                    return m([], i)
                                }
                            }
                            try {
                                return m(r.querySelectorAll(n), i)
                            } catch (e) {
                            }
                        } else if (r.nodeType === 1 && r.nodeName.toLowerCase() !== "object") {
                            var f = r, d = r.getAttribute("id"), p = d || t, h = r.parentNode, g = /^\s*[+~]/.test(n);
                            if (!d) {
                                r.setAttribute("id", p)
                            } else {
                                p = p.replace(/'/g, "\\$&")
                            }
                            if (g && h) {
                                r = r.parentNode
                            }
                            try {
                                if (!g || h) {
                                    return m(r.querySelectorAll("[id='" + p + "'] " + n), i)
                                }
                            } catch (e) {
                            } finally {
                                if (!d) {
                                    f.removeAttribute("id")
                                }
                            }
                        }
                    }
                    return e(n, r, i, o)
                };
                for (var n in e) {
                    l[n] = e[n]
                }
            })()
        }
        (function () {
            var e = document.documentElement,
                t = e.matchesSelector || e.mozMatchesSelector || e.webkitMatchesSelector || e.msMatchesSelector,
                n = false;
            try {
                t.call(document.documentElement, "[test!='']:sizzle")
            } catch (e) {
                n = true
            }
            if (t) {
                l.matchesSelector = function (e, r) {
                    r = r.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
                    if (!l.isXML(e)) {
                        try {
                            if (n || !c.match.PSEUDO.test(r) && !/!=/.test(r)) {
                                return t.call(e, r)
                            }
                        } catch (e) {
                        }
                    }
                    return l(r, null, null, [e]).length > 0
                }
            }
        })();
        c.order.splice(1, 0, "CLASS");
        c.find.CLASS = function (e, t, n) {
            if (typeof t.getElementsByClassName !== "undefined" && !n) {
                return t.getElementsByClassName(e[1])
            }
        };

        function L(e, t, n, r, i, o) {
            for (var a = 0, s = r.length; a < s; a++) {
                var u = r[a];
                if (u) {
                    var l = false;
                    u = u[e];
                    while (u) {
                        if (u.sizcache === n) {
                            l = r[u.sizset];
                            break
                        }
                        if (u.nodeType === 1 && !o) {
                            u.sizcache = n;
                            u.sizset = a
                        }
                        if (u.nodeName.toLowerCase() === t) {
                            l = u;
                            break
                        }
                        u = u[e]
                    }
                    r[a] = l
                }
            }
        }

        function F(e, t, n, r, i, o) {
            for (var a = 0, s = r.length; a < s; a++) {
                var u = r[a];
                if (u) {
                    var c = false;
                    u = u[e];
                    while (u) {
                        if (u.sizcache === n) {
                            c = r[u.sizset];
                            break
                        }
                        if (u.nodeType === 1) {
                            if (!o) {
                                u.sizcache = n;
                                u.sizset = a
                            }
                            if (typeof t !== "string") {
                                if (u === t) {
                                    c = true;
                                    break
                                }
                            } else if (l.filter(t, [u]).length > 0) {
                                c = u;
                                break
                            }
                        }
                        u = u[e]
                    }
                    r[a] = c
                }
            }
        }

        if (document.documentElement.compareDocumentPosition) {
            l.contains = function (e, t) {
                return !!(e.compareDocumentPosition(t) & 16)
            }
        } else if (document.documentElement.contains) {
            l.contains = function (e, t) {
                if (e !== t && e.contains && t.contains) {
                    return e.contains(t)
                } else if (!t || t.nodeType == 9) {
                    return false
                } else if (t === e) {
                    return true
                } else {
                    return l.contains(e, t.parentNode)
                }
            }
        } else {
            l.contains = function () {
                return false
            }
        }
        l.isXML = function (e) {
            var t = (e ? e.ownerDocument || e : 0).documentElement;
            return t ? t.nodeName !== "HTML" : false
        };
        var Q = function (e, t) {
            var n, r = [], i = "", o = t.nodeType ? [t] : t;
            while (n = c.match.PSEUDO.exec(e)) {
                i += n[0];
                e = e.replace(c.match.PSEUDO, "")
            }
            e = c.relative[e] ? e + "*" : e;
            for (var a = 0, s = o.length; a < s; a++) {
                l(e, o[a], r)
            }
            return l.filter(i, r)
        };
        QZFL.selector = window.Sizzle = l;
        QZFL.object.makeArray = QZFL.dom.collection2Array = m;
        QZFL.dom.uniqueSort = l.uniqueSort;
        QZFL.dom.contains = l.contains
    })();
    (function () {
        var e = QZFL.ElementHandler = function (e, t) {
            this.elements = null;
            this._isElementHandler = true;
            this._init(e, t)
        };
        e.prototype = {
            _init: function (e, t) {
                if (QZFL.lang.isString(e)) {
                    this.elements = QZFL.selector(e, t)
                } else if (e instanceof QZFL.ElementHandler) {
                    this.elements = e.elements.slice()
                } else if (QZFL.lang.isArray(e)) {
                    this.elements = e
                } else if (e && (e.nodeType && e.nodeType !== 3 && e.nodeType !== 8 || e.setTimeout)) {
                    this.elements = [e]
                } else {
                    this.elements = []
                }
            }, findElements: function (e) {
                var t = [], n;
                this.each(function (r) {
                    n = QZFL.selector(e, r);
                    if (n.length > 0) {
                        t = t.concat(n)
                    }
                });
                return t
            }, find: function (e) {
                return t.get(this.findElements(e))
            }, filter: function (e, n, r) {
                if (r) {
                    e = ":not(" + e + ")"
                }
                return t.get(QZFL.selector.matches(e, n || this.elements))
            }, each: function (e) {
                QZFL.object.each(this.elements, e);
                return this
            }, concat: function (e) {
                return t.get(this.elements.concat(!!e._isElementHandler ? e.elements : e))
            }, get: function (e) {
                return t.get(this.elements[e])
            }, eq: function (e) {
                return this.elements[e || 0]
            }, slice: function () {
                return t.get(Array.prototype.slice.apply(this.elements, arguments))
            }
        };
        var t = QZFL.element = {
            get: function (t, n) {
                return new e(t, n)
            }, extend: function (t) {
                QZFL.object.extend(e, t)
            }, extendFn: function (t) {
                QZFL.object.extend(e.prototype, t)
            },
            getVersion: function () {
                return e.version
            }
        }
    })();
    QZFL.element.extend({version: "1.0"});
    QZFL.element.extendFn({
        bind: function (e, t, n) {
            if (typeof t != "function") {
                return false
            }
            return this.each(function (r) {
                QZFL.event.addEvent(r, e, t, n)
            })
        }, unBind: function (e, t) {
            return this.each(function (n) {
                QZFL.event[t ? "removeEvent" : "purgeEvent"](n, e, t)
            })
        }, onHover: function (e, t) {
            this.onMouseOver(e);
            return this.onMouseOut(t)
        }, onMouseEnter: function (e) {
            return this.bind("mouseover", function (t) {
                var n = QZFL.event.getRelatedTarget(t);
                if (QZFL.lang.isFunction(e) && !QZFL.dom.isAncestor(this, n)) {
                    e.call(this, t)
                }
            })
        }, onMouseLeave: function (e) {
            return this.bind("mouseout", function (t) {
                var n = QZFL.event.getRelatedTarget(t);
                if (QZFL.lang.isFunction(e) && !QZFL.dom.isAncestor(this, n)) {
                    e.call(this, t)
                }
            })
        }, delegate: function (e, t, n, r) {
            if (typeof n != "function") {
                return false
            }
            return this.each(function (i) {
                QZFL.event.delegate(i, e, t, n, r)
            })
        }, undelegate: function (e, t, n) {
            return this.each(function (r) {
                QZFL.event.undelegate(r, e, t, n)
            })
        }
    })
    ;QZFL.object.each(["onClick", "onMouseDown", "onMouseUp", "onMouseOver", "onMouseMove", "onMouseOut", "onFocus", "onBlur", "onKeyDown", "onKeyPress", "onKeyUp"], function (e, t) {
        QZFL.ElementHandler.prototype[e] = function (t) {
            return this.bind(e.slice(2).toLowerCase(), t)
        }
    });
    QZFL.element.extendFn({
        setHtml: function (e) {
            return this.setAttr("innerHTML", e)
        }, getHtml: function (e) {
            var t = this.elements[e || 0];
            return !!t ? t.innerHTML : null
        }, setVal: function (e) {
            if (QZFL.object.getType(e) == "array") {
                var t = "\0" + e.join("\0") + "\0";
                this.each(function (n) {
                    if (/radio|checkbox/.test(n.type)) {
                        n.checked = n.nodeType && ("\0" + t.indexOf(n.value.toString() + "\0") > -1 || t.indexOf("\0" + n.name.toString() + "\0") > -1)
                    } else if (n.tagName == "SELECT") {
                        QZFL.object.each(n.options, function (e) {
                            e.selected = e.nodeType == 1 && ("\0" + t.indexOf(e.value.toString() + "\0") > -1 || t.indexOf("\0" + e.text.toString() + "\0") > -1)
                        })
                    } else {
                        n.value = e
                    }
                })
            } else {
                this.setAttr("value", e)
            }
            return this
        }, getVal: function (e) {
            var t = this.elements[e || 0], n;
            if (t) {
                if (t.tagName == "SELECT") {
                    n = []
                    ;
                    if (t.selectedIndex < 0) {
                        return null
                    }
                    if (t.type == "select-one") {
                        n.push(t.value)
                    } else {
                        QZFL.object.each(t.options, function (e) {
                            if (e.nodeType == 1 && e.selected) {
                                n.push(e.value)
                            }
                        })
                    }
                } else {
                    n = t.value
                }
            } else {
                return null
            }
            return n
        }, hasClass: function (e) {
            if (this.elements && this.elements.length) {
                return QZFL.css.hasClassName(this.elements[0], e)
            }
            return false
        }, addClass: function (e) {
            return this.each(function (t) {
                QZFL.css.addClassName(t, e)
            })
        }, removeClass: function (e) {
            return this.each(function (t) {
                QZFL.css.removeClassName(t, e)
            })
        }, toggleClass: function (e) {
            return this.each(function (t) {
                QZFL.css.toggleClassName(t, e)
            })
        }, getSize: function (e) {
            var t = this.elements[e || 0];
            return !!t ? QZFL.dom.getSize(t) : null
        }, getXY: function (e) {
            var t = this.elements[e || 0];
            return !!t ? QZFL.dom.getXY(t) : null
        }, setSize: function (e, t) {
            return this.each(function (n) {
                QZFL.dom.setSize(n, e, t)
            })
        }, setXY: function (e, t) {
            return this.each(function (n) {
                QZFL.dom.setXY(n, e, t)
            })
        }, hide: function () {
            return this.each(function (e) {
                QZFL.dom.setStyle(e, "display", "none")
            })
        },
        show: function (e) {
            return this.each(function (t) {
                QZFL.dom.setStyle(t, "display", e ? "block" : "")
            })
        }, getStyle: function (e, t) {
            var n = this.elements[t || 0];
            return !!n ? QZFL.dom.getStyle(n, e) : null
        }, setStyle: function (e, t) {
            return this.each(function (n) {
                QZFL.dom.setStyle(n, e, t)
            })
        }, setAttr: function (e, t) {
            e = e == "class" ? "className" : e;
            return this.each(function (n) {
                n[e] = t
            })
        }, getAttr: function (e, t) {
            e = e == "class" ? "className" : e;
            var n = this.elements[t || 0];
            return n ? n[e] === undefined ? n.getAttribute(e) : n[e] : null
        }
    });
    QZFL.element.extendFn({
        getPrev: function () {
            var e = [];
            this.each(function (t) {
                var n = QZFL.dom.getPreviousSibling(t);
                e.push(n)
            });
            return QZFL.element.get(e)
        }, getNext: function () {
            var e = [];
            this.each(function (t) {
                var n = QZFL.dom.getNextSibling(t);
                e.push(n)
            });
            return QZFL.element.get(e)
        }, getChildren: function () {
            var e = [];
            this.each(function (t) {
                var n = QZFL.dom.getFirstChild(t);
                while (n) {
                    if (!!n && n.nodeType == 1) {
                        e.push(n)
                    }
                    n = n.nextSibling
                }
            });
            return QZFL.element.get(e)
        }, getParent: function () {
            var e = [];
            this.each(function (t) {
                var n = t.parentNode
                ;e.push(n)
            });
            return QZFL.element.get(e)
        }
    });
    QZFL.element.extendFn({
        create: function (e, t) {
            var n = [];
            this.each(function (r) {
                n.push(QZFL.dom.createElementIn(e, r, false, t))
            });
            return QZFL.element.get(n)
        }, appendTo: function (e) {
            var e = e.elements && e.elements[0] || QZFL.dom.get(e);
            return this.each(function (t) {
                e.appendChild(t)
            })
        }, insertAfter: function (e) {
            var e = e.elements && e.elements[0] || QZFL.dom.get(e), t = e.nextSibling, n = e.parentNode;
            return this.each(function (e) {
                n[!t ? "appendChild" : "insertBefore"](e, t)
            })
        }, insertBefore: function (e) {
            var e = e.elements && e.elements[0] || QZFL.dom.get(e), t = e.parentNode;
            return this.each(function (n) {
                t.insertBefore(n, e)
            })
        }, remove: function () {
            return this.each(function (e) {
                QZFL.dom.removeElement(e)
            })
        }
    });
    QZFL.effect = {
        off: 0,
        mode: [],
        init: function () {
            var e = [["webkit", "WebkitTransition"], ["firefox", "MozTransition"], ["opera", "OTransition"], ["ie", "msTransition"]],
                t = QZFL.userAgent, n = "", r = "";
            for (var i = 0, o = e.length; i < o; i++) {
                if (t[e[i][0]]) {
                    n = e[i][0];
                    r = e[i][1];
                    break
                }
            }
            return QZFL.effect.mode = r in document.documentElement.style ? [n, "css3"] : [n]
        },
        run: function (e, t, n) {
            var r = QZFL.effect, i = ++r._uniqueID, o, a, s;
            if (!e) {
                return
            }
            if (!r.mode[0]) {
                r.init()
            }
            n = r._opt(n);
            n.start();
            e = QZFL.dom.get(e);
            o = r._prop(t, e);
            a = o[0];
            e._tid = i;
            if (r.off) {
                s = QZFL.dom;
                for (var u in o[1]) {
                    s.setStyle(e, u, o[1][u])
                }
                window.setTimeout(n.complete, n.duration)
            } else {
                if (r.mode[1] == "css3" && n.change == QZFL.emptyFn) {
                    new QZFL.cssTransfrom(e, a, n).firecss()
                } else {
                    var l = new QZFL.tweenMaker(0, 100, n.duration, n.interval, n);
                    l.onStart = r.mode[1] == "css3" ? function () {
                        r._tweenArray[i] = l;
                        new QZFL.cssTransfrom(e, a, n).firecss()
                    } : function () {
                        r._tweenArray[i] = l
                    };
                    l.onChange = r.mode[1] != "css3" ? function (t) {
                        r.drawStyle(a, t, e);
                        n.change(t)
                    } : function (e) {
                        n.change(e)
                    };
                    l.onEnd = function () {
                        if (r.mode[1] != "css3") {
                            n.complete()
                        }
                        delete r._tweenArray[e._tid]
                    };
                    l.start()
                }
            }
        },
        getPercent: function (e) {
            var e = QZFL.dom.get(e), t = e._tid, n = QZFL.effect._tweenArray[t];
            return n.getPercent()
        },
        stop: function (e) {
            var t = QZFL.effect, n = t.mode[1] == "css3", r
            ;e = QZFL.dom.get(e);
            if (n) {
                (r = e._transition) && r.stop()
            } else {
                var i = e._tid, o = t._tweenArray[i];
                o && o.stop()
            }
            return t
        },
        drawStyle: function (e, t, n) {
            var r = QZFL.dom, i, o = "", a, s = QZFL.string;
            t *= .01;
            QZFL.object.each(e, function (e, i) {
                var u = e.start, l = e.end, c = e.unit;
                v = l >= u ? (l - u) * t + u : u - (u - l) * t;
                a = r.convertStyle(n, i, v + c);
                o += s.reCamelCase(a.prop) + ":" + a.value + ";"
            });
            n.style.cssText += ";" + o
        },
        _tweenArray: {},
        _uniqueID: 0,
        _opt: function (e) {
            var t = e, n = QZFL.effect;
            t.duration = e.duration || 500;
            t.easing = e.easing || "ease";
            t.complete = e.complete || QZFL.emptyFn;
            t.interval = e.interval || 16;
            t.start = e.start || QZFL.emptyFn;
            t.change = e.change || QZFL.emptyFn;
            return t
        },
        _prop: function (e, t) {
            var n = {}, r = QZFL.effect, i = r.mode[1] == "css3", o = {};
            QZFL.object.each(e, function (e, a) {
                a = QZFL.string.camelCase(a);
                if (QZFL.object.getType(e) == "object") {
                    var s = r._cssValue(t, e.value, a);
                    o[a] = e.value = s.end + (s.unit ? s.unit : 0);
                    if (i) {
                        n[a] = e
                    } else {
                        n[a] = s
                    }
                } else {
                    var u = r._cssValue(t, e, a), l;
                    o[a] = l = u.end + (u.unit ? u.unit : 0);
                    if (i) {
                        u = l
                    }
                    n[a] = u
                }
            });
            return [n, o]
        },
        _cssValue: function (e, t, n) {
            var r = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i, i = {}, o = r.exec(t + ""), a = QZFL.effect, s = a._cur(e, n);
            if (o) {
                var u = parseFloat(o[2]), l = o[3] || (a._cssNumber[n] ? "" : "px");
                if (l !== "px") {
                    QZFL.dom.setStyle(e, n, (u || 1) + l);
                    s = (u || 1) / a._cur(e, n) * s;
                    QZFL.dom.setStyle(e, n, s + l)
                }
                if (o[1]) {
                    u = (o[1] === "-=" ? -1 : 1) * u + s
                }
                i = {start: s, end: u, unit: l}
            } else {
                i = {start: s, end: t, unit: ""}
            }
            return i
        },
        _cssNumber: {zIndex: true, fontWeight: true, opacity: true, zoom: true, lineHeight: true},
        _cur: function (e, t) {
            var n, r = QZFL.dom.getStyle(e, t);
            if (e != null && e[t] != null && (!e.style || e.style[t] == null)) {
                return e[t]
            }
            return isNaN(n = parseFloat(r)) ? !r || r === "auto" ? 0 : r : n
        },
        show: function (e, t, n) {
            var r = QZFL.dom, i, o;
            e = r.get(e);
            t = t || {};
            i = typeof t == "number" ? t : t.duration;
            o = t.start || QZFL.emptyFn;
            QZFL.effect.run(e, {opacity: 1}, QZFL.object.extend(t, {
                duration: i || 1e3, start: function () {
                    r.setStyle(e, "opacity", 0);
                    r.setStyle(e, "display", "");
                    o()
                }, complete: n
            }))
        },
        hide: function (e, t, n) {
            var r = QZFL.dom, i;
            e = r.get(e);
            t = t || {};
            i = typeof t == "number" ? t : t.duration
            ;n = n || t.complete || QZFL.emptyFn;
            QZFL.effect.run(e, {opacity: 0}, QZFL.object.extend(t, {
                duration: i || 1e3, complete: function () {
                    r.setStyle(e, "display", "none");
                    r.setStyle(e, "opacity", 1);
                    n()
                }
            }))
        },
        toggle: function (e, t, n) {
            var r = QZFL.effect;
            t = t || {};
            if (r._isHidden(e)) {
                r.stop(e).show(e, t, n)
            } else {
                r.stop(e).hide(e, t, n)
            }
        },
        slideDown: function (e, t) {
            var n = QZFL.dom, r, i = QZFL.effect, o = {}, a = QZFL.object, s, u, l;
            e = n.get(e);
            r = i._checkVerticalStyle(e, {status: "down"});
            t = t || {};
            if (r) {
                s = typeof t == "number" ? t : t.duration;
                u = t.start || QZFL.emptyFn;
                l = t.complete || QZFL.emptyFn;
                i.run(e, r, a.extend(t, {
                    duration: s || 1e3, start: function () {
                        if (r && !t.noClear) {
                            a.each(r, function (t, r) {
                                n.setStyle(e, r, "0px")
                            })
                        }
                        n.setStyle(e, "display", "");
                        u()
                    }, complete: function () {
                        l();
                        i._checkVerticalStyle(e, {clear: 1})
                    }
                }))
            }
        },
        slideUp: function (e, t) {
            var n = QZFL.dom, r, i = QZFL.effect, o = {}, a = QZFL.object, s, u;
            e = n.get(e);
            r = i._checkVerticalStyle(e, {status: "up"});
            if (r) {
                a.each(r, function (e, t) {
                    o[t] = "0px"
                });
                t = t || {};
                s = typeof t == "number" ? t : t.duration;
                u = t.complete || QZFL.emptyFn
                ;n.setStyle(e, "display", "");
                i.run(e, o, a.extend(t, {
                    duration: s || 1e3, complete: function () {
                        n.setStyle(e, "display", "none");
                        a.each(r, function (t, r) {
                            n.setStyle(e, r, t)
                        });
                        i._checkVerticalStyle(e, {clear: 1});
                        u()
                    }
                }))
            }
        },
        _slideArray: {},
        slideToggle: function (e, t) {
            var n = QZFL.effect, r, t = t || {};
            if (n._isHidden(e)) {
                n.stop(e).slideDown(e, t)
            } else {
                if (e._slideid) {
                    r = n._slideArray[e._slideid].status;
                    if (r == "up") {
                        t.noClear = 1;
                        n._slideArray[e._slideid].status = "down";
                        n.stop(e).slideDown(e, t)
                    } else if (r == "down") {
                        n._slideArray[e._slideid].status = "up";
                        n.stop(e).slideUp(e, t)
                    }
                } else {
                    n.stop(e).slideUp(e, t)
                }
            }
        },
        _checkVerticalStyle: function (e, t) {
            var n = ["marginTop", "marginBottom", "paddingTop", "paddingBottom", "height"], r = {}, i = QZFL.dom, o,
                a = QZFL.effect;
            if (t.clear) {
                if (a._slideArray[e._slideid]) {
                    delete a._slideArray[e._slideid];
                    delete e._slideid
                }
                return null
            }
            if (!e._slideid) {
                e._slideid = ++a._uniqueID
            }
            if (!(o = a._slideArray[e._slideid])) {
                QZFL.object.each(n, function (t) {
                    var n = parseInt(i.getStyle(e, t), 10);
                    if (n) {
                        r[t] = n;
                        o = 1
                    }
                })
                ;a._slideArray[e._slideid] = {pps: r, status: t.status}
            } else {
                r = o.pps
            }
            return o ? r : null
        },
        _isHidden: function (e) {
            return QZFL.dom.getStyle(e, "display") == "none"
        }
    };
    QZFL.tweenMaker = function (e, t, n, r, i) {
        var o = this, i = i || {}, a;
        o.duration = n || 500;
        o.interval = r || 16;
        o.startValue = e;
        o.endValue = t;
        a = i.easing || "ease";
        o.functor = typeof i.functor == "function" ? i.functor : o.functors[a] || o.functors["ease"];
        o.onStart = o.onChange = o.onEnd = QZFL.emptyFn;
        o.playing = false;
        o.changeValue = o.endValue - o.startValue;
        o.currentValue = 0
    };
    QZFL.tweenMaker.prototype = {
        functors: {
            ease: function (e, t, n, r) {
                if ((e /= r / 2) < 1) return n / 2 * e * e * e + t;
                return n / 2 * ((e -= 2) * e * e + 2) + t
            }, linear: function (e, t, n, r) {
                return n * e / r + t
            }, "ease-in": function (e, t, n, r) {
                return n * (e /= r) * e * e + t
            }, "ease-out": function (e, t, n, r) {
                return n * ((e = e / r - 1) * e * e + 1) + t
            }, "ease-in-out": function (e, t, n, r) {
                if ((e /= r / 2) < 1) return n / 2 * e * e * e + t;
                return n / 2 * ((e -= 2) * e * e + 2) + t
            }
        }, start: function () {
            var e = this;
            e.playing = true;
            e._startTime = (new Date).getTime();
            e.onStart.apply(e);
            e._runTimer()
        }, _runTimer: function () {
            var e = this
            ;
            if (e.playing) {
                e._playTimer();
                setTimeout(function () {
                    e._runTimer.apply(e, [])
                }, e.interval)
            }
        }, _playTimer: function (e) {
            var t = false, n = this, e = (new Date).getTime() - n._startTime;
            if (e > n.duration) {
                e = n.duration;
                t = true
            }
            n.currentValue = n.functor(e, n.startValue, n.changeValue, n.duration);
            n.onChange.apply(n, [n.getPercent()]);
            if (t) {
                n.playing = false;
                n.onEnd.apply(this);
                if (window.CollectGarbage) {
                    CollectGarbage()
                }
            }
        }, stop: function () {
            this.playing = false
        }, getPercent: function () {
            return (this.currentValue - this.startValue) / this.changeValue * 100
        }
    };
    QZFL.cssTransfrom = function (e, t, n) {
        var r = this;
        r._elem = e;
        r._uid = "uid_" + ++QZFL.cssTransfrom._count;
        if (!r._running && t) {
            r._conf = t;
            r._duration = "duration" in n ? n.duration / 1e3 : .5;
            r._delay = "delay" in n ? n.delay : 0;
            r._easing = n.easing || "ease";
            r._count = 0;
            r._running = false;
            r._callback = QZFL.lang.isFunction(n.complete) ? n.complete : QZFL.emptyFn;
            r._change = n.change;
            e._transition = r
        }
        return r
    };
    QZFL.cssTransfrom._cssText = {};
    QZFL.cssTransfrom._attrs = {};
    QZFL.cssTransfrom._hasEnd = {}
    ;QZFL.cssTransfrom._count = 1e4;
    QZFL.cssTransfrom.prototype = {
        init: function () {
            var e = [["webkit", "-webkit-transition", "WebkitTransition", "webkitTransitionEnd", "WebkitTransform"], ["firefox", "-moz-transition", "MozTransition", "transitionend", "MozTransform"], ["opera", "-o-transition", "OTransition", "oTransitionEnd", "OTransform"], ["ie", "-ms-transition", "msTransition", "MSTransitionEnd", "msTransform"]],
                t, n, r, i, o = QZFL.userAgent, a;
            for (var s = 0, u = e.length; s < u; s++) {
                if (o[e[s][0]]) {
                    t = e[s][1];
                    n = e[s][2];
                    r = e[s][3];
                    i = e[s][4];
                    break
                }
            }
            a = QZFL.cssTransfrom.prototype;
            a.TRANSITION = {classPrefix: t, event: r, styleName: n};
            a.TRANSFORM = {styleName: i}
        }, firecss: function () {
            var e = this, t = e._elem, n = e._uid, r = this._conf, i = QZFL.dom.getStyle, o = QZFL.cssTransfrom, a;
            var s = [], u, l = [], c = [], f, d = [], p, m = [], h, g, L = "", F;
            if (!(this.TRANSITION && this.TRANSITION.classPrefix)) {
                this.init()
            }
            this._running = true;
            g = this.TRANSITION.classPrefix;
            u = g + "-delay";
            this.pptKey = g + "-property";
            f = g + "-duration";
            p = g + "-timing-function";
            h = this.TRANSFORM.styleName
            ;
            if (r.transform && !r[h]) {
                r[h] = r.transform;
                delete r.transform
            }
            for (var Q in r) {
                if (r.hasOwnProperty(Q)) {
                    e._addProperty(Q, r[Q]);
                    if (t.style[Q] === "") {
                        QZFL.dom.setStyle(t, Q, i(t, Q))
                    }
                }
                L = Q
            }
            c.push(i(t, this.pptKey));
            if (c[0] && c[0] !== "all") {
                d.push(i(t, f));
                m.push(i(t, p));
                l.push(i(t, u))
            } else {
                c.pop()
            }
            a = o._attrs[n];
            for (var Z in a) {
                hyphy = e._toHyphen(Z);
                Q = a[Z];
                if (a.hasOwnProperty(Z) && Q.transition === e) {
                    if (Z in t.style) {
                        d.push(parseFloat(Q.duration) + "s");
                        l.push(parseFloat(Q.delay) + "s");
                        m.push(Q.easing);
                        c.push(hyphy);
                        s.push(hyphy + ": " + Q.value)
                    } else {
                        e._removeProperty(Z)
                    }
                }
            }
            if (!o._hasEnd[n]) {
                t.addEventListener(this.TRANSITION.event, t._transitionCb = function (t) {
                    e._onTransfromEnd(t, n)
                }, false);
                e.timer = window.setTimeout(function () {
                    e._end()
                }, e._duration * 1e3);
                o._hasEnd[n] = true
            }
            F = s.join(";");
            o._cssText[n] = {};
            o._cssText[n].property = c;
            o._cssText[n].style = t.style.cssText;
            t.style.cssText += ["", this.pptKey + ":" + c.join(","), f + ":" + d.join(","), p + ":" + m.join(","), u + ":" + l.join(","), F, ""].join(";")
        }, _toHyphen: function (e) {
            e = e.replace(/([A-Z]?)([a-z]+)([A-Z]?)/g, function (e, t, n, r) {
                var i = "";
                t && (i += "-" + t.toLowerCase());
                i += n;
                r && (i += "-" + r.toLowerCase());
                return i
            });
            return e
        }, _endTransfrom: function (e) {
            var t = QZFL, n = this._elem, r = this.pptKey, i = t.dom.getStyle(n, r);
            if (!i) {
                r = t.string.camelCase(r);
                i = n.style[r]
            }
            if (typeof i === "string") {
                i = i.replace(new RegExp("(?:^|,\\s)" + e + ",?"), ",");
                i = i.replace(/^,|,$/, "");
                n.style[this.TRANSITION.styleName] = i || null
            }
        }, _onTransfromEnd: function (e, t) {
            var n = QZFL.string.camelCase(e.propertyName), r = e.elapsedTime, i = QZFL.cssTransfrom._attrs[t],
                o = i && i[n], a = o ? o.transition : null, s = "";
            if (a) {
                window.clearTimeout(this.timer);
                this.timer = null;
                for (var o in this._conf) {
                    s = o
                }
                a._removeProperty(n);
                a._endTransfrom(n);
                if (a._count <= 0) {
                    a._end(r)
                }
            }
        }, _addProperty: function (e, t) {
            var n = this, r = this._elem, i = n._uid, o = QZFL.cssTransfrom._attrs[i], a, s, u, l, c;
            if (!o) {
                o = QZFL.cssTransfrom._attrs[i] = {}
            }
            l = o[e];
            if (t && t.value !== undefined) {
                c = t.value
            } else if (t !== undefined) {
                c = t;
                t = {}
            }
            if (l && l.transition) {
                if (l.transition !== n) {
                    l.transition._count--
                }
            }
            n._count++;
            u = (typeof t.duration != "undefined" ? t.duration : n._duration) || 1e-4;
            o[e] = {
                value: c,
                duration: u,
                delay: typeof t.delay != "undefined" ? t.delay : n._delay,
                easing: t.easing || n._easing,
                transition: n
            };
            a = QZFL.dom.getStyle(r, e);
            s = typeof c === "string" ? a : parseFloat(a);
            if (s === c) {
                setTimeout(function () {
                    n._onTransfromEnd.call(n, {propertyName: e, elapsedTime: u}, i)
                }, u * 1e3)
            }
        }, _removeProperty: function (e) {
            var t = this, n = QZFL.cssTransfrom._attrs[t._uid];
            if (n && n[e]) {
                delete n[e];
                t._count--
            }
        }, _end: function () {
            var e = this, t = e._elem, n = e._callback;
            e._running = false;
            e._callback = null;
            if (t && n && !this._stoped) {
                setTimeout(function () {
                    n()
                }, 1);
                e.clearStatus(t)
            }
        }, stop: function () {
            var e = this._uid, t = this._elem, n, r, i = [];
            n = QZFL.cssTransfrom._cssText[e];
            r = n.property;
            for (var o = 0; o < r.length; o++) {
                i.push(r[o] + ":" + QZFL.dom.getStyle(t, r[o]))
            }
            this.clearStatus(t, i.join(";"));
            this._stoped = true
        }, clearStatus: function (e, t) {
            e.style.cssText = e.style.cssText.replace(/[^;]+?transition[^;]+?;/gi, "") + (t ? t : "");
            if (e._transitionCb) {
                e.removeEventListener(this.TRANSITION.event, e._transitionCb, false);
                e._transitionCb = null
            }
        }
    };
    QZFL.now = function () {
        return (new Date).getTime()
    };
    QZFL.string = QZFL.string || {};
    QZFL.string.camelCase = function (e) {
        var t = /-([a-z])/gi;
        return e.replace(t, function (e, t) {
            return t.toUpperCase()
        })
    };
    QZFL.string.reCamelCase = function (e) {
        var t = /[A-Z]/g;
        return e.replace(t, function (e, t) {
            return "-" + e.toLowerCase()
        })
    };
    QZFL.Tween = function (e, t, n, r, i, o) {
        var a = this;
        a.elem = QZFL.dom.get(e);
        a.prop = {};
        a.sv = r;
        a.fv = i;
        a.pname = t;
        a.prop[t] = parseInt(i);
        a.opts = {duration: o * 1e3};
        a.onMotionStart = QZFL.emptyFn;
        a.onMotionChange = null;
        a.onMotionStop = QZFL.emptyFn;
        a.css = true
    };
    QZFL.Tween.prototype.start = function () {
        var e = this, t = parseInt(e.sv), n = parseInt(e.fv);
        var r = QZFL.dom.setStyle(e.elem, e.pname, e.sv);
        if (r) {
            e.opts.complete = e.onMotionStop;
            e.opts.change = function (r) {
                r *= .01;
                var i = n >= t ? (n - t) * r + t : t - (t - n) * r;
                e.onMotionChange && e.onMotionChange.apply(e, [e.elem, e.pname, i])
            };
            e.onMotionStart.apply(e);
            QZFL.effect.run(e.elem, e.prop, e.opts)
        } else {
            e.css = false;
            var i = new QZFL.tweenMaker(t, n, e.opts.duration, e.opts.interval || 15);
            i.onStart = function () {
                e.t = i;
                e.onMotionStart.apply(e)
            };
            i.onChange = function (r) {
                r *= .01;
                var i = n >= t ? (n - t) * r + t : t - (t - n) * r;
                e.onMotionChange && e.onMotionChange.apply(e, [e.elem, e.pname, i])
            };
            i.onEnd = function () {
                e.onMotionStop.apply(e)
            };
            i.start()
        }
    };
    QZFL.Tween.prototype.getPercent = function () {
        return this.css ? QZFL.effect.getPercent(this.elem) : this.t.getPercent()
    };
    QZFL.Tween.prototype.stop = function () {
        QZFL.effect.stop(this.elem)
    };
    QZFL.transitions = {};
    (function () {
        var e = function (e, t, n, r) {
            var i = QZFL.dom["get" + e](this), o = typeof t != "number" && typeof n != "number";
            if (e == "Size" && o) {
                QZFL.dom["set" + e](this, t, n);
                var a = QZFL.dom["get" + e](this);
                t = a[0];
                n = a[1]
            }
            var s = i[0] - t;
            var u = i[1] - n;
            var l = new QZFL.Tween(this, "_p", QZFL.transitions[r] || QZFL.transitions.regularEaseOut, 0, 100, .5);
            l.onMotionChange = QZFL.event.bind(this, function () {
                var r = arguments[2];
                QZFL.dom["set" + e](this, typeof t != "number" ? i[0] : i[0] - r / 100 * s, typeof n != "number" ? i[1] : i[1] - r / 100 * u)
            })
            ;
            if (e == "Size" && o) {
                l.onMotionStop = QZFL.event.bind(this, function () {
                    QZFL.dom["set" + e](this)
                })
            }
            l.start()
        };
        var t = function (e, t) {
            var n = new QZFL.Tween(this, "opacity", QZFL.transitions[t] || QZFL.transitions.regularEaseOut, e ? 0 : 1, e ? 1 : 0, .5);
            n[e ? "onMotionStart" : "onMotionStop"] = QZFL.event.bind(this, function () {
                this.style.display = e ? "" : "none";
                QZFL.dom.setStyle(this, "opacity", 1)
            });
            n.start()
        };
        var n = function (e, t, n) {
            if (this.nodeType == 9) {
                var r = [QZFL.dom.getScrollTop(this), QZFL.dom.getScrollLeft(this)]
            } else {
                var r = [this.scrollTop, this.scrollLeft]
            }
            var i = r[0] - e;
            var o = r[1] - t;
            var a = new QZFL.Tween(this, "_p", QZFL.transitions[n] || QZFL.transitions.regularEaseOut, 0, 100, .5);
            a.onMotionChange = QZFL.event.bind(this, function () {
                var e = arguments[2], t = r[0] - e / 100 * i, n = r[1] - e / 100 * o;
                if (this.nodeType == 9) {
                    QZFL.dom.setScrollTop(t, this);
                    QZFL.dom.setScrollLeft(n, this)
                } else {
                    this.scrollTop = t;
                    this.scrollLeft = n
                }
            });
            a.start()
        };
        QZFL.element.extendFn({
            tween: function () {
            }, effectShow: function (n, r) {
                this.each(function (e) {
                    t.apply(e, [true, r])
                })
                ;
                if (n == "resize") {
                    this.each(function (t) {
                        e.apply(t, ["Size", null, null, r])
                    })
                }
            }, effectHide: function (n, r) {
                this.each(function (e) {
                    t.apply(e, [false, r])
                });
                if (n == "resize") {
                    this.each(function (t) {
                        e.apply(t, ["Size", 0, 0, r])
                    })
                }
            }, effectResize: function (t, n, r) {
                this.each(function (i) {
                    e.apply(i, ["Size", t, n, r])
                })
            }, effectMove: function (t, n, r) {
                this.each(function (i) {
                    e.apply(i, ["XY", t, n, r])
                })
            }, effectScroll: function (e, t, r) {
                this.each(function (i) {
                    n.apply(i, [e, t, r])
                })
            }
        })
    })();
    QZFL.Deferred = function (e, t) {
        var n = Array.prototype.slice, r = function () {
            this.status = undefined
        }, i = {
            _status: {reject: 1, resolve: 1}, _init: function (e) {
                if (!this.eventList) {
                    this.eventList = {rejectFuncs: [], resolveFuncs: []}
                }
            }, add: function (e, t) {
                this._init(e);
                if (typeof t == "function") {
                    if (this.status == e) {
                        t.apply(window, this.eventList[e + "Datas"])
                    } else {
                        this.eventList[e + "Funcs"].push(t)
                    }
                    this.eventList.added = 1
                }
                return this
            }, trigger: function (e, t) {
                var n, r, i;
                if (e in this._status) {
                    this._init();
                    if (this.eventList.added) {
                        r = this.eventList[e + "Funcs"];
                        while (i = r.shift()) {
                            i.apply(window, t)
                        }
                    } else {
                        this.eventList[e + "Datas"] = t
                    }
                    this.status = e
                }
            }
        }, o;
        QZFL.object.extend(r.prototype, {
            done: function (e) {
                return this.add("resolve", e)
            }, fail: function (e) {
                return this.add("reject", e)
            }, then: function (e, t) {
                return this.add("resolve", e).add("reject", t)
            }, resolve: function () {
                this.trigger("resolve", n.call(arguments))
            }, reject: function () {
                this.trigger("reject", n.call(arguments))
            }, state: function () {
                return this.status
            }
        }, i);
        o = new r;
        if (!(t instanceof Array)) {
            t = []
        }
        if (typeof e == "function") {
            t.push(o);
            e.apply(window, t)
        }
        return o
    };
    QZFL.object.extend(QZFL, {
        when: function (e) {
            var t = Array.prototype.slice, n = t.call(arguments), r = n.length, i, o, a = [], s, u;
            i = r !== 1 || e && e.state() ? r : 0;
            e = i === 1 ? e : QZFL.Deferred();
            o = function (n, r) {
                a[n] = t.call(r);
                if (!--i) {
                    e.resolve.apply(e, a)
                }
            };
            if (r > 1) {
                for (var l = 0; l < r; l++) {
                    if (!n[l].state) {
                        throw new Error("not a promise instance")
                    }
                    n[l].done(function (e) {
                        return function () {
                            o(e, arguments)
                        }
                    }(l)).fail(function () {
                        e.reject(t.call(arguments))
                    })
                }
            }
            if (!i) {
                e.resolve()
            }
            return e
        }
    })
    ;QZFL.XHR = function (e, t, n, r, i, o) {
        var a = QZFL.XHR, s, u;
        t = t || "_xhrInstence_" + a.counter;
        if (!(a.instance[t] instanceof QZFL.XHR)) {
            a.instance[t] = this;
            a.counter++
        }
        s = a.instance[t];
        s._name = t;
        s._nc = !!o;
        s._method = (typeof n == "string" ? n : "").toUpperCase() != "GET" ? "POST" : "GET";
        if (!(s._uriObj = new QZFL.util.URI(e))) {
            throw new Error("URL not valid!")
        }
        s._uri = e;
        s._data = r;
        this.onSuccess = QZFL.emptyFn;
        this.onError = QZFL.emptyFn;
        this.charset = "gb2312";
        this.proxyPath = "";
        return s
    };
    QZFL.XHR.instance = {};
    QZFL.XHR.counter = 0;
    QZFL.XHR.path = "http://" + QZFL.config.resourceDomain + "/ac/qzfl/release/expand/xhr_base.js?max_age=864001", QZFL.XHR.prototype.send = function () {
        var e = QZFL.XHR, t;
        if (this._method == "POST" && !this._data) {
            return false
        }
        if (typeof this._data == "object") {
            this._data = e.genHttpParamString(this._data, this.charset)
        }
        if (this._method == "GET" && this._data) {
            this._uri += (this._uri.indexOf("?") < 0 ? "?" : "&") + this._data
        }
        t = location.host && this._uriObj.host != location.host ? "_DoXsend" : "_DoSend";
        if (e[t]) {
            return e[t](this)
        } else {
            QZFL.imports(e.path, function (n) {
                return function () {
                    e[t](n)
                }
            }(this));
            return true
        }
    };
    QZFL.XHR.genHttpParamString = function (e, t) {
        t = (t || "gb2312").toLowerCase();
        var n = [];
        for (var r in e) {
            n.push(r + "=" + (t == "utf-8" ? encodeURIComponent(e[r]) : QZFL.string.URIencode(e[r])))
        }
        return n.join("&")
    };
    var _autoXSS = function () {
        var e = {"<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;", "&": "&amp;"};
        var t = {"&lt;": "<", "&gt;": ">", "&#39;": "'", "&quot;": '"', "&amp;": "&"};
        var n = Object.prototype.toString;
        var r = {
            go: function (e) {
                var t = e;
                if (!e) {
                    return t
                }
                var r = typeof e, i;
                if (r === "string") {
                    t = this.filter(e)
                } else if (r === "object") {
                    i = n.call(e);
                    if (i === "[object Array]" || i === "[object Arguments]") {
                        t = this.parseArray(e)
                    } else if (i === "[object Object]") {
                        t = this.parseObject(e)
                    }
                }
                return t
            }, encodeHtml: function (t) {
                t = t || "";
                return t.replace(/[<>&'"]/g, function (t) {
                    return e[t]
                })
            }, decodeHtml: function (e) {
                e = e || "";
                return e.replace(/(&lt;|&gt;|&#39;|&quot;|&amp;)/g, function (e) {
                    return t[e]
                })
            }, parseArray: function (e) {
                var t = 0, n = e.length, r;
                for (; t < n; ++t) {
                    e[t] = this.go(e[t])
                }
                return e
            }, parseObject: function (e) {
                for (var t in e) {
                    if (e.hasOwnProperty(t)) {
                        e[t] = this.go(e[t])
                    }
                }
                return e
            }, filter: function (e) {
                e = e || "";
                e = this.decodeHtml(e);
                e = this.encodeHtml(e);
                e = e.replace(/\u0026/g, "&amp;").replace(/\u0022/g, "&quot;").replace(/\u003C/g, "&lt;").replace(/\u003E/g, "&gt;").replace(/\u0027/g, "&#39;");
                return e
            }
        };
        return function (e) {
            if (location.pathname.indexOf("/qzone/biz/") == -1) {
                return e
            } else {
                return r.go(e)
            }
        }
    }();
    (function () {
        var def = {
                onload: function () {
                }, onprogress: function () {
                }, timeout: 3e3, onSuccess: function () {
                }, onError: function () {
                }, onerror: function () {
                }, method: "get", processText: null, instance: null, headers: {"X-Real-Url": ""}
            }, extend = QZFL.object.extend, cdm = location.host,
            supportlv2 = (QZFL.userAgent.ie > 9 || window.XMLHttpRequest) && "withCredentials" in new XMLHttpRequest;

        function transdata(e) {
            var t = [];
            if (typeof e == "object") {
                for (var n in e) {
                    t.push(n + "=" + encodeURIComponent(e[n]))
                }
            } else {
                t.push(e)
            }
            return t.join("&")
        }

        function isSameDomain(e) {
            var t = e;
            if (e.indexOf("//") === 0) {
                t = window.location.protocol + t
            }
            if (t.charAt(0) == "/") {
                return true
            }
            var n = /^https?\:\/\/([\s\S]+?)\//.test(t) && RegExp.$1 == cdm;
            return n
        }

        function createXHR() {
            var e;
            if (window.XMLHttpRequest) {
                e = new XMLHttpRequest
            } else if (window.ActiveXObject) {
                e = new ActiveXObject("Msxml2.XMLHTTP") || new ActiveXObject("Microsoft.XMLHTTP")
            }
            return e
        }

        function setHeader(e, t) {
            for (var n in t) {
                t[n] && e.setRequestHeader(n, t[n])
            }
        }

        function processText(e) {
            if (e.indexOf("<script") > -1) {
                var t = e.lastIndexOf(")"), n = e.substring(e.indexOf(".callback(") + 10, t == -1 ? e.length : t);
                return n
            }
            return '""'
        }

        function reportSSLInfo(e, t) {
            if (!e) {
                return
            }
            if (window.g_iLoginUin % 10 != 3) {
                return
            }
            var n = e.split("|");
            var r = n[4] == "r";
            var i = parseInt(n[3] || "0", 10);
            if (i == 0 || isNaN(i)) {
                return
            }
            if (window.haboStat) {
                if (i == 1) {
                    window.haboStat({
                        commandid: "ssl_session_reused",
                        stime: 1e3,
                        resultcode: r ? 0 : 1,
                        touin: window.g_iLoginUin || 0,
                        frequency: 1
                    })
                }
                window.haboStat({
                    commandid: "tcp_conn_reused",
                    stime: 1e3,
                    resultcode: i > 1 ? 0 : 1,
                    touin: window.g_iLoginUin || 0,
                    frequency: 1
                })
            }
        }

        function ajaxRequest(url, data, opt) {
            var xhr = createXHR();
            if (!xhr) {
                return
            }
            var instance = {url: url, startTime: +new Date};
            if (isSameDomain(url)) {
                xhr.open(opt.method, url + (url.indexOf("?") > -1 ? "&" : "?") + "g_tk=" + QZFL.pluginsDefine.getACSRFToken(url), true);
                xhr.onreadystatechange = function () {
                    var th = opt.instance || {};
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            instance.endTime = +new Date;
                            var o = eval("(" + (opt.processText || processText)(this.responseText) + ")");
                            var cloneO = extend({}, o);
                            try {
                                o = _autoXSS(o)
                            } catch (e) {
                                o = cloneO
                            }
                            (opt.instance || instance || {})["resultArgs"] = [o];
                            if (o && o.code == -3005) {
                                var that = this;
                                window.seajs && seajs.use("//qzonestyle.gtimg.cn/qzone/hybrid/lib/pow/pow", function (e) {
                                    if (!e) {
                                        opt.onload.call(that, o);
                                        return
                                    }
                                    e.getResult({target: o.target}, function (e) {
                                        url = url + (url.indexOf("?") > -1 ? "&" : "?") + "pow=" + o.target + "&powret=" + e;
                                        ajaxRequest(url, data, opt)
                                    })
                                });
                                return
                            }
                            opt.onload.call(this, o);
                            QZFL["FormSender"]._pluginsRunner("onRequestComplete", opt.instance || instance)
                            ;reportSSLInfo(this.getResponseHeader("x-stgw-ssl-info"), {url: url});
                            if (o.code != 0) {
                                errcodeReport({
                                    code: o.code,
                                    cgi: url,
                                    pathname: location.pathname,
                                    time: instance.endTime - instance.startTime
                                })
                            }
                            returnCodeReport({
                                appid: "20141",
                                url: url,
                                type: o && o.code == 0 ? 1 : 2,
                                code: o.code || 0
                            })
                        } else if (this.status > 400) {
                            th.endTime = +new Date;
                            th.msg = QZFL.FormSender._errCodeMap[999].msg;
                            th.statusCode = this.status;
                            QZFL["FormSender"]._pluginsRunner("onRequestComplete", th);
                            errcodeReport({
                                code: this.status,
                                cgi: url,
                                pathname: location.pathname,
                                time: th.endTime - th.startTime
                            });
                            returnCodeReport({appid: "20141", url: url, type: 3, code: this.status})
                        }
                    }
                    th.readyState = this.readyState
                }
            } else if (supportlv2) {
                xhr.open(opt.method, url + (url.indexOf("?") > -1 ? "&" : "?") + "g_tk=" + QZFL.pluginsDefine.getACSRFToken(url), true);
                xhr.withCredentials = true;
                xhr.onload = function () {
                    instance.endTime = +new Date;
                    var o = eval("(" + (opt.processText || processText)(this.responseText) + ")");
                    var cloneO = extend({}, o);
                    try {
                        o = _autoXSS(o)
                    } catch (e) {
                        o = cloneO
                    }
                    if (o && o.code == -3005) {
                        var that = this
                        ;window.seajs && seajs.use("//qzonestyle.gtimg.cn/qzone/hybrid/lib/pow/pow", function (e) {
                            if (!e) {
                                opt.onload.call(that, o);
                                return
                            }
                            e.getResult({target: o.target}, function (e) {
                                url = url + (url.indexOf("?") > -1 ? "&" : "?") + "pow=" + o.target + "&powret=" + e;
                                ajaxRequest(url, data, opt)
                            })
                        });
                        return
                    }
                    opt.onload.call(this, o);
                    QZFL["FormSender"]._pluginsRunner("onRequestComplete", opt.instance || instance)
                }
            }
            xhr.onerror = opt.onerror;
            xhr.onprogress = opt.onprogress;
            setHeader(xhr, opt.method.toLowerCase() == "post" ? extend({"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"}, opt.headers) : opt.headers);
            xhr.send(transdata(data))
        }

        QZFL.ajaxPost = function (e, t, n) {
            if (typeof t == "function") {
                n = t;
                t = null
            }
            n = extend({}, def, typeof n == "function" ? {onload: n} : n || {});
            ajaxRequest(e, t, extend(n, {method: "post"}))
        };
        QZFL.ajaxGet = function (e, t, n) {
            if (typeof t == "function") {
                n = t;
                t = null
            }
            n = extend({}, def, typeof n == "function" ? {onload: n} : n || {});
            ajaxRequest(e, t, extend(n, {
                method: "get", processText: function (e) {
                    return e.substring(e.indexOf("(") + 1, e.lastIndexOf(")"))
                }
            }))
        }
    })();
    QZFL.cookie = {
        set: function (e, t, n, r, i) {
            if (i) {
                var o = new Date;
                o.setTime(o.getTime() + 36e5 * i)
            }
            document.cookie = e + "=" + t + "; " + (i ? "expires=" + o.toGMTString() + "; " : "") + (r ? "path=" + r + "; " : "path=/; ") + (n ? "domain=" + n + ";" : "domain=" + QZFL.config.domainPrefix + ";");
            return true
        }, get: function (e) {
            var t = new RegExp("(?:^|;+|\\s+)" + e + "=([^;]*)"), n = document.cookie.match(t);
            return !n ? "" : n[1]
        }, del: function (e, t, n) {
            document.cookie = e + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " + (n ? "path=" + n + "; " : "path=/; ") + (t ? "domain=" + t + ";" : "domain=" + QZFL.config.domainPrefix + ";")
        }
    };
    QZFL.debug = {
        errorLogs: [], startDebug: function () {
            window.onerror = function (e, t, n) {
                var r = (t || "").replace(/\\/g, "/").split("/");
                QZFL.console.print(e + "<br/>" + r[r.length - 1] + " (line:" + n + ")", 1);
                QZFL.debug.errorLogs.push(e);
                return false
            }
        }, stopDebug: function () {
            window.onerror = null
        }, clearErrorLog: function () {
            this.errorLogs = []
        }, showLog: function () {
            var e = ENV.get("debug_out");
            if (!!e) {
                e.innerHTML = QZFL.string.nl2br(QZFL.string.escHTML(this.errorLogs.join("\n")))
            }
        }, getLogString: function () {
            return this.errorLogs.join("\n")
        }
    };
    QZFL.runTime = function () {
        function e() {
            return QZFL.config.debugLevel > 1
        }

        function t(t, n) {
            var r;
            if (e()) {
                r = t + "\n=STACK=\n" + i()
            } else {
                if (n == "error") {
                    r = t
                } else if (n == "warn") {
                }
            }
            QZFL.debug.errorLogs.push(r)
        }

        function n(e, n) {
            t(QZFL.string.write.apply(QZFL.string, arguments), "warn")
        }

        function r(e, n) {
            t(QZFL.string.write.apply(QZFL.string, arguments), "error")
        }

        function i(e, t) {
            function n(e, t) {
                if (e.stack) {
                    return e.stack
                } else if (e.message.indexOf("\nBacktrace:\n") >= 0) {
                    var n = 0;
                    return e.message.split("\nBacktrace:\n")[1].replace(/\s*\n\s*/g, function () {
                        n++;
                        return n % 2 == 0 ? "\n" : " @ "
                    })
                } else {
                    var r = t.callee == i ? t.callee.caller : t.callee;
                    var o = r.arguments;
                    var a = [];
                    for (var s = 0, u = o.length; s < u; s++) {
                        a.push(typeof o[s] == "undefined" ? "<u>" : o[s] === null ? "<n>" : o[s])
                    }
                    var l = /function\s+([^\s\(]+)\(/;
                    var c = l.test(r.toString()) ? l.exec(r.toString())[1] : "<ANON>"
                    ;
                    return (c + "(" + a.join() + ");").replace(/\n/g, "")
                }
            }

            var r;
            if (e instanceof Error && typeof arguments == "object" && !!arguments.callee) {
                r = n(e, t)
            } else {
                try {
                    ({}).sds()
                } catch (e) {
                    r = n(e, arguments)
                }
            }
            return r.replace(/\n/g, " <= ")
        }

        return {stack: i, warn: n, error: r, isDebugMode: e}
    }();
    QZFL.JsLoader = function () {
        this.onload = QZFL.emptyFn;
        this.onerror = QZFL.emptyFn
    };
    QZFL.JsLoader.prototype.load = function (e, t, n) {
        var r = {}, i = typeof n, o = this;
        if (i == "string") {
            r.charset = n
        } else if (i == "object") {
            r = n
        }
        r.charset = r.charset || "gb2312";
        QZFL.userAgent.ie ? setTimeout(function () {
            o._load(e, t || document, r)
        }, 0) : o._load(e, t || document, r)
    };
    QZFL.JsLoader.count = 0;
    QZFL.JsLoader._idleInstancesIDQueue = [];
    QZFL.JsLoader.prototype._load = function () {
        var e = QZFL.userAgent.ie, t = document, n = QZFL.JsLoader._idleInstancesIDQueue, r = QZFL.dom.removeElement,
            i = QZFL.event.addEvent, o = t.documentMode;
        return function (t, a, s) {
            var u = this, l, c, f = a.head || a.getElementsByTagName("head")[0] || a.body, d = false, p
            ;
            if (!(p = a.getElementById(n.pop())) || QZFL.userAgent.ie && QZFL.userAgent.ie > 8) {
                p = a.createElement("script");
                p.id = "_qz_jsloader_" + ++QZFL.JsLoader.count;
                d = true
            }
            i(p, e && e < 10 ? "readystatechange" : "load", function () {
                if (!p || e && e < 10 && (typeof o == "undefined" || o < 10 ? p.readyState != "loaded" : p.readyState != "complete")) {
                    return
                }
                e && n.push(p.id);
                u.onload();
                !e && r(p);
                p = u = null
            });
            if (!e) {
                i(p, "error", function () {
                    e && n.push(p.id);
                    u.onerror();
                    !e && r(p);
                    p = u = null
                })
            }
            for (c in s) {
                if (typeof(l = s[c]) == "string" && c.toLowerCase() != "src") {
                    p.setAttribute(c, l)
                }
            }
            d && f.appendChild(p);
            if (QZFL.win.g_cdn_proto == "https:" || window.location.protocol == "https:") {
                if (t.indexOf("/") === 0 && t.indexOf("//") !== 0) {
                    t = window.location.protocol + "//" + (window.siDomain || "qzonestyle.gtimg.cn") + (t.indexOf("/") === 0 ? t : "/" + t)
                }
                p.src = t.replace(/^http:/, QZFL.win.g_cdn_proto || window.location.protocol)
            } else {
                p.src = t
            }
            s = null
        }
    }();
    QZFL["js" + "Loader"] = QZFL.JsLoader;
    QZFL.imports = function (e, t, n) {
        var r, i, o, a, s, u, l, c, f = QZFL.lang.isFunction;
        n = QZFL.lang.isString(n) ? {charset: n} : n || {}
        ;n.charset = n.charset || "utf-8";
        var r = f(n.errCallback) ? n.errCallback : QZFL.emptyFn;
        t = f(t) ? t : QZFL.emptyFn;
        if (typeof e == "string") {
            i = QZFL.imports.getUrl(e);
            QZFL.imports.load(i, t, r, n)
        } else if (QZFL.lang.isArray(e)) {
            a = QZFL.imports.getCountId();
            o = QZFL.imports.counters[a] = e.length;
            s = 0;
            u = function () {
                s++;
                if (s == o) {
                    if (f(t)) t()
                }
                delete QZFL.imports.counters[a]
            };
            l = function () {
                if (f(r)) r();
                QZFL.imports.counters[a]
            };
            for (c = 0; c < o; c++) {
                i = QZFL.imports.getUrl(e[c]);
                QZFL.imports.load(i, u, l, n)
            }
        }
    };
    QZFL.imports.getUrl = function (e) {
        return QZFL.string.isURL(e) ? e : QZFL.imports._indirectUrlRE.test(e) ? e : QZFL.config.staticServer + e + ".js"
    };
    QZFL.imports.urlCache = {};
    QZFL.imports.counters = {};
    QZFL.imports.count = 0;
    QZFL.imports._indirectUrlRE = /^(?:\.{1,2})?\//;
    QZFL.imports.getCountId = function () {
        return "imports" + QZFL.imports.count++
    };
    QZFL.imports.load = function (e, t, n, r) {
        var i = e + "";
        if (window.QZFL && QZFL.win && (QZFL.win.g_cdn_proto == "https:" || window.location.protocol == "https:")) {
            i = i.replace(/^http:/, QZFL.win.g_cdn_proto || window.location.protocol)
        }
        if (QZFL.imports.urlCache[i] === true) {
            setTimeout(function () {
                if (QZFL.lang.isFunction(t)) t()
            }, 0);
            return
        }
        if (!QZFL.imports.urlCache[i]) {
            QZFL.imports.urlCache[i] = [];
            var o = new QZFL.JsLoader;
            o.onload = function () {
                QZFL.imports.execFnQueue(QZFL.imports.urlCache[i], 1);
                QZFL.imports.doOn("load", {url: i});
                QZFL.imports.urlCache[i] = true
            };
            o.onerror = function () {
                QZFL.imports.execFnQueue(QZFL.imports.urlCache[i], 0);
                QZFL.imports.doOn("error", {url: i});
                QZFL.imports.urlCache[i] = null;
                delete QZFL.imports.urlCache[i]
            };
            o.load(i, null, r)
        }
        QZFL.imports.urlCache[i].push([n, t])
    };
    QZFL.imports.execFnQueue = function (e, t) {
        var n;
        while (e.length) {
            n = e.shift()[t];
            if (QZFL.lang.isFunction(n)) {
                setTimeout(function (e) {
                    return e
                }(n), 0)
            }
        }
    };
    QZFL.imports.onQueue = {};
    QZFL.imports.on = function (e, t) {
        if (!QZFL.imports.onQueue[e]) {
            QZFL.imports.onQueue[e] = []
        }
        QZFL.imports.onQueue[e].push(t)
    };
    QZFL.imports.doOn = function (e, t) {
        var n = QZFL.imports.onQueue[e];
        if (!n) {
            return
        }
        for (var r = 0, i = n.length; r < i; r++) {
            if (typeof n[r] == "function") {
                n[r](t)
            }
        }
    };
    QZFL.FormSender = function (e, t, n, r) {
        this.name = "_fpInstence_" + QZFL.FormSender.counter;
        QZFL.FormSender.instance[this.name] = this;
        QZFL.FormSender.counter++;
        var i = String(r).toLowerCase();
        if (typeof e == "object" && e.nodeType == 1 && e.tagName == "FORM") {
            this.instanceForm = e
        } else {
            this.method = t || "POST";
            this.uri = e;
            this.charset = i == "utf-8" || i == "gbk" || i == "gb2312" || i == "gb18030" ? i : "gb2312";
            this.data = typeof n == "object" || typeof n == "string" ? n : null;
            this.proxyURL = this.charset == "utf-8" ? QZFL.config.FSHelperPage.replace(/_gbk/, "_utf8") : QZFL.config.FSHelperPage
        }
        this._sender = null;
        this.onSuccess = QZFL.emptyFn;
        this.onError = QZFL.emptyFn;
        this.ownerWindow = window;
        this.startTime = 0;
        this.endTime = 0;
        this.postTime = 0
    };
    QZFL.FormSender.instance = {};
    QZFL.FormSender.counter = 0;
    QZFL.FormSender._errCodeMap = {999: {msg: "Connection or Server error"}};
    QZFL.FormSender.pluginsPool = {formHandler: [], onErrorHandler: []};
    QZFL.FormSender._pluginsRunner = function (e, t) {
        var n = QZFL.FormSender, r = n.pluginsPool[e], i = t, o;
        if (r && (o = r.length)) {
            for (var a = 0; a < o; ++a) {
                if (typeof r[a] == "function") {
                    i = r[a](i) || t
                }
            }
        }
        return i
    };
    QZFL.FormSender._clear = function (e) {
        e._sender = e._sender.callback = e._sender.errorCallback = null;
        if (QZFL.userAgent.safari || QZFL.userAgent.opera) {
            setTimeout('QZFL.dom.removeElement(document.getElementById("_fp_frm_' + e.name + '"))', 50)
        } else {
            QZFL.dom.removeElement(document.getElementById("_fp_frm_" + e.name))
        }
        e.endTime = +new Date;
        QZFL.FormSender._pluginsRunner("onRequestComplete", e);
        e.instanceForm = null
    };
    QZFL.FormSender.prototype.send = function () {
        var e = window;
        (function (e) {
            var t = window, n, r = 0, i = [];
            while (true) {
                n = false;
                try {
                    t.document && t.document.domain == document.domain && (n = true)
                } catch (e) {
                }
                if (n) {
                    i.push(t)
                }
                if (t == top) {
                    break
                }
                t = t.parent
            }
            while (i.length) {
                if (e(t = i.pop()) === true) {
                    return t
                }
            }
            return null
        })(function (t) {
            if (t.QZFL && t.QZFL.FormSender && t.QZFL.cookie) {
                e = t;
                return true
            }
        });
        var t = e.location.host, n = e.QZFL.cookie.get("blabla") == "dynamic", r = QZFL.object.extend
        ;
        return function () {
            this.startTime = +new Date;
            var i = n && /(?:^user\.(s\d\.)?|\d{5,}\.|rc\.)qzone\.qq\.com/.test(t), o = this.uri, a = o, s, u,
                l = e.QZFL.config.canUseXHR2;
            if (this.charset == "utf-8") {
                if (ua.chrome && e.QZFL && e.QZFL.FormSender) {
                    var c = typeof this.data == "object" ? r(this.data, {qzreferrer: location.href}) : [this.data, "qzreferrer=" + encodeURIComponent(location.href)].join("&");
                    var f = transUrl2HttpsIfNeed(o);
                    f = f + (f.indexOf("?") > -1 ? "&" : "?") + (QZFL.win.g_qzonetoken ? "qzonetoken=" + QZFL.win.g_qzonetoken : "");
                    u = QZFL.util.URI(f);
                    this.speedup = 1;
                    var d = this;
                    return this.type = "xhr", e.QZFL.ajaxPost(f, c, {
                        onload: function (e) {
                            try {
                                d._sslinfo = this.getResponseHeader("x-stgw-ssl-info") || ""
                            } catch (e) {
                            }
                            d.endTime = +new Date;
                            d.onSuccess(e)
                        }, instance: this, headers: i ? {"X-Real-Url": o} : {}
                    }), this.postTime = +new Date
                }
            }
            if (this._sender === null || this._sender === void 0) {
                var p, m = document.createElement("iframe");
                m.id = m.name = "_fp_frm_" + this.name;
                m.style.cssText = "width:0;height:0;border-width:0;display:none;";
                m.callback = function (t) {
                    return function () {
                        t.resultArgs = arguments;
                        t.msg = "ok";
                        t.onSuccess.apply(t, arguments);
                        e.QZFL.FormSender._clear(t);
                        if (arguments && arguments[0].code !== 0) {
                            var n = 0;
                            if (t.endTime != undefined && t.startTime != undefined) {
                                n = t.endTime - t.startTime
                            }
                            errcodeReport({code: arguments[0].code, cgi: t.uri, pathname: location.pathname, time: n});
                            returnCodeReport({appid: "20141", url: t.uri, type: 2, code: arguments[0].code})
                        } else {
                            returnCodeReport({appid: "20141", url: t.uri, type: 1, code: arguments[0].code})
                        }
                    }
                }(this);
                var h = function (t) {
                    var n = function () {
                        t.resultArgs = arguments;
                        t.msg = QZFL.FormSender._errCodeMap[999].msg;
                        e.QZFL.FormSender._pluginsRunner("onErrorHandler", t);
                        e.QZFL.FormSender._clear(t);
                        t.onError()
                    };
                    return function () {
                        if (typeof t.resultArgs == "object") {
                            return
                        }
                        if (this.readyState == "complete" || typeof this.readyState == "undefined") {
                            if ("sended".indexOf(this.state) > -1) {
                                this.onload = this.onreadystatechange = null;
                                n()
                            }
                        }
                        var e = 0;
                        if (t.endTime != undefined && t.startTime != undefined) {
                            e = t.endTime - t.startTime
                        }
                        errcodeReport({
                            code: 502, cgi: t.uri,
                            pathname: location.pathname, time: e
                        });
                        returnCodeReport({appid: "20141", url: t.uri, type: 3, code: 502})
                    }
                }(this);
                document.body.appendChild(m);
                m.errorCallback = h;
                m.onload = m.onreadystatechange = h;
                m.state = "initing";
                this._sender = m
            }
            if (!this.instanceForm) {
                var g = this, L = QZFL.userAgent.ie, F = QZFL.userAgent.firefox, Q, Z, c = g.data;
                var v = g.uri;
                v = transUrl2HttpsIfNeed(v, true);
                v = v + (v.indexOf("?") > -1 ? "&" : "?") + "g_tk=" + QZFL.pluginsDefine.getACSRFToken(v) + (QZFL.win.g_qzonetoken ? "&qzonetoken=" + QZFL.win.g_qzonetoken : "");
                Z = '<!DOCTYPE html><html lang="zh-cn"><head><meta http-equiv="content-type" content="text/html; charset=' + g.charset + '" /><meta charset="' + g.charset + '" />';
                if (L || F) {
                    Q = 'javascript:document.open();document.domain="' + document.domain + '";var me=parent.QZFL.FormSender.instance["' + g.name + '"];document.write(me.ifrHTML);document.close();'
                }
                Z = Z + '<script type="text/javascript">' + ((L || F) && 'document.charset="' + g.charset + '"' || "") + ';document.domain="' + document.domain + '";frameElement.submited=void(0);frameElement.state="sending";<\/script></head><body>';
                Z = Z + '<form action="' + v + '" accept-charset="' + g.charset + '" id="p" enctype="application/x-www-form-urlencoded;charset=' + g.charset + '" method="post">';
                Z = Z + '<input type="hidden" name="qzreferrer" id="qzreferrer" />'
                ;Z = Z + '</form><script type="text/javascript">var me=parent.QZFL.FormSender.instance["' + g.name + '"],doc=document,f=doc.getElementById("p"),d=me.jsonData,fg=doc.createDocumentFragment();if(typeof d=="string"){var l=d.split("&");for(var i=0;i<l.length;i++){var kv=l[i].split("=");var ipt=doc.createElement("input");ipt.type="hidden";ipt.name=kv[0];var v=kv[1];try{v=decodeURIComponent(v);}catch(e) {}ipt.value=v;fg.appendChild(ipt);}}else{for(var i in d){var ipt=doc.createElement("input");ipt.type="hidden";ipt.name=i;ipt.value=d[i];fg.appendChild(ipt);}}f.appendChild(fg);doc.getElementById("qzreferrer").value=parent.location.href;f.submit();me.postTime=+new Date;frameElement.submited=true;frameElement.state="sended";<\/script></body></html>';
                g.ifrHTML = Z;
                g.ifrurl = Q;
                g.jsonData = c;
                L || F ? setTimeout(function (e) {
                    return function () {
                        e._sender.state = "inited";
                        e._sender.src = e.ifrurl
                    }
                }(g), 10) : m.src = "javascript:;";
                if (!L && !F) {
                    var y = m.contentDocument || m.contentWindow.document;
                    if (y) {
                        y.open();
                        y.write(g.ifrHTML)
                        ;y.close()
                    }
                }
            } else {
                this.instanceForm.target = m.name = m.id;
                this._sender.submited = true;
                this.instanceForm.submit()
            }
            return true
        }
    }();
    QZFL.FormSender.prototype.destroy = function () {
        var e = this.name;
        delete QZFL.FormSender.instance[e]._sender;
        QZFL.FormSender.instance[e]._sender = null;
        delete QZFL.FormSender.instance[e];
        QZFL.FormSender.counter--;
        return null
    };
    (function (e) {
        var t = window, n, r = 0, i = [];
        while (true) {
            n = false;
            try {
                t.document && t.document.domain == document.domain && (n = true)
            } catch (e) {
            }
            if (n) {
                i.push(t)
            }
            if (t == top) {
                break
            }
            t = t.parent
        }
        while (i.length) {
            if (e(t = i.pop()) === true) {
                return t
            }
        }
        return null
    })(function (e) {
        if (e.QZFL && e.QZFL.FormSender && e.QZFL.cookie) {
            QZFL.win = e;
            return true
        }
    });
    QZFL.JSONGetter = function (e, t, n, r, i) {
        if (QZFL.object.getType(t) != "string") {
            t = "_jsonInstence_" + (QZFL.JSONGetter.counter + 1)
        }
        var o = QZFL.JSONGetter.instance[t];
        if (o instanceof QZFL.JSONGetter) {
        } else {
            QZFL.JSONGetter.instance[t] = o = this;
            QZFL.JSONGetter.counter++;
            o._name = t;
            o._sender = null;
            o._timer = null;
            this.startTime = 0;
            this.onSuccess = QZFL.emptyFn
            ;this.onError = QZFL.emptyFn;
            this.onTimeout = QZFL.emptyFn;
            this.timeout = 5e3;
            this.clear = QZFL.emptyFn;
            this.ownerWindow = window;
            this._baseClear = function () {
                this._waiting = false;
                this._squeue = [];
                this._equeue = [];
                this.onSuccess = this.onError = QZFL.emptyFn;
                this.clear = null
            }
        }
        o._uri = e;
        o._data = n && (QZFL.object.getType(n) == "object" || QZFL.object.getType(n) == "string") ? n : null;
        o._charset = QZFL.object.getType(r) != "string" ? QZFL.config.defaultDataCharacterSet : r;
        o._jMode = !!i;
        return o
    };
    QZFL.JSONGetter.instance = {};
    QZFL.JSONGetter.counter = 0;
    QZFL.JSONGetter._errCodeMap = {
        999: {msg: "Connection or Server error."},
        998: {msg: "Connection to Server timeout."}
    };
    QZFL.JSONGetter.genHttpParamString = function (e) {
        var t = [];
        for (var n in e) {
            t.push(n + "=" + encodeURIComponent(e[n]))
        }
        return t.join("&")
    };
    QZFL.JSONGetter.prototype.addOnSuccess = function (e) {
        if (typeof e == "function") {
            if (this._squeue && this._squeue.push) {
            } else {
                this._squeue = []
            }
            this._squeue.push(e)
        }
    };
    QZFL.JSONGetter._runFnQueue = function (e, t, n) {
        var r;
        if (e && e.length) {
            while (e.length > 0) {
                r = e.shift();
                if (typeof r == "function") {
                    r.apply(n ? n : null, t)
                }
            }
        }
        n.resultArgs = t;
        QZFL.JSONGetter._pluginsRunner("onRequestComplete", n)
    };
    QZFL.JSONGetter.prototype.addOnError = function (e) {
        if (typeof e == "function") {
            if (this._equeue && this._equeue.push) {
            } else {
                this._equeue = []
            }
            this._equeue.push(e)
        }
    };
    QZFL.JSONGetter.pluginsPool = {
        srcStringHandler: [],
        onErrorHandler: [],
        onRequestComplete: [],
        onRequestTimeout: []
    };
    QZFL.JSONGetter._pluginsRunner = function (e, t) {
        var n = QZFL.JSONGetter, r = n.pluginsPool[e], i = t, o, a;
        if (r && (a = r.length)) {
            for (var s = 0; s < a; ++s) {
                if (typeof r[s] == "function") {
                    o = r[s](i)
                }
            }
        }
        return o
    };
    QZFL.JSONGetter.prototype.send = function (e) {
        if (this._waiting) {
            return
        }
        this.startTime = +new Date;
        var t, n = QZFL.object.getType(e) != "string" ? "callback" : e, r = this._uri;
        if (this._data) {
            r += (r.indexOf("?") < 0 ? "?" : "&") + (typeof this._data == "object" ? QZFL.JSONGetter.genHttpParamString(this._data) : this._data)
        }
        r = QZFL.JSONGetter._pluginsRunner("srcStringHandler", r);
        this.url = r;
        if (this._jMode) {
            window[n] = this.onSuccess;
            var i = new QZFL.JsLoader
            ;i.onerror = this.onError;
            i.load(r, void 0, this._charset);
            return
        }
        this._timer = setTimeout(function (e) {
            return function () {
                e._waiting = false;
                e.onTimeout && e.onTimeout();
                QZFL.JSONGetter._pluginsRunner("onRequestTimeout", e)
            }
        }(this), this.timeout);
        var o = QZFL.win, a = o.location.host, s = false, u = QZFL.object.extend;
        var l = s && /(?:^user\.(s\d\.)?|\d{5,}\.|rc\.)qzone\.qq\.com/.test(a), c = r + function (e) {
            if (!QZFL.win.g_qzonetoken) {
                return ""
            }
            if (e.indexOf("?") > -1) {
                return "&qzonetoken=" + QZFL.win.g_qzonetoken
            } else {
                return "?qzonetoken=" + QZFL.win.g_qzonetoken
            }
        }(r), f, d, p = l ? "http://" + a + "/p" : c;
        if (this._charset == "utf-8" && ua.chrome && window.QZFL && QZFL.JSONGetter && QZFL.config.xhrGetReqProxyEnable(r)) {
            f = QZFL.util.URI(c);
            var m = f.host.replace(".qzone.qq.com", "");
            if (o.location.search) {
                pIp = QZFL.getParameter(o.location.search, m.split(".")[0]);
                if (pIp) {
                    pIp = "proxy_target_ip=" + pIp;
                    f.search ? f.search += "&" + pIp : f.search += "?" + pIp
                }
            }
            this.speedup = 1;
            return o.QZFL.ajaxGet(p, null, {
                onload: function (e) {
                    return function () {
                        e._waiting = false;
                        try {
                            e._sslinfo = this.getResponseHeader("x-stgw-ssl-info") || ""
                        } catch (e) {
                        }
                        e.endTime = +new Date;
                        e.onSuccess.apply(e, arguments);
                        QZFL.JSONGetter._runFnQueue(e._squeue, arguments, e);
                        clearTimeout(e._timer)
                    }
                }(this), instance: this, headers: l ? {"X-Real-Url": c} : {}
            }), this.postTime = +new Date
        }
        if (QZFL.userAgent.ie && (typeof document.documentMode == "undefined" || document.documentMode < 10) && !(QZFL.userAgent.beta && navigator.appVersion.indexOf("Trident/4.0") > -1)) {
            var h = document.createDocumentFragment(), g = document.createElement("script");
            g.charset = this._charset;
            this._senderDoc = h;
            this._sender = g;
            this.clear = t = function (e) {
                clearTimeout(e._timer);
                if (e._sender) {
                    e._sender.onreadystatechange = null
                }
                h["callback"] = h["_Callback"] = h[n] = null;
                h = e._senderDoc = e._sender = null;
                e._baseClear()
            };
            h["callback"] = h["_Callback"] = h[n] = function (e) {
                return function () {
                    e._waiting = false;
                    e.endTime = +new Date;
                    var n = u({}, arguments);
                    var r = n;
                    try {
                        r = _autoXSS(arguments)
                    } catch (e) {
                        r = n
                    }
                    e.onSuccess.apply(e, r);
                    QZFL.JSONGetter._runFnQueue(e._squeue, r, e);
                    t(e)
                }
            }(this)
            ;
            if (QZFL.userAgent.ie < 9) {
                g.onreadystatechange = function (e) {
                    return function () {
                        if (e._sender && e._sender.readyState == "loaded") {
                            try {
                                e._onError()
                            } catch (e) {
                            }
                        }
                    }
                }(this)
            } else {
                g.onerror = function (e) {
                    return function () {
                        try {
                            e._onError()
                        } catch (e) {
                        }
                    }
                }(this)
            }
            this._waiting = true;
            h.appendChild(g);
            this._sender.src = c
        } else {
            this.clear = t = function (e) {
                clearTimeout(e._timer);
                e._baseClear()
            };
            window[n] = function () {
                var e = u({}, arguments);
                var t = e;
                try {
                    t = _autoXSS(arguments)
                } catch (n) {
                    t = e
                }
                QZFL.JSONGetter.args = t
            };
            var L = function (e) {
                return function () {
                    e.endTime = +new Date;
                    e.onSuccess.apply(e, QZFL.JSONGetter.args);
                    QZFL.JSONGetter._runFnQueue(e._squeue, QZFL.JSONGetter.args, e);
                    QZFL.JSONGetter.args = [];
                    t(e)
                }
            }(this);
            var F = function (e) {
                return function () {
                    e._waiting = false;
                    e.endTime = +new Date;
                    var n = QZFL.JSONGetter._errCodeMap[999];
                    e.msg = n.msg;
                    e.onError(n);
                    QZFL.JSONGetter._runFnQueue(e._equeue, [n], e);
                    t(e);
                    return e
                }
            }(this);
            var Q = document.getElementsByTagName("head"), Z;
            Q = Q && Q[0] || document.body;
            if (!Q) return
                ;
            var v = Q.getElementsByTagName("base")[0];
            Z = document.createElement("script");
            Z.charset = this._charset || "utf-8";
            Z.onload = function () {
                this.onload = null;
                if (Z.parentNode) {
                    Q.removeChild(Z)
                }
                L();
                Z = void 0;
                QZFL.returnCodeReport({appid: "20141", url: this.src || "", type: 1, code: 0})
            };
            Z.onerror = function () {
                this.onerror = null;
                var e = F();
                QZFL.errcodeReport({
                    code: 502,
                    cgi: this.src || "",
                    pathname: location.pathname,
                    time: e.endTime - e.startTime
                });
                QZFL.returnCodeReport({appid: "20141", url: this.src || "", type: 3, code: 502})
            };
            Z.src = c;
            v ? Q.insertBefore(Z, v) : Q.appendChild(Z)
        }
        this.postTime = +new Date
    };
    QZFL.JSONGetter.prototype._onError = function () {
        this._waiting = false;
        this.endTime = +new Date;
        var e = QZFL.JSONGetter._errCodeMap[999];
        this.msg = e.msg;
        this.onError(e);
        QZFL.JSONGetter._runFnQueue(this._equeue, [e], this);
        QZFL.JSONGetter._pluginsRunner("onErrorHandler", this);
        this.clear(this)
    };
    QZFL.JSONGetter.prototype.destroy = QZFL.emptyFn;
    QZFL.getParameter = function (e, t) {
        var n = new RegExp("(\\?|#|&)" + t + "=([^&#]*)(&|#|$)"), r = e.match(n)
        ;
        return !r ? "" : r[2]
    };
    window.QZFL = window.QZFL || {};
    QZFL.pingSender = function (e, t, n) {
        var r = QZFL.pingSender, i, o;
        if (!e) {
            return
        }
        n = n || {};
        i = "sndImg_" + r._sndCount++;
        o = r._sndPool[i] = new Image;
        o.iid = i;
        o.onload = o.onerror = o.ontimeout = function (e) {
            return function (t) {
                t = t || window.event || {type: "timeout"};
                void(typeof n[t.type] == "function" ? setTimeout(function (e, t) {
                    return function () {
                        n[e]({type: e, duration: (new Date).getTime() - t})
                    }
                }(t.type, e._s_), 0) : 0);
                QZFL.pingSender._clearFn(t, e)
            }
        }(o);
        typeof n.timeout == "function" && setTimeout(function () {
            o.ontimeout && o.ontimeout({type: "timeout"})
        }, typeof n.timeoutValue == "number" ? Math.max(100, n.timeoutValue) : 5e3);
        void(typeof t == "number" ? setTimeout(function () {
            o._s_ = (new Date).getTime();
            o.src = transUrl2HttpsIfNeed(e)
        }, t = Math.max(0, t)) : o.src = transUrl2HttpsIfNeed(e))
    };
    QZFL.pingSender._sndPool = {};
    QZFL.pingSender._sndCount = 0;
    QZFL.pingSender._clearFn = function (e, t) {
        var n = QZFL.pingSender;
        if (t) {
            n._sndPool[t.iid] = t.onload = t.onerror = t.ontimeout = t._s_ = null;
            delete n._sndPool[t.iid]
            ;n._sndCount--;
            t = null
        }
    };
    QZFL.media = {
        _tempImageList: [], _flashVersion: null, getImageInfo: function () {
            var e = function (e, t, n) {
                if (e) {
                    var r = n.ow || e.width, i = n.oh || e.height, o, a, s, u;
                    if (r && i) {
                        if (r >= i) {
                            a = r;
                            s = i;
                            u = ["width", "height"]
                        } else {
                            a = i;
                            s = r;
                            u = ["height", "width"]
                        }
                        o = {direction: u, rate: a / s, longSize: a, shortSize: s};
                        o.ow = r;
                        o.oh = i
                    }
                    QZFL.lang.isFunction(t) && t(e, o, n)
                }
            };
            return function (t, n) {
                n = n || {};
                if (QZFL.lang.isString(n.trueSrc)) {
                    var r = new Image;
                    r.onload = function (t, n, r) {
                        return function () {
                            e(t, n, r);
                            t = t.onerror = t.onload = null
                        }
                    }(r, t, n);
                    r.onerror = function (e, t, n) {
                        return function () {
                            if (typeof n.errCallback == "function") {
                                n.errCallback()
                            }
                            e = e.onerror = e.onload = null
                        }
                    }(r, t, n);
                    r.src = n.trueSrc
                } else if (QZFL.lang.isElement(n.img)) {
                    e(n.img, t, n)
                }
            }
        }(), adjustImageSize: function (e, t, n, r, i) {
            var o = {
                trueSrc: n, callback: function (e) {
                    return function (t, n, r, i, o) {
                        QZFL.lang.isFunction(e) && e(t, r, i, null, o.ow, o.oh, o)
                    }
                }(r), errCallback: i
            };
            QZFL.media.reduceImage(0, e, t, o)
        }, getFlashHtml: function (e, t, n) {
            var r = [], i = [];
            for (var o in e) {
                switch (o) {
                    case"noSrc":
                    case"movie":
                        continue;
                        break;
                    case"id":
                    case"name":
                    case"width":
                    case"height":
                    case"style":
                        if (typeof e[o] != "undefined") {
                            r.push(" ", o, '="', e[o], '"')
                        }
                        break;
                    case"src":
                        if (QZFL.userAgent.ie) {
                            i.push('<param name="movie" value="', e.noSrc ? "" : e[o], '"/>')
                        } else {
                            r.push(' data="', e.noSrc ? "" : e[o], '"')
                        }
                        break;
                    default:
                        i.push('<param name="', o, '" value="', e[o], '" />')
                }
            }
            if (QZFL.userAgent.ie) {
                if (QZFL.userAgent.ie > 10) {
                    r.push(' classid="clsid:', n || "D27CDB6E-AE6D-11cf-96B8-444553540000", '"', ' data="', e.src || "", '"')
                } else {
                    r.push(' classid="clsid:', n || "D27CDB6E-AE6D-11cf-96B8-444553540000", '"')
                }
            } else {
                r.push(' type="application/x-shockwave-flash"')
            }
            if (t && t instanceof QZFL.media.SWFVersion) {
                var a = QZFL.media.getFlashVersion().major, s = t.major;
                r.push(' codeBase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab#version=', t, '"')
            }
            return "<object" + r.join("") + ">" + i.join("") + "</object>"
        }, insertFlash: function (e, t) {
            if (!e || typeof e.innerHTML == "undefined") {
                return false
            }
            t = t || {};
            t.src = t.src || ""
            ;t.width = t.width || "100%";
            t.height = t.height || "100%";
            if (QZFL.userAgent.chrome && QZFL.userAgent.chrome >= 47) {
                e.innerHTML = QZFL.media.getFlashHtml(t)
            } else {
                t.noSrc = true;
                e.innerHTML = QZFL.media.getFlashHtml(t);
                var n = e.firstChild;
                if (QZFL.userAgent.ie) {
                    setTimeout(function () {
                        try {
                            n.LoadMovie(0, t.src)
                        } catch (e) {
                        }
                    }, 0)
                } else {
                    n.setAttribute("data", t.src)
                }
            }
            return true
        }, getWMMHtml: function (e, t) {
            var n = [], r = [];
            for (var i in e) {
                switch (i) {
                    case"id":
                    case"width":
                    case"height":
                    case"style":
                    case"src":
                        r.push(" ", i, '="', e[i], '"');
                        break;
                    default:
                        r.push(" ", i, '="', e[i], '"');
                        n.push('<param name="', i, '" value="', e[i], '" />')
                }
            }
            if (e["src"]) {
                n.push('<param name="URL" value="', e["src"], '" />')
            }
            if (QZFL.userAgent.ie) {
                return '<object classid="' + (t || "clsid:6BF52A52-394A-11D3-B153-00C04F79FAA6") + '" ' + r.join("") + ">" + n.join("") + "</object>"
            } else {
                return "<embed " + r.join("") + "></embed>"
            }
        }
    };
    QZFL.media.SWFVersion = function () {
        var e;
        if (arguments.length > 1) {
            e = arg2arr(arguments)
        } else if (arguments.length == 1) {
            if (typeof arguments[0] == "object") {
                e = arguments[0]
            } else if (typeof arguments[0] == "number") {
                e = [arguments[0]]
            } else {
                e = []
            }
        } else {
            e = []
        }
        this.major = parseInt(e[0], 10) || 0;
        this.minor = parseInt(e[1], 10) || 0;
        this.rev = parseInt(e[2], 10) || 0;
        this.add = parseInt(e[3], 10) || 0
    };
    QZFL.media.SWFVersion.prototype.toString = function (e) {
        return [this.major, this.minor, this.rev, this.add].join(typeof e == "undefined" ? "," : e)
    };
    QZFL.media.SWFVersion.prototype.toNumber = function () {
        var e = .001;
        return this.major + this.minor * e + this.rev * e * e + this.add * e * e * e
    };
    QZFL.media.getFlashVersion = function () {
        if (!QZFL.media._flashVersion) {
            var e = 0;
            if (navigator.plugins && navigator.mimeTypes.length) {
                var t = navigator.plugins["Shockwave Flash"];
                if (t && t.description) {
                    e = t.description.replace(/(?:[a-z]|[A-Z]|\s)+/, "").replace(/(?:\s+r|\s+b[0-9]+)/, ".").split(".")
                }
            } else {
                try {
                    for (var n = e = 6, r = new Object; r != null; ++n) {
                        r = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + n);
                        e = n
                    }
                } catch (t) {
                    if (e == 6) {
                        e = 0
                    }
                    e = Math.max(e - 1, 0)
                }
                try {
                    e = new QZFL.media.SWFVersion(r.GetVariable("$version").split(" ")[1].split(","))
                } catch (e) {
                }
            }
            if (!(e instanceof QZFL.media.SWFVersion)) {
                e = new QZFL.media.SWFVersion(e)
            }
            if (e.major < 3) {
                e.major = 0
            }
            QZFL.media._flashVersion = e
        }
        return QZFL.media._flashVersion
    };
    QZFL.media.reduceImage = function () {
        var e = function (e, t, n, r, i, o) {
            var a, s;
            if (i.rate == 1) {
                i.direction[0] = n > r ? "height" : "width";
                i.direction[1] = n > r ? "width" : "height"
            }
            a = i.direction[t] == "width" ? n : r;
            t ? (a > i.shortSize ? a = i.shortSize : 1) && (i.k = i.shortSize / a) : (a > i.longSize ? a = i.longSize : 1) && (i.k = i.longSize / a);
            e.setAttribute(i.direction[t], a);
            QZFL.lang.isFunction(o) && o(e, t, n, r, i)
        };
        return function (t, n, i, o) {
            o = o || {};
            o.img = QZFL.lang.isNode(o.img) ? o.img : QZFL.event.getTarget();
            o.img.onload = null;
            o.trueSrc && (o.img.src = o.trueSrc);
            if (o.img) {
                if (!(o.direction && o.rate && o.longSize && o.shortSize)) {
                    r = QZFL.media.getImageInfo(function (r, a) {
                        if (!r || !a) {
                            return
                        }
                        e(o.img, t, n, i, a, o.callback)
                    }, o)
                } else {
                    e(o.img, t, n, i, o, o.callback)
                }
            }
        }
    }();
    QZFL.media.imagePlusUrl = "http://" + QZFL.config.resourceDomain + "/ac/qzfl/release/widget/smart_image.js?max_age=1209603"
    ;QZFL.media.smartImage = function (e, t, n) {
        n = n || {};
        n.img = QZFL.lang.isNode(n.img) ? n.img : QZFL.event.getTarget();
        QZFL.imports(QZFL.media.imagePlusUrl, function (e, t, n) {
            return function () {
                QZFL.media.smartImage(e, t, n)
            }
        }(e, t, n))
    };
    QZFL.media.reduceImgByRule = function (e, t, n, r) {
        n = n || {};
        n.img = QZFL.lang.isNode(n.img) ? n.img : QZFL.event.getTarget();
        QZFL.imports(QZFL.media.imagePlusUrl, function (e, t, n, r) {
            return function () {
                QZFL.media.reduceImgByRule(e, t, n, r)
            }
        }(e, t, n, r))
    };
    QZFL.shareObject = {};
    QZFL.shareObject.create = function (e) {
        if (typeof e == "undefined") {
            e = QZFL.config.defaultShareObject
        }
        var t = new QZFL.shareObject.DataBase(e)
    };
    QZFL.shareObject.instance = {};
    QZFL.shareObject.refCount = 0;
    QZFL.shareObject.getValidSO = function () {
        var e = QZFL.shareObject.refCount + 1;
        for (var t = 1; t < e + 1; ++t) {
            if (QZFL.shareObject.instance["so_" + t] && QZFL.shareObject.instance["so_" + t]._ready) {
                return QZFL.shareObject.instance["so_" + t]
            }
        }
        return null
    };
    QZFL.shareObject.get = function (e) {
        var t = QZFL.shareObject.getValidSO()
        ;
        if (t) return t.get(e); else return void 0
    };
    QZFL.shareObject.set = function (e, t) {
        var n = QZFL.shareObject.getValidSO();
        if (n) return n.set(e, t); else return false
    };
    QZFL.shareObject.DataBase = function (e) {
        if (QZFL.shareObject.refCount > 0) {
            return QZFL.shareObject.instance["so_1"]
        }
        this._ready = false;
        QZFL.shareObject.refCount++;
        var t = document.createElement("div");
        t.style.height = "0px";
        t.style.overflow = "hidden";
        document.body.appendChild(t);
        t.innerHTML = QZFL.media.getFlashHtml({
            src: e,
            id: "__so" + QZFL.shareObject.refCount,
            width: 1,
            height: 0,
            allowscriptaccess: "always"
        });
        this.ele = $("__so" + QZFL.shareObject.refCount);
        QZFL.shareObject.instance["so_" + QZFL.shareObject.refCount] = this
    };
    QZFL.shareObject.DataBase.prototype.set = function (e, t) {
        if (this._ready) {
            this.ele.set("seed", Math.random());
            this.ele.set(e, t);
            this.ele.flush();
            return true
        } else {
            return false
        }
    };
    QZFL.shareObject.DataBase.prototype.del = function (e) {
        if (this._ready) {
            this.ele.set("seed", Math.random());
            this.ele.set(e, void 0);
            this.ele.flush();
            return true
        } else {
            return false
        }
    };
    QZFL.shareObject.DataBase.prototype.get = function (e) {
        return this._ready ? this.ele.get(e) : null
    };
    QZFL.shareObject.DataBase.prototype.clear = function () {
        if (this._ready) {
            this.ele.clear();
            return true
        } else {
            return false
        }
    };
    QZFL.shareObject.DataBase.prototype.getDataSize = function () {
        if (this._ready) {
            return this.ele.getSize()
        } else {
            return -1
        }
    };
    QZFL.shareObject.DataBase.prototype.load = function (e, t, n, r) {
        if (this._ready) {
            this.ele.load(e, t, n, r);
            return true
        } else {
            return false
        }
    };
    QZFL.shareObject.DataBase.prototype.setReady = function () {
        this._ready = true
    };

    function getShareObjectPrefix() {
        QZFL.shareObject.instance["so_" + QZFL.shareObject.refCount].setReady();
        return location.host.replace(".qzone.qq.com", "")
    }

    QZFL.shareObject.DataBase.prototype.setClipboard = function (e) {
        if (this._ready && isString(e)) {
            this.ele.setClipboard(e);
            return true
        } else {
            return false
        }
    };
    QZFL.dragdrop = {
        path: "http://" + QZFL.config.resourceDomain + "/ac/qzfl/release/widget/dragdrop.js?max_age=864001",
        dragdropPool: {},
        count: 0,
        registerDragdropHandler: function (e, t, n) {
            var r = QZFL.event, i = QZFL.dragdrop, o = QZFL.dom.get(e), a = QZFL.dom.get(t), s;
            n = n || {range: [null, null, null, null], ghost: 0};
            if (!(o = o || a)) {
                return null
            }
            s = a || o;
            if (!o.id) {
                o.id = "dragdrop_" + ++i.count
            }
            o.style.cursor = n.cursor || "move";
            i.dragdropPool[o.id] = {};
            r.on(o, "mousedown", i.startDrag, [o.id, s, n]);
            return i.dragdropPool[o.id]
        },
        unRegisterDragdropHandler: function (e) {
            var t = QZFL.dom.get(e), n = QZFL.event;
            if (!t) {
                return null
            }
            t.style.cursor = "";
            QZFL.dragdrop._oldSD && n.removeEvent(t, "mousedown", QZFL.dragdrop._oldSD);
            n.removeEvent(t, "mousedown", QZFL.dragdrop.startDrag);
            delete QZFL.dragdrop.dragdropPool[t.id]
        },
        startDrag: function (e) {
            QZFL.dragdrop.doStartDrag.apply(QZFL.dragdrop, arguments);
            QZFL.event.preventDefault(e)
        },
        dragTempId: 0,
        doStartDrag: function (e, t, n, r) {
            var i = QZFL.dragdrop, o = {};
            QZFL.object.extend(o, e);
            QZFL.imports(i.path, function () {
                i.startDrag.call(i, o, t, n, r)
            })
        }
    };
    QZFL.dragdrop._oldSD = QZFL.dragdrop.startDrag;
    QZFL.element.extendFn({
        dragdrop: function (e, t) {
            var n = []
            ;this.each(function () {
                n.push(QZFL.dragdrop.registerDragdropHandler(this, e, t))
            });
            return n
        }, unDragdrop: function (e, t) {
            this.each(function () {
                _arr.push(QZFL.dragdrop.unRegisterDragdropHandler(this))
            })
        }
    });
    QZFL.widget.msgbox = {
        cssPath: "//" + QZFL.config.resourceDomain + "/ac/qzfl/release/css/msgbox.css",
        path: "//" + QZFL.config.resourceDomain + "/ac/qzfl/release/widget/msgbox.js",
        currentCssPath: null,
        _loadCss: function (e) {
            var t = QZFL.widget.msgbox;
            e = e || t.cssPath;
            if (t.currentCssPath != e) {
                QZFL.css.insertCSSLink(t.currentCssPath = e)
            }
        },
        show: function (e, t, n, r) {
            var i = QZFL.widget.msgbox;
            if (typeof r == "number") {
                r = {topPosition: r}
            }
            r = r || {};
            i._loadCss(r.cssPath);
            QZFL.imports(i.path, function () {
                i.show(e, t, n, r)
            })
        },
        hide: function (e) {
            QZFL.imports(QZFL.widget.msgbox.path, function () {
                QZFL.widget.msgbox.hide(e)
            })
        }
    };
    QZFL.dialog = {
        cssPath: "http://" + QZFL.config.resourceDomain + "/qzone_v6/qz_dialog.css",
        currentCssPath: "",
        path: "http://" + QZFL.config.resourceDomain + "/ac/qzfl/release/widget/dialog.js?max_age=864020",
        count: 0,
        instances: {},
        BUTTON_TYPE: {Disabled: -1, Normal: 0, Cancel: 1, Confirm: 2, Negative: 3},
        create: function (e, t, n) {
            var r, i, o;
            if (t && typeof t == "object" && t.src && t.src.indexOf("//") !== 0 && t.src.indexOf("/") === 0) {
                t.src = window.location.protocol + "//" + (window.imgcacheDomain || "qzs.qq.com") + t.src
            } else if (t && typeof t == "string") {
                t = t.replace(/<iframe([^>]+)>/gi, function () {
                    var e = arguments;
                    var t = e[1];
                    return "<iframe " + t.replace(/src="([^"]+)"/i, function () {
                        var e = arguments;
                        var t = e[1];
                        if (t && t.indexOf("//") !== 0 && t.indexOf("/") === 0) {
                            t = window.location.protocol + "//" + (window.imgcacheDomain || "qzs.qq.com") + t
                        }
                        return 'src="' + escHTML(t) + '"'
                    }) + "></iframe>"
                })
            }
            if (r = typeof n != "number" || isNaN(parseInt(n, 10))) {
                n = n || {};
                i = [0, 0, n.width, n.height, n.useTween, n.noBorder]
            } else {
                n = {width: n};
                i = arguments
            }
            r && (n.width = i[2] || 300);
            n.height = i[3] || 200;
            n.useTween = !!i[4];
            n.noBorder = !!i[5];
            n.title = e || n.title || "";
            n.content = t || n.content || "";
            o = new QZFL.dialog.shell(n);
            o.init(n);
            return o
        },
        createBorderNone: function (e, t, n) {
            var r = r || {};
            r.noBorder = true;
            r.width = t || 300
            ;r.height = n || 200;
            return QZFL.dialog.create(null, e || "", r)
        }
    };
    QZFL.dialog._shellCall = function (e, t, n) {
        var r = QZFL.dialog;
        QZFL.imports(r.path, function (t) {
            return function () {
                r.base.prototype[e].apply(t, n || [])
            }
        }(t))
    };
    QZFL.dialog.shell = function (e) {
        var t = QZFL.dialog, n = e.cssPath || t.cssPath;
        if (n != t.currentCssPath) {
            QZFL.css.insertCSSLink(n);
            t.currentCssPath = n
        }
        this.opts = e;
        this.id = "qzDialog" + ++t.count;
        t.instances[this.id] = this;
        this.uniqueID = t.count;
        if (!t.base) {
            QZFL.imports(t.path)
        }
    };
    QZFL.dialog.shell.prototype.getZIndex = function () {
        return this.zIndex || 6e3 + QZFL.dialog.count
    };
    (function (e) {
        for (var t = 0, n = e.length; t < n; ++t) {
            QZFL.dialog.shell.prototype[e[t]] = function (e) {
                return function () {
                    QZFL.dialog._shellCall(e, this, arguments)
                }
            }(e[t])
        }
    })(["hide", "unload", "init", "fillTitle", "fillContent", "setSize", "show", "hide", "focus", "blur", "setReturnValue"]);
    QZFL.widget.Confirm = function (e, t, n) {
        if (typeof n != "undefined" && typeof n != "object") {
            n = {type: n, tips: arguments[3]}
        }
        n = n || {}
        ;var r, i = QZFL.widget.Confirm, o = n.cssPath || i.cssPath;
        n.title = n.title || e || "";
        n.content = n.content || t || "";
        this.opts = n;
        this.tips = n.tips = n.tips || [];
        r = ++i.count;
        this.id = "qzConfirm" + r;
        i.instances[r] = this;
        if (o != i.currentCssPath) {
            QZFL.css.insertCSSLink(o);
            i.currentCssPath = o
        }
        if (!i.iconMap) {
            QZFL.imports(i.path)
        }
    };
    QZFL.widget.Confirm.TYPE = {OK: 1, NO: 2, OK_NO: 3, CANCEL: 4, OK_CANCEL: 5, NO_CANCEL: 6, OK_NO_CANCEL: 7};
    QZFL.widget.Confirm.count = 0;
    QZFL.widget.Confirm.instances = {};
    QZFL.widget.Confirm.cssPath = "http://" + QZFL.config.resourceDomain + "/ac/qzfl/release/resource/css/confirm_by_dialog.css";
    QZFL.widget.Confirm.path = "http://" + QZFL.config.resourceDomain + "/ac/qzfl/release/widget/confirm_base.js";
    QZFL.widget.Confirm._shellCall = function (e, t, n) {
        var r = QZFL.widget.Confirm;
        QZFL.imports(r.path, function (t) {
            return function () {
                r.prototype[e].apply(t, n || [])
            }
        }(t))
    };
    (function (e) {
        for (var t = 0, n = e.length; t < n; ++t) {
            QZFL.widget.Confirm.prototype[e[t]] = function (e) {
                return function () {
                    QZFL.widget.Confirm._shellCall(e, this, arguments)
                }
            }(e[t])
        }
    })(["hide", "show"]);
    (function (e) {
        var t = {};
        e.get = e.load = function (e) {
            return t[e]
        };
        e.del = function (e) {
            t[e] = null;
            delete t[e];
            return true
        };
        e.save = function e(n, r) {
            t[n] = r;
            return true
        }
    })(QZFL.dataCenter = {});
    QZFL.maskLayout = function () {
        var e = null, t = 0, n = function (n, r, i) {
            ++t;
            if (e) {
                return t
            }
            n = n || 5e3;
            r = r || document;
            i = i || {};
            var o = parseFloat(i.opacity, 10);
            i.opacity = isNaN(o) ? .2 : o;
            o = parseFloat(i.top, 10);
            i.top = isNaN(o) ? 0 : o;
            o = parseFloat(i.left, 10);
            i.left = isNaN(o) ? 0 : o;
            e = QZFL.dom.createElementIn("div", r.body, false, {
                className: "qz_mask",
                unselectable: "on",
                style: '-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(opacity=20)"'
            });
            e.style.cssText = "background-color:#000;filter:alpha(opacity=" + 100 * i.opacity + ");opacity:" + i.opacity + ";position:fixed;_position:absolute;left:" + i.left + "px;top:" + i.top + "px;z-index:" + n + ";width:100%;height:" + QZFL.dom[QZFL.userAgent.ie < 7 ? "getScrollHeight" : "getClientHeight"](r) + "px;";
            return t
        };
        n.setOpacity = function (t) {
            if (e && t) {
                QZFL.dom.setStyle(e, "opacity", t)
            }
        };
        n.getRef = function () {
            return e
        };
        n.remove = function (n) {
            t = Math.max(--t, 0);
            if (!t || n) {
                QZFL.dom.removeElement(e);
                e = null;
                n && (t = 0)
            }
        };
        return n.create = n
    }();
    QZFL.fixLayout = {
        _fixLayout: null,
        _isIE6: QZFL.userAgent.ie && QZFL.userAgent.ie < 7,
        _layoutDiv: {},
        _layoutCount: 0,
        _init: function () {
            this._fixLayout = QZFL.dom.get("fixLayout") || QZFL.dom.createElementIn("div", document.body, false, {
                id: "fixLayout",
                style: "width:100%;"
            });
            this._isInit = true;
            if (this._isIE6) {
                QZFL.event.addEvent(document.compatMode == "CSS1Compat" ? window : document.body, "scroll", QZFL.event.bind(this, this._onscroll))
            }
        },
        create: function (e, t, n, r, i) {
            if (!this._isInit) {
                this._init()
            }
            i = i || {};
            var o = {style: (t ? "bottom:0;" : "top:0;") + (i.style || "left:0;width:100%;z-index:10000")}, a;
            if (n) {
                o.id = n
            }
            this._layoutCount++;
            a = this._layoutDiv[this._layoutCount] = QZFL.dom.createElementIn("div", this._fixLayout, false, o);
            a.style.position = this._isIE6 ? "absolute" : "fixed";
            a.isTop = !t;
            a.innerHTML = e;
            a.noFixed = r ? 1 : 0;
            return this._layoutCount
        },
        moveTop: function (layoutId) {
            if (!this._layoutDiv[layoutId].isTop) {
                with (this._layoutDiv[layoutId]) {
                    if (this._isIE6 && !this._layoutDiv[layoutId].noFixed) {
                        style.marginTop = QZFL.dom.getScrollTop() + "px";
                        style.marginBottom = "0";
                        style.marginBottom = "auto"
                    }
                    style.top = "0";
                    style.bottom = "";
                    isTop = true
                }
            }
        },
        moveBottom: function (layoutId) {
            if (this._layoutDiv[layoutId].isTop) {
                with (this._layoutDiv[layoutId]) {
                    if (this._isIE6 && !this._layoutDiv[layoutId].noFixed) {
                        style.marginTop = "auto";
                        style.marginBottom = "0";
                        style.marginBottom = "auto"
                    }
                    style.top = "";
                    style.bottom = "0";
                    isTop = false
                }
            }
        },
        fillHtml: function (e, t) {
            this._layoutDiv[e].innerHTML = t
        },
        _onscroll: function () {
            var e = QZFL.fixLayout;
            for (var t in e._layoutDiv) {
                if (e._layoutDiv[t].noFixed) {
                    continue
                }
                QZFL.dom.setStyle(e._layoutDiv[t], "display", "none")
            }
            clearTimeout(this._timer);
            this._timer = setTimeout(this._doScroll, 500);
            if (this._doHide) {
                return
            }
            this._doHide = true
        },
        _doScroll: function () {
            var e = QZFL.fixLayout;
            for (var t in e._layoutDiv) {
                if (e._layoutDiv[t].noFixed) {
                    continue
                }
                var n = e._layoutDiv[t];
                if (n.isTop) {
                    e._layoutDiv[t].style.marginTop = QZFL.dom.getScrollTop() + "px"
                } else {
                    e._layoutDiv[t].style.marginBottom = "0";
                    e._layoutDiv[t].style.marginBottom = "auto"
                }
            }
            clearTimeout(this._stimer);
            this._stimer = setTimeout(function () {
                for (var t in e._layoutDiv) {
                    if (e._layoutDiv[t].noFixed) {
                        continue
                    }
                    QZFL.dom.setStyle(e._layoutDiv[t], "display", "")
                }
            }, 800);
            e._doHide = false
        }
    };
    QZFL.widget.bubble = {
        show: function (e, t, n, r) {
            r = r || {};
            var i = r.id || "oldBubble_" + ++QZFL.widget.bubble.count;
            r.id = i;
            QZFL.imports(QZFL.widget.bubble.path, function () {
                QZFL.widget.tips.show("<div>" + t + "</div>" + n, e, r)
            });
            return i
        }, count: 0, hide: function (e) {
            if (QZFL.widget.tips) {
                QZFL.widget.tips.close(e)
            }
        }, hideAll: function () {
            if (QZFL.widget.tips) {
                QZFL.widget.tips.closeAll()
            }
        }
    };

    function hideBubble(e) {
        QZFL.widget.bubble.hide(e)
    }

    function hideAllBubble() {
        QZFL.widget.bubble.hideAll()
    }

    QZFL.widget.bubble.showEx = QZFL.emptyFn;
    QZFL.widget.bubble.setExKey = QZFL.emptyFn;
    QZFL.widget.tips = {
        path: "http://" + QZFL.config.resourceDomain + "/ac/qzfl/release/widget/tips.js?max_age=1209600",
        show: function (e, t, n) {
            n = n || {};
            var r = n.id || "QZFL_bubbleTips_" + ++QZFL.widget.tips.count;
            n.id = r;
            QZFL.imports(QZFL.widget.tips.path, function () {
                QZFL.widget.tips.show(e, t, n)
            });
            return r
        },
        count: -1,
        close: function (e) {
            QZFL.imports(QZFL.widget.tips.path, function () {
                if (QZFL.widget.tips) {
                    QZFL.widget.tips.close(e)
                }
            })
        },
        closeAll: function () {
            QZFL.imports(QZFL.widget.tips.path, function () {
                if (QZFL.widget.tips) {
                    QZFL.widget.tips.closeAll()
                }
            })
        },
        resize: function (e) {
            QZFL.imports(QZFL.widget.tips.path, function () {
                if (QZFL.widget.tips) {
                    QZFL.widget.tips.resize && QZFL.widget.tips.resize(e)
                }
            })
        }
    };
    (QZFL.widget.bubble || {}).path = QZFL.widget.tips.path;
    QZFL.widget.seed = {
        _seed: 1, domain: "qzone.qq.com", prefix: "__Q_w_s_", update: function (e, t) {
            var n = 1, r, i = QZFL.widget.seed;
            if (typeof e == "undefined") {
                n = i._update()
            } else {
                e = i.prefix + e;
                if (t && t.useCookie) {
                    n = QZFL.cookie.get(e);
                    if (n) {
                        QZFL.cookie.set(e, ++n, t.domain || i.domain, null, 3e3)
                    } else {
                        return 0
                    }
                } else {
                    r = QZFL.shareObject.getValidSO();
                    if (!r) {
                        n = i._update()
                    } else if (n = r.get(e)) {
                        r.set(e, ++n)
                    } else {
                        return 0
                    }
                }
            }
            return n
        }, _update: function () {
            var e = QZFL.widget.seed;
            QZFL.cookie.set("randomSeed", e._seed = parseInt(Math.random() * 1e6, 10), e.domain, null, 3e3);
            return e._seed
        }, get: function (e, t) {
            var n, r, i = QZFL.widget.seed;
            if (typeof e == "undefined") {
                return (i._seed = QZFL.cookie.get("randomSeed")) ? i._seed : i.update()
            } else {
                e = i.prefix + e;
                if (t && t.useCookie) {
                    return (r = QZFL.cookie.get(e)) ? r : (QZFL.cookie.set(e, r = 1, t.domain || i.domain, null, 3e3), r)
                } else {
                    if (!(n = QZFL.shareObject.getValidSO())) {
                        return i._seed
                    }
                    return (r = n.get(e)) ? r : (n.set(e, r = 1), r)
                }
            }
        }
    };
    QZFL.widget.runBox = function (e, t, n) {
        var r, i, o, a;
        e = QZFL.dom.get(e);
        t = QZFL.dom.get(t);
        if (!QZFL.lang.isNode(e) || !QZFL.lang.isNode(t) || !QZFL.effect) {
            return
        }
        n = n || {};
        n.duration = n.duration || .8;
        r = n.doc = n.doc || document;
        o = QZFL.dom.getPosition(e);
        i = r.createElement("div")
        ;i.style.cssText = "border:3px solid #999; z-index:10000; position:absolute; left:" + o.left + "px; top:" + o.top + "px; width:" + o.width + "px; height:" + o.height + "px;";
        r.body.appendChild(i);
        a = QZFL.dom.getPosition(t);
        QZFL.effect.run(i, {left: a.left, top: a.top, width: a.width, height: a.height}, {
            duration: n.duration * 1e3,
            complete: function () {
                r.body.removeChild(i);
                o = a = i = null
            }
        })
    };
    QZFL.widget.runBox.start = function () {
        QZFL.widget.runBox.apply(QZFL.widget.runBox, arguments)
    };
    QZFL.object.map(QZFL.string || {});
    QZFL.object.map(QZFL.util || {});
    QZFL.object.map(QZFL.lang || {});
    (function (e) {
        e.ua = e.ua || QZFL.userAgent;
        e.$e = QZFL.element.get;
        !e.$ && (e.$ = QZFL.dom.get);
        e.removeNode = QZFL.dom.removeElement;
        e.ENV = QZFL.enviroment;
        e.addEvent = QZFL.event.addEvent;
        e.removeEvent = QZFL.event.removeEvent;
        e.getEvent = QZFL.event.getEvent;
        e.insertFlash = QZFL.media.getFlashHtml;
        e.getShareObjectPrefix = getShareObjectPrefix
    })(window);
    if (!QZFL.pluginsDefine) {
        QZFL.pluginsDefine = {}
    }
    QZFL.pluginsDefine.getACSRFToken = function (e) {
        e = QZFL.util.URI(e);
        var t
        ;
        if (e) {
            if (e.host && e.host.indexOf("qzone.qq.com") > 0) {
                try {
                    t = parent.QZFL.cookie.get("p_skey")
                } catch (e) {
                    t = QZFL.cookie.get("p_skey")
                }
            } else if (e.host && e.host.indexOf("qq.com") > 0) {
                t = QZFL.cookie.get("skey")
            }
        }
        if (!t) {
            t = QZFL.cookie.get("p_skey") || QZFL.cookie.get("skey") || QZFL.cookie.get("rv2") || ""
        }
        return arguments.callee._DJB(t)
    };
    QZFL.pluginsDefine.getACSRFToken._DJB = function (e) {
        var t = 5381;
        for (var n = 0, r = e.length; n < r; ++n) {
            t += (t << 5) + e.charCodeAt(n)
        }
        return t & 2147483647
    };

    function toUrlParam(e) {
        var t = [];
        for (var n in e) {
            if (e.hasOwnProperty(n)) {
                if (e[n] !== "" && e[n] !== undefined) {
                    t.push(encodeURIComponent(n) + "=" + encodeURIComponent(e[n]))
                }
            }
        }
        return t.join("&")
    }

    function errcodeReport(e) {
        e = e || {};
        e.cgi = e.cgi || "";
        e.code = e.code || 502;
        e.pathname = e.pathname || "";
        e.time = e.time || 0;
        var t = e.cgi.split("/");
        var n = t.pop();
        if (n && n.indexOf("?") > -1) {
            n = n.split("?")[0]
        }
        var r = {pathname: e.pathname, code: e.code, time: e.time, cgi: e.cgi};
        r = toUrlParam(r);
        if (XMLHttpRequest) {
            var i = new XMLHttpRequest;
            i.withCredentials = true
            ;i.open("post", "//h5.qzone.qq.com/log/post/error/pc/502/" + n, true);
            i.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            i.send(r)
        }
    }

    function getCgiDomainAndPath(e) {
        var t = "";
        if (e.indexOf("?") > -1) {
            t = e.split("?")[0]
        } else {
            t = e
        }
        t = t.replace(/\/\//, "").replace(/https?:/, "").replace(/(user|h5).qzone.qq.com\/proxy\/domain\//, "");
        var n = t.indexOf("/");
        var r = t.substring(0, n);
        var i = t.substring(n) + "?qzfl";
        return {domain: r, cgi: i}
    }

    function returnCodeReport(e) {
        e = e || {};
        if (!e.url || !e.type) {
            return
        }
        var t = getCgiDomainAndPath(e.url);
        var n = toUrlParam({
            appid: e.appid || "20141",
            platform: "pc",
            domain: t.domain || window.location.host,
            cgi: t.cgi,
            type: e.type,
            code: e.code || 0,
            time: Math.random() * 1e3,
            apn: "wifi",
            rate: 1
        });
        (new Image).src = "https://report.huatuo.qq.com/code.cgi?" + n;
        if (window.g_isAlpha_iLoginUin) {
            console.log("上报返回码成功")
        }
        var r;
        if (e.type == 1) {
            r = 0
        } else if (e.type == 2) {
            r = 1
        } else if (e.type == 3) {
            r = 2
        }
        reportMd(t.domain + t.cgi, r, e.code || 0, 1)
    }

    function reportMd(e, t, n, r) {
        var i = getMdMap()[e];
        if (i) {
            var o = "//h5.qzone.qq.com/report/md?" + "fromId=204971707&toId=211006088&interfaceId=" + i + (typeof n == "undefined" ? "" : "&code=" + n) + (typeof t == "undefined" ? "" : "&type=" + t) + (typeof r == "undefined" ? "" : "&delay=" + Math.min(r, 10 * 1e3)) + "&r=" + Math.random();
            var a = new Image;
            a.src = o
        }
    }

    function getMdMap(e) {
        return {
            "ic2.qzone.qq.com/cgi-bin/feeds/feeds3_html_more?qzfl": 104980806,
            "ic2.qzone.qq.com/cgi-bin/feeds/feeds_html_act_all?qzfl": 104980807,
            "ic2.qzone.qq.com/cgi-bin/feeds/cgi_get_feeds_count.cgi?qzfl": 104980808
        }
    }

    QZFL.errcodeReport = errcodeReport;
    QZFL.returnCodeReport = returnCodeReport;
    QZFL.reportMd = reportMd;

    function transUrl2HttpsIfNeed(e, t) {
        var n = QZFL.win.g_sdms || {};
        if (!e) {
            return e
        }
        var r = QZFL.util.URI(e);
        if (!r) {
            return e
        }
        var i;
        var o;
        if (t) {
            o = window.location.protocol
        } else {
            o = QZFL.win.g_proto || window.location.protocol
        }
        if (n[r.host] == 1) {
            i = o + "//" + (window.g_cgidomain || "h5") + ".qzone.qq.com/proxy/domain/" + r.host + r.pathname + r.search
        } else if (r.host == "qzonestyle.gtimg.cn" || r.host == "qzs.qq.com" || r.host == "qzs.qzone.qq.com") {
            i = o + "//" + r.host + r.pathname + r.search
        }
        return i || e
    }

    (function () {
        var e = QZONE.FormSender;
        if (e && e.pluginsPool) {
            e.pluginsPool.formHandler.push(function (e) {
                if (e) {
                    if (!e.g_tk) {
                        var t = QZFL.string.trim(e.action);
                        t = transUrl2HttpsIfNeed(t);
                        t += (t.indexOf("?") > -1 ? "&" : "?") + "g_tk=" + QZFL.pluginsDefine.getACSRFToken(t);
                        e.action = t
                    }
                }
                return e
            })
        }
    })();
    (function () {
        var e = QZONE.JSONGetter, t = /\.js|\.json$/i;
        if (e && e.pluginsPool) {
            e.pluginsPool.srcStringHandler.push(function (e) {
                var n, r;
                if (typeof e == "string") {
                    e = transUrl2HttpsIfNeed(e);
                    if (e.indexOf("g_tk=") < 0) {
                        r = (n = e.indexOf("?") > -1) ? e.split("?")[0] : e;
                        if (t.lastIndex = 0, !t.test(r)) {
                            e += (n ? "&" : "?") + "g_tk=" + QZFL.pluginsDefine.getACSRFToken(e)
                        }
                    }
                }
                return e
            })
        }
    })();
    if (!QZFL.pluginsDefine) {
        QZFL.pluginsDefine = {}
    }
    QZFL.pluginsDefine.networkChectLibPath = window.location.protocol + "//" + QZFL.config.resourceDomain + "/qzone/v6/troubleshooter/network_check_plugin_lib.js";
    (function () {
        var e = QZONE.FormSender
        ;
        if (e && e.pluginsPool) {
            e.pluginsPool.onErrorHandler.push(function (e) {
                e && QZFL.pluginsDefine && QZFL.pluginsDefine.networkChectLibPath && QZFL.imports && QZFL.imports(QZFL.pluginsDefine.networkChectLibPath, function (e) {
                    return function () {
                        QZONE && QZONE.troubleShooter && QZONE.troubleShooter.qzflPluginNetworlCheck && QZONE.troubleShooter.qzflPluginNetworlCheck(e)
                    }
                }({url: e.uri}))
            })
        }
    })();
    (function () {
        var e = QZONE.JSONGetter;
        if (e && e.pluginsPool) {
            e.pluginsPool.onErrorHandler.push(function (e) {
                e && QZFL.pluginsDefine && QZFL.pluginsDefine.networkChectLibPath && QZFL.imports && QZFL.imports(QZFL.pluginsDefine.networkChectLibPath, function (e) {
                    return function () {
                        QZONE && QZONE.troubleShooter && QZONE.troubleShooter.qzflPluginNetworlCheck && QZONE.troubleShooter.qzflPluginNetworlCheck(e)
                    }
                }({url: e._uri}))
            })
        }
    })();
    (function (e) {
        var t = false;
        (function (e) {
            var t = window, n, r = 0, i = [];
            while (true) {
                n = false;
                try {
                    t.document && t.document.domain == document.domain && (n = true)
                } catch (e) {
                }
                if (n) {
                    i.push(t)
                }
                if (t == top) {
                    break
                }
                t = t.parent
            }
            while (i.length) {
                if (e(t = i.pop()) === true) {
                    return t
                }
            }
            return null
        })(function (e) {
            if (/(?:^user\.(s\d\.)?|\d{5,}\.|rc\.)qzone\.qq\.com/.test(e.location.host) && e.QZFL && e.QZFL.cookie) {
                t = e.QZFL && e.QZFL.cookie.get("blabla") == "dynamic";
                return true
            }
        });
        var n = "https://huatuocode.weiyun.com/code.cgi", r = /^https?:\/\/([\s\S]*?)(\/[\s\S]*?)(?:\?|$)/,
            i = e.pingSender, o = [], a, s = (new Date).getHours(), u = s > 0 && s < 8 ? 1 : 1,
            l = s > 0 && s < 8 ? 1 : 1, c = function () {
                return Math.random() * u < 1
            }, f = function () {
                return Math.random() * l < 1
            }, d = typeof g_iUin == "undefined" ? 0 : g_iUin, p = 1e3, m = e.object.each;

        function h(t, r, i, o, a, s, u, l) {
            if (Math.random() > 1 / s) return;
            var c = [];
            c.push("uin=" + u, "key=" + "domain,cgi,type,code,time,rate", "r=" + Math.random());
            if (typeof l.unshift == "function") {
                var f = 0;
                while (l.length) {
                    if (c.join("&").length > 1e3) {
                        break
                    }
                    var d = l.shift();
                    c.push([f + 1, 1].join("_") + "=" + d[0]);
                    c.push([f + 1, 2].join("_") + "=" + d[1] + (d[6] ? "?qzfl_s" : "?qzfl"));
                    c.push([f + 1, 3].join("_") + "=" + d[2]);
                    c.push([f + 1, 4].join("_") + "=" + d[3]);
                    c.push([f + 1, 5].join("_") + "=" + d[4])
                    ;c.push([f + 1, 6].join("_") + "=" + d[5]);
                    f++
                }
            }
            if (t != "" || f > 0) {
                e.pingSender && e.pingSender(n + "?" + c.join("&"), 1e3)
            }
        }

        function g() {
            if (o.length) {
                h("", "", "", "", "", "", d, o)
            }
            a = setTimeout(g, p);
            p *= 1.1
        }

        function L(e) {
            if (!e) return "";
            var t = e;
            if (e.indexOf("://") == 4 || e.indexOf("://") == 5) {
                t = e
            } else if (e.indexOf("../") === 0) {
                t = location.protocol + "//" + location.host + "/" + e.replace(/(?:\.\.\/)*/, location.pathname.split("/").slice(1, -1 * e.split("../").length).join("/") + "/")
            } else if (/^[^\/]+\//.test(e) || e.indexOf("./") === 0) {
                if (e.indexOf("./") === 0) {
                    e = e.substring(2)
                }
                t = location.protocol + "//" + location.host + location.pathname.split("/").slice(0, -1).join("/") + "/" + e
            } else if (e.charAt(0) === "/") {
                t = location.protocol + "//" + location.host + e
            }
            return t
        }

        m(["JSONGetter", "FormSender"], function (n) {
            e[n].prototype.setReportRate = function (e) {
                this.reportRate = e
            };
            if (e[n] && e[n].pluginsPool) {
                if (typeof e[n].pluginsPool.onRequestComplete == "undefined") {
                    e[n].pluginsPool.onRequestComplete = []
                }
                e[n].pluginsPool.onRequestComplete.push(function (t) {
                    var n = t._uri || t.uri;
                    n = L(n);
                    var i = n.match(r), a = i[2], s = i[1];
                    if (t.msg && t.msg.indexOf("Connection") > -1) {
                        o.push([s, a, 2, t.statusCode || 502, +t.endTime - t.startTime, 1, t.speedup]);
                        return
                    }
                    var d = t.resultArgs;
                    if (d && (d = d[0])) {
                        if (typeof d.code == "undefined") {
                            d.code = d.ret;
                            d.subcode = d.ret
                        }
                        if (d.code != 0) {
                            o.push([s, a, 3, d.subcode || 1, +t.endTime - t.startTime, 1, t.speedup])
                        } else {
                            if (t instanceof e.JSONGetter) {
                                if (t.reportRate) {
                                    (t.reportRate == 1 || Math.random() < 1 / t.reportRate) && o.push([s, a, 1, d.subcode || 1, +t.endTime - t.startTime, t.reportRate || u, t.speedup])
                                } else {
                                    c() && o.push([s, a, 1, d.subcode || 1, +t.endTime - t.startTime, t.reportRate || u, t.speedup])
                                }
                            }
                            if (t && t.ownerWindow && t instanceof t.ownerWindow.QZFL.FormSender) {
                                if (t.reportRate) {
                                    (t.reportRate == 1 || Math.random() < 1 / t.reportRate) && o.push([s, a, 1, d.subcode || 1, +t.endTime - t.startTime, t.reportRate || l])
                                } else {
                                    f() && o.push([s, a, 1, d.subcode || 1, +t.endTime - t.startTime, t.reportRate || l])
                                }
                            }
                        }
                    }
                });
                e[n].pluginsPool.onRequestComplete.push(function (e) {
                    if (t && e && e.ownerWindow && e instanceof e.ownerWindow.QZFL.FormSender) {
                        var n = e.postTime - e.startTime, r, i;
                        if ((e._uri || e.uri).indexOf("taotao.qq.com") > -1) {
                            i = 51
                        } else if ((e._uri || e.uri).indexOf("w.qzone.qq.com") > -1) {
                            i = 52
                        }
                        if (!i) {
                            return
                        }
                        var o = "https://huatuospeed.weiyun.com/cgi-bin/r.cgi?flag1=175&flag2=363&flag3=" + i;
                        if (ua.ie == 8) {
                            r = "2"
                        } else if (ua.ie == 9) {
                            r = "3"
                        } else if (ua.ie == 10) {
                            r = "4"
                        } else if (ua.chrome) {
                            r = "5"
                        } else if (ua.safari) {
                            r = "6"
                        } else if (ua.opera) {
                            r = "7"
                        } else if (ua.firefox) {
                            r = "8"
                        }
                        o += "&" + r + "=" + n;
                        QZFL.pingSender && QZFL.pingSender(o)
                    }
                })
            }
        });
        g()
    })(QZFL);
    if (typeof define === "function") {
        define(function () {
            return QZFL
        })
    }
    if (QZFL.userAgent.ie) {
        eval((typeof document.documentMode == "undefined" || document.documentMode < 9 ? "var document = QZFL._doc;" : "") + "var setTimeout = QZFL._setTimeout, setInterval = QZFL._setInterval")
    }
    try {
        if (!window.frameElement) {
            QZFL.event.addEvent(window, "beforeunload", function () {
                QZFL.cookie.del("blabla", "qzone.qq.com")
            })
        }
    } catch (e) {
    }
    QZFL.config = QZFL.config || {}
    ;var list = [["taotao.qq.com", "emotion_cgi_publish_v6"], ["taotao.qq.com", "emotion_cgi_re_feeds"], ["taotao.qq.com", "emotion_cgi_addcomment_ugc"], ["taotao.qq.com", "emotion_cgi_addreply_ugc"], ""].slice(0, -1);
    var re = /^https?\:\/\/([\s\S]+?)\//, rst;
    var supportlv2 = (QZFL.userAgent.ie > 9 || window.XMLHttpRequest) && "withCredentials" in new XMLHttpRequest;
    var urlParse = /^https?:\/\/([\s\S]*?)(\/[\s\S]*?)(?:\?|$)/;
    QZFL.config.xhrProxyEnable = function (e) {
        if (location.href.indexOf("proxydebug") > -1) return 1;
        if (location.href.indexOf("proxyoff") > -1) {
            return false
        }
        var t = e.match(urlParse), n = t[1], r = t[2];
        var i = QZFL.win.g_sdms || {};
        if (i[n] == 1) {
            return false
        }
        return e.indexOf("taotao.qq.com") > -1
    };
    QZFL.config.xhrGetReqProxyEnable = function (e) {
        if (e.indexOf("//") == 0 || e.indexOf(".js") != -1) return false;
        if (e.charAt(0) == "/" || e.indexOf("../") == 0) return true;
        var t = QZFL.win.g_sdms || {};
        var n = e.match(urlParse), r = n[1], i = n[2];
        if (t[r] == 1 || r == location.hostname) {
            return true
        }
        return false
    };
    QZFL.config.canUseXHR2 = function (e) {
        if (!supportlv2) return false;
        rst = e.match(re);
        for (var t = 0; t < list.length; t++) if (list[t][0] == rst[1] && new RegExp("\\/" + list[t][1] + "\\b").test(e)) return true;
        return false
    }
})();
