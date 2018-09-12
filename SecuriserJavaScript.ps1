break
# first step: try to remove all in one => not good
#cat pong2obj.js | Out-String | foreach-object {[Regex]::Replace([Regex]::Replace($_,'(\/\/.*) | (\/\*.*\*\/)',''),'([\t\n\r ]+)',' ')} | Out-File pong2obj.secure.js

# second step: remove comments and after remove carriage return with an intermediate file (temporary)
#cat pong2obj.js | Out-String | foreach-object {[Regex]::Replace($_,'(//.*)*','')} | Out-File pong2obj.secure.js.tmp
#cat pong2obj.secure.js.tmp | Out-String | foreach-object {[Regex]::Replace($_,'([\t\r\n ]+)',' ')} | Out-File pong2obj.secure.js
#remove-item pong2obj.secure.js.tmp

# third step: remove comments and after remove carriage return but into pipeline and not temporary file
$strContent = Get-Content ./pong2obj.js
# get the header of the script
$strHeader = $strContent | Select-Object -First 27
# get content and remove all comments

#$strContent | Select-Object $_
#Write-Verbose -Message "line" -Verbose

$strContent = $strContent `
   | Out-String | ForEach-Object {[Regex]::Replace($_,'(//.*)*','')} `
   | Out-String | ForEach-Object {[Regex]::Replace($_,'(\/\*.*\*\/)*','')} `
   | Out-String | ForEach-Object {[Regex]::Replace($_,'([\n\r]+)','')} `
   | Out-String | ForEach-Object {[Regex]::Replace($_,'[\t ]+',' ')} `
   | Out-String | ForEach-Object {[Regex]::Replace($_,'(\W)( )','$1')} `
   | Out-String | ForEach-Object {[Regex]::Replace($_,'( )(\W)','$2')}

$strHeader + $strContent | Out-File pong2obj.secure.js