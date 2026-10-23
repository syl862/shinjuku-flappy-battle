@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:8011 in your browser.
echo Keep this window open. Press Ctrl+C to stop the server.
python -m http.server 8011 --bind 127.0.0.1
pause
