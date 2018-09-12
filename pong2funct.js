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
const isIE = (window.event) ? 1 : 0; // verification du navigateur (pour les anciens IE6 / Netscape 4)


// types declaration

// graphical object
function graphicalObject(objectName, objectNumber) {
    // variables
    this.element = document.createElement('DIV');
    this.element.id = objectName + objectNumber;
    this.element.name = objectName;
    this.element.className = objectName;
	
    this.position = {
        x: 0,
        y: 0
    };

    this.coordinates = function() {
      let tmpSize = this.size();
      return {
        x1: this.position.x,
        y1: this.position.y,
        x2: this.position.x + tmpSize.x,
        y2: this.position.y + tmpSize.y
      };
    }

    this.size = function() {
      return {
        x: (isIE) ? this.element.offsetWidth : this.element.clientWidth,
        y: (isIE) ? this.element.offsetHeight : this.element.clientHeight
      }
    }
}

// ball
function ball(ballNumber) {
    // herits of graphicalObject
    this.prototype = new graphicalObject("ball", ballNumber);
    this.prototype.element.resistance = 1;

    return this.prototype;
}

// carriage

// brick

// list of balls
// list of bricks

// unit test
function unitTest() {
var ball1 = new ball("4");
  console.log(ball1.element);
  console.log(new ball("7"));
}

function Init() {
  //just for test
console.log('ok');
  //setTimeout('unitTest', 500);
}
