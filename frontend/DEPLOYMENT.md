# Frontend Deployment Guide

This guide provides instructions for deploying the Canadian Cancer Society Donor Tracker frontend to a production environment.

## Prerequisites

- Node.js 14.x or higher
- npm or yarn package manager
- Access to a hosting service (e.g., Netlify, Vercel, AWS S3, etc.)

## Deployment Options

### Option 1: Netlify (Recommended)

Netlify offers a simple and efficient way to deploy React applications with continuous deployment.

#### Steps:

1. **Build the application**:

   ```bash
   # Make the build script executable
   chmod +x build.sh
   
   # Run the build script
   ./build.sh
   ```

2. **Deploy to Netlify**:

   a. **Using Netlify CLI**:
   
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Initialize a new site
   netlify init
   
   # Deploy the site
   netlify deploy --prod
   ```
   
   b. **Using Netlify UI**:
   
   - Go to [Netlify](https://app.netlify.com/)
   - Sign up or log in
   - Drag and drop the `build` folder to the Netlify dashboard
   - Configure your site settings

3. **Configure environment variables**:

   In the Netlify dashboard:
   - Go to Site settings > Build & deploy > Environment
   - Add the following environment variables:
     - `REACT_APP_API_URL`: URL of your backend API
     - `REACT_APP_SESSION_TIMEOUT`: Session timeout in milliseconds (e.g., 1800000 for 30 minutes)
     - `REACT_APP_SESSION_WARNING`: Warning time before session timeout in milliseconds (e.g., 300000 for 5 minutes)

### Option 2: Vercel

Vercel is another excellent platform for deploying React applications.

#### Steps:

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy the application**:

   ```bash
   # Navigate to the project directory
   cd /path/to/frontend
   
   # Deploy to Vercel
   vercel
   ```

4. **Configure environment variables**:

   In the Vercel dashboard:
   - Go to your project > Settings > Environment Variables
   - Add the same environment variables as mentioned in the Netlify section

### Option 3: Traditional Web Server (Apache/Nginx)

You can also deploy the React application to a traditional web server.

#### Steps:

1. **Build the application**:

   ```bash
   # Make the build script executable
   chmod +x build.sh
   
   # Run the build script
   ./build.sh
   ```

2. **Configure Nginx**:

   Create an Nginx configuration file:

   ```nginx
   server {
       listen 80;
       server_name donortracker.canadiancancersociety.org;
       root /path/to/frontend/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Proxy API requests to the backend server
       location /api {
           proxy_pass http://api.canadiancancersociety-donortracker.org;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable the site and restart Nginx**:

   ```bash
   sudo ln -s /etc/nginx/sites-available/donortracker /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

4. **Set up SSL (Let's Encrypt)**:

   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d donortracker.canadiancancersociety.org
   ```

## Post-Deployment Tasks

### 1. Test the Deployed Application

- Verify that all routes work correctly
- Test authentication flows (login, logout, password reset)
- Ensure API calls to the backend are working
- Test session timeout functionality

### 2. Set Up Monitoring

- Configure error tracking (e.g., Sentry)
- Set up performance monitoring
- Configure alerts for critical issues

### 3. Implement CI/CD Pipeline

For automated deployments, consider setting up a CI/CD pipeline using:
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI

Example GitHub Actions workflow:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install Dependencies
      run: npm install
      
    - name: Run Tests
      run: npm test
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Troubleshooting

### Common Issues and Solutions

1. **API Connection Issues**:
   - Verify that the `REACT_APP_API_URL` environment variable is set correctly
   - Check CORS configuration on the backend
   - Ensure the API server is running and accessible

2. **Routing Issues**:
   - Ensure that the server is configured to serve `index.html` for all routes
   - Check that the `BrowserRouter` is configured correctly in the application

3. **Authentication Issues**:
   - Verify that the JWT token is being stored and sent correctly
   - Check that the session timeout settings are appropriate

4. **Performance Issues**:
   - Use code splitting to reduce bundle size
   - Implement lazy loading for routes
   - Optimize images and assets
