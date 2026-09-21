param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$javascriptRoot = Join-Path $ProjectRoot 'ai-prompt-footprint\js'
$appPath = Join-Path $javascriptRoot 'app.js'
$dataPath = Join-Path $javascriptRoot 'source-data.js'
$source = [System.IO.File]::ReadAllText($appPath)
$pattern = '(?s)    // ---- Data: per-prompt model impacts.*?    const DAYS = 365;\s*'
$match = [regex]::Match($source, $pattern)

if (-not $match.Success) {
  throw 'Could not find the baseline data block in js/app.js.'
}

$dataBlock = [regex]::Replace($match.Value, '(?m)^    ', '').Trim()
$exports = @'

globalThis.FootprintSourceData = Object.freeze({
  MODELS,
  SIZES,
  SIZE_LABEL_OVERRIDES,
  WPM,
  TOKENS_PER_WORD,
  TOKENS_PER_LINE,
  CODE_FRACTION,
  DEFAULT_ROWS,
  PRESETS,
  WORLD_GRID,
  LOCATIONS,
  HOMES,
  DRIVING,
  DIETS,
  FLYING,
  COUNTRY_DIET,
  REPORT_REFS,
  DAILY_ITEMS,
  ANNUAL_ITEMS,
  DAILY_WATER_ITEMS,
  ANNUAL_WATER_ITEMS,
  GAL_TO_L,
  DAYS,
});
'@

$replacement = @'
    const {
      MODELS, SIZES, SIZE_LABEL_OVERRIDES, WPM, TOKENS_PER_WORD, TOKENS_PER_LINE,
      CODE_FRACTION, DEFAULT_ROWS, PRESETS, WORLD_GRID, LOCATIONS, HOMES, DRIVING,
      DIETS, FLYING, COUNTRY_DIET, REPORT_REFS, DAILY_ITEMS, ANNUAL_ITEMS,
      DAILY_WATER_ITEMS, ANNUAL_WATER_ITEMS, GAL_TO_L, DAYS,
    } = globalThis.FootprintSourceData;

'@

$updatedApp = [regex]::Replace($source, $pattern, $replacement, 1)
[System.IO.File]::WriteAllText($dataPath, $dataBlock + $exports, $utf8NoBom)
[System.IO.File]::WriteAllText($appPath, $updatedApp, $utf8NoBom)

Write-Output "Extracted baseline coefficient and citation tables to $dataPath"
Write-Output "Updated $appPath to consume FootprintSourceData"
