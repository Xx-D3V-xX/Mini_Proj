Param()
$ErrorActionPreference = "Stop"
Function Test-Health($url){ try { Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 | Out-Null; return $true } catch { return $false } }
Write-Host "Starting AI Models..."
Start-Process -FilePath "python" -ArgumentList "-m","uvicorn","app.main:app","--port","8001" -WorkingDirectory "./ai-models" -WindowStyle Minimized
Start-Sleep -Seconds 2
while(!(Test-Health "http://localhost:8001/health")) { Write-Host "Waiting for ai-models..."; Start-Sleep -Seconds 1 }
Write-Host "Starting Backend..."
Start-Process -FilePath "npm" -ArgumentList "run","start" -WorkingDirectory "./backend" -WindowStyle Minimized
Start-Sleep -Seconds 2
while(!(Test-Health "http://localhost:4000/docs")) { Write-Host "Waiting for backend..."; Start-Sleep -Seconds 1 }
Write-Host "Starting Frontend..."
Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory "./frontend" -WindowStyle Minimized
Write-Host "All services started:
  Frontend: http://localhost:5173
  Backend : http://localhost:4000 (Swagger at /docs)
  AI      : http://localhost:8001"
