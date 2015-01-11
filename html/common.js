var Path = require("path");
var FS = require("fs");

var Common = function() {
    var languages = null;
    var langStyle = null;

    return {
        /**
         * Retourner le répertoire de la page courante.
         */
        pwd: function() {
            var path = window.location.href.substr(7);
            console.info("[common] path=...", path);
            if ((path.charAt(0) == '\\' || path.charAt(0) == '/') && path.charAt(2) == ':') {
                path = path.substr(1);
                console.info("[common] path (windows)=...", path);
            }
            console.info("[common] Path.dirname(path)=...", Path.dirname(path));
            return Path.dirname(path);
        },

        lang: function(id) {
            if (!languages) {
                // Initialise localization.
                languages = [];
                langStyle = window.document.createElement("style");
                var children = window.document.querySelectorAll("[lang]");
                window.document.head.appendChild(langStyle);
                for (var i = 0 ; i < children.length ; i++) {
                    var child = children[i];
                    lang = child.getAttribute("lang");
                    found = false;
                    for (k = 0 ; k < languages.length ; k++) {
                        if (languages[k] == lang) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        languages.push(lang);
                    }
                }
            }

            var lang, k, found, first, txt;
            if (id === undefined) {
                // Return current language.
                lang = window.localStorage.getItem("language");
                if (!lang) {
                    lang = window.navigator.language || window.navigator.browserLanguage || "en";
                    lang = lang.substr(0, 2);
                }
                window.localStorage.setItem("language", lang);
                return lang;
            } else {
                // Set current language and display localized elements.
                found = false;
                for (k = 0 ; k < languages.length ; k++) {
                    if (languages[k] == id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    id = languages[0];
                }
                txt = "";
                first = true;
                for (k = 0 ; k < languages.length ; k++) {
                    lang = languages[k];
                    if (lang != id) {
                        if (first) {
                            first = false;
                        } else {
                            txt += ",";
                        }
                        txt += "[lang=" + lang + "]";
                    }
                }
                langStyle.textContent = txt + "{display: none}";
                window.localStorage.setItem("language", id);
            }
        }
    };
}();



window.addEventListener(
    'DOMContentLoaded',
    function() {
        var dir = Common.pwd();
        Common.lang(Common.lang());
        var elements = window.document.querySelectorAll("pre");
        if (!elements) return;
        console.info("[common] elements=...", elements);
        var i;
        for (i = 0 ; i < elements.length ; i++) {
            var elem = elements[i];
            var src = elem.getAttribute("src");
            var file = Path.join(dir, src);
            if (FS.existsSync(file)) {
                var content = "" + FS.readFileSync(file);
                var lines = content.trim().split("\n");
                var ol = window.document.createElement("ol");
                elem.innerHTML = "";
                elem.appendChild(ol);
                lines.forEach(
                    function(line) {
                        var li = window.document.createElement("li");
                        li.textContent = line;
                        ol.appendChild(li);
                    } 
                );
            }
        }
    }
);
