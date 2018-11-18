/* ** ------------------------------------------------------ ** */
/* ** --          PONG 2                                  -- ** */
/* ** ------------------------------------------------------ ** */
/* ** -- Author      :  Pierre Contri                     -- ** */
/* ** -- Created     :  07/06/2006                        -- ** */
/* ** -- Modified    :  24/12/2008                        -- ** */
/* ** ------------------------------------------------------ ** */
/* ** -- Version 4.0 :  functionnal programming           -- ** */
/* ** ------------------------------------------------------ ** */

'use strict';

// Constants declaration
const properties = {
  nbBalls : 9,
  nbBricks : 60,
  movingDelta : 3,
  movingTimer : 5
};

var divJeu = null;

// types declaration

// graphical object
// has to be herit
function graphicalObject(objectName, objectNumber, initialPosition = { x: 0, y: 0 }) {
  // variables
  this.element = document.createElement('DIV');
  this.element.id = objectName + objectNumber;
  this.element.name = objectName;
  this.element.className = objectName;

  this.position = initialPosition;

  this.coordinates = function() {
    let tmpSize = this.getSize();
    return {
      x1: this.position.x,
      y1: this.position.y,
      x2: this.position.x + tmpSize.x,
      y2: this.position.y + tmpSize.y
    };
  };

  this.getSize = function() {
    return {
      x: this.element.offsetWidth,
      y: this.element.offsetHeight
    };
  };
}

// ball
function ball(ballNumber) {
  // herits of graphicalObject
  this.prototype = new graphicalObject(this.constructor.name, ballNumber);
  //this.prototype.innerHTML = ballDesign(false);
  this.prototype.element.resistance = 1;
  this.prototype.element.innerHTML = ballDesign(false);
  return this.prototype;
}

// carriage
function carriage(carriageName) {
  // herits of graphicalObject
  this.prototype = new graphicalObject(this.constructor.name, carriageName);
  this.prototype.element.innerHTML = carriageDesign(false);

  this.prototype.move = function (newPosition) {
    //if ((newPosition - (this.size().x / 2)) > 0 && (newPosition + (tmpX / 2)) <= deplScreen.x && !basculeTriche) {
    //    this.posCarriage = newPosition - (tmpX / 2);
        console.log("move");
    //}
  };

  return this.prototype;
}

// GUI declaration
var ballDesign = function(graphicImg) {
  return (graphicImg) ? "<img src='img/balle.jpg' style='width: 16px; height: 16px; border: 0px none;'/>" : "O";
};

var carriageDesign = function(graphicImg) {
  return (graphicImg) ? "<img src='img/palette.jpg'/>" : "__________";
};

var brickDesign = function(graphicImg) {
  return (graphismeImg) ?
    ((!isBrokenBrique) ? "<img src='img/brique.jpg' style='width: 45px; height: 26px;'/>" :
                         "<img src='img/brokenbrique.jpg' style='width: 45px; height: 26px;'/>") :
    ((!isBrokenBrique) ? "<table border=\"2\" class=\"InterieurBrique\"><tr><td style=\"border-color: blue;\">&nbsp;&nbsp;&nbsp;</td><td style=\"border-color: blue;\">&nbsp;&nbsp;&nbsp;</td><td style=\"border-color: blue;\">&nbsp;&nbsp;&nbsp;</td></tr></table>":
                         "<table border=\"2\" class=\"InterieurBrique\"><tr><td style=\"border-color: blue;\">&nbsp;&nbsp;&nbsp;&nbsp;</td><td style=\"border-color: blue;\">&nbsp;&nbsp;&nbsp;&nbsp;</td></tr></table>");
};

var moveObject = function (obj, newRelativePosition) {
  let newPosition = {
    x: obj.position.x + newRelativePosition.x,
    y: obj.position.y + newRelativePosition.y
  }
  return new obj.className(obj.name, obj.objectNumber, newPosition);
};

var refreshObject = function(obj) {

};

// list of balls
// list of bricks

// screen size
function getSizeScreen() {
  return {
      x: document.body.clientWidth - 40,
      y: document.body.clientHeight - 30
  };
}


// random position
function getRandomPosition(objectSize, areaSize) {
  // positionnement aleatoire sur la grille
  var tmpPos = {
      x: (areaSize.x * Math.random()),
      y: (areaSize.y * Math.random())
  };

  // alignement sur une grille virtuelle
  tmpPos.x = Math.floor(tmpPos.x / objectSize.x) * objectSize.x;
  tmpPos.y = Math.floor(tmpPos.y / objectSize.y) * objectSize.y;

  return tmpPos;
};


var mainCarriage = null;

// events mouse & keyboard

function moveCarriageByKeyboard() {

  var moveCarriage = function (keyCode) {
    switch (keyCode) {
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
            if (carriage.deltaCarriage > 2) carriage.deltaCarriage--;
            break;
        default: // ne rien faire
            break;
    }
  }

  return function (event) { moveCarriage(event.keyCode); };
}

function moveCarriageByMouse() {
  var moveCarriage = function (event) { carriage.move(event.clientX); };
  return moveCarriage;
}


// unit test
function unitTest() {
  Init();

  var ball1 = new ball("4");
  console.log(ball1.element);
  console.log(ball1);

  mainCarriage = new carriage("main");
  console.log(mainCarriage);

  divJeu.appendChild(ball1.element);
  divJeu.appendChild(mainCarriage.element);
}

function goBall() {
  console.log(arguments.callee);
  return true;
}

function Init() {
  divJeu = document.getElementById("jeu");
  console.log(divJeu);
  if (!divJeu) return false;

  //document.onkeypress = handlerKey;
  document.onkeydown = moveCarriageByKeyboard();
  document.onmousemove = moveCarriageByMouse();
  setTimeout('goBall', properties.movingTimer);
}