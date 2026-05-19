param(
    [string]$BaseUrl = "http://localhost:4010"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Test-Request {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [int]$ExpectedStatus,
        [object]$Body = $null,
        [hashtable]$Headers = $null,
        [switch]$NoRedirect
    )

    try {
        $params = @{
            UseBasicParsing = $true
            Uri = $Url
            Method = $Method
            ErrorAction = "Stop"
        }

        if ($NoRedirect.IsPresent) {
            $params["MaximumRedirection"] = 0
        }

        if ($null -ne $Body) {
            $params["ContentType"] = "application/json"
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }

        if ($null -ne $Headers) {
            $params["Headers"] = $Headers
        }

        $response = Invoke-WebRequest @params
        $status = [int]$response.StatusCode

        [PSCustomObject]@{
            Check = $Name
            Status = $status
            Expected = $ExpectedStatus
            Ok = ($status -eq $ExpectedStatus)
        }
    } catch {
        $status = -1
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
        }

        [PSCustomObject]@{
            Check = $Name
            Status = $status
            Expected = $ExpectedStatus
            Ok = ($status -eq $ExpectedStatus)
        }
    }
}

$allChecks = @()

# Bloco publico
$exerciseList = Invoke-RestMethod -Uri "$BaseUrl/api/exercises" -Method GET
if ($exerciseList -is [array]) {
    if ($exerciseList.Count -eq 0) {
        throw "Sem exercicios para executar smoke test."
    }
    $exerciseId = [string]$exerciseList[0].id
} else {
    $exerciseId = [string]$exerciseList.id
}

$sampleCode = @{ html = "<h1>Smoke</h1>"; css = "h1{color:green;}"; javascript = "console.log('smoke')" }

$allChecks += Test-Request -Name "Home" -Method "GET" -Url "$BaseUrl/" -ExpectedStatus 200
$allChecks += Test-Request -Name "Categories" -Method "GET" -Url "$BaseUrl/categories" -ExpectedStatus 200
$allChecks += Test-Request -Name "Ranking page" -Method "GET" -Url "$BaseUrl/ranking" -ExpectedStatus 200
$allChecks += Test-Request -Name "Exercise list page" -Method "GET" -Url "$BaseUrl/exercise" -ExpectedStatus 200
$allChecks += Test-Request -Name "Exercise detail page" -Method "GET" -Url "$BaseUrl/exercise/$exerciseId" -ExpectedStatus 200
$allChecks += Test-Request -Name "Exercises by category page" -Method "GET" -Url "$BaseUrl/exercises/html" -ExpectedStatus 200
$allChecks += Test-Request -Name "Feedback page" -Method "GET" -Url "$BaseUrl/feedback" -ExpectedStatus 200
$allChecks += Test-Request -Name "Signin page" -Method "GET" -Url "$BaseUrl/auth/signin" -ExpectedStatus 200
$allChecks += Test-Request -Name "Signup page" -Method "GET" -Url "$BaseUrl/auth/signup" -ExpectedStatus 200
$allChecks += Test-Request -Name "Forgot password page" -Method "GET" -Url "$BaseUrl/auth/forgot-password" -ExpectedStatus 200
$allChecks += Test-Request -Name "Profile redirect unauth" -Method "GET" -Url "$BaseUrl/auth/profile" -ExpectedStatus 307 -NoRedirect
$allChecks += Test-Request -Name "Admin add exercise redirect" -Method "GET" -Url "$BaseUrl/admin/add-exercise" -ExpectedStatus 307 -NoRedirect
$allChecks += Test-Request -Name "Fallback pagina inexistente" -Method "GET" -Url "$BaseUrl/rota-inexistente" -ExpectedStatus 404

$allChecks += Test-Request -Name "Health API" -Method "GET" -Url "$BaseUrl/api/health" -ExpectedStatus 200
$allChecks += Test-Request -Name "Exercises API" -Method "GET" -Url "$BaseUrl/api/exercises" -ExpectedStatus 200
$allChecks += Test-Request -Name "Exercise by ID API" -Method "GET" -Url "$BaseUrl/api/exercises/$exerciseId" -ExpectedStatus 200
$allChecks += Test-Request -Name "Ranking API" -Method "GET" -Url "$BaseUrl/api/users/ranking" -ExpectedStatus 200
$allChecks += Test-Request -Name "Validate API" -Method "POST" -Url "$BaseUrl/api/exercises/$exerciseId/validate" -ExpectedStatus 200 -Body @{ userCode = $sampleCode }
$allChecks += Test-Request -Name "AI Hint API" -Method "POST" -Url "$BaseUrl/api/exercises/$exerciseId/ai-hint" -ExpectedStatus 200 -Body @{ userCode = $sampleCode }
$allChecks += Test-Request -Name "AI Review API" -Method "POST" -Url "$BaseUrl/api/exercises/$exerciseId/ai-review" -ExpectedStatus 200 -Body @{ userCode = $sampleCode }
$allChecks += Test-Request -Name "Feedback API unauth" -Method "POST" -Url "$BaseUrl/api/feedbacks" -ExpectedStatus 401 -Body @{ feedback = "Smoke unauth" }
$allChecks += Test-Request -Name "Admin create API unauth" -Method "POST" -Url "$BaseUrl/api/admin/exercises" -ExpectedStatus 401 -Body @{
    id = "smoke-unauth"
    title = "Smoke unauth"
    description = "Smoke"
    difficulty = "iniciante"
    category = "html"
    points = 5
    instructions = "Smoke"
}

# Bloco autenticado (Bearer)
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "homologacao.phase7.$timestamp@example.com"
$password = "123456"
$signupResult = Invoke-RestMethod -Uri "$BaseUrl/api/auth/sign-up" -Method POST -ContentType "application/json" -Body (@{
    name = "Homologacao Fase 7 $timestamp"
    email = $email
    password = $password
} | ConvertTo-Json)

$sessionId = [string]$signupResult.sessionId
if (-not $sessionId) {
    throw "Nao foi possivel obter sessionId no cadastro."
}

$authHeaders = @{ Authorization = "Bearer $sessionId" }
$adminExerciseId = "smoke-admin-$timestamp"

$allChecks += Test-Request -Name "Login com credenciais validas" -Method "POST" -Url "$BaseUrl/api/auth/sign-in" -ExpectedStatus 200 -Body @{ email = $email; password = $password }
$allChecks += Test-Request -Name "Login com credenciais invalidas" -Method "POST" -Url "$BaseUrl/api/auth/sign-in" -ExpectedStatus 401 -Body @{ email = "naoexiste.$timestamp@example.com"; password = $password }
$allChecks += Test-Request -Name "Sessao via bearer (/api/user)" -Method "GET" -Url "$BaseUrl/api/user" -ExpectedStatus 200 -Headers $authHeaders
$allChecks += Test-Request -Name "Persistencia sessao apos refresh" -Method "GET" -Url "$BaseUrl/api/user" -ExpectedStatus 200 -Headers $authHeaders
$allChecks += Test-Request -Name "Buscar progresso geral autenticado" -Method "GET" -Url "$BaseUrl/api/progress" -ExpectedStatus 200 -Headers $authHeaders
$allChecks += Test-Request -Name "Buscar progresso por exercicio autenticado" -Method "GET" -Url "$BaseUrl/api/progress/$exerciseId" -ExpectedStatus 200 -Headers $authHeaders
$allChecks += Test-Request -Name "Salvar codigo autenticado" -Method "POST" -Url "$BaseUrl/api/code/save" -ExpectedStatus 200 -Headers $authHeaders -Body @{ exerciseId = $exerciseId; userCode = $sampleCode }
$allChecks += Test-Request -Name "Completar exercicio autenticado" -Method "POST" -Url "$BaseUrl/api/exercises/$exerciseId/complete" -ExpectedStatus 200 -Headers $authHeaders -Body @{ userCode = $sampleCode }
$allChecks += Test-Request -Name "Feedback autenticado" -Method "POST" -Url "$BaseUrl/api/feedbacks" -ExpectedStatus 201 -Headers $authHeaders -Body @{ feedback = "Feedback autenticado Fase 7 $timestamp" }
$allChecks += Test-Request -Name "Criar exercicio admin autenticado" -Method "POST" -Url "$BaseUrl/api/admin/exercises" -ExpectedStatus 201 -Headers $authHeaders -Body @{
    id = $adminExerciseId
    title = "Smoke admin"
    description = "Criado durante homologacao"
    difficulty = "iniciante"
    category = "html"
    points = 5
    instructions = "Smoke"
    initialCode = @{ html = ""; css = ""; javascript = "" }
    starterTemplate = @{ html = ""; css = ""; javascript = "" }
    solutionCode = @{ html = "<h1>ok</h1>"; css = ""; javascript = "" }
    hints = @("hint")
    validationRules = @()
    tests = @()
}
$allChecks += Test-Request -Name "Excluir exercicio admin autenticado" -Method "DELETE" -Url "$BaseUrl/api/admin/exercises/$adminExerciseId" -ExpectedStatus 200 -Headers $authHeaders
$allChecks += Test-Request -Name "Logout endpoint" -Method "POST" -Url "$BaseUrl/api/auth/sign-out" -ExpectedStatus 200 -Body @{}
$allChecks += Test-Request -Name "Sessao limpa sem bearer apos logout" -Method "GET" -Url "$BaseUrl/api/user" -ExpectedStatus 401

$allChecks | Format-Table -AutoSize

$failures = @($allChecks | Where-Object { -not $_.Ok })
"FAILURES=$($failures.Count)"

if ($failures.Count -gt 0) {
    exit 1
}
