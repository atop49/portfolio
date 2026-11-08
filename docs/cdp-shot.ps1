param([string]$Ws, [string]$OutDir)

$ErrorActionPreference = "Stop"
$c = New-Object System.Net.WebSockets.ClientWebSocket
$c.ConnectAsync([Uri]$Ws, [Threading.CancellationToken]::None).Wait()

$script:id = 0

function Send-Cdp([string]$method, $params) {
  $script:id++
  $myId = $script:id
  $msg = @{ id = $myId; method = $method; params = $params } | ConvertTo-Json -Depth 10 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($msg)
  $seg = New-Object 'System.ArraySegment[byte]' -ArgumentList @(,$bytes)
  $c.SendAsync($seg, [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).Wait()

  while ($true) {
    $ms = New-Object System.IO.MemoryStream
    $buf = New-Object byte[] 65536
    $done = $false
    while (-not $done) {
      $cts = New-Object Threading.CancellationTokenSource
      $cts.CancelAfter(30000)
      $segR = New-Object 'System.ArraySegment[byte]' -ArgumentList @(,$buf)
      $res = $c.ReceiveAsync($segR, $cts.Token)
      $res.Wait()
      $r = $res.Result
      if ($r.Count -le 0) { return $null }
      $ms.Write($buf, 0, $r.Count)
      if ($r.EndOfMessage) { $done = $true }
    }
    $txt = [Text.Encoding]::UTF8.GetString($ms.ToArray())
    $obj = $txt | ConvertFrom-Json
    if ($obj.id -eq $myId) { return $obj }
  }
}

function Shot([string]$name) {
  $r = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; captureBeyondViewport = $false }
  $path = Join-Path $OutDir $name
  [IO.File]::WriteAllBytes($path, [Convert]::FromBase64String($r.result.data))
  "  shot $name = $((Get-Item $path).Length) bytes"
}

function Eval([string]$js) {
  $r = Send-Cdp 'Runtime.evaluate' @{ expression = $js; returnByValue = $true; awaitPromise = $true }
  return $r.result.result.value
}

Send-Cdp 'Page.enable' @{} | Out-Null
Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = 1600; height = 1000; deviceScaleFactor = 1; mobile = $false } | Out-Null
Send-Cdp 'Page.navigate' @{ url = 'https://atop49.github.io/portfolio/' } | Out-Null
Start-Sleep -Seconds 10
Shot '01-portfolio.png'

function ClickLabel([string]$label) {
  $js = "(()=>{const t='$label'.toLowerCase();const els=[...document.querySelectorAll('button,a')];const b=els.find(x=>x.textContent.trim().toLowerCase()===t);if(!b)return 'notfound:'+els.map(x=>x.textContent.trim()).filter(Boolean).slice(0,12).join('|');b.click();return 'clicked';})()"
  return Eval $js
}

ClickLabel 'skills' | ForEach-Object { "  skills -> $_" }
Start-Sleep -Seconds 3
Shot '07-skills.png'

ClickLabel 'about' | ForEach-Object { "  about -> $_" }
Start-Sleep -Seconds 4
Shot '08-about.png'

ClickLabel 'projects' | ForEach-Object { "  projects -> $_" }
Start-Sleep -Seconds 5
Eval "const h=document.querySelector('.frame-hit');h?(h.click(),'clicked'):'notfound'" | ForEach-Object { "  open card -> $_" }
Start-Sleep -Seconds 4
Shot '09-inspector.png'

$c.Dispose()
"done"
