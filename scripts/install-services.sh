#!/bin/bash

echo "🚀 Installing Guess The Jam system services..."

# Create systemd service for WebSocket server
sudo tee /etc/systemd/system/guess-the-jam-websocket.service > /dev/null <<EOF
[Unit]
Description=Guess The Jam WebSocket Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which pnpm) run websocket
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=WEBSOCKET_PORT=3001

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for Next.js app
sudo tee /etc/systemd/system/guess-the-jam-nextjs.service > /dev/null <<EOF
[Unit]
Description=Guess The Jam Next.js App
After=network.target guess-the-jam-websocket.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which pnpm) start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable services
sudo systemctl daemon-reload
sudo systemctl enable guess-the-jam-websocket
sudo systemctl enable guess-the-jam-nextjs

echo "✅ Services installed and enabled!"
echo "🚀 Starting services..."
sudo systemctl start guess-the-jam-websocket
sudo systemctl start guess-the-jam-nextjs

echo "📊 Service status:"
sudo systemctl status guess-the-jam-websocket --no-pager -l
echo ""
sudo systemctl status guess-the-jam-nextjs --no-pager -l

echo ""
echo "🎮 Your servers are now running automatically!"
echo "🌐 Next.js app: http://localhost:3000"
echo "📡 WebSocket server: ws://localhost:3001"
echo ""
echo "💡 Commands:"
echo "  sudo systemctl start guess-the-jam-websocket    # Start WebSocket server"
echo "  sudo systemctl start guess-the-jam-nextjs      # Start Next.js app"
echo "  sudo systemctl stop guess-the-jam-websocket    # Stop WebSocket server"
echo "  sudo systemctl stop guess-the-jam-nextjs       # Stop Next.js app"
echo "  sudo systemctl restart guess-the-jam-websocket # Restart WebSocket server"
echo "  sudo systemctl restart guess-the-jam-nextjs    # Restart Next.js app"
