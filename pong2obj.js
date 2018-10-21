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
const properties = {
    nbBricks    : 60,
    nbBalls     : 15,
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
    gameDiv: null,
    tabBalls: null,
    tabBricks: null,
    carriage: null
};

const MOVING_DIRECTION = {
    LEFT  : -1,
    RIGHT : 1,
    NONE  : 0
}

const ORIENTATION = {
    HORIZONTAL : 'x',
    VERTICAL   : 'y'
}

// Redefinition de l'objet Array
// Ajout d'une methode remove
if (Array.prototype.remove === undefined)
Array.prototype.remove = function (objectToRemove) {
    return this.filter(objArray => objArray != objectToRemove);
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
        orientation: { x: Math.floor(Math.random()), y: -1 }
    };

    this.getSize = (properties.isIE) 
                    ? function () { return {x: this.element.offsetWidth, y: this.element.offsetHeight}; }
                    : function () { return {x: this.element.clientWidth, y: this.element.clientHeight}; };

    this.getCenterCoordinates = function() {
        let sizeBall = this.getSize();
        return {
            x: this.moving.x + (sizeBall.x / 2),
            y: this.moving.y + (sizeBall.y / 2)
        };
    };

    this.getCoordinates = function() {
        let tmpSize = this.getSize();
        return {
          x1: this.moving.x,
          y1: this.moving.y,
          x2: this.moving.x + tmpSize.x,
          y2: this.moving.y + tmpSize.y
        };
    };

    // placer la balle dans le jeu
    gameComponents.gameDiv.appendChild(this.element);

    // methodes
    // change the ball orientation
    this.changeBallOrientation = function (orientation) {
        this.moving.orientation[orientation] *= -1;
    };

    // refresh ball position
    this.refresh = function () {
        this.element.style.left = this.moving.x + "px";
        this.element.style.top = this.moving.y + "px";
    };

    // remove the ball
    this.remove = function () {
        // graphical
        gameComponents.gameDiv.removeChild(this.element);
        // object (functionnal)
        gameComponents.tabBalls = gameComponents.tabBalls.remove(this);
        // for the game
        properties.nbBalls--;
        // remove double carriage if the ball is lost
        if (gameComponents.carriage.doubleCarriage) {
            gameComponents.carriage.doubleCarriage = false;
            gameComponents.carriage.printObject();
        }
    };

    // rebound if object on the way
    this.objectRebound = function() {
      let objectReboudList = graphicalComponents.getObjectsList();
      let lstObjects = objectReboudList.map(objRebound => ({ objCollision: objRebound, orientation: intersectBallObject(this, objRebound) }));
      return lstObjects.find( obj => obj.orientation !== false );
    };

    // move the ball
    this.move = function () {

        let objCoordinates = this.getCoordinates();

        // horizontal
        this.moving.orientation.x = ((objCoordinates.x2 + properties.deltadepl < deplScreen.x && this.moving.orientation.x == MOVING_DIRECTION.RIGHT)
                                     || objCoordinates.x1 <= 0)
                                    ? MOVING_DIRECTION.RIGHT : MOVING_DIRECTION.LEFT;
        // vertical
        // change vertical orientation if the ball is on top of the screen
        if (objCoordinates.y1 <= 0 || (objCoordinates.y2 >= deplScreen.y && switchCheated))
            this.changeBallOrientation(ORIENTATION.VERTICAL);

        this.moving.x += properties.deltadepl * this.moving.orientation.x;
        this.moving.y += properties.deltadepl * this.moving.orientation.y;
        this.refresh();

        // calculate impacts with another potential object (ball, brick or carriage)
        let objTouched = this.objectRebound();
        if (objTouched) {
            // to remove this part of map; increase speed
            this.touchedPointOrientation = objTouched.orientation;
            objTouched.objCollision.touchedPointOrientation = objTouched.orientation;
            Array.concat(this, objTouched.objCollision).map(obj2 => obj2.impact());
        }
    };

    this.touchedPointOrientation = null;
    this.impact = function() {
        this.changeBallOrientation(this.touchedPointOrientation);
    };
}

function isObjectNotInArea(obj) {
    // check the ball if follow on carriage and in game area
    // cheat or in game board
    return !(obj.getCoordinates().y2 <= deplScreen.y + properties.deltadepl || switchCheated);
}

function intersectBallObject(tmpBall, comparedObject) {

    // 3 return values
    // - false : no intersection
    // - ORIENTATION.VERTICAL : intersection by vertical
    // - ORIENTATION.HORIZONTAL : intersection by horizontal

    if (comparedObject == null || tmpBall == null || tmpBall == comparedObject)
        return false;

    var intersect = false;

    // get first object coordinates
    let ballCoordinates = tmpBall.getCoordinates();

    // get second object coordinates
    let comparedObjectCoordinates = comparedObject.getCoordinates();

    // prise en compte d'erreur de precision de calcul
    if (((comparedObjectCoordinates.x1 <= ballCoordinates.x1 && ballCoordinates.x1 <= comparedObjectCoordinates.x2)
            && (Math.abs(ballCoordinates.y2 - comparedObjectCoordinates.y2) <= precisionErreur))
         ||
        ((comparedObjectCoordinates.x1 <= ballCoordinates.x1 && ballCoordinates.x1 <= comparedObjectCoordinates.x2)
            && (Math.abs(ballCoordinates.y1 - comparedObjectCoordinates.y1) <= precisionErreur))) {

         intersect = ORIENTATION.VERTICAL;
    }
    else if (((comparedObjectCoordinates.x1 <= ballCoordinates.x2 && ballCoordinates.x2 <= comparedObjectCoordinates.x2)
             && (Math.abs(ballCoordinates.y2 - comparedObjectCoordinates.y2) <= precisionErreur))
            ||
            ((comparedObjectCoordinates.x1 <= ballCoordinates.x1 && ballCoordinates.x1 <= comparedObjectCoordinates.x2)
             && (Math.abs(ballCoordinates.y1 - comparedObjectCoordinates.y1) <= precisionErreur))) {

        intersect = ORIENTATION.VERTICAL;
    }
    else if (((comparedObjectCoordinates.y1 <= ballCoordinates.y1 && ballCoordinates.y1 <= comparedObjectCoordinates.y2)
             && (Math.abs(ballCoordinates.x2 - comparedObjectCoordinates.x2) <= precisionErreur))
            ||
            ((comparedObjectCoordinates.y1 <= ballCoordinates.y1 && ballCoordinates.y1 <= comparedObjectCoordinates.y2)
             && (Math.abs(ballCoordinates.x1 - comparedObjectCoordinates.x1) <= precisionErreur))) {

        intersect = ORIENTATION.HORIZONTAL;
    }
    else if (((comparedObjectCoordinates.y1 <= ballCoordinates.y2 && ballCoordinates.y2 <= comparedObjectCoordinates.y2)
             && (Math.abs(ballCoordinates.x2 - comparedObject.x2) <= precisionErreur))
            ||
            ((comparedObjectCoordinates.y1 <= ballCoordinates.y1 && ballCoordinates.y1 <= comparedObjectCoordinates.y2)
             && (Math.abs(ballCoordinates.x1 - comparedObjectCoordinates.x1) <= precisionErreur))) {

        intersect = ORIENTATION.HORIZONTAL;
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
    this.brickType = Math.floor(5 * Math.random());

    this.printObject = function () {
        this.element.innerHTML = graphicalComponents.getBrick(this.element.strength);
    };
    this.printObject();
    // append brick to the game
    gameComponents.gameDiv.appendChild(this.element);

    this.getSize = (properties.isIE) 
                    ? function () { return {x: this.element.offsetWidth, y: this.element.offsetHeight}; }
                    : function () { return {x: this.element.clientWidth, y: this.element.clientHeight}; };

    // this part has to be exported
    this.getRandomPosition = function () {
        // positionnement aleatoire sur la grille
        let tmpPos = {
            x: ((deplScreen.x - 20) * Math.random()),
            y: (((deplScreen.y) * 3 / 5) * Math.random())
        };

        // alignement sur une grille virtuelle
        let objSize = this.getSize();
        return {
          x: Math.floor(tmpPos.x / objSize.x) * objSize.x,
          y: Math.floor(tmpPos.y / objSize.y) * objSize.y
        };
    };

    this.isEqualPosition = function (tmpObject) {
        return (this.position.x == tmpObject.position.x
             && this.position.y == tmpObject.position.y);
    };

    // set the brick to a free place on the game board
    let escapeInfiniteLoop = 0;
    do {
        this.position = this.getRandomPosition();
    } while (containtBrickPosition(this) && escapeInfiniteLoop++ < 10000);

    this.element.style.left = this.position.x + "px";
    this.element.style.top = this.position.y + "px";

    this.getCoordinates = function() {
        let tmpSize = this.getSize();
        return {
          x1: this.position.x,
          y1: this.position.y,
          x2: this.position.x + tmpSize.x,
          y2: this.position.y + tmpSize.y
        };
      };

    // out of part to change


    // destruction of the brick
    this.breakBrick = function () {
        switch (this.brickType) {
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
            case 4: // inbreakable

            console.log(this.element.strength);
                return false;
            default:
                break;
        }
        gameComponents.gameDiv.removeChild(this.element);
        gameComponents.tabBricks = gameComponents.tabBricks.remove(this);
        return true;
    };

    this.touchedPointOrientation = null;
    this.impact = this.breakBrick;
}

function containtBrickPosition(searchBrick) {
    return gameComponents.tabBricks.find(
                objBrick => searchBrick.isEqualPosition(objBrick)
            ) !== undefined;
}

// Carriage Object
function Carriage() {
    this.element = document.createElement('DIV');
    this.element.id = "carriage";
    this.element.className = "Carriage";
    // add carriage to the board
    gameComponents.gameDiv.appendChild(this.element);

    this.deltaCarriage = 20;
    this.doubleCarriage = false;

    this.getSize = (properties.isIE) 
                        ? function () { return {x: this.element.offsetWidth, y: this.element.offsetHeight}; }
                        : function () { return {x: this.element.clientWidth, y: this.element.clientHeight}; };

    this.position = { x: (deplScreen.x / 2), y: getScreenSize().y - 40};

    this.printObject = function () {
        this.element.innerHTML = graphicalComponents.getCarriage(this.doubleCarriage, switchCheated);
        this.refresh();
    };

    this.refresh = function () {
        this.position.y = getScreenSize().y - this.getSize().y;
        this.element.style.top = this.position.y + "px";
        this.element.style.left = ((switchCheated) ? "0" : this.position.x) + "px";
    };

    this.getCoordinates = function() {
        let tmpSize = this.getSize();
        return {
          x1: this.position.x,
          y1: this.position.y,
          x2: this.position.x + tmpSize.x,
          y2: this.position.y + tmpSize.y
        };
      };

    this.move = function (newPosition) {
        let carriageSize = this.getSize().x;

        if (!switchCheated
            && (newPosition - (carriageSize / 2)) > 0
            && (newPosition + (carriageSize / 2)) <= deplScreen.x) {

            this.position.x = newPosition - (carriageSize / 2);
            this.element.style.left = this.position.x + "px";
        }
    };

    this.moveTo = function (direction = MOVING_DIRECTION.NONE) {
        let tmpPosL = this.position.x + (this.getSize().x / 2) + (direction * this.deltaCarriage);
        this.move(tmpPosL);
    }

    this.cheated = function () {
        switchCheated = !switchCheated;
        this.printObject();
    };

    this.touchedPointOrientation = null;
    this.impact = function (impactOrientation) {
        return null;
    };

    this.printObject();
}

// this part can be consider as a singleton or uniq graphical helper object
const graphicalComponents = {
    isGraphic: true,
    graphicName: "",
    themeDictionnary: {
        'T': "tennis",
        'C': "construction",
        'E': "choucroutte",
        'B': "balloon"
    },
    getThemeIndexes:     function() { return Object.keys(this.themeDictionnary); },
    getCodeThemeIndexes: function() { return this.getThemeIndexes().map(obj => obj.charCodeAt(0)); },
    getObjectsList:      function() { return Array.concat(gameComponents.tabBalls, gameComponents.tabBricks, gameComponents.carriage); },
    switchGraphic :      function() { graphicalComponents.isGraphic = !graphicalComponents.isGraphic; },
    getBall:             function() { return (this.isGraphic) ? "<img class='ballImg' src='img/" + this.graphicName + "_ball.jpg' />" : "O"; },

    getCarriage : function (isDouble = false, tricks = false) {
        if (tricks) return "".padEnd(50,"_");

        let carriageGraph = (this.isGraphic) ? "<img src='img/" + this.graphicName + "_carriage.jpg' onload='gameComponents.carriage.refresh();'/>" : "".padEnd(10, "_");;
        if (isDouble) carriageGraph += carriageGraph;
        return carriageGraph;
    },

    getBrick: function(strength = 2) {
        return (this.isGraphic) ?
                  "<img class='brickImg' src='img/" + this.graphicName + "_brick" + strength + ".jpg' />" :
                  ((strength > 1) ? "<table class=\"InsideBrick\"><tr><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td></tr></table>":
                                    "<table class=\"InsideBrick\"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td></tr></table>");

    },

    refreshObjects: function(theme = "") {
        if (theme == "random") {
            let keysDict = this.getThemeIndexes();
            this.graphicName = keysDict[Math.floor(keysDict.length * Math.random())];
        }
        else if (theme != "") this.graphicName = theme;

        if (this.graphicName == "") { // if theme is empty
            let keysDict = this.getThemeIndexes();
            this.graphicName = this.themeDictionnary[keysDict[0]];
        }
        else { // get the complet theme name
            this.graphicName = this.themeDictionnary[this.graphicName];
        }
        this.getObjectsList().map(obj => obj.printObject());
    }
};

const instructions = `
Pong2 Instructions
===============

Key press:
- from 1 to 9 : number of balls
- ${graphicalComponents.getThemeIndexes()} : differents themes
- O : switch to html graphical
- +,-,*,/ : carriage speed
- left and right arrows: move the carriage
- D : double the carriage
- I : this page
- space : for cheat

Have Fun !
`;

function Init() {
    deplScreen = getScreenSize();
    gameComponents.gameDiv = document.getElementById("game");
    if (!gameComponents.gameDiv) return false;

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

    // refresh environment with random theme
    graphicalComponents.refreshObjects("random");

    // start game
    setTimeout('goBall()', properties.timeOutdepl);
    return true;
}

function goBall() {
  // move balls and get the intersected objects
  gameComponents.tabBalls.map(objBall => objBall.move());

  /* 
  Functionnal part
  
  // and get object intersected
  let objectsIntersectedLst = gameComponents.tabBalls.map(objBall => objBall.move());
  // explood in one 1-D array
  objectsIntersectedLst = objectsIntersectedLst.reduce((acc, val) => acc.concat(val), []);
  // get only not null
  let objectsIntersected = objectsIntersectedLst.filter(obj1 => obj1 !=null);
  // set the operation for intersection
  objectsIntersected.map(obj2 => obj2.impact(obj2.touchedPointOrientation));
  
  */

  // remove all balls wich are not in board area
  gameComponents.tabBalls.filter(isObjectNotInArea).map(b => b.remove());

  // game over if nomore balls
  if (gameComponents.tabBalls.length == 0) {
    if (confirm("Game Over !\nStart a new part ?"))
      document.location.reload();
    else
      return false;
  }

  // restart game if nomore Bricks (except permanent)
  if (gameComponents.tabBricks.filter(b => b.brickType != 4).length == 0) {
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
    else if (keyPress == 48) { // zero just because the touch is large
        for (var i = 0, tabBallsLen = gameComponents.tabBalls.length; i < tabBallsLen; i++) {
            gameComponents.tabBalls[i].element.innerHTML = "O";
        }
    }
    else if ((keyPress >= 49 && keyPress <= 57) ||
			 (keyPress >= 96 && keyPress <= 105)) { // from 1 to 9
        // enter the ball number with keyboard
        var nbBallDem = String.fromCharCode(keyPress);
        // check if there is enough
        if (properties.nbBalls < nbBallDem) nbBallDem = properties.nbBalls;
        // get the rest of balls
        nbBallDem = nbBallDem - gameComponents.tabBalls.length;
        for (let i = 0; i < nbBallDem; i++)
            gameComponents.tabBalls.push(new Ball(gameComponents.tabBalls.length));
    }
    else if (keyPress == 32) gameComponents.carriage.cheated(); // space
    else if (keyPress == 27 || (!properties.isIE && e.code == 'Escape')) alert(`Pause, Boss is here !\n\n${instructions}\nOK to continue ...`); // escape
    else if (keyPress == 79) { // 'O'
      graphicalComponents.switchGraphic(gameComponents.tabBalls);
      graphicalComponents.refreshObjects();
    }
    else if (graphicalComponents.getCodeThemeIndexes().indexOf(keyPress) > -1) { // 'C', 'E', 'T', 'B'
      graphicalComponents.refreshObjects(String.fromCharCode(keyPress));
    }
    else if (keyPress === 68) { // 'D'
        gameComponents.carriage.doubleCarriage = !gameComponents.carriage.doubleCarriage;
        gameComponents.carriage.printObject();
    }
    else if (keyPress == 73) { // 'I'
        alert(instructions);
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

  return (properties.isIE)
            ? function (e) { moveCarriage(event.keyCode); }
            : function (e) { moveCarriage(e.which); };
}

function moveCarriageByMouse() {

  return (properties.isIE)
            ? function (evt) { gameComponents.carriage.move(event.x); }
            : function (evt) { gameComponents.carriage.move(evt.clientX); };
}