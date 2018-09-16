/* ** ------------------------------------------------------ ** */
/* ** --          PONG 2                                  -- ** */
/* ** ------------------------------------------------------ ** */
/* ** -- Auteur      :  Pierre Contri                     -- ** */
/* ** -- Cree le     :  07/06/2006                        -- ** */
/* ** -- Modifie le  :  24/12/2008                        -- ** */
/* ** -- Update3 le  :  26/07/2015                        -- ** */
/* ** ------------------------------------------------------ ** */
/* ** -- Version 1.0 :  deplacement chariot et balle      -- ** */
/* ** -- Version 1.1 :  pause plus grossissement balle    -- ** */
/* ** -- Version 1.2 :  trois balles                      -- ** */
/* ** -- Version 1.3 :  debut de gestion de la souris     -- ** */
/* ** -- Version 1.4 :  creation des Bricks              -- ** */
/* ** -- Version 1.5 :  gestion des Bricks               -- ** */
/* ** -- Version 2.0 :  code de qualite                   -- ** */
/* ** -- Version 2.1 :  passage en code objet             -- ** */
/* ** -- Version 2.2 :  simplification sur objets         -- ** */
/* ** -- Version 2.3 :  compatibilite FireFox             -- ** */
/* ** -- Version 2.4 :  simplification du code            -- ** */
/* ** -- Version 2.5 :  alignement des Bricks sur grille -- ** */
/* ** -- Version 2.6 :  acceleration calculs              -- ** */
/* ** -- Version 2.7 :  pouvoirs sur Bricks              -- ** */
/* ** -- Version 2.8 :  reduction du code                 -- ** */
/* ** -- Version 2.9 :  correction interpreteur JavaScr   -- ** */
/* ** -- Version 3.0 :  amelioration qualite code         -- ** */
/* ** -- Version 3.1 :  Brick avec double resistance     -- ** */
/* ** ------------------------------------------------------ ** */

'use strict';

// Declaration des objets du jeu
// Variables globales pour le joueur
var nbBalls = 9;
var nbBricks = 60;
var deltadepl = 3; // pour toutes les balles
var timeOutdepl = 5; // temps en millisecondes de boucle du jeu
var isIE = (window.event) ? 1 : 0; // verification du navigateur (pour les anciens IE6 / Netscape 4)

// Variables de la classe __main__
var deplScreen = null;
var basculeTriche = false;
var precisionErreur = 1;
var graphismeImg = true;

var divJeu = null;
var tabBalls = null;
var tabBricks = null;
var carriage = null;

// Redefinition de l'objet Array
// Ajout d'une methode remove
Array.prototype.remove = function (obj) {
    let tmpArray = new Array();
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i] != obj) tmpArray.push(this[i]);
    }
    return tmpArray;
};

function getSizeScreen() {
    return {
        x: ((isIE) ? document.body.offsetWidth : document.body.clientWidth) - 40,
        y: ((isIE) ? document.body.offsetHeight : document.body.clientHeight) - 30
    };
}

// Objet "Ball"
function Ball(numero) {

    // variables
    this.element = document.createElement('DIV');
    this.element.id = "ball" + numero;
    this.element.name = "ball";
    this.element.className = "Ball";
    this.printForm = function () {
        this.element.innerHTML = (graphismeImg) ? "<img src='img/balle.jpg' style='width: 16px; height: 16px; border: 0px none;'/>" : "O";
    };
    this.printForm();

    // randomisation du positionnement des balles
    this.deplX = Math.floor((deplScreen.x) * Math.random());
    this.deplY = Math.floor((deplScreen.y) * Math.random());
    this.deplXPos = Math.floor(Math.random());
    this.deplYPos = 0;

    // placer la balle dans le jeu
    divJeu.appendChild(this.element);

    // methodes
    // changer la balle de sens
    this.changeBallSens = function (orientation) {
        if (orientation == 'X')
            this.deplXPos = !this.deplXPos;
        else
            this.deplYPos = !this.deplYPos;
    };

    // rafraichissement de la balle (nouvelle position)
    this.refresh = function () {
        this.element.style.left = this.deplX + "px";
        this.element.style.top = this.deplY + "px";
    };

    // tester la balle pour savoir si elle fait encore partie de l'air de jeu
    this.isInArea = function () {
        // verifier que la balle tombe bien sur le chariot et qu'elle est presente sur le terrain
        if ((this.deplY + deltadepl) >= deplScreen.y) {
            // sortir la balle du jeu ou pas
            return (this.deplX >= carriage.posCarriage && this.deplX <= (carriage.posCarriage + (carriage.getSize().x)) || basculeTriche);
        }
        return true;
    };

    // effacer la balle
    this.killBall = function () {
        divJeu.removeChild(this.element);
        tabBalls = tabBalls.remove(this);
        nbBalls--;
        // enlever la double palette si une balle se perd
        if (carriage.doubleCarriage) {
            carriage.doubleCarriage = false;
            carriage.printForm();
        }
    };

    // casser les Bricks sur son passage
    this.breakBrick = function () {
        if (tabBricks == null) return false;
        var breakB = false;
        // parcourir les Bricks pour savoir si la balle est dans la zone de l'une d'entre-elles.
        for (var idxBrick = 0, lenB = tabBricks.length; idxBrick < lenB; idxBrick++) {
            var tmpBrick = tabBricks[idxBrick];
            var intersect = intersectBallBrick(this, tmpBrick);
            if (intersect.breakBrick) {
                tmpBrick.breakBrick();
                this.changeBallSens(intersect.orientation);
                breakB = true;
            }
        }
        return breakB;
    };

    // deplacement graphique de la balle
    this.move = function () {
        // horizontal
        if (this.deplX + deltadepl < deplScreen.x && this.deplXPos) {
            this.deplX += deltadepl;
        }
        else if (this.deplX <= 0) {
            this.deplX += deltadepl;
            this.deplXPos = 1;
        }
        else {
            this.deplX -= deltadepl;
            this.deplXPos = 0;
        }

        // vertical
        if (this.deplY + deltadepl < deplScreen.y && this.deplYPos) {
            this.deplY += deltadepl;
        }
        else if (this.deplY <= 0) {
            this.deplY += deltadepl;
            this.deplYPos = 1;
        }
        else {
            this.deplY -= deltadepl;
            this.deplYPos = 0;
        }

        this.refresh();

        // si la balle n'est pas dans l'air de jeu,
        // la supprimer
        if (!this.isInArea())
            this.killBall();
        else
            this.breakBrick();
    };
}

function intersectBallBrick(tmpBall, tmpBrick) {
    var intersect = { breakBrick: false, orientation: 'X' };

    if (tmpBrick != null && tmpBall != null) {
        var Xball = tmpBall.deplX + Math.floor(((isIE) ? tmpBall.element.offsetWidth : tmpBall.element.clientWidth) / 2);
        var Yball = tmpBall.deplY + Math.floor(((isIE) ? tmpBall.element.offsetHeight : tmpBall.element.clientHeight) / 2);

        var X1Brick = tmpBrick.element.offsetLeft;
        var X2Brick = X1Brick + ((isIE) ? tmpBrick.element.offsetWidth : tmpBrick.element.clientWidth);

        var Y1Brick = tmpBrick.element.offsetTop;
        var Y2Brick = Y1Brick + ((isIE) ? tmpBrick.element.offsetHeight : tmpBrick.element.clientHeight);

        // prise en compte d'erreur de calcul processeur
        if (((X1Brick <= Xball && Xball <= X2Brick) &&
            (Math.abs(Yball - Y2Brick) <= precisionErreur))
           ||
           ((X1Brick <= Xball && Xball <= X2Brick) &&
            (Math.abs(Yball - Y1Brick) <= precisionErreur))) {
            intersect.breakBrick = true;
            intersect.orientation = 'Y';
        }
        else if (((Y1Brick <= Yball && Yball <= Y2Brick) &&
            (Math.abs(Xball - X2Brick) <= precisionErreur))
           ||
           ((Y1Brick <= Yball && Yball <= Y2Brick) &&
            (Math.abs(Xball - X1Brick) <= precisionErreur))) {
            intersect.breakBrick = true;
            intersect.orientation = 'X';
        }
    }

    return intersect;
}

// Objet Brick
function Brick(numero) {
    this.numero = numero;
    this.element = document.createElement('div');
    this.element.id = "brick" + numero;
    this.element.name = "brick";
    this.element.className = "Brick";
    this.element.resistance = 1;
    // type de Brick
    // 1) multiplier les balles
    // 2) doubler le chariot
    // 3) Brick double résistance
    let brickType = Math.floor(5 * Math.random());
    if (brickType == 3)
        this.element.resistance = 2;

    this.printForm = function () {
        let isBrickBroken = (brickType == 3) && (this.element.resistance == 1);
        this.element.innerHTML = (graphismeImg) ?
                                    ((!isBrickBroken) ? "<img src='img/Brique.jpg' style='width: 45px; height: 26px;'/>" :
                                                         "<img src='img/brokenBrique.jpg' style='width: 45px; height: 26px;'/>") :
                                    ((!isBrickBroken) ? "<table class=\"InsideBrick\"><tr><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td></tr></table>":
                                                         "<table class=\"InsideBrick\"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td></tr></table>");
    };
    this.printForm();
    // append brick to the game
    divJeu.appendChild(this.element);

    this.size = {
        x: (isIE) ? this.element.offsetWidth : this.element.clientWidth,
        y: (isIE) ? this.element.offsetHeight : this.element.clientHeight
    };

    this.getRandomPosition = function () {
        // positionnement aleatoire sur la grille
        let tmpPos = {
            x: (deplScreen.x) * Math.random(),
            y: (deplScreen.y * 3 / 5) * Math.random()
        };

        // alignement sur une grille virtuelle
        tmpPos.x = Math.floor(tmpPos.x / this.size.x) * this.size.x;
        tmpPos.y = Math.floor(tmpPos.y / this.size.y) * this.size.y;

        return tmpPos;
    };

    this.isEqualPosition = function (tmpBrick) {
        return (this.posRnd.x == tmpBrick.posRnd.x && this.posRnd.y == tmpBrick.posRnd.y);
    };

    // positionner la Brick sur le jeu à un endroit libre
    //do {
        this.posRnd = this.getRandomPosition();
    //} while (containtBrickPosition(this));

    this.element.style.left = this.posRnd.x + "px";
    this.element.style.top = this.posRnd.y + "px";

    // destruction de la Brick
    this.breakBrick = function () {
        // performances problem
        //this.element.resistance--;
        switch (brickType) {
            case 0:
                var nbBallDem = 3;
                //if (nbBalls < nbBallDem) nbBallDem = nbBalls;
                nbBallDem = nbBallDem - tabBalls.length;
                for (var i = 0; i < nbBallDem; i++)
                    tabBalls.push(new Ball(tabBalls.length));
                break;
            case 1:
                carriage.doubleCarriage = true;
                carriage.printForm();
                break;
            case 3:
                // double resistance
                // performances problem
                // must get the 'this.element.resistance' decrease here
                this.element.resistance--;
                if (this.element.resistance > 0) {
                    this.printForm();
                    return false;
                }
                break;
            default:
                break;
        }
        divJeu.removeChild(this.element);
        tabBricks = tabBricks.remove(this);
        return true;
    };
}

function containtBrickPosition(searchBrick) {
    for (var i = 0, tabBricksLength = tabBricks.length; i < tabBricksLength; i++) {
        if (searchBrick.isEqualPosition(tabBricks[i])) return true;
    }
    return false;
}

// Objet chariot
function Carriage() {
    this.element = document.createElement('DIV');
    this.element.id = "carriage";
    this.element.className = "Carriage";

    this.printForm = function () {
        this.element.innerHTML = (graphismeImg) ? "<img src='img/palette.jpg'/>" : "__________";
        if (this.doubleCarriage) this.element.innerHTML += this.element.innerHTML;
    };

    this.getSize = function () {
        return {
            x: (isIE) ? this.element.offsetWidth : this.element.clientWidth,
            y: (isIE) ? this.element.offsetHeight : this.element.clientHeight
        };
    };

    this.printForm();

    this.deltaCarriage = 20;
    this.element.style.top = getSizeScreen().y + "px";
    this.posCarriage = (deplScreen.x / 2);
    this.element.style.left = this.posCarriage + "px";
    this.doubleCarriage = false;

    this.refresh = function () {
        if (!basculeTriche)
            this.element.style.left = this.posCarriage + "px";
    };

    this.move = function (newPosition) {
        let carriageSize = this.getSize().x;
        console.log(carriageSize);
        if ((newPosition - (carriageSize / 2)) > 0 && (newPosition + (carriageSize / 2)) <= deplScreen.x && !basculeTriche) {
            this.posCarriage = newPosition - (carriageSize / 2);
            this.refresh();
        }
    };

    this.moveLeft = function () {
        let tmpPosL = this.posCarriage + (this.getSize().x / 2) - this.deltaCarriage;
        this.move(tmpPosL);
    };

    this.moveRight = function () {
        let tmpPosR = this.posCarriage + (this.getSize().x / 2) + this.deltaCarriage;
        this.move(tmpPosR);
    };

    this.triche = function () {
        basculeTriche = !basculeTriche;
        if (basculeTriche) {
            this.element.innerHTML = "__________________________________________________________________";
            this.element.style.left = "0px";
        }
        else {
            this.printForm();
        }
    };

    // ajouter le chariot au jeu
    divJeu.appendChild(this.element);
}

function Init() {
    deplScreen = getSizeScreen();
    console.log(deplScreen);
    divJeu = document.getElementById("game");
    if (!divJeu) return false;

    // Creer le chariot
    carriage = new Carriage();

    // Creation d'une balle
    tabBalls = new Array();
    tabBalls.push(new Ball(0));

    // Initialisation des Bricks
    tabBricks = new Array();
    for (var i = 0; i < nbBricks; i++)
        tabBricks.push(new Brick(i));

    // gestion clavier et sourris
    document.onkeypress = handlerKey;
    document.onkeydown = movCarriageByKeyboard;
    document.onmousemove = movCarriageByMouse;

    // lancement du jeu
    setTimeout('goBall()', timeOutdepl);
    return true;
}

function goBall() {
  // move balls
  tabBalls.map(
    function(objBall) {
      objBall.move()
    });

    // game over if nomore balls
    if (tabBalls == null || tabBalls.length == 0) {
        if (confirm("Game Over !\nStart a new part ?"))
            document.location.reload();
        else
            return false;
    }

    // restart game if nomore Bricks
    if (tabBricks == null || tabBricks.length == 0) {
        if (confirm("Congratulations !\nStart a new part ?"))
            document.location.reload();
        else
            return false;
    }

    setTimeout('goBall()', timeOutdepl);
}

function handlerKey(e) {
    var keyPress = (isIE) ? event.keyCode : e.which;

    if (keyPress == 43 && timeOutdepl > 1) timeOutdepl--;
    else if (keyPress == 45) timeOutdepl++;
    else if (keyPress == 42) deltadepl++;
    else if (keyPress == 47 && deltadepl > 1) deltadepl--;
    else if (keyPress == 48) {
        for (var i = 0, tabBallsLen = tabBalls.length; i < tabBallsLen; i++) {
            if (tabBalls[i].element.innerHTML == "o")
                tabBalls[i].element.innerHTML = "O";
            else
                tabBalls[i].element.innerHTML = "o";
        }
    }
    else if ((keyPress >= 49 && keyPress <= 57) ||
			(keyPress >= 96 && keyPress <= 105)) { // de 1 a 9
        // nombre de balles tappees au clavier
        var nbBallDem = String.fromCharCode(keyPress);
        if (nbBalls < nbBallDem) nbBallDem = nbBalls;
        nbBallDem = nbBallDem - tabBalls.length;
        for (var i = 0; i < nbBallDem; i++)
            tabBalls.push(new Ball(tabBalls.length));
    }
    else if (keyPress == 32) carriage.triche(); // espace
    else if (keyPress == 27 || (!isIE && e.code == 'Escape')) alert("Pause, v'la le chef !\nOK pour continuer ..."); // escape
    else if (keyPress == 66) { // 'B'
        graphismeImg = !graphismeImg;
        // changer le graphisme des balles
        if (tabBalls == null) return false;
        for (var i = 0, tabBallsLen = tabBalls.length; i < tabBallsLen; i++)
            tabBalls[i].printForm();
        // changer le graphisme des Bricks
        if (tabBricks == null) return false;
        for (var i = 0, tabBricksLen = tabBricks.length; i < tabBricksLen; i++)
            tabBricks[i].printForm();
        // changer le graphisme du chariot
        carriage.printForm();
    }
    else if (keyPress === 68) { // 'D'
        carriage.doubleCarriage = !carriage.doubleCarriage;
        carriage.printForm();
    }
    else if (keyPress >= 65) { // a partir de 'A'
        for (var i = 0, tabBallsLen = tabBalls.length; i < tabBallsLen; i++)
            tabBalls[i].element.innerHTML = String.fromCharCode(keyPress);
    }
    return true;
}

function movCarriageByKeyboard(e) {
    switch ((isIE) ? event.keyCode : e.which) {
        case 37:  //deplacement vers la gauche
            carriage.moveLeft();
            break;
        case 39: //deplacement vers la droite
            carriage.moveRight();
            break;
        case 38: //acceleration du deplacement chariot
            carriage.deltaCarriage++;
            break;
        case 40: // descelleration du deplacement chariot
            if (carriage.deltaCarriage > 1) carriage.deltaCarriage--;
            break;
        default: // ne rien faire
            break;
    }
}

function movCarriageByMouse(e) {
    carriage.move((isIE) ? event.x : e.clientX);
}
