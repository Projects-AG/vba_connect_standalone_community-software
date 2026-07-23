# Rebuild both images for one-app (nginx + Nest) and push to Docker Hub.
# From repo root:
#   .\azure\rebuild-one-app.ps1
# Optional: set DOCKERHUB_USER in azure\.env.azure (default projectsag)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $PSScriptRoot ".env.azure"

if (Test-Path $EnvFile) {
  Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $parts = $line -split "=", 2
    if ($parts.Count -eq 2) {
      Set-Item -Path "Env:$($parts[0].Trim())" -Value $parts[1].Trim()
    }
  }
}

$user = if ($env:DOCKERHUB_USER) { $env:DOCKERHUB_USER } else { "projectsag" }
$frontendImage = if ($env:FRONTEND_IMAGE) { $env:FRONTEND_IMAGE } else { "$user/project-loop:latest" }
$backendImage = if ($env:BACKEND_IMAGE) { $env:BACKEND_IMAGE } else { "$user/project-loop-backend:latest" }
$viteApi = if ($null -ne $env:VITE_API_URL) { $env:VITE_API_URL } else { "" }
$viteLk = if ($env:VITE_LIVEKIT_URL) { $env:VITE_LIVEKIT_URL } else { "ws://127.0.0.1:7880" }

Write-Host "Building backend -> $backendImage"
docker build -t $backendImage (Join-Path $Root "backend")
if ($LASTEXITCODE -ne 0) { throw "backend build failed" }

Write-Host "Building frontend (VITE_API_URL='$viteApi') -> $frontendImage"
docker build `
  -t $frontendImage `
  --build-arg "VITE_API_URL=$viteApi" `
  --build-arg "VITE_LIVEKIT_URL=$viteLk" `
  (Join-Path $Root "frontend")
if ($LASTEXITCODE -ne 0) { throw "frontend build failed" }

Write-Host "Pushing $backendImage ..."
docker push $backendImage
if ($LASTEXITCODE -ne 0) { throw "backend push failed" }

Write-Host "Pushing $frontendImage ..."
docker push $frontendImage
if ($LASTEXITCODE -ne 0) { throw "frontend push failed" }

Write-Host ""
Write-Host "Done. Deploy azure/docker-compose.appservice.yml on one App Service."
Write-Host "  Images: $frontendImage , $backendImage"
Write-Host "  Compose: azure/docker-compose.appservice.yml"
