function Open-Connection {
    param (
        $url = 'ws://esp32.local:81'
    )
    $global:WS = New-Object System.Net.WebSockets.ClientWebSocket                                                
    $global:CT = New-Object System.Threading.CancellationToken
    $WS.Options.UseDefaultCredentials = $true

    #Get connected
    $Conn = $WS.ConnectAsync($URL, $CT)
    While (!$Conn.IsCompleted) { 
        Start-Sleep -Milliseconds 100 
    }
    Write-Host "Connected to $($URL)"
    return $WS
}

function Read-WS {
    #Start reading the received items
    While ($WS.State -eq 'Open') {                        

        $Recv = New-Object System.ArraySegment[byte] -ArgumentList @(, $Array)
        $Conn = $WS.ReceiveAsync($Recv, $CT)
        While (!$Conn.IsCompleted) { 
            #Write-Host "Sleeping for 100 ms"
            Start-Sleep -Milliseconds 100 
        }

        #Write-Host "Finished Receiving Request"
        $stringresp = [System.Text.Encoding]::ASCII.GetString($Recv)
        Write-Host $stringresp
    }  
}

function Send-WS {
    param (
        $cmd
    )
    $Size = 1024
    $Array = [byte[]] @(, 0) * $Size

    #Send Starting Request
    $Command = [System.Text.Encoding]::UTF8.GetBytes($cmd)
    $Send = New-Object System.ArraySegment[byte] -ArgumentList @(, $Command)            
    $Conn = $WS.SendAsync($Send, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $CT)

    While (!$Conn.IsCompleted) { 
        #Write-Host "Sleeping for 100 ms"
        Start-Sleep -Milliseconds 100 
    }

    Write-Host "Finished Sending Request"
}

$commands = @{
    'addrup' = '0';
    'addrdown' = '1';
    'MSB' = '2';
    'LSB' = '3';
    'graphon' = '4';
    'graphoff' = '5';
}

try {
    Do {
        $WS = Open-Connection
        Send-WS $commands['MSB']
        Send-WS $commands['addrdown']
        Send-WS $commands['addrdown']
        Send-WS $commands['addrdown']
        Send-WS $commands['addrdown']
        Read-WS
    } Until ($WS.State -ne 'Open')
}
Finally {
    If ($WS) { 
        Write-Host "Closing websocket"
        $WS.Dispose()
    }
}