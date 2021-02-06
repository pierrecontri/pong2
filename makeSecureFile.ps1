;;cat pong2obj.js.secure | Out-String | foreach-object {$_.Trim()}
;;cat pong2obj.js.secure | Out-String | foreach-object {$_.Replace('\t','').Trim()}
;;cat pong2obj.js.secure | Out-String | foreach-object {$_.Replace('\t','').Replace([Environment]::NewLine,'').Trim()}
;; attention !!! enlever les lignes de commentaire
cat pong2obj.js.secure | Out-String | foreach-object {$_.Trim().Replace('\t','').Trim().Replace('^(//.*)$','').Replace([Environment]::NewLine,'').Trim()}
cat pong2obj.js.secure | Out-String | foreach-object {$_.Split([Environment]::NewLine)}
$rxFigure = New-Object System.Text.RegularExpressions.Regex "(//.*)"
cat pong2obj.js.secure | Out-String | foreach-object {$_.Split([Environment]::NewLine) | foreach-object {$_.Replace($rxFigure,'')}}


$rxFigure = New-Object System.Text.RegularExpressions.Regex "(//.*)"
cat pong2obj.js.secure | Out-String | foreach-object {$_.Split([Environment]::NewLine) | foreach-object {[Regex]::Replace([Regex]::Replace($_,$rxFigure,''),'[\t ]+','').Trim()}}

cat pong2obj.js | Out-String | foreach-object {$_.Split([Environment]::NewLine) | foreach-object {[Regex]::Replace([Regex]::Replace($_,'(//.*)',''),'[\t ]+',' ')}} | Out-String | foreach-object {$_.Replace([Environment]::NewLine,' ')} | Out-File pong2obj.secure.js

cat pong2obj.js | Out-String | foreach-object {$_.Split([Environment]::NewLine) | foreach-object{[Regex]::Replace([Regex]::Replace($_,'(//.*)',''),'[\t ]+',' ')}} | Out-File pong2obj.secure.js

cat pong2obj.js | foreach-object {[Regex]::Replace([Regex]::Replace($_,'(//.*)',''),'[\t ]+',' ')} | Out-File pong2obj.secure.js
cat pong2obj.js | foreach-object {[Regex]::Replace([Regex]::Replace($_,'(//.*)',''),'[\t ]+',' ')} | Out-String | foreach-object {$_.Replace([Environment]::NewLine,' ')} | Out-File pong2obj.secure.js
