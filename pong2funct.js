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

// ** *---------------------------------------------------* **
// **               PROPERTIES GAME PART
// ** *---------------------------------------------------* **

// Variables of __main__ class
const gameProperties = {
  nbBricks      : 60,
  nbBalls       : 15,
  movingDelta   : 1, // moving delta distance between two ticks
  scaleError    : 3.4, // 2.1 * movingDelta,
  movingTimeOut : 7, // game looping timeout 7ms
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

// types declaration

// graphical object
// has to be herit
function graphicalObject(objectName, objectNumber, initialPosition = { x: 0, y: 0 }) {
  // variables
  this.element = document.createElement('DIV');
  this.element.id = objectName.toLowerCase() + objectNumber;
  this.element.name = objectName.toLowerCase();
  this.element.className = objectName;

  this.position = initialPosition;

  this.coordinates = function() {
    let tmpSize = this.getSize();
    return {
      point1 : { x: this.position.x,                  y: this.position.y },
      point2 : { x: this.position.x + tmpSize.x,      y: this.position.y + tmpSize.y },
      center : { x: this.position.x + tmpSize.x / 2,  y: this.position.y + tmpSize.y / 2 }
    };
  };

  this.getSize = function() {
    return { x: this.element.offsetWidth, y: this.element.offsetHeight };
  };
}

// Ball
function Ball(ballNumber) {
  // herits of graphicalObject
  this.prototype = new graphicalObject(this.constructor.name, ballNumber);
  //this.prototype.innerHTML = ballDesign(false);
  this.prototype.element.resistance = 1;
  this.prototype.element.innerHTML = ballDesign(false);
  return this.prototype;
}

// Carriage
function Carriage(carriageName) {
  // herits of graphicalObject
  this.prototype = new graphicalObject(this.constructor.name, carriageName);
  this.prototype.element.innerHTML = carriageDesign(false);

  this.prototype.move = function (newPosition) {
    if ((newPosition - (this.getSize().x / 2)) > 0 && (newPosition + (this.posCarriage / 2)) <= gameProperties.screenSize.x && !basculeTriche) {
        this.posCarriage = newPosition - (this.posCarriage / 2);
        console.log("move");
    }
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
function getScreenSize() {
  return {
      x: (window.innerWidth  || document.body.clientWidth  || document.body.offsetWidth)  - gameProperties.screenMarge.x,
      y: (window.innerHeight || document.body.clientHeight || document.body.offsetHeight) - gameProperties.screenMarge.y
  };
}

function setScreenSize() {
  gameProperties.screenSize = getScreenSize();
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
      let unbreakableBrick = (brickType == Brick.TYPE.UNBREAKABLE) ? " unbreakableBrick" : "";
      return (this.isGraphic) ?
              ((brickType > 1) ? "<img class='brickImg" + unbreakableBrick + "' src='img/" + this.graphicName + "_brick2.jpg' />" :
                                 "<img class='brickImg" + unbreakableBrick + "' src='img/" + this.graphicName + "_brick1.jpg' />") :
              ((brickType > 1) ? "<table class=\"InsideBrick" + unbreakableBrick + "\"><tr><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td></tr></table>":
                                 "<table class=\"InsideBrick" + unbreakableBrick + "\"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td></tr></table>");
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
      this.getObjectsList().map(function(obj) { return obj.printObject(); });
  }
};

// ** *---------------------------------------------------* **
// **                   HANDLER PART
// ** *---------------------------------------------------* **

function handlerKey(event) {
  let keyPress = event.which || event.keyCode;

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
  else if (keyPress == 27) alert(`Pause, Boss is here !\n\n${instructions}\nOK to continue ...`); // escape
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
      gameComponents.tabBalls.map(function(objBal) { objBal.element.innerHTML = String.fromCharCode(keyPress); });
  }
  return true;
}

function moveCarriageByKeyboard(event) {

  let keyCode = event.keyCode;
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

function moveCarriageByMouse() {
  return function (event) { gameComponents.carriage.move(event.x); };
}

// unit test
function unitTest() {
  Init();

  var ball1 = new Ball("4");
  console.log(ball1.element);
  console.log(ball1);

  gameComponents.carriage = new Carriage("main");
  console.log(gameComponents.carriage);

  gameProperties.divGame.appendChild(ball1.element);
  gameProperties.divGame.appendChild(gameComponents.carriage.element);
}

function goBall() {
  console.log(arguments.callee);
  return true;
}

function Init() {
  gameProperties.divGame = document.getElementById("game");
  if (!gameProperties.divGame) return false;
  // get the screen size
  setScreenSize();

  // keyboard and mouse management
  document.onkeypress = handlerKey;
  document.onkeydown = moveCarriageByKeyboard;
  document.onmousemove = moveCarriageByMouse();

  document.body.onresize = setScreenSize;
  setTimeout('goBall', gameProperties.movingTimeOut);
}