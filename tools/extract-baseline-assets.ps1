param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$calculatorRoot = Join-Path $ProjectRoot 'ai-prompt-footprint'
$indexPath = Join-Path $calculatorRoot 'index.html'
$stylesPath = Join-Path $calculatorRoot 'styles.css'
$javascriptRoot = Join-Path $calculatorRoot 'js'
$appPath = Join-Path $javascriptRoot 'app.js'

$source = [System.IO.File]::ReadAllText($indexPath)
$stylePattern = '(?ms)^<style>\s*(.*?)^</style>\s*$'
$scriptPattern = '(?ms)^<script>\s*(.*?)^</script>\s*$'
$styleMatches = [regex]::Matches($source, $stylePattern)
$scriptMatches = [regex]::Matches($source, $scriptPattern)

if ($styleMatches.Count -ne 2) {
  throw "Expected two embedded style blocks; found $($styleMatches.Count)."
}

if ($scriptMatches.Count -ne 1) {
  throw "Expected one embedded script block; found $($scriptMatches.Count)."
}

[System.IO.Directory]::CreateDirectory($javascriptRoot) | Out-Null

$styles = ($styleMatches | ForEach-Object { $_.Groups[1].Value.Trim() }) -join "`r`n`r`n"
$app = $scriptMatches[0].Groups[1].Value.Trim()

$html = [regex]::Replace($source, $stylePattern, '')
$html = [regex]::Replace($html, $scriptPattern, '')
$html = $html.Replace('</head>', "  <link rel=`"stylesheet`" href=`"styles.css`">`r`n</head>")
$html = $html.Replace('</body>', "  <script src=`"js/source-data.js`"></script>`r`n  <script src=`"js/calculations.js`"></script>`r`n  <script src=`"js/app.js`"></script>`r`n</body>")
$html = [regex]::Replace($html, '(\r?\n){3,}', "`r`n`r`n").Trim() + "`r`n"

[System.IO.File]::WriteAllText($stylesPath, $styles + "`r`n", $utf8NoBom)
[System.IO.File]::WriteAllText($appPath, $app + "`r`n", $utf8NoBom)
[System.IO.File]::WriteAllText($indexPath, $html, $utf8NoBom)

Write-Output "Extracted $($styleMatches.Count) style blocks to $stylesPath"
Write-Output "Extracted the application script to $appPath"
Write-Output "Updated $indexPath to load local assets"
