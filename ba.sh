timeout 5h bash -c '
while true; do
    # 1. Prevent Codespace sleep
    echo "[KEEPALIVE] $(date) - Sending ping to localhost..."
    curl -s http://localhost:9090> /dev/null || echo "[WARN] $(date) - Ping failed."

    # 2. Check npm start
    if pgrep -f "npm start" > /dev/null; then
        echo "[INFO] $(date) - npm start is running..."
    else
        echo "[WARN] $(date) - npm start not found, starting now..."
        npm start &
        sleep 5 # give it time to start
    fi

    sleep 60
done
'
