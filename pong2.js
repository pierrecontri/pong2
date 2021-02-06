var nbBalls = 9;
var tabDeplX = new Array(nbBalls);
var tabDeplY = new Array(nbBalls);
var tabDeplXPos = new Array(nbBalls);
var tabDeplYPos = new Array(nbBalls);
var deplScreenX = 0;
var deplScreenY = 0;
var deltaDepl = 3;
var timeOutDepl = 7;
var posCarriage = 0;
var YCarraige = 0;
var deltaCarriage = 20;
var ballValue = "o";
var basculeTriche = false;
var tabMovBall = new Array(nbBalls);
var nbBallOk = 1;
var nbBriques = 40;
var tabBriques = new Array(nbBriques);
var decompteBriques = nbBriques;
var precisionErreur = 1;


function Init() {
  setSizeScreen();

  // Positionner le chariot
  carriage.style.top = deplScreenY;
  posCarriage = ((document.body.offsetWidth - 20) / 2);
  carriage.style.left = posCarriage;

  for(i=0; i < nbBalls; i++) {
    // Creer les balles
    tabMovBall[i] = document.createElement('DIV');
    tabMovBall[i].id = "movBall" + i;
    tabMovBall[i].className = "Ball";
    tabMovBall[i].innerHTML = "O";
    // Enregistrer les dix balles
    //tabMovBall[i] = document.getElementById("movBall" + i);
    // randomisation du positionnement des balles
    tabDeplX[i] = Math.floor((deplScreenX)*Math.random());
    tabDeplY[i] = Math.floor((deplScreenY)*Math.random());
    tabDeplXPos[i] = Math.floor(Math.random());
    tabDeplYPos[i] = 0;
    document.getElementById("jeu").appendChild(tabMovBall[i]);
  }

  // afficher la premiere balle
  tabMovBall[0].style.visibility = "visible";

  // initialisation des briques
  // random de prévu dans le demi espace superieur de la fenetre
  for(i=0; i<nbBriques; i++) {
    tabBriques[i] = document.getElementById("cassBriqueMaitre").cloneNode();
    tabBriques[i].id = "cassBrique" + i;
    tabBriques[i].name = "brique" + i;
    tabBriques[i].innerHTML = document.getElementById("cassBriqueMaitre").innerHTML;
    tabBriques[i].style.left = Math.floor((deplScreenX - document.getElementById("cassBriqueMaitre").offsetWidth)*Math.random()) + "px";
    tabBriques[i].style.top  = Math.floor((deplScreenY / 2)*Math.random()) + "px";
    tabBriques[i].style.visibility = "visible";
    document.getElementById("jeu").appendChild(tabBriques[i]);
  }
}

function ballBreakBrique(numBall) {
  // parcourir les briques pour savoir si la balle est dans la zone de l'une d'entre-elles.
  var i = 0;
  while(i<nbBriques) {
    if(tabBriques[i] != null && tabBriques[i].style.visibility != "hidden") {
      var Xball = Number(String(tabMovBall[numBall].style.left).split("px")[0]) + Math.floor(tabMovBall[numBall].offsetWidth/2);

      var X1brique = tabBriques[i].offsetLeft; //Number(String(tabBriques[i].style.left).split("px")[0]);
      var X2brique = X1brique + tabBriques[i].offsetWidth;

      var Yball = Number(String(tabMovBall[numBall].style.top).split("px")[0]) + Math.floor(tabMovBall[numBall].offsetHeight/2);

      var Y1brique = tabBriques[i].offsetTop; //Number(String(tabBriques[i].style.top).split("px")[0]);
      var Y2brique = Y1brique + tabBriques[i].offsetHeight;

      // arrivee par le dessous ou arrivee par le dessus
      /*if(((X1brique <= Xball && Xball <= X2brique) &&
          (Yball == Y2brique))
         ||
         ((X1brique <= Xball && Xball <= X2brique) &&
          (Yball == Y1brique))
        ) {
        breakBrique(numBall, i);
        changeBallSens(numBall, 'Y');
      } else if (((Y1brique <= Yball && Yball <= Y2brique) &&
          (Xball == X2brique))
         ||
         ((Y1brique <= Yball && Yball <= Y2brique) &&
          (Xball == X1brique))
        ) {
        breakBrique(numBall, i);
        changeBallSens(numBall, 'X');
      }*/

      // Re-ecriture du code ci-dessus
      // prise en compte d'erreur de calcul processeur (precision de 1)
      if(((X1brique <= Xball && Xball <= X2brique) &&
          (Math.abs(Yball - Y2brique) <= precisionErreur))
         ||
         ((X1brique <= Xball && Xball <= X2brique) &&
          (Math.abs(Yball - Y1brique) <= precisionErreur))
        ) {
        breakBrique(numBall, i);
        changeBallSens(numBall, 'Y');
      } else if (((Y1brique <= Yball && Yball <= Y2brique) &&
          (Math.abs(Xball - X2brique) <= precisionErreur))
         ||
         ((Y1brique <= Yball && Yball <= Y2brique) &&
          (Math.abs(Xball - X1brique) <= precisionErreur))
        ) {
        breakBrique(numBall, i);
        changeBallSens(numBall, 'X');
      }
    }
    i++;
  }
  return -1;
}

function breakBrique(numBall, numBrique) {
  tabBriques[numBrique].style.visibility == "hidden";
  jeu.removeChild(tabBriques[numBrique]);
  tabBriques[numBrique] = null;
  decompteBriques -= 1;
}

function changeBallSens(numBall, sens) {
  if(sens == 'X') {
    tabDeplXPos[numBall] = (tabDeplXPos[numBall])?0:1;
  } else {
    tabDeplYPos[numBall] = (tabDeplYPos[numBall])?0:1;
  }
}

function setSizeScreen() {
  deplScreenX = document.body.offsetWidth - 40;
  deplScreenY = document.body.offsetHeight - 30;
}

function goBall() {
  for(i=0; i < nbBalls; i++) {
    if(tabMovBall[i] == null)
      continue;

    isVisible = tabMovBall[i].style.visibility == "visible";

    if(!isVisible) continue;

    deplX = tabDeplX[i];
    deplY = tabDeplY[i];
    deplXPos = tabDeplXPos[i];
    deplYPos = tabDeplYPos[i];

    if(deplX + deltaDepl < deplScreenX && deplXPos) {
      deplX += deltaDepl;
    } else if(deplX <= 0) {
      deplX += deltaDepl;
      deplXPos = 1;
    } else {
      deplX -= deltaDepl;
      deplXPos = 0;
    }

    if(deplY + deltaDepl < deplScreenY && deplYPos) {
      deplY += deltaDepl;
    } else if(deplY <= 0) {
      deplY += deltaDepl;
      deplYPos = 1;
    } else {
      deplY -= deltaDepl;
      deplYPos = 0;
    }

    tabMovBall[i].style.left = deplX;
    tabMovBall[i].style.top  = deplY;

    tabDeplX[i] = deplX;
    tabDeplY[i] = deplY;
    tabDeplXPos[i] = deplXPos;
    tabDeplYPos[i] = deplYPos;

    // verifier que la balle tombe bien sur le chariot et qu'elle est presente sur le terrain
    if((deplY + deltaDepl) >= deplScreenY && isVisible) {
      if(deplX >= posCarriage && deplX <= (posCarriage + carriage.offsetWidth)) {
        //ok
      } else if(!basculeTriche) {
        if(nbBallOk > 1) {
          nbBallOk -= 1;
          tabMovBall[i].style.visibility = "hidden";
          tabMovBall[i] = null;
        } else {
          alert("Perdu !");
          document.location.reload();
        }
      }
    }

    // casser les briques
    if(tabMovBall[i] != null) {
      ballBreakBrique(i);
    }
  } // end for

  // relancer le jeu si plus de briques
  if(decompteBriques == 0) 
    document.location.reload();

  setTimeout('goBall()', timeOutDepl);
}

function handlerKey() {
  var keyPress = event.keyCode;
  //alert(keyPress);
  if(keyPress == 43 && timeOutDepl > 1) {
    timeOutDepl -= 1;
  } else if(keyPress == 45) {
    timeOutDepl += 1;
  } else if(keyPress == 42) {
    deltaDepl += 1;
  } else if(keyPress == 47 && deltaDepl > 1) {
    deltaDepl -= 1;
  } else if(keyPress == 48) {
    for(i=0; i<nbBalls; i++)
      if (document.getElementById("movBall" + i).innerHTML == "o")
        document.getElementById("movBall" + i).innerHTML = "O";
      else
        document.getElementById("movBall" + i).innerHTML = "o";
  } else if(keyPress >= 49 && keyPress <= 57) {
    // nombre de balles tappees au clavier
    for(i=0, charCodeKey=String.fromCharCode(keyPress); i<charCodeKey; i++)
      if(tabMovBall[i] != null)
        tabMovBall[i].style.visibility = "visible";
    nbBallOk = String.fromCharCode(keyPress);
  } else if(keyPress == 32) {
    basculeTriche = !basculeTriche;
    if(basculeTriche) {
      document.getElementById("carriage").innerHTML = "__________________________________________________________________";
      document.getElementById("carriage").style.left = 0;
    } else {
      document.getElementById("carriage").innerHTML = "__________";
    }
  } else if(keyPress == 27) {
    alert("Pause, v'la le chef !\nOK pour continuer ...");
  } else if (keyPress == 66) {
    document.getElementById("movBall" + i).innerHTML = "<img src='balle.jpg'>";
  } else {
    for(i=0; i<nbBalls; i++)
      document.getElementById("movBall" + i).innerHTML = String.fromCharCode(keyPress);
  }
}

function movCarriage() {
  var controlKey = event.keyCode;

  if(controlKey == 37 && posCarriage > 0) {
    // deplacement vers la gauche
    posCarriage -= deltaCarriage;
  } else if(controlKey == 39 && posCarriage < deplScreenX){
    // deplacement vers la droite
    posCarriage += deltaCarriage;
  } else if(controlKey == 38) {
    deltaCarriage += 1;
  } else if(controlKey == 40 && deltaCarriage > 1) {
    deltaCarriage -= 1;
  }
  if(!basculeTriche)
    carriage.style.left = posCarriage;
}

function movCarriageByMouse() {
  var controlMouse = event.x;
  
  if((controlMouse - (carriage.offsetWidth / 2)) > 0 && (controlMouse + (carriage.offsetWidth / 2)) < deplScreenX) {
    // deplacement vers la gauche
    posCarriage = controlMouse - (carriage.offsetWidth / 2);
  }

  if(!basculeTriche)
    carriage.style.left = posCarriage;
}