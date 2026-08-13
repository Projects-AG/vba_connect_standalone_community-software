# Start local LiveKit (Docker) + Nest backend + Vite frontend.
# Start MySQL yourself first (database loop_db).
#
# From repo root:
#   powershell -ExecutionPolicy Bypass -File .\local-setup.ps1
# Stop LiveKit:
#   powershell -ExecutionPolicy Bypass -File .\local-setup.ps1 -Stop

param(
  [switch]$Stop
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"
$BackendEnv = Join-Path $BackendDir ".env"
$FrontendEnv = Join-Path $FrontendDir ".env"
$ComposeFile = Join-Path $Root "docker-compose.yml"

function Assert-Command($Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing '$Name' on PATH. Install it and retry."
  }
}

function Ensure-NpmInstall($Dir) {
  if (-not (Test-Path (Join-Path $Dir "node_modules"))) {
    Write-Host "npm install in $Dir"
    Push-Location $Dir
    try {
      npm install
      if ($LASTEXITCODE -ne 0) { throw "npm install failed in $Dir" }
    }
    finally {
      Pop-Location
    }
  }
}

function Ensure-BackendEnv {
  if (Test-Path $BackendEnv) { return }

  $rootEnv = Join-Path $Root ".env"
  if (Test-Path $rootEnv) {
    Write-Host 'Creating backend/.env from repo .env (LIVEKIT_HOST -> localhost)'
    $text = Get-Content -Raw $rootEnv
    $text = $text -replace "LIVEKIT_HOST=http://livekit:7880", "LIVEKIT_HOST=http://localhost:7880"
    if ($text -notmatch "(?m)^JWT_SECRET=") {
      $text = $text.TrimEnd() + "`r`nJWT_SECRET=project-loop-dev-secret-change-me`r`n"
    }
    if ($text -notmatch "(?m)^DB_SYNC=") {
      $text = $text.TrimEnd() + "`r`nDB_SYNC=true`r`n"
    }
    Set-Content -Path $BackendEnv -Value $text -NoNewline
  }
  else {
    $example = Join-Path $BackendDir ".env.example"
    Write-Host 'Creating backend/.env from backend/.env.example - set DB_PASSWORD'
    Copy-Item $example $BackendEnv
  }
}

function Ensure-FrontendEnv {
  if (Test-Path $FrontendEnv) { return }
  $lines = @(
    "VITE_API_URL=http://localhost:3000"
    "VITE_LIVEKIT_URL=ws://localhost:7880"
  )
  Set-Content -Path $FrontendEnv -Value $lines
  Write-Host 'Created frontend/.env'
}

if ($Stop) {
  Assert-Command docker
  Write-Host "Stopping local LiveKit..."
  docker compose -f $ComposeFile --profile livekit stop livekit
  Write-Host "Close the Backend and Frontend PowerShell windows to stop npm."
  Write-Host "MySQL is left running (you manage it)."
  exit 0
}

Assert-Command docker
Assert-Command npm
Assert-Command node

Write-Host "Checking Docker..."
docker info 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
  throw "Docker is not running. Start Docker Desktop and retry."
}

Ensure-BackendEnv
Ensure-FrontendEnv
Ensure-NpmInstall $BackendDir
Ensure-NpmInstall $FrontendDir

Write-Host 'Starting LiveKit (Docker: 7880 7881 UDP 50000-50020)...'
docker compose -f $ComposeFile --profile livekit up -d livekit
if ($LASTEXITCODE -ne 0) { throw "Failed to start LiveKit" }

Write-Host "Opening backend http://localhost:3000 ..."
Start-Process powershell -WorkingDirectory $BackendDir -ArgumentList @(
  "-NoExit",
  "-Command",
  "Write-Host 'Loop backend - http://localhost:3000/api' -ForegroundColor Cyan; npm run start:dev"
)

Write-Host "Opening frontend http://localhost:5173 ..."
Start-Process powershell -WorkingDirectory $FrontendDir -ArgumentList @(
  "-NoExit",
  "-Command",
  "Write-Host 'Loop frontend - http://localhost:5173' -ForegroundColor Cyan; npm run dev"
)

Write-Host ""
Write-Host "Local stack starting. Start MySQL first if it is not already up."
Write-Host "  UI:      http://localhost:5173"
Write-Host "  API:     http://localhost:3000/api"
Write-Host "  LiveKit: ws://localhost:7880"
Write-Host "Stop LiveKit:  powershell -ExecutionPolicy Bypass -File .\local-setup.ps1 -Stop"
Write-Host "Stop npm:      close the Backend and Frontend windows"
