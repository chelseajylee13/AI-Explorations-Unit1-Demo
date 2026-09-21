$ErrorActionPreference = 'Stop'

function Assert-Equal {
    param($Actual, $Expected, [string]$Label)
    if ($Actual -ne $Expected) {
        throw "$Label expected '$Expected'; received '$Actual'."
    }
}

$dataRoot = Join-Path $PSScriptRoot '../ai-prompt-footprint/data'
$upstreamRoot = Join-Path $dataRoot 'upstream/ecologits-0.11.1'
$manifest = Get-Content -LiteralPath (Join-Path $dataRoot 'source-manifest.json') -Raw | ConvertFrom-Json
$video = Get-Content -LiteralPath (Join-Path $upstreamRoot 'video_models.json') -Raw | ConvertFrom-Json
$mixes = Get-Content -LiteralPath (Join-Path $upstreamRoot 'electricity_mixes.json') -Raw | ConvertFrom-Json

Assert-Equal $manifest.schema_version '1.0.0' 'Manifest schema version'
Assert-Equal $manifest.records.Count 3 'Manifest record count'

foreach ($record in $manifest.records | Where-Object { $_.sha256 }) {
    $path = Join-Path $upstreamRoot $record.value
    $actualHash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    Assert-Equal $actualHash $record.sha256 "Hash for $($record.id)"
}

Assert-Equal $video.models.Count 17 'Video model count'
Assert-Equal @($video.provider_configurations.PSObject.Properties).Count 8 'Provider configuration count'
Assert-Equal @($video.hardware_configurations.PSObject.Properties).Count 4 'Hardware configuration count'

foreach ($model in $video.models) {
    if (-not $video.provider_configurations.PSObject.Properties[$model.provider]) {
        throw "Model $($model.model_name) references missing provider $($model.provider)."
    }
    if (-not $video.hardware_configurations.PSObject.Properties[$model.hardware]) {
        throw "Model $($model.model_name) references missing hardware $($model.hardware)."
    }
    if ($model.capabilities.resolutions.Count -eq 0 -or $model.capabilities.frames_count.Count -eq 0) {
        throw "Model $($model.model_name) has an empty capability list."
    }
}

$usa = $mixes.electricity_mixes | Where-Object name -eq 'USA'
$singapore = $mixes.electricity_mixes | Where-Object name -eq 'SGP'
$world = $mixes.electricity_mixes | Where-Object name -eq 'WOR'
Assert-Equal $usa.gwp 0.3844 'USA GWP factor'
Assert-Equal $usa.wue 3.1321 'USA electricity WUE factor'
Assert-Equal $singapore.gwp 0.49709 'Singapore GWP factor'
Assert-Equal $singapore.wue 3.908 'Singapore electricity WUE factor'
Assert-Equal $world.gwp 0.45829 'World GWP factor'

$pendingImage = $manifest.records | Where-Object id -eq 'bertazzini-image-energy-2025-pending'
Assert-Equal $pendingImage.evidence_label 'Pending' 'Image source status'
if ($null -ne $pendingImage.value) {
    throw 'Pending image source must not contain an inferred coefficient.'
}

Write-Output 'PASS - frozen source hashes match the reviewed EcoLogits 0.11.1 files.'
Write-Output 'PASS - all 17 video models reference one of 8 providers and 4 hardware configurations.'
Write-Output 'PASS - USA, Singapore, and world electricity factors match the pinned data.'
Write-Output 'PASS - image energy remains explicitly pending with no inferred coefficient.'
