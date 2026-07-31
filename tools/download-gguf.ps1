# Multi-threaded download from ModelScope for Qwen3-8B-Q4_K_M.gguf
$ErrorActionPreference = "Stop"
$url = "https://modelscope.cn/models/Qwen/Qwen3-8B-GGUF/resolve/master/Qwen3-8B-Q4_K_M.gguf"
$out = "C:\Users\zero\Downloads\Qwen3-8B-Q4_K_M.gguf"
$total = 5027783488
$threads = 8
$chunk = [math]::Ceiling($total / $threads)

# cleanup old parts
1..$threads | ForEach-Object { Remove-Item "$out.part$_" -ErrorAction SilentlyContinue }

$jobs = @()
for ($i = 1; $i -le $threads; $i++) {
    $start = ($i - 1) * $chunk
    $end = [math]::Min($start + $chunk - 1, $total - 1)
    if ($start -ge $total) { break }
    $part = "$out.part$i"
    $jobs += Start-Job -ArgumentList $url, $part, $start, $end -ScriptBlock {
        param($u, $p, $s, $e)
        curl.exe -sL --retry 5 --retry-delay 2 -o $p -r "${s}-${e}" $u
        if ($LASTEXITCODE -ne 0) { Write-Error "curl failed for range $s-$e" }
    }
}

Write-Host "Downloading with $($jobs.Count) threads..."
Wait-Job $jobs | Out-Null
$failed = $jobs | Where-Object { $_.State -ne 'Completed' }
if ($failed) { Write-Error "Some download jobs failed"; exit 1 }

# merge
Write-Host "Merging parts..."
$fs = [System.IO.File]::OpenWrite($out)
$fs.SetLength(0)
try {
    for ($i = 1; $i -le $threads; $i++) {
        $part = "$out.part$i"
        if (Test-Path $part) {
            $data = [System.IO.File]::ReadAllBytes($part)
            $fs.Write($data, 0, $data.Length)
            Remove-Item $part
            Write-Host "  merged part $i"
        }
    }
} finally {
    $fs.Close()
}

$size = (Get-Item $out).Length
Write-Host "DONE: $out ($size bytes, expected $total)"
if ($size -ne $total) { Write-Error "SIZE MISMATCH!"; exit 1 }
