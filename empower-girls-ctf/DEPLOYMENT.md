# AWS EC2 Deployment Guide

## Initial Setup (One-Time)

### 1. Launch EC2 Instance
1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu Server 22.04 LTS**
3. Instance type: **t2.small** (t2.micro may be too slow)
4. Configure Security Group:
   - SSH (22) - Your IP only
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
5. Create/select key pair and download it
6. Launch instance

### 2. Connect to EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR-EC2-IP
```

### 3. Install Docker on EC2
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Log out and back in for group changes to take effect
exit
```

### 4. Set Up Git (Recommended)
```bash
# Reconnect to EC2
ssh -i your-key.pem ubuntu@YOUR-EC2-IP

# Install git
sudo apt install git -y

# Clone your repository
git clone YOUR-REPO-URL
cd empower-girls-ctf
```

**OR** Upload files manually:
```bash
# On your local machine
scp -i your-key.pem -r empower-girls-ctf ubuntu@YOUR-EC2-IP:~/
```

### 5. Configure Environment
```bash
cd ~/empower-girls-ctf

# Copy environment file
cp .env.example .env

# Edit with your secret key
nano .env
# Change SECRET_KEY to a random string
```

### 6. Initial Deployment
```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 7. Set Up Nginx (Optional but Recommended)
```bash
# Install nginx
sudo apt install nginx -y

# Create nginx config
sudo nano /etc/nginx/sites-available/ctf
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR-DOMAIN-OR-IP;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/ctf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Access Your App
Open browser: `http://YOUR-EC2-IP` or `http://YOUR-DOMAIN`

---

## Updating the App (Super Easy!)

### Method 1: Using Git (Recommended)
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR-EC2-IP

# Navigate to app directory
cd ~/empower-girls-ctf

# Run deploy script
./deploy.sh
```

That's it! The script will:
- Pull latest code from git
- Rebuild Docker containers
- Restart the app
- Show you the status

### Method 2: Manual File Upload
```bash
# On your local machine, upload changed files
scp -i your-key.pem -r empower-girls-ctf/templates ubuntu@YOUR-EC2-IP:~/empower-girls-ctf/
scp -i your-key.pem -r empower-girls-ctf/static ubuntu@YOUR-EC2-IP:~/empower-girls-ctf/

# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR-EC2-IP

# Restart containers
cd ~/empower-girls-ctf
docker-compose restart
```

---

## Useful Commands

### View Logs
```bash
docker-compose logs -f
```

### Restart App
```bash
docker-compose restart
```

### Stop App
```bash
docker-compose down
```

### Start App
```bash
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
```

### Access Database
```bash
docker-compose exec web python
>>> from app import db, Team
>>> teams = Team.query.all()
>>> for team in teams: print(team.name, team.score)
```

### Clear Database (Reset)
```bash
docker-compose down
rm -rf instance/ctf.db
docker-compose up -d
```

---

## Troubleshooting

### App not accessible
```bash
# Check if container is running
docker-compose ps

# Check logs
docker-compose logs

# Check nginx
sudo systemctl status nginx
sudo nginx -t
```

### Port already in use
```bash
# Find what's using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 PID
```

### Out of disk space
```bash
# Clean up old Docker images
docker system prune -a
```

---

## Cost Estimate

- **t2.small EC2**: ~$17/month
- **t2.micro EC2**: ~$8.50/month (free tier eligible for 12 months)
- **Elastic IP**: Free if attached to running instance
- **Data transfer**: Usually negligible for small apps

---

## Security Recommendations

1. **Change SECRET_KEY** in .env file
2. **Restrict SSH** to your IP only in Security Group
3. **Set up SSL** with Let's Encrypt (free):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```
4. **Enable firewall**:
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```
5. **Regular updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
