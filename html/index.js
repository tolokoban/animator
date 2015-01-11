var Path = require("path");
var FS = require("fs");
var anim = null;
var animFile = null;
var frameIndex = -1;
var backX = 0;
var backY = 0;

function listAnims() {
    var animdir = Path.join(Common.pwd(), "../data/anim");
    var ul = window.document.getElementById("anims");
    FS.readdir(
        animdir,
        function(err, files) {
            if (err) {
                ul.textContent = err;
            } else {
                files.forEach(
                    function(filename) {
                        var size = filename.length;
                        if (filename.substr(size - 5) != '.json') return;
                        var file = Path.join(animdir, filename);
                        var stat = FS.statSync(file);
                        if (stat.isDirectory()) return;
                        var li = window.document.createElement("li");
                        var a = window.document.createElement("a");
                        a.setAttribute("href", "javascript:setAnim('" + filename + "')");
                        a.textContent = filename.substr(0, size - 5);
                        li.appendChild(a);
                        ul.appendChild(li);
                    }
                );
            }
        }
    );
}

function save() {
    if (!anim || !animFile) return;
    var content = "{\n";
    content += '  "time": ' + parseInt(anim.time) + ",\n"
    + '  "frames": [';
    anim.frames.forEach(
        function(frame, index) {
            frame.x = parseInt(frame.x);
            frame.y = parseInt(frame.y);
            if (index > 0) {
                content += ",";
            }
            content += "\n    " + JSON.stringify(frame);
        }
    );
    content += "\n  ]\n}";
    FS.writeFileSync(animFile, content);
}

function centerFrame(frame) {
    var img = new Image();
    img.onload = function() {
        frame.y = img.height;
        frame.x = Math.floor(img.width / 2);
        showDetails();
    };
    img.src = "../data/anim/" + frame.src;
}

function setAnim(filename) {
    var animdir = Path.join(Common.pwd(), "../data/anim");    
    var file = Path.join(animdir, filename);
    if (!FS.existsSync(file)) {
        alert("File not found: " + file);
        return;
    }
    animFile = file;
    backX = 0;
    backY = 0;
    frameIndex = -1;
    try {
        anim = JSON.parse(FS.readFileSync(file));
    } catch (x) {
        alert("Bad JSON format for " + file + "\n" + x);
        return;
    }

    if (typeof anim.time === 'undefined') anim.time = 300;
    anim.time = parseInt(anim.time);
    if (typeof anim.frames === 'undefined') {
        anim.frames = [];
        alert("The animation definition need the attribute 'frames'!");
        return;
    }
    anim.frames.forEach(
        function(frame) {
            if (typeof frame.x === 'undefined' || typeof frame.y === 'undefined') {
                centerFrame(frame);
            }
        }
    );
    showDetails();
}

function showDetails() {
    // Afficher les détails.
    var detail = document.getElementById("detail");
    detail.innerHTML = "<span>Durée de l'animation (millisecondes) :</span> ";
    inp(
        detail,
        function() {
            this.value = parseInt(this.value);
            anim.time = this.value;
            save();
        }
    ).value = anim.time;
    var ol = document.createElement("ol");
    detail.appendChild(ol);
    anim.frames.forEach(
        function(frame, index) {
            var li = document.createElement("li");
            ol.appendChild(li);
            addFrameEditor(li, frame, index);
        }
    );
}

function addFrameEditor(container, frame, index) {
    inp(
        container, 
        function() {
            this.value = parseInt(this.value);
            frame.x = this.value;
            save();
        }
    ).value = frame.x;
    inp(
        container, 
        function() {
            this.value = parseInt(this.value);
            frame.y = this.value;
            save();
        }
    ).value = frame.y;
    var btn = document.createElement("button");
    btn.className = "small";
    btn.textContent = "Fix";
    btn.addEventListener(
        "click", 
        function() {
            if (frameIndex == index) {
                frameIndex = -1;
            } else {
                frameIndex = index;
            }
        }, 
        false
    );
    container.appendChild(btn);
}

function inp(container, onblur, size) {
    if (typeof size === 'undefined') size = 4;
    var input = document.createElement("input");
    container.appendChild(input);
    input.setAttribute("size", size);
    input.setAttribute("type", "text");
    if (typeof onblur === 'function') {
        input.addEventListener("blur", onblur, false);
    }
    return input;
}

function animBackground(timestamp) {
    var div = document.getElementById("background");    
    div.style.backgroundPosition = backX + "px " + backY + "px";
    backX++;
    backY++;
    window.requestAnimationFrame(animBackground);

    var img = document.getElementById("img");
    if (!anim || !anim.frames || anim.frames.length == 0) {
        img.setAttribute("src", "");
        return;
    }
    var idx = Math.floor(anim.frames.length * (timestamp % anim.time) / anim.time);
    if (frameIndex > -1) {
        idx = frameIndex % anim.frames.length;
    }
    var frame = anim.frames[idx];
    img.setAttribute("src", "../data/anim/" + frame.src);
    img.style.left = (240 - frame.x) + "px";
    img.style.top = (160 - frame.y) + "px";
}

window.addEventListener(
    'DOMContentLoaded',
    function() {
        listAnims();
        animBackground();
    }
);
