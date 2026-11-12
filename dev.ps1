# LifeLink Dev Server Launcher
$env:Path = "C:\Program Files\nodejs;C:\Users\MY PC\AppData\Roaming\npm;" + $env:Path
Write-Host "Starting LifeLink Development Server on Node.js $(node -v)..." -ForegroundColor Cyan
npm run dev
