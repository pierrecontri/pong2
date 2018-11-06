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
/* ** -- Version 2.8 :  code refactoring                   -- ** */
/* ** -- Version 2.9 :  correction interpreteur JavaScr    -- ** */
/* ** -- Version 3.0 :  amelioration qualite code          -- ** */
/* ** -- Version 3.1 :  Brick with double strength         -- ** */
/* ** -- Version 3.2 :  Strict JavScript                   -- ** */
/* ** -- Version 3.3 :  Update code, ready for functionnal -- ** */
/* ** -- Version 3.4 :  Strict JavaScript & ECMA v6 norm   -- ** */
/* ** -- Version 3.5 :  Remove the IE part                 -- ** */
/* ** ------------------------------------------------------- ** */

'use strict';


// ** *---------------------------------------------------* **
// **               PROPERTIES GAME PART
// ** *---------------------------------------------------* **

// Variables of __main__ class
const gameProperties = {
    nbBricks      : 60,
    nbBalls       : 15,
    movingDelta   : 3, // moving delta distance between two ticks
    scaleError    : 1.1 * 3,
    movingTimeOut : 7, // game looping timeout 7ms
    isIE          : 0, //(window.event) ? 1 : 0, -> ECMA v6 not needed
    screenMarge   : {x: 50, y: 10},
    screenSize    : null,
    switchCheated : false
};

// for graphic components
const gameComponents = {
    gameDiv: null,
    tabBalls: null,
    tabBricks: null,
    carriage: null
};

// dictionnary of positions and orientations
const ORIENTATION = {
    NONE       : 0,
    LEFT       : -1,
    RIGHT      : 1,
    TOP        : 2,
    BOTTOM     : -2,
    HORIZONTAL : 'x',
    VERTICAL   : 'y'
}

// Array redefine for object removing
if (Array.prototype.remove === undefined)
Array.prototype.remove = function (objectToRemove) {
    return this.filter(objArray => objArray != objectToRemove);
};

// Array defined random function
if(Array.prototype.random === undefined)
Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};

function getScreenSize() {
    return {
        x: (window.innerWidth || document.body.clientWidth || document.body.offsetWidth) - gameProperties.screenMarge.x,
        y: (window.innerHeight || document.body.clientHeight || document.body.offsetHeight) - gameProperties.screenMarge.y
    };
}


// ** *---------------------------------------------------* **
// **                   BALL PART
// ** *---------------------------------------------------* **

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
        x: Math.floor((gameProperties.screenSize.x) * Math.random()),
        y: Math.floor((gameProperties.screenSize.y) * Math.random()),
        orientation: { x: Math.floor(Math.random()), y: -1 }
    };

    this.getSize = (gameProperties.isIE) 
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
        gameProperties.nbBalls--;
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
        this.moving.orientation.x = ((objCoordinates.x2 + gameProperties.movingDelta < gameProperties.screenSize.x && this.moving.orientation.x == ORIENTATION.RIGHT)
                                     || objCoordinates.x1 <= 0)
                                    ? ORIENTATION.RIGHT : ORIENTATION.LEFT;
        // vertical
        // change vertical orientation if the ball is on top of the screen
        if (objCoordinates.y1 <= 0 || (objCoordinates.y2 >= gameProperties.screenSize.y && gameProperties.switchCheated))
            this.changeBallOrientation(ORIENTATION.VERTICAL);

        this.moving.x += gameProperties.movingDelta * this.moving.orientation.x;
        this.moving.y += gameProperties.movingDelta * this.moving.orientation.y;
        this.refresh();

        // calculate impacts with another potential object (ball, brick or carriage)
        let objTouched = this.objectRebound();
        if (objTouched) {
            // to remove this part of map; increase speed
            this.touchedPointOrientation = objTouched.orientation;
            objTouched.objCollision.touchedPointOrientation = objTouched.orientation;
            [].concat(this, objTouched.objCollision).map(obj2 => obj2.impact());
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
    return !(obj.getCoordinates().y2 <= gameProperties.screenSize.y + gameProperties.movingDelta || gameProperties.switchCheated);
}

function intersectBallObject(tmpBall, comparedObject) {

    // 3 return values
    // - false : no intersection
    // - ORIENTATION.VERTICAL : intersection by vertical
    // - ORIENTATION.HORIZONTAL : intersection by horizontal

    if (comparedObject == null || tmpBall == null || tmpBall == comparedObject)
        return false;

    // get first object coordinates
    let ballCoordinates = tmpBall.getCoordinates();

    // get second object coordinates
    let comparedObjectCoordinates = comparedObject.getCoordinates();

    // intersection calculation
    let intersect = false;
    if (((comparedObjectCoordinates.x1 <= ballCoordinates.x1 && ballCoordinates.x1 <= comparedObjectCoordinates.x2)
          ||
         (comparedObjectCoordinates.x1 <= ballCoordinates.x2 && ballCoordinates.x2 <= comparedObjectCoordinates.x2))
        && 
          (Math.abs(ballCoordinates.y2 - comparedObjectCoordinates.y2) <= gameProperties.scaleError
           ||
           Math.abs(ballCoordinates.y1 - comparedObjectCoordinates.y1) <= gameProperties.scaleError)) {

        intersect = ORIENTATION.VERTICAL;
    }
    else if (((comparedObjectCoordinates.y1 <= ballCoordinates.y1 && ballCoordinates.y1 <= comparedObjectCoordinates.y2)
               ||
              (comparedObjectCoordinates.y1 <= ballCoordinates.y2 && ballCoordinates.y2 <= comparedObjectCoordinates.y2))
            &&
              (Math.abs(ballCoordinates.x2 - comparedObjectCoordinates.x2) <= gameProperties.scaleError
               ||
               Math.abs(ballCoordinates.x1 - comparedObjectCoordinates.x1) <= gameProperties.scaleError)) {

        intersect = ORIENTATION.HORIZONTAL;
    }

    return intersect;
}


// ** *---------------------------------------------------* **
// **                   BRICK PART
// ** *---------------------------------------------------* **

// type of brick
const TYPE_BRICK = {
    DESTRUCTED      : 0,
    BREAKED         : 1,
    NORMAL          : 2,
    DOUBLE_STRENGTH : 3,
    TRIPLE_BALLS    : 4,
    DOUBLE_CARRIAGE : 5,
    UNBREAKABLE     : 6,
    rnd             : function() { /* brickTypeAllowed */ return [2,3,4,5,6].random();}
    //rnd             : function() { return [...Array(5).keys()].map(i => i + 2).random();}
};

const STATE_BRICK = {
    DESTRUCTED      : 0,
    BREAKED         : 1,
    BUILT           : 2
};

// Objet Brick
function Brick(numero) {
    this.numero = numero;
    this.element = document.createElement('div');
    this.element.id = "brick" + numero;
    this.element.name = "brick";
    this.element.className = "Brick";
    // type of Brick
    // on construct, get random brick type
    this.brickType = TYPE_BRICK.rnd();

    this.printObject = function () {
        this.element.innerHTML = graphicalComponents.getBrick(this.brickType);
    };
    this.printObject();
    // append brick to the game
    gameComponents.gameDiv.appendChild(this.element);

    this.getSize = (gameProperties.isIE) 
                    ? function () { return {x: this.element.offsetWidth, y: this.element.offsetHeight}; }
                    : function () { return {x: this.element.clientWidth, y: this.element.clientHeight}; };

    // this part has to be exported
    this.getRandomPosition = function () {
        // positionnement aleatoire sur la grille
        let tmpPos = {
            x: ((gameProperties.screenSize.x - 20) * Math.random()),
            y: (((gameProperties.screenSize.y) * 3 / 5) * Math.random())
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
            case TYPE_BRICK.DOUBLE_STRENGTH:
                this.brickType = 1;
                this.printObject();
                return false;
            case TYPE_BRICK.TRIPLE_BALLS:
                let nbBallAsked = 3 - gameComponents.tabBalls.length;
                for (let i = 0; i < nbBallAsked; i++)
                    gameComponents.tabBalls.push(new Ball(gameComponents.tabBalls.length));
                break;
            case TYPE_BRICK.DOUBLE_CARRIAGE:
                gameComponents.carriage.doubleCarriage = true;
                gameComponents.carriage.printObject();
                break;
            case TYPE_BRICK.UNBREAKABLE:
                return false;
            default:
                break;
        }
        // break brick
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


// ** *---------------------------------------------------* **
// **                   CARRIAGE PART
// ** *---------------------------------------------------* **

// Carriage Object
function Carriage() {
    this.element = document.createElement('DIV');
    this.element.id = "carriage";
    this.element.className = "Carriage";
    // add carriage to the board
    gameComponents.gameDiv.appendChild(this.element);

    this.deltaCarriage = 20;
    this.doubleCarriage = false;

    this.getSize = (gameProperties.isIE) 
                        ? function () { return {x: this.element.offsetWidth, y: this.element.offsetHeight}; }
                        : function () { return {x: this.element.clientWidth, y: this.element.clientHeight}; };

    this.position = { x: (gameProperties.screenSize.x / 2), y: getScreenSize().y - 40};

    this.printObject = function () {
        this.element.innerHTML = graphicalComponents.getCarriage(this.doubleCarriage, gameProperties.switchCheated);
        this.refresh();
    };

    this.refresh = function () {
        this.position.y = getScreenSize().y - this.getSize().y;
        this.element.style.top = this.position.y + "px";
        this.element.style.left = ((gameProperties.switchCheated) ? "0" : this.position.x) + "px";
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

        if (!gameProperties.switchCheated
            && (newPosition - (carriageSize / 2)) > 0
            && (newPosition + (carriageSize / 2)) <= gameProperties.screenSize.x) {

            this.position.x = newPosition - (carriageSize / 2);
            this.element.style.left = this.position.x + "px";
        }
    };

    this.moveTo = function (direction = ORIENTATION.NONE) {
        let tmpPosL = this.position.x + (this.getSize().x / 2) + (direction * this.deltaCarriage);
        this.move(tmpPosL);
    }

    this.cheated = function () {
        gameProperties.switchCheated = !gameProperties.switchCheated;
        this.printObject();
    };

    this.touchedPointOrientation = null;
    this.impact = function (impactOrientation) {
        return null;
    };

    this.printObject();
}

// ** *---------------------------------------------------* **
// **                   GRAPHICAL PART
// ** *---------------------------------------------------* **

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
    getObjectsList:      function() { return [].concat(gameComponents.tabBalls, gameComponents.tabBricks, gameComponents.carriage); },
    switchGraphic :      function() { graphicalComponents.isGraphic = !graphicalComponents.isGraphic; },
    getBall:             function() { return (this.isGraphic) ? "<img class='ballImg' src='img/" + this.graphicName + "_ball.jpg' />" : "O"; },

    getCarriage : function (isDouble = false, tricks = false) {
        if (tricks) return "".padEnd(50,"_");

        let carriageGraph = (this.isGraphic) ? "<img src='img/" + this.graphicName + "_carriage.jpg' onload='gameComponents.carriage.refresh();'/>" : "".padEnd(10, "_");;
        if (isDouble) carriageGraph += carriageGraph;
        return carriageGraph;
    },

    getBrick: function(brickType) {
        let unbreakableBrick = (brickType == TYPE_BRICK.UNBREAKABLE) ? " unbreakableBrick" : "";
        return (this.isGraphic) ?
                ((brickType > 1) ? "<img class='brickImg" + unbreakableBrick + "' src='img/" + this.graphicName + "_brick2.jpg' />" :
                                   "<img class='brickImg" + unbreakableBrick + "' src='img/" + this.graphicName + "_brick1.jpg' />") :
                ((brickType > 1) ? "<table class=\"InsideBrick" + unbreakableBrick + "\"><tr><td>&nbsp;&nbsp;" + brickType + "&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td></tr></table>":
                                   "<table class=\"InsideBrick\"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;" + brickType + "&nbsp;&nbsp;&nbsp;</td></tr></table>");
    },

    refreshObjects: function(theme = "") {

        // get random theme if there is no graphicName or random asking
        if (theme == "random" || (this.graphicName == "" && theme == "")) {
            let keysDict = this.getThemeIndexes();
            this.graphicName = keysDict.random(); //[Math.floor(keysDict.length * Math.random())];
        }
        else if (theme != "") this.graphicName = theme;

        // get the complet theme name
        this.graphicName = this.themeDictionnary[this.graphicName];
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


// ** *---------------------------------------------------* **
// **                   MAIN PART
// ** *---------------------------------------------------* **

function Init() {
    gameProperties.screenSize = getScreenSize();
    gameComponents.gameDiv = document.getElementById("game");
    if (!gameComponents.gameDiv) return false;

    // instanciate carriage
    gameComponents.carriage = new Carriage();

    // instanciate first ball
    gameComponents.tabBalls = new Array();
    gameComponents.tabBalls.push(new Ball(0));

    // instanciate bricks
    gameComponents.tabBricks = new Array();
    for (var i = 0; i < gameProperties.nbBricks; i++)
        gameComponents.tabBricks.push(new Brick(i));

    // keyboard and mouse management
    document.onkeypress = handlerKey;
    document.onkeydown = moveCarriageByKeyboard();
    document.onmousemove = moveCarriageByMouse();

    // refresh environment with random theme
    graphicalComponents.refreshObjects("random");

    // start game
    setTimeout('goBall()', gameProperties.movingTimeOut);
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
  if (gameComponents.tabBricks.filter(b => b.brickType != TYPE_BRICK.UNBREAKABLE).length == 0) {
    if (confirm("Congratulations !\nStart a new part ?"))
      document.location.reload();
    else
      return false;
  }

  setTimeout('goBall()', gameProperties.movingTimeOut);
}



// ** *---------------------------------------------------* **
// **                   HANDLER PART
// ** *---------------------------------------------------* **

function handlerKey(e) {
    var keyPress = (gameProperties.isIE) ? event.keyCode : e.which;

    if (keyPress == 43 && gameProperties.movingTimeOut > 1) gameProperties.movingTimeOut--;
    else if (keyPress == 45) gameProperties.movingTimeOut++;
    else if (keyPress == 42) gameProperties.movingDelta++;
    else if (keyPress == 47 && gameProperties.movingDelta > 1) gameProperties.movingDelta--;
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
        if (gameProperties.nbBalls < nbBallDem) nbBallDem = gameProperties.nbBalls;
        // get the rest of balls
        nbBallDem = nbBallDem - gameComponents.tabBalls.length;
        for (let i = 0; i < nbBallDem; i++)
            gameComponents.tabBalls.push(new Ball(gameComponents.tabBalls.length));
    }
    else if (keyPress == 32) gameComponents.carriage.cheated(); // space
    else if (keyPress == 27 || (!gameProperties.isIE && e.code == 'Escape')) alert(`Pause, Boss is here !\n\n${instructions}\nOK to continue ...`); // escape
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
            gameComponents.carriage.moveTo(ORIENTATION.LEFT);
            break;
        case 39: // move to the right
            gameComponents.carriage.moveTo(ORIENTATION.RIGHT);
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

  return (gameProperties.isIE)
            ? function (e) { moveCarriage(event.keyCode); }
            : function (e) { moveCarriage(e.which); };
}

function moveCarriageByMouse() {

  return (gameProperties.isIE)
            ? function (evt) { gameComponents.carriage.move(event.x); }
            : function (evt) { gameComponents.carriage.move(evt.clientX); };
}