# Deploy backend + frontend containers to Azure App Service (LiveKit later on Hostinger).
# Prerequisites: Azure CLI installed and logged in (az login).
# Usage from repo root:
#   .\azure\deploy-app-service.ps1

$ErrorActionPreference = "Stop"
$EnvFile = Join-Path $PSScriptRoot ".env.azure"

if (-not (Test-Path $EnvFile)) {
  throw "Missing azure/.env.azure"
}

Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) { return }
  $parts = $line -split "=", 2
  if ($parts.Count -eq 2) {
    Set-Item -Path "Env:$($parts[0].Trim())" -Value $parts[1].Trim()
  }
}

$rg = $env:AZURE_RESOURCE_GROUP
$loc = $env:AZURE_LOCATION
$plan = $env:AZURE_APP_PLAN
$apiApp = $env:AZURE_API_APP
$webApp = $env:AZURE_WEB_APP
$backendImage = $env:BACKEND_IMAGE
$frontendImage = $env:FRONTEND_IMAGE

Write-Host "Subscription:"
az account show --query "{name:name,id:id}" -o table

Write-Host "Using resource group $rg ($loc) ..."
az group show --name $rg -o none

Write-Host "Creating App Service plan $plan (Linux B1) if missing ..."
$planExists = $false
try {
  az appservice plan show --name $plan --resource-group $rg -o none 2>$null
  if ($LASTEXITCODE -eq 0) { $planExists = $true }
} catch { $planExists = $false }

if (-not $planExists) {
  az appservice plan create `
    --name $plan `
    --resource-group $rg `
    --location $loc `
    --is-linux `
    --sku B1 `
    -o none
  if ($LASTEXITCODE -ne 0) { throw "Failed to create App Service plan $plan" }
} else {
  Write-Host "Plan $plan already exists."
}
Write-Host "Creating API webapp $apiApp ..."
az webapp create `
  --resource-group $rg `
  --plan $plan `
  --name $apiApp `
  --deployment-container-image-name $backendImage `
  -o none

Write-Host "Creating frontend webapp $webApp ..."
az webapp create `
  --resource-group $rg `
  --plan $plan `
  --name $webApp `
  --deployment-container-image-name $frontendImage `
  -o none

Write-Host "Configuring backend app settings ..."
az webapp config appsettings set `
  --resource-group $rg `
  --name $apiApp `
  --settings `
    PORT=8080 `
    WEBSITES_PORT=8080 `
    CORS_ORIGINS=$($env:CORS_ORIGINS) `
    LIVEKIT_HOST=$($env:LIVEKIT_HOST) `
    LIVEKIT_API_KEY=$($env:LIVEKIT_API_KEY) `
    LIVEKIT_API_SECRET=$($env:LIVEKIT_API_SECRET) `
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false `
  -o none

Write-Host "Configuring frontend container port 80 ..."
az webapp config appsettings set `
  --resource-group $rg `
  --name $webApp `
  --settings `
    WEBSITES_PORT=80 `
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false `
  -o none

Write-Host "Enabling continuous deployment pull (optional docker hub public) ..."
az webapp deployment container config --enable-cd true --name $apiApp --resource-group $rg -o none
az webapp deployment container config --enable-cd true --name $webApp --resource-group $rg -o none

Write-Host "Restarting apps ..."
az webapp restart --name $apiApp --resource-group $rg -o none
az webapp restart --name $webApp --resource-group $rg -o none

Write-Host ""
Write-Host "Deployed:"
Write-Host "  Frontend: https://$webApp.azurewebsites.net"
Write-Host "  Backend:  https://$apiApp.azurewebsites.net"
Write-Host "  Swagger:  https://$apiApp.azurewebsites.net/api"
