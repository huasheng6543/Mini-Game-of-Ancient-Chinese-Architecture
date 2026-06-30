#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
from threading import Timer

PORT = 9005

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def send_response(self, *args, **kwargs):
        super().send_response(*args, **kwargs)
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')

def open_browser():
    webbrowser.open(f'http://localhost:{PORT}')

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 服务器启动成功！")
        print(f"📍 访问地址: http://localhost:{PORT}")
        print(f"📁 服务目录: {os.getcwd()}")
        print(f"\n按 Ctrl+C 停止服务器\n")
        
        Timer(1.5, open_browser).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n\n🛑 服务器已停止")
            httpd.shutdown()
