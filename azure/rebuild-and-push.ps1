# Rebuild Velocity Teams with Azure URLs and push to Docker Hub.
# Usage (from repo root):
#   .\azure\rebuild-and-push.ps1
# Optional: edit azure\.env.azure first.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $PSScriptRoot ".env.azure"

if (-not (Test-Path $EnvFile)) {
  throw "Missing azure/.env.azure - copy azure/.env.azure.example to azure/.env.azure and edit it."
}

Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) { return }
  $parts = $line -split "=", 2
  if ($parts.Count -eq 2) {
    Set-Item -Path "Env:$($parts[0].Trim())" -Value $parts[1].Trim()
  }
}

if (-not $env:VITE_API_URL -or -not $env:VITE_LIVEKIT_URL) {
  throw "VITE_API_URL and VITE_LIVEKIT_URL must be set in azure/.env.azure"
}

$frontendImage = if ($env:FRONTEND_IMAGE) { $env:FRONTEND_IMAGE } else { "projectsag/project-loop:latest" }
$backendImage = if ($env:BACKEND_IMAGE) { $env:BACKEND_IMAGE } else { "projectsag/project-loop-backend:latest" }

Write-Host "Building frontend with:"
Write-Host "  VITE_API_URL=$($env:VITE_API_URL)"
Write-Host "  VITE_LIVEKIT_URL=$($env:VITE_LIVEKIT_URL)"
Write-Host "  image=$frontendImage"

docker build `
  -t $frontendImage `
  --build-arg "VITE_API_URL=$($env:VITE_API_URL)" `
  --build-arg "VITE_LIVEKIT_URL=$($env:VITE_LIVEKIT_URL)" `
  (Join-Path $Root "frontend")

Write-Host "Pushing $frontendImage ..."
docker push $frontendImage

Write-Host "Building/tagging backend as $backendImage ..."
docker build -t $backendImage (Join-Path (Split-Path -Parent $PSScriptRoot) "backend")
docker push $backendImage

Write-Host ""
Write-Host "Done."
Write-Host "Images:"
Write-Host "  Frontend: $frontendImage"
Write-Host "  Backend:  $backendImage"
Write-Host "Compose: azure/docker-compose.appservice.yml"
