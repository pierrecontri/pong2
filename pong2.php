<?php

function breakBricks() {
  $webPage = new WebPage();
  $webPage->docTitle    = "Pong 2";
  $webPage->metaWords   = "break bricks";

  // age of the program
  $d = getdate();
  $programAge = date("Y", $d[0] - mktime(1,0,0,1,7,2005)) - 1970;

  
  $webPage->headerDescription = <<<ENDHeader
    <div>
      <h2>Break Bricks</h2>
      <p>I wrote this game in 2005 in procedural programming, transform it in object programming in 2006. Many people said me that is a stupid idea.</p>
      <p>At now, {$programAge} years later, I always use the code in example for my job. Many companies are so late in this technology.</p>
    </div>
ENDHeader;

  $webPage->contentPage = <<<ENDCasseB
    <div>
        <iframe src="./data/pong2/pingpong.html" style="height:80px; width: 100%; max-width: 500px;"></iframe>
    </div>
    <div>
	  <a href="javascript:;"  onclick="javascript:window.open('./data/pong2/pong2.html','CasseBrique','width=800, height=640, toolbar=no, menubar=no, scrollbars=no, resizable=1, status=no, location=no');">
	    <img src="./src/images/pong2View.jpg" alt="pong2" style="width: 100%; max-width: 500px;"/>
	  </a>
	</div>
      <p>
Made entirely by hand in Notepad, TextEdit, I tried to write clean code and annotations. The technologies used are HTML, JavaScript and CSS. The sources present on the Internet are lacking annotation after a second exercise in style as Microsoft's Ajax pages. The design is not beautiful, but the game is very fast. I am currently developing a function to go into a game more aesthetic. Only the design is not my forte.
The game was written in a procedural manner, can be passed in writing later. The only reason to have passed in object is to show that we can properly encode the object in JavaScript. Its pitfalls is its loss of speed 1/10th.
      </p>
      <input type="button" class="btnsubmit" value="Bricks Break ..." onclick="javascript:window.open('./data/pong2/pong2.html','CasseBrique','width=800, height=640, toolbar=no, menubar=no, scrollbars=no, resizable=1, status=no, location=no');"/>\n
ENDCasseB;

  return $webPage;
}
?>
