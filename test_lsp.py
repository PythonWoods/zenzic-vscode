import json
import subprocess
import sys
import os

def send_message(proc, message):
    body = json.dumps(message).encode("utf-8")
    header = f"Content-Length: {len(body)}\r\nContent-Type: application/vscode-jsonrpc; charset=utf-8\r\n\r\n".encode("ascii")
    proc.stdin.write(header + body)
    proc.stdin.flush()

def read_message(proc):
    header = b""
    while True:
        line = proc.stdout.readline()
        if not line:
            return None
        if line == b"\r\n":
            break
        header += line
    
    content_length = 0
    for line in header.split(b"\r\n"):
        if b":" in line:
            key, val = line.split(b":", 1)
            if key.decode("ascii").strip().lower() == "content-length":
                content_length = int(val.decode("ascii").strip())
    
    body = proc.stdout.read(content_length)
    return json.loads(body.decode("utf-8"))

if __name__ == "__main__":
    env = os.environ.copy()
    env["PYTHONPATH"] = "/home/developer/SandBox/zenzic/src"
    
    proc = subprocess.Popen(
        [sys.executable, "-m", "zenzic.main", "lsp"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=sys.stderr,
        env=env
    )
    
    init_msg = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "rootUri": "file:///home/developer/SandBox/zenzic-vscode"
        }
    }
    send_message(proc, init_msg)
    print("Init response:", read_message(proc))
    
    send_message(proc, {
        "jsonrpc": "2.0",
        "method": "initialized",
        "params": {}
    })
    
    print("Post-init response:", read_message(proc))
    
    with open("/home/developer/SandBox/zenzic-vscode/testerror.md", "r") as f:
        text = f.read()
        
    send_message(proc, {
        "jsonrpc": "2.0",
        "method": "textDocument/didOpen",
        "params": {
            "textDocument": {
                "uri": "file:///home/developer/SandBox/zenzic-vscode/testerror.md",
                "languageId": "markdown",
                "version": 1,
                "text": text
            }
        }
    })
    
    print("Diag response:", read_message(proc))
    
    proc.terminate()
