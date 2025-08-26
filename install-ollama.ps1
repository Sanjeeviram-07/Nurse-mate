# NurseMate - Ollama Installation Helper
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NurseMate - Ollama Installation Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you install and set up Ollama for NurseMate." -ForegroundColor Yellow
Write-Host ""

# Step 1: Check if Ollama is installed
Write-Host "Step 1: Checking if Ollama is already installed..." -ForegroundColor Green
try {
    $ollamaVersion = ollama --version 2>$null
    if ($ollamaVersion) {
        Write-Host "✅ Ollama is already installed! Version: $ollamaVersion" -ForegroundColor Green
        Write-Host ""
        
        # Step 2: Check if llama3 model is installed
        Write-Host "Step 2: Checking if llama3 model is installed..." -ForegroundColor Green
        $modelList = ollama list 2>$null
        if ($modelList -match "llama3") {
            Write-Host "✅ llama3 model is already installed!" -ForegroundColor Green
            Write-Host ""
            
            # Step 3: Start Ollama
            Write-Host "Step 3: Starting Ollama..." -ForegroundColor Green
            Write-Host "Starting Ollama in the background..." -ForegroundColor Yellow
            
            # Check if Ollama is already running
            try {
                Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 -ErrorAction Stop | Out-Null
                Write-Host "✅ Ollama is already running on localhost:11434" -ForegroundColor Green
            } catch {
                Write-Host "Starting Ollama service..." -ForegroundColor Yellow
                Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
                Start-Sleep -Seconds 3
                Write-Host "✅ Ollama should now be running on localhost:11434" -ForegroundColor Green
            }
            
            Write-Host ""
            Write-Host "You can now use NurseMate with full AI capabilities!" -ForegroundColor Green
            Write-Host ""
            Read-Host "Press Enter to continue"
            exit 0
        } else {
            Write-Host "❌ llama3 model not found. Installing..." -ForegroundColor Yellow
            Write-Host "This may take a few minutes depending on your internet connection..." -ForegroundColor Yellow
            
            try {
                ollama pull llama3
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ llama3 model installed successfully!" -ForegroundColor Green
                    Write-Host ""
                    
                    # Step 3: Start Ollama
                    Write-Host "Step 3: Starting Ollama..." -ForegroundColor Green
                    Write-Host "Starting Ollama in the background..." -ForegroundColor Yellow
                    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
                    Start-Sleep -Seconds 3
                    Write-Host "✅ Ollama should now be running on localhost:11434" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "You can now use NurseMate with full AI capabilities!" -ForegroundColor Green
                    Write-Host ""
                    Read-Host "Press Enter to continue"
                    exit 0
                } else {
                    Write-Host "❌ Failed to install llama3 model" -ForegroundColor Red
                    Write-Host "Please check your internet connection and try again." -ForegroundColor Yellow
                    Read-Host "Press Enter to continue"
                    exit 1
                }
            } catch {
                Write-Host "❌ Failed to install llama3 model" -ForegroundColor Red
                Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
                Read-Host "Press Enter to continue"
                exit 1
            }
        }
    }
} catch {
    Write-Host "❌ Ollama is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please follow these steps to install Ollama:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Visit https://ollama.ai" -ForegroundColor White
    Write-Host "2. Download the Windows installer" -ForegroundColor White
    Write-Host "3. Run the installer" -ForegroundColor White
    Write-Host "4. Restart this script after installation" -ForegroundColor White
    Write-Host ""
    Write-Host "After installing Ollama, run this script again to set up the model." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue"
    exit 1
} 