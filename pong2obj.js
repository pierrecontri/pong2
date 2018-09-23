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
/* ** -- Version 3.1 :  Brick with double strength     -- ** */
/* ** ------------------------------------------------------ ** */

'use strict';

// Declaration des objets du jeu
// variables / constantes globales pour le joueur
var nbBalls = 9;
const nbBricks = 60;
const deltadepl = 3; // pour toutes les balles
const timeOutdepl = 5; // temps en millisecondes de boucle du jeu
const isIE = (window.event) ? 1 : 0; // verification du navigateur (pour les anciens IE6 / Netscape 4)

// Variables de la classe __main__
var deplScreen = null;
var basculeTriche = false;
var precisionErreur = 1;
var graphismeImg = true;

var divJeu = null;
var tabBalls = null;
var tabBricks = null;
var carriage = null;

const MOVING_DIRECTION = {
    'LEFT'  : -1,
    'RIGHT' : 1,
    'NONE'  : 0
}

const ORIENTAION = {
    'HORIZONTAL': 'X',
    'VERTICAL'  : 'Y'
}

// Redefinition de l'objet Array
// Ajout d'une methode remove
Array.prototype.remove = function (obj) {
    let tmpArray = new Array();
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i] != obj) tmpArray.push(this[i]);
    }
    return tmpArray;
};

function getScreenSize() {
    return {
        x: (window.innerWidth || document.body.clientWidth || document.body.offsetWidth) - 40,
        y: (window.innerHeight || document.body.clientHeight || document.body.offsetHeight) - 30
    };
}

// Objet "Ball"
function Ball(numero) {

    // variables
    this.element = document.createElement('DIV');
    this.element.id = "ball" + numero;
    this.element.name = "ball";
    this.element.className = "Ball";
    this.printObject = function () {
        this.element.innerHTML = graphicalComponents.getBall();
    };
    this.printObject();

    // randomisation du positionnement des balles
    this.moving = {
        x: Math.floor((deplScreen.x) * Math.random()),
        y: Math.floor((deplScreen.y) * Math.random()),
        xPos: Math.floor(Math.random()),
        yPos: -1
    };

    // placer la balle dans le jeu
    divJeu.appendChild(this.element);

    // methodes
    // change the ball orientation
    this.changeBallOrientation = function (orientation) {
        if (orientation == ORIENTAION.HORIZONTAL)
            this.moving.xPos *= -1;
        else
            this.moving.yPos *= -1;
    };

    // rafraichissement de la balle (nouvelle position)
    this.refresh = function () {
        this.element.style.left = this.moving.x + "px";
        this.element.style.top = this.moving.y + "px";
    };

    // tester la balle pour savoir si elle fait encore partie de l'air de jeu
    this.isInArea = function () {
        // verifier que la balle tombe bien sur le chariot et qu'elle est presente sur le terrain
        if ((this.moving.y + deltadepl) >= deplScreen.y) {
            // sortir la balle du jeu ou pas
            return (this.moving.x >= carriage.posCarriage
                && this.moving.x <= (carriage.posCarriage + (carriage.getSize().x))
                || basculeTriche);
        }
        return true;
    };

    // effacer la balle
    this.killBall = function () {
        // graphical
        divJeu.removeChild(this.element);
        // object (functionnal)
        tabBalls = tabBalls.remove(this);
        // for the game
        nbBalls--;
        // remove double cariage if the ball is lost
        if (carriage.doubleCarriage) {
            carriage.doubleCarriage = false;
            carriage.printObject();
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
                this.changeBallOrientation(intersect.orientation);
                breakB = true;
            }
        }
        return breakB;
    };

    // deplacement graphique de la balle
    this.move = function () {
        // horizontal
        this.moving.xPos = ((this.moving.x + deltadepl < deplScreen.x && this.moving.xPos == 1)
                            || this.moving.x <= 0)
                        ? 1 : -1;
            
        this.moving.x += deltadepl * this.moving.xPos;

        // vertical
        this.moving.yPos = ((this.moving.y + deltadepl < deplScreen.y && this.moving.yPos == 1)
                            || this.moving.y <= 0)
                        ? 1 : -1;

        this.moving.y += deltadepl * this.moving.yPos;

        this.refresh();

        // remove ball if not in game board
        if (!this.isInArea())
            this.killBall();
        else
            this.breakBrick();
    };
}

function intersectBallBrick(tmpBall, tmpBrick) {
    var intersect = { breakBrick: false, orientation: 'X' };

    if (tmpBrick != null && tmpBall != null) {
        var Xball = tmpBall.moving.x + Math.floor(((isIE) ? tmpBall.element.offsetWidth : tmpBall.element.clientWidth) / 2);
        var Yball = tmpBall.moving.y + Math.floor(((isIE) ? tmpBall.element.offsetHeight : tmpBall.element.clientHeight) / 2);

        var X1Brick = tmpBrick.element.offsetLeft;
        var X2Brick = X1Brick + ((isIE) ? tmpBrick.element.offsetWidth : tmpBrick.element.clientWidth);

        var Y1Brick = tmpBrick.element.offsetTop;
        var Y2Brick = Y1Brick + ((isIE) ? tmpBrick.element.offsetHeight : tmpBrick.element.clientHeight);

        // prise en compte d'erreur de precision de calcul
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
    this.element.strength = 2;
    // type of Brick
    // 1) multiply balls
    // 2) double carriage
    // 3) Brick double strength
    // 4) unbreakable
    let brickType = Math.floor(5 * Math.random());

    this.printObject = function () {
        this.element.innerHTML = graphicalComponents.getBrick(this.element.strength);
    };
    this.printObject();
    // append brick to the game
    divJeu.appendChild(this.element);

    this.size = {
        x: (isIE) ? this.element.offsetWidth : this.element.clientWidth,
        y: (isIE) ? this.element.offsetHeight : this.element.clientHeight
    };

    this.getRandomPosition = function () {
        // positionnement aleatoire sur la grille
        let tmpPos = {
            x: ((deplScreen.x) * Math.random()),
            y: ((deplScreen.y * 3 / 5) * Math.random())
        };

        // alignement sur une grille virtuelle
        tmpPos.x = Math.floor(tmpPos.x / this.size.x) * this.size.x;
        tmpPos.y = Math.floor(tmpPos.y / this.size.y) * this.size.y;

        return tmpPos;
    };

    this.isEqualPosition = function (tmpBrick) {
        return (this.posRnd.x == tmpBrick.posRnd.x 
             && this.posRnd.y == tmpBrick.posRnd.y);
    };

    // set the brick to a free place on the game board
    do {
        this.posRnd = this.getRandomPosition();
    } while (containtBrickPosition(this));

    this.element.style.left = this.posRnd.x + "px";
    this.element.style.top = this.posRnd.y + "px";

    // destruction of the brick
    this.breakBrick = function () {
        switch (brickType) {
            case 0:
                var nbBallDem = 3 - tabBalls.length;
                for (var i = 0; i < nbBallDem; i++)
                    tabBalls.push(new Ball(tabBalls.length));
                break;
            case 1:
                carriage.doubleCarriage = true;
                carriage.printObject();
                break;
            case 3:
                // double strength
                this.element.strength--;
                if (this.element.strength != 0) {
                    this.printObject();
                    return false;
                }
                break;
            //case 4:
                // inbreakable
            //    return false;
            //    break;
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

// Carriage Object
function Carriage() {
    this.element = document.createElement('DIV');
    this.element.id = "carriage";
    this.element.className = "Carriage";

    this.printObject = function () {
        this.element.innerHTML = graphicalComponents.getCarriage(this.doubleCarriage, basculeTriche);
    };

    this.getSize = function () {
        return {
            x: (isIE) ? this.element.offsetWidth : this.element.clientWidth,
            y: (isIE) ? this.element.offsetHeight : this.element.clientHeight
        };
    };

    this.printObject();

    this.deltaCarriage = 20;
    this.element.style.top = getScreenSize().y + "px";
    this.posCarriage = (deplScreen.x / 2);
    this.element.style.left = this.posCarriage + "px";
    this.doubleCarriage = false;

    this.move = function (newPosition) {
        let carriageSize = this.getSize().x;

        if (!basculeTriche
            && (newPosition - (carriageSize / 2)) > 0
            && (newPosition + (carriageSize / 2)) <= deplScreen.x) {

            this.posCarriage = newPosition - (carriageSize / 2);
            this.element.style.left = this.posCarriage + "px";
        }
    };

    this.moveTo = function (direction = MOVING_DIRECTION.NONE) {
        let tmpPosL = this.posCarriage + (this.getSize().x / 2) + (direction * this.deltaCarriage);
        this.move(tmpPosL);
    }

    this.triche = function () {
        basculeTriche = !basculeTriche;
        if (basculeTriche) {
            this.element.style.left = "0px";
        }
        this.printObject();
    };

    // ajouter le chariot au jeu
    divJeu.appendChild(this.element);
}

// this part can be consider as a singleton or uniq graphical helper object
const graphicalComponents = {
    isGraphic: true,
    
    switchGraphic : function (listObjects) {
        graphicalComponents.isGraphic = !graphicalComponents.isGraphic;
        listObjects.map(function(obj) { obj.printObjet() });
    },

    getCarriage : function (isDouble = false, tricks = false) {
        if (tricks) return "".padEnd(50,"_");

        let carriageGraph = (this.isGraphic) ? "<img src='img/palette.jpg'/>" : "".padEnd(10, "_");;
        if(isDouble) carriageGraph += carriageGraph;
        return carriageGraph;
    },

    getBrick: function(strength = 2) {
        console.log(strength);
        return (this.isGraphic) ?
                  "<img class='brickImg' src='img/brick" + strength + ".jpg' />" :
                  ((strength > 1) ? "<table class=\"InsideBrick\"><tr><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td></tr></table>":
                                    "<table class=\"InsideBrick\"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td></tr></table>");

    },

    getBall: function() {
        return (this.isGraphic) ? "<img class='ballImg' src='img/ball.jpg' />" : "O";
    }
};

function Init() {
    deplScreen = getScreenSize();
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
        graphicalComponents.switchGraphic(tabBalls);
        // changer le graphisme des balles
        if (tabBalls == null) return false;
        for (var i = 0, tabBallsLen = tabBalls.length; i < tabBallsLen; i++)
            tabBalls[i].printObject();
        // changer le graphisme des Bricks
        if (tabBricks == null) return false;
        for (var i = 0, tabBricksLen = tabBricks.length; i < tabBricksLen; i++)
            tabBricks[i].printObject();
        // changer le graphisme du chariot
        carriage.printObject();
    }
    else if (keyPress === 68) { // 'D'
        carriage.doubleCarriage = !carriage.doubleCarriage;
        carriage.printObject();
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
            carriage.moveTo(MOVING_DIRECTION.LEFT);
            break;
        case 39: //deplacement vers la droite
            carriage.moveTo(MOVING_DIRECTION.RIGHT);
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
