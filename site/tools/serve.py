"""Local preview server for the Nitara site.

    python site/tools/serve.py            # http://localhost:8080
    python site/tools/serve.py --port 9000

Why not `python -m http.server`?
  * Clean URLs: /capabilities serves capabilities.html, exactly like Vercel (cleanUrls).
  * Review comments: /__agentation/* is passed through to the Agentation server
    (localhost:4747, started by Claude Code's MCP). The toolbar talks to that path on the
    same origin, so a forwarded port (VS Code ports, ngrok, ...) works for other people too.
"""
from __future__ import annotations

import argparse
import http.client
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROXY_PREFIX = "/__agentation"
AGENTATION = ("127.0.0.1", 4747)
HOP_HEADERS = {"connection", "keep-alive", "transfer-encoding", "upgrade", "host", "content-length"}


class Handler(SimpleHTTPRequestHandler):
    # ---- clean URLs ---------------------------------------------------------------
    def translate_path(self, path: str) -> str:
        local = super().translate_path(path)
        if not os.path.exists(local) and os.path.exists(local + ".html"):
            return local + ".html"
        return local

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")  # always see the latest build
        super().end_headers()

    # ---- Agentation pass-through -------------------------------------------------
    def _is_proxy(self) -> bool:
        return urlsplit(self.path).path.startswith(PROXY_PREFIX + "/") or self.path == PROXY_PREFIX

    def _proxy(self) -> None:
        target = self.path[len(PROXY_PREFIX):] or "/"
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None
        headers = {k: v for k, v in self.headers.items() if k.lower() not in HOP_HEADERS}
        conn = http.client.HTTPConnection(*AGENTATION, timeout=600)
        try:
            conn.request(self.command, target, body=body, headers=headers)
            upstream = conn.getresponse()
        except OSError:
            self.send_error(502, "Agentation server is not running (reconnect it with /mcp in Claude Code)")
            return
        self.send_response(upstream.status)
        for key, value in upstream.getheaders():
            if key.lower() not in HOP_HEADERS:
                self.send_header(key, value)
        streaming = "text/event-stream" in (upstream.getheader("Content-Type") or "")
        if streaming:
            self.send_header("Connection", "close")
            self.close_connection = True
            SimpleHTTPRequestHandler.end_headers(self)
            try:  # live updates: forward each chunk as it arrives
                while chunk := upstream.read1(65536):
                    self.wfile.write(chunk)
                    self.wfile.flush()
            except (OSError, http.client.HTTPException):
                pass
        else:
            data = upstream.read()
            self.send_header("Content-Length", str(len(data)))
            SimpleHTTPRequestHandler.end_headers(self)
            self.wfile.write(data)
        conn.close()

    def do_GET(self):  # noqa: N802
        self._proxy() if self._is_proxy() else super().do_GET()

    def do_HEAD(self):  # noqa: N802
        self._proxy() if self._is_proxy() else super().do_HEAD()

    def do_POST(self):  # noqa: N802
        self._proxy() if self._is_proxy() else self.send_error(405)

    def do_PATCH(self):  # noqa: N802
        self._proxy() if self._is_proxy() else self.send_error(405)

    def do_PUT(self):  # noqa: N802
        self._proxy() if self._is_proxy() else self.send_error(405)

    def do_DELETE(self):  # noqa: N802
        self._proxy() if self._is_proxy() else self.send_error(405)

    def do_OPTIONS(self):  # noqa: N802
        self._proxy() if self._is_proxy() else self.send_error(405)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--host", default="127.0.0.1", help="use 0.0.0.0 to allow other devices on your network")
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), partial(Handler, directory=SITE))
    print(f"Nitara preview: http://localhost:{args.port}  (capabilities: /capabilities)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
