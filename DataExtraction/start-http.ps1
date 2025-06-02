Write-Host "Starting HTTP Server..."
$http = [System.Net.HttpListener]::new()
$http.Prefixes.Add("http://localhost:3001/")
$http.Start()

if ($http.IsListening) {
    Write-Host "HTTP Server is running at http://localhost:3001/"
    Write-Host "Endpoints:"
    Write-Host "  GET  http://localhost:3001/api/health"
    Write-Host "  POST http://localhost:3001/api/analyze"
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server..."
}

while ($http.IsListening) {
    $context = $http.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $response.Headers.Add("Content-Type", "application/json")
    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
    
    # Handle CORS preflight
    if ($request.HttpMethod -eq "OPTIONS") {
        $response.StatusCode = 200
        $response.Close()
        continue
    }
    
    $responseText = ""
    
    try {
        if ($request.HttpMethod -eq "GET" -and $request.Url.LocalPath -eq "/api/health") {
            $responseText = @{
                status = "ok"
                timestamp = [System.DateTime]::UtcNow.ToString("o")
            } | ConvertTo-Json
            $response.StatusCode = 200
        }
        elseif ($request.HttpMethod -eq "POST" -and $request.Url.LocalPath -eq "/api/analyze") {
            $reader = [System.IO.StreamReader]::new($request.InputStream, $request.ContentEncoding)
            $body = $reader.ReadToEnd()
            $reader.Dispose()
            
            Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Received request: $body"
            
            $responseText = @{
                success = $true
                data = @{
                    contractAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"
                    name = "Test NFT Collection"
                    symbol = "TEST"
                    totalSupply = "10000"
                    analysis = @{
                        security = 85
                        activity = 72
                        community = 65
                        liquidity = 90
                    }
                    priceData = @{
                        currentPrice = 0.5
                        priceChange24h = 2.5
                        volume24h = 2500
                    }
                    lastUpdated = [System.DateTime]::UtcNow.ToString("o")
                }
            } | ConvertTo-Json -Depth 5
            
            $response.StatusCode = 200
        }
        else {
            $responseText = @{ error = "Not Found" } | ConvertTo-Json
            $response.StatusCode = 404
        }
    }
    catch {
        $responseText = @{ 
            error = "Internal Server Error"
            message = $_.Exception.Message
        } | ConvertTo-Json
        $response.StatusCode = 500
    }
    
    $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseText)
    $response.ContentLength64 = $buffer.Length
    $output = $response.OutputStream
    $output.Write($buffer, 0, $buffer.Length)
    $output.Close()
}

$http.Stop()
