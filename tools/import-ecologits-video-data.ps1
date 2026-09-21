param(
    [Parameter(Mandatory = $true)]
    [string]$EcoLogitsSource
)

$ErrorActionPreference = 'Stop'

$expected = @{
    'video_models.json' = '23892AB10EB3C53D00E8D9EEC79ABFB1DD3E9357B2D020C4AF2578DC7FB55A0B'
    'electricity_mixes.json' = 'E6433AE79645719812067079F3D20A6A8420C8B8E5406FCCC94F73C9421FE917'
}

$sourceData = Join-Path $EcoLogitsSource 'ecologits/data'
$destination = Join-Path $PSScriptRoot '../ai-prompt-footprint/data/upstream/ecologits-0.11.1'

foreach ($filename in $expected.Keys) {
    $sourcePath = Join-Path $sourceData $filename
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
        throw "Missing expected EcoLogits source file: $sourcePath"
    }

    $actualHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash
    if ($actualHash -ne $expected[$filename]) {
        throw "Hash mismatch for $filename. Expected $($expected[$filename]); received $actualHash."
    }
}

New-Item -ItemType Directory -Path $destination -Force | Out-Null

foreach ($filename in $expected.Keys) {
    Copy-Item -LiteralPath (Join-Path $sourceData $filename) -Destination (Join-Path $destination $filename)
}

Write-Output 'Imported byte-identical EcoLogits 0.11.1 video model and electricity-mix records.'
foreach ($filename in ($expected.Keys | Sort-Object)) {
    $destinationPath = Join-Path $destination $filename
    $hash = (Get-FileHash -LiteralPath $destinationPath -Algorithm SHA256).Hash
    Write-Output "$filename $hash"
}
