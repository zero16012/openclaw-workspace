' 🚀 OpenClaw Control - 静默启动网关 + 打开面板
Dim gwUrl, running, http

gwUrl = "http://127.0.0.1:18789/"

' 检测网关是否运行
Set http = CreateObject("MSXML2.ServerXMLHTTP")
http.open "GET", gwUrl, false
http.setTimeouts 2000, 2000, 2000, 2000
On Error Resume Next
http.send
If Err.Number <> 0 Then
    ' 网关没启动，启动它
    CreateObject("WScript.Shell").Run "openclaw gateway restart", 0, False
    WScript.Sleep 5000
End If
On Error Goto 0
Set http = Nothing

' 打开 PWA 面板
CreateObject("WScript.Shell").Run """C:\Program Files (x86)\Microsoft\Edge\Application\msedge_proxy.exe"" --profile-directory=Default --app-id=elaofidhnjoejcebffgfmpicgbdhdgcp --app-url=http://127.0.0.1:18789/ --app-launch-source=4", 0, False
