# NutriSuite Deployment Guide

This guide covers deploying the NutriSuite web application to production.

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account or MongoDB instance
- Cloud storage service (AWS S3, Cloudinary, etc.) for file uploads
- Domain name and SSL certificate
- VPS or cloud hosting service (Vercel, Netlify, Heroku, etc.)

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dietience
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d
UPLOAD_PATH=../uploads
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## Database Setup

1. **MongoDB Atlas Setup:**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Create a database user
   - Whitelist your server IP addresses
   - Get the connection string

2. **Seed the Database:**
   ```bash
   cd backend
   npm run seed
   ```

## File Storage

### Option 1: Local Storage (Development)
- Files are stored in the `uploads/` directory
- Ensure the directory has proper write permissions

### Option 2: Cloud Storage (Production)
- Configure AWS S3, Cloudinary, or similar service
- Update the file upload logic in `backend/routes/dietPlans.js`
- Update file serving in `backend/server.js`

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

1. **Deploy Frontend:**
   ```bash
   cd frontend
   npm run build
   # Deploy to Vercel
   ```

2. **Deploy Backend:**
   - Use Railway, Render, or similar service
   - Set environment variables
   - Deploy the backend code

### Option 2: Docker Deployment

1. **Create Dockerfile for Backend:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Create Dockerfile for Frontend:**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/out /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **Docker Compose:**
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongo:27017/dietience
       depends_on:
         - mongo
     
     frontend:
       build: ./frontend
       ports:
         - "3000:80"
       depends_on:
         - backend
     
     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db

   volumes:
     mongo_data:
   ```

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use strong, unique JWT secrets
   - Rotate secrets regularly

2. **File Upload Security:**
   - Validate file types and sizes
   - Scan uploaded files for malware
   - Use secure file storage

3. **API Security:**
   - Implement rate limiting
   - Use HTTPS in production
   - Validate all inputs
   - Implement proper CORS settings

4. **Database Security:**
   - Use strong database passwords
   - Enable MongoDB authentication
   - Restrict database access by IP

## Performance Optimization

1. **Frontend:**
   - Enable Next.js production optimizations
   - Use CDN for static assets
   - Implement image optimization
   - Enable compression

2. **Backend:**
   - Use PM2 for process management
   - Implement caching (Redis)
   - Optimize database queries
   - Use connection pooling

3. **Database:**
   - Create proper indexes
   - Monitor query performance
   - Use MongoDB Atlas monitoring

## Monitoring and Logging

1. **Application Monitoring:**
   - Use services like Sentry for error tracking
   - Implement health check endpoints
   - Monitor API response times

2. **Logging:**
   - Use structured logging (Winston)
   - Log important events
   - Monitor for security issues

## Backup Strategy

1. **Database Backups:**
   - Enable MongoDB Atlas automated backups
   - Test restore procedures regularly

2. **File Backups:**
   - Backup uploaded files regularly
   - Use versioning for important files

## SSL/TLS Configuration

1. **Obtain SSL Certificate:**
   - Use Let's Encrypt for free certificates
   - Or purchase from a trusted CA

2. **Configure HTTPS:**
   - Redirect HTTP to HTTPS
   - Use secure headers
   - Enable HSTS

## Scaling Considerations

1. **Horizontal Scaling:**
   - Use load balancers
   - Implement session management
   - Use stateless architecture

2. **Database Scaling:**
   - Use MongoDB sharding
   - Implement read replicas
   - Monitor performance metrics

## Maintenance

1. **Regular Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in staging

2. **Monitoring:**
   - Set up alerts for critical issues
   - Monitor resource usage
   - Track user metrics

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Check CORS configuration in backend
   - Verify API URL in frontend

2. **File Upload Issues:**
   - Check file permissions
   - Verify upload directory exists
   - Check file size limits

3. **Database Connection:**
   - Verify MongoDB URI
   - Check network connectivity
   - Verify authentication credentials

4. **Authentication Issues:**
   - Check JWT secret
   - Verify token expiration
   - Check cookie settings

For more help, check the application logs and monitor the health endpoints.
