var TGD = require("tgd");

function alea(a, b) {
    if (typeof b === 'undefined') {
        b = a - 1;
        a = 0;
    }
    return a + Math.floor(Math.random() * (b - a + 1));
}


function cyberlab() {
    // On récupère le contexte du canvas.
    var ctx = this.context;
    // Choisir une position aléatoire.
    var radius = this.mouseButtons[0] > 0 ? 5 : 0;
    var x = this.pointerX + alea(-radius, radius);
    var y = this.pointerY + alea(-radius, radius);
    // Effacer l'écran.
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Dessiner un cyberlab.
    var img = this.image("cyberlab");
    ctx.drawImage(img, x - img.width / 2, y - img.height / 2);
}

function wait() {}

function program() {
    this.draw = wait;
    this.loadImages(
        {
            cyberlab: "cyberlab.png"
        },
        cyberlab
    );
    this.addMobil(
        new TGD.Mobil(
            {
                draw: function() {
                    var ctx = this.runtime.context;
                    var img = this.runtime.image("cyberlab");
                    ctx.drawImage(img, - img.width / 2, - img.height / 2);
                },
                sx: 50,
                sy: 30
            }
        )
    );
}

// Charger la bibliothèque "canvas" et démarrer le programme.
window.main = function() {
    var runtime = new TGD.Runtime();
    runtime.start(program);
};
