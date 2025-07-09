# Backend Deployment Guide

This guide provides instructions for deploying the Canadian Cancer Society Donor Tracker backend to a production environment.

## Prerequisites

- Python 3.8 or higher
- PostgreSQL database
- Web server (e.g., Nginx, Apache)
- WSGI server (e.g., Gunicorn, uWSGI)

## Deployment Steps

### 1. Set Up Environment

Create a virtual environment and install dependencies:

```bash
cd /path/to/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/donortracker

# Security
SECRET_KEY=your_secure_secret_key
JWT_SECRET_KEY=your_secure_jwt_secret
JWT_ACCESS_TOKEN_EXPIRES=1800  # 30 minutes in seconds

# Email Configuration (for password reset)
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password
MAIL_DEFAULT_SENDER=no-reply@example.com

# Application Configuration
FLASK_ENV=production
```

Replace the placeholder values with your actual configuration.

### 3. Set Up Database

Initialize the database:

```bash
flask db upgrade
```

If needed, seed the database with initial data:

```bash
flask seed-db
```

### 4. Configure WSGI Server (Gunicorn)

Create a `wsgi.py` file in the backend directory:

```python
from app import create_app

application = create_app()

if __name__ == "__main__":
    application.run()
```

Install Gunicorn:

```bash
pip install gunicorn
```

Test Gunicorn configuration:

```bash
gunicorn --bind 0.0.0.0:5000 wsgi:application
```

### 5. Configure Web Server (Nginx)

Create an Nginx configuration file:

```nginx
server {
    listen 80;
    server_name api.canadiancancersociety-donortracker.org;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/donortracker /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### 6. Set Up Process Manager (Supervisor)

Install Supervisor:

```bash
sudo apt-get install supervisor
```

Create a Supervisor configuration file:

```ini
[program:donortracker]
directory=/path/to/backend
command=/path/to/backend/venv/bin/gunicorn --workers 4 --bind 0.0.0.0:5000 wsgi:application
autostart=true
autorestart=true
stderr_logfile=/var/log/donortracker/err.log
stdout_logfile=/var/log/donortracker/out.log
user=www-data
```

Create log directories:

```bash
sudo mkdir -p /var/log/donortracker
sudo chown www-data:www-data /var/log/donortracker
```

Enable and start the Supervisor service:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start donortracker
```

### 7. Set Up SSL (Let's Encrypt)

Install Certbot:

```bash
sudo apt-get install certbot python3-certbot-nginx
```

Obtain and configure SSL certificate:

```bash
sudo certbot --nginx -d api.canadiancancersociety-donortracker.org
```

### 8. Monitoring and Maintenance

- Set up regular database backups
- Configure application logging
- Set up monitoring for the application and server
- Implement a CI/CD pipeline for automated deployments

## Troubleshooting

- Check application logs: `/var/log/donortracker/`
- Check Nginx logs: `/var/log/nginx/`
- Check Supervisor status: `sudo supervisorctl status donortracker`
