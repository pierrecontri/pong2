/* ** ------------------------------------------------------- ** */
/* ** --          PONG 2                                   -- ** */
/* ** ------------------------------------------------------- ** */
/* ** -- Author      :  Pierre Contri                      -- ** */
/* ** -- Created     :  07/06/2006                         -- ** */
/* ** -- Updated     :  25/09/2018                         -- ** */
/* ** ------------------------------------------------------- ** */
/* ** -- Version 1.0 :  deplacement chariot et balle       -- ** */
/* ** -- Version 1.1 :  pause plus grossissement balle     -- ** */
/* ** -- Version 1.2 :  trois balles                       -- ** */
/* ** -- Version 1.3 :  debut de gestion de la souris      -- ** */
/* ** -- Version 1.4 :  creation des Bricks                -- ** */
/* ** -- Version 1.5 :  gestion des Bricks                 -- ** */
/* ** -- Version 2.0 :  code de qualite                    -- ** */
/* ** -- Version 2.1 :  passage en code objet              -- ** */
/* ** -- Version 2.2 :  simplification sur objets          -- ** */
/* ** -- Version 2.3 :  compatibilite FireFox              -- ** */
/* ** -- Version 2.4 :  simplification du code             -- ** */
/* ** -- Version 2.5 :  alignement des Bricks sur grille   -- ** */
/* ** -- Version 2.6 :  acceleration calculs               -- ** */
/* ** -- Version 2.7 :  pouvoirs sur Bricks                -- ** */
/* ** -- Version 2.8 :  reduction du code                  -- ** */
/* ** -- Version 2.9 :  correction interpreteur JavaScr    -- ** */
/* ** -- Version 3.0 :  amelioration qualite code          -- ** */
/* ** -- Version 3.1 :  Brick with double strength         -- ** */
/* ** -- Version 3.2 :  Strict JavScript                   -- ** */
/* ** -- Version 3.3 :  Update code, ready for functionnal -- ** */
/* ** ------------------------------------------------------- ** */

'use strict';

// Declaration des objets du jeu
// variables / constantes globales pour le joueur
var nbBalls = 9;
const properties = {
    nbBricks    : 60,
    deltadepl   : 3, // pour toutes les balles
    timeOutdepl : 5, // temps en millisecondes de boucle du jeu
    isIE        : (window.event) ? 1 : 0 // verification du navigateur (pour les anciens IE6 / Netscape 4)isIE = (window.event) ? 1 : 0; // verification du navigateur (pour les anciens IE6 / Netscape 4)
};

// Variables de la classe __main__
var deplScreen = null;
var switchCheated = false;
var precisionErreur = 1;
var graphismeImg = true;

const gameComponents = {
    divJeu: null,
    tabBalls: null,
    tabBricks: null,
    carriage: null
};

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
        x: (window.innerWidth || document.body.clientWidth || document.body.offsetWidth) - 50,
        y: (window.innerHeight || document.body.clientHeight || document.body.offsetHeight) - 10
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
    gameComponents.divJeu.appendChild(this.element);

    // methodes
    // change the ball orientation
    this.changeBallOrientation = function (orientation) {
        if (orientation == ORIENTAION.HORIZONTAL)
            this.moving.xPos *= -1;
        else
            this.moving.yPos *= -1;
    };

    // refresh ball position
    this.refresh = function () {
        this.element.style.left = this.moving.x + "px";
        this.element.style.top = this.moving.y + "px";
    };

    // tester la balle pour savoir si elle fait encore partie de l'air de jeu
    this.isInArea = function () {
        // check the ball if follow on carriage and in game area
        if ((this.moving.y + properties.deltadepl) >= deplScreen.y) {
            // exit ball if needed
            return (this.moving.x >= gameComponents.carriage.posCarriage
                && this.moving.x <= (gameComponents.carriage.posCarriage + (gameComponents.carriage.getSize().x))
                || switchCheated);
        }
        return true;
    };

    // remove the ball
    this.killBall = function () {
        // graphical
        gameComponents.divJeu.removeChild(this.element);
        // object (functionnal)
        gameComponents.tabBalls = gameComponents.tabBalls.remove(this);
        // for the game
        nbBalls--;
        // remove double carriage if the ball is lost
        if (gameComponents.carriage.doubleCarriage) {
            gameComponents.carriage.doubleCarriage = false;
            gameComponents.carriage.printObject();
        }
    };

    // break brick on it way
    this.breakBrick = function () {
        if (gameComponents.tabBricks == null) return false;
        var breakB = false;
        // parcourir les Bricks pour savoir si la balle est dans la zone de l'une d'entre-elles.
        for (var idxBrick = 0, lenB = gameComponents.tabBricks.length; idxBrick < lenB; idxBrick++) {
            var tmpBrick = gameComponents.tabBricks[idxBrick];
            var intersect = intersectBallBrick(this, tmpBrick);
            if (intersect.breakBrick) {
                tmpBrick.breakBrick();
                this.changeBallOrientation(intersect.orientation);
                breakB = true;
            }
        }
        return breakB;
    };

    // move the ball
    this.move = function () {
        // horizontal
        this.moving.xPos = ((this.moving.x + properties.deltadepl < deplScreen.x && this.moving.xPos == 1)
                            || this.moving.x <= 0)
                        ? 1 : -1;
            
        this.moving.x += properties.deltadepl * this.moving.xPos;

        // vertical
        this.moving.yPos = ((this.moving.y + properties.deltadepl < deplScreen.y && this.moving.yPos == 1)
                            || this.moving.y <= 0)
                        ? 1 : -1;

        this.moving.y += properties.deltadepl * this.moving.yPos;

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
        var Xball = tmpBall.moving.x + Math.floor(((properties.isIE) ? tmpBall.element.offsetWidth : tmpBall.element.clientWidth) / 2);
        var Yball = tmpBall.moving.y + Math.floor(((properties.isIE) ? tmpBall.element.offsetHeight : tmpBall.element.clientHeight) / 2);

        var X1Brick = tmpBrick.element.offsetLeft;
        var X2Brick = X1Brick + ((properties.isIE) ? tmpBrick.element.offsetWidth : tmpBrick.element.clientWidth);

        var Y1Brick = tmpBrick.element.offsetTop;
        var Y2Brick = Y1Brick + ((properties.isIE) ? tmpBrick.element.offsetHeight : tmpBrick.element.clientHeight);

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
    gameComponents.divJeu.appendChild(this.element);

    this.getSize = (properties.isIE) 
                    ? function () { return {x: this.element.offsetWidth, y: this.element.offsetHeight}; }
                    : function () { return {x: this.element.clientWidth, y: this.element.clientHeight}; };

// this part has to be exported
    this.getRandomPosition = function () {
        // positionnement aleatoire sur la grille
        let tmpPos = {
            x: ((deplScreen.x) * Math.random()),
            y: ((deplScreen.y * 3 / 5) * Math.random())
        };

        // alignement sur une grille virtuelle
        let objSize = this.getSize();
        return {
          x: Math.floor(tmpPos.x / objSize.x) * objSize.x,
          y: Math.floor(tmpPos.y / objSize.y) * objSize.y
        };
    };

    this.isEqualPosition = function (tmpBrick) {
        return (this.position.x == tmpBrick.position.x 
             && this.position.y == tmpBrick.position.y);
    };

    // set the brick to a free place on the game board
    do {
        this.position = this.getRandomPosition();
    } while (containtBrickPosition(this));

    this.element.style.left = this.position.x + "px";
    this.element.style.top = this.position.y + "px";


    // out of part to change


    // destruction of the brick
    this.breakBrick = function () {
        switch (brickType) {
            case 0: // triple balls
                let nbBallDem = 3 - gameComponents.tabBalls.length;
                for (let i = 0; i < nbBallDem; i++)
                gameComponents.tabBalls.push(new Ball(gameComponents.tabBalls.length));
                break;
            case 1: // double carriage
                gameComponents.carriage.doubleCarriage = true;
                gameComponents.carriage.printObject();
                break;
            case 3: // double strength
                this.element.strength--;
                if (this.element.strength != 0) {
                    this.printObject();
                    return false;
                }
                break;
            //case 4: // inbreakable
            //    return false;
            //    break;
            default:
                break;
        }
        gameComponents.divJeu.removeChild(this.element);
        gameComponents.tabBricks = gameComponents.tabBricks.remove(this);
        return true;
    };
}

function containtBrickPosition(searchBrick) {
    return gameComponents.tabBricks.find(
                objBrick => searchBrick.isEqualPosition(objBrick)
            ) == "undefined";
}

// Carriage Object
function Carriage() {
    this.element = document.createElement('DIV');
    this.element.id = "carriage";
    this.element.className = "Carriage";
    // add carriage to the board
    gameComponents.divJeu.appendChild(this.element);

    this.deltaCarriage = 20;
    this.doubleCarriage = false;
    this.posCarriage = (deplScreen.x / 2);

    this.printObject = function () {
        this.element.innerHTML = graphicalComponents.getCarriage(this.doubleCarriage, switchCheated);
        this.refresh();
    };

    this.refresh = function () {
        this.element.style.top = (getScreenSize().y - this.getSize().y) + "px";
        this.element.style.left = ((switchCheated)?"0":this.posCarriage) + "px";
    };

    this.ie_getSize = function () {
      return {
        x: this.element.offsetWidth,
        y: this.element.offsetHeight
      };
    };

    this.moz_getSize = function () {
        return {
            x: this.element.clientWidth,
            y: this.element.clientHeight
        };
    };

    this.getSize = (properties.isIE) ? this.ie_getSize
                          : this.moz_getSize;

    this.move = function (newPosition) {
        let carriageSize = this.getSize().x;

        if (!switchCheated
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

    this.cheated = function () {
        switchCheated = !switchCheated;
        this.printObject();
    };

    this.printObject();
}

// this part can be consider as a singleton or uniq graphical helper object
const graphicalComponents = {
    isGraphic: true,
    graphicName: "",

    getObjectsList: function() {
        return Array.concat(gameComponents.tabBalls, gameComponents.tabBricks, gameComponents.carriage);
    },
    
    switchGraphic : function () {
        graphicalComponents.isGraphic = !graphicalComponents.isGraphic;
    },

    getCarriage : function (isDouble = false, tricks = false) {
        if (tricks) return "".padEnd(50,"_");

        let carriageGraph = (this.isGraphic) ? "<img src='img/" + this.graphicName + "_carriage.jpg' onload='gameComponents.carriage.refresh();'/>" : "".padEnd(10, "_");;
        if(isDouble) carriageGraph += carriageGraph;
        return carriageGraph;
    },

    getBrick: function(strength = 2) {
        return (this.isGraphic) ?
                  "<img class='brickImg' src='img/" + this.graphicName + "_brick" + strength + ".jpg' />" :
                  ((strength > 1) ? "<table class=\"InsideBrick\"><tr><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td></tr></table>":
                                    "<table class=\"InsideBrick\"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td></tr></table>");

    },

    getBall: function() {
        return (this.isGraphic) ? "<img class='ballImg' src='img/" + this.graphicName + "_ball.jpg' />" : "O";
    },

    refreshObjects: function(theme = "") {
        if(theme != "") this.graphicName = theme;
        this.getObjectsList().map(obj => obj.printObject());
    }
};

function Init() {
    deplScreen = getScreenSize();
    gameComponents.divJeu = document.getElementById("game");
    if (!gameComponents.divJeu) return false;

    // instanciate carriage
    gameComponents.carriage = new Carriage();

    // instanciate first ball
    gameComponents.tabBalls = new Array();
    gameComponents.tabBalls.push(new Ball(0));

    // instanciate bricks
    gameComponents.tabBricks = new Array();
    for (var i = 0; i < properties.nbBricks; i++)
        gameComponents.tabBricks.push(new Brick(i));

    // keyboard and mouse management
    document.onkeypress = handlerKey;
    document.onkeydown = moveCarriageByKeyboard();
    document.onmousemove = moveCarriageByMouse();

    // refresh environment with tennis theme by default
    graphicalComponents.refreshObjects('tennis');

    // start game
    setTimeout('goBall()', properties.timeOutdepl);
    return true;
}

function goBall() {
  // move balls
  gameComponents.tabBalls.map(objBall => objBall.move());

  // game over if nomore balls
  if (gameComponents.tabBalls == null || gameComponents.tabBalls.length == 0) {
    if (confirm("Game Over !\nStart a new part ?"))
      document.location.reload();
    else
      return false;
  }

  // restart game if nomore Bricks
  if (gameComponents.tabBricks == null || gameComponents.tabBricks.length == 0) {
    if (confirm("Congratulations !\nStart a new part ?"))
      document.location.reload();
    else
      return false;
  }

  setTimeout('goBall()', properties.timeOutdepl);
}

function handlerKey(e) {
    var keyPress = (properties.isIE) ? event.keyCode : e.which;

    if (keyPress == 43 && properties.timeOutdepl > 1) properties.timeOutdepl--;
    else if (keyPress == 45) properties.timeOutdepl++;
    else if (keyPress == 42) properties.deltadepl++;
    else if (keyPress == 47 && properties.deltadepl > 1) properties.deltadepl--;
    else if (keyPress == 48) {
        for (var i = 0, tabBallsLen = gameComponents.tabBalls.length; i < tabBallsLen; i++) {
            gameComponents.tabBalls[i].element.innerHTML = (gameComponents.tabBalls[i].element.innerHTML == "o") ? "O" : "o";
        }
    }
    else if ((keyPress >= 49 && keyPress <= 57) ||
			(keyPress >= 96 && keyPress <= 105)) { // from 1 to 9
        // enter the ball number with keyboard
        var nbBallDem = String.fromCharCode(keyPress);
        // check if there is enough
        if (nbBalls < nbBallDem) nbBallDem = nbBalls;
        nbBallDem = nbBallDem - gameComponents.tabBalls.length;
        for (let i = 0; i < nbBallDem; i++)
        gameComponents.tabBalls.push(new Ball(gameComponents.tabBalls.length));
    }
    else if (keyPress == 32) gameComponents.carriage.cheated(); // space
    else if (keyPress == 27 || (!properties.isIE && e.code == 'Escape')) alert("Pause, v'la le chef !\nOK pour continuer ..."); // escape
    else if (keyPress == 66) { // 'B'
      graphicalComponents.switchGraphic(gameComponents.tabBalls);
      graphicalComponents.refreshObjects();
    }
    else if (keyPress == 67) { // 'C'
      graphicalComponents.refreshObjects('construction');
    }
    else if (keyPress == 69) { // 'E'
      graphicalComponents.refreshObjects('choucroutte');
    }
    else if (keyPress == 84) { // 'T'
      graphicalComponents.refreshObjects('tennis');
    }
    else if (keyPress === 68) { // 'D'
        gameComponents.carriage.doubleCarriage = !gameComponents.carriage.doubleCarriage;
        gameComponents.carriage.printObject();
    }
    else if (keyPress >= 65) { // a partir de 'A'
        gameComponents.tabBalls.map(objBal => objBal.element.innerHTML = String.fromCharCode(keyPress));
    }
    return true;
}

function moveCarriageByKeyboard() {

  var moveCarriage = function (keyCode) {
    switch (keyCode) {
        case 37:  // move to the left
            gameComponents.carriage.moveTo(MOVING_DIRECTION.LEFT);
            break;
        case 39: // move to the right
            gameComponents.carriage.moveTo(MOVING_DIRECTION.RIGHT);
            break;
        case 38: // carriage acceleration
            gameComponents.carriage.deltaCarriage++;
            break;
        case 40: // carriage descelleration
            if (gameComponents.carriage.deltaCarriage > 2) gameComponents.carriage.deltaCarriage--;
            break;
        default: // nothing to do
            break;
    }
  }

  return (properties.isIE) ? function (e) { moveCarriage(event.keyCode); }
                : function (e) { moveCarriage(e.which); }
    
}

function moveCarriageByMouse() {

  var moveCarriage = (properties.isIE) ? function (evt) { gameComponents.carriage.move(event.x); }
                            : function (evt) { gameComponents.carriage.move(evt.clientX); };

  return moveCarriage;
}