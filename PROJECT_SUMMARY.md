# 🍎 NutriSuite - Complete Diet Management Web Application

## Project Overview

NutriSuite is a comprehensive full-stack web application designed for diet management and nutrition tracking. It features separate dashboards for clients and nutritionists (admins), enabling personalized diet plan management, progress tracking, and communication.

## ✨ Key Features

### 🔐 Authentication System
- JWT-based authentication with role-based access control
- Secure password hashing with bcrypt
- Client and Admin role separation
- Protected routes and API endpoints

### 🏠 Landing Page
- Modern, responsive marketing page
- Hero section with clear value proposition
- Services overview and testimonials
- About section featuring the nutritionist
- Call-to-action buttons for registration/login

### 👤 Client Dashboard
- **Diet Plans**: View and download assigned nutrition plans (PDF)
- **Messages**: Receive and read notes from nutritionist
- **Weekly Updates**: Submit progress reports with weight, mood, and photos
- **Update History**: Track progress over time with visual analytics
- **Progress Tracking**: Monitor weight changes and mood trends

### 👨‍⚕️ Admin Dashboard
- **Client Management**: Create, edit, and manage client accounts
- **Diet Plan Management**: Upload PDF plans and assign to clients
- **Update Review**: Review client submissions and provide feedback
- **Messaging System**: Send notes and guidance to clients
- **Analytics**: Overview of client progress and engagement

### 📁 File Management
- PDF upload for diet plans (10MB limit)
- Image upload for progress photos (5MB limit)
- Secure file storage with proper validation
- Download and preview functionality

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: Radix UI components with custom styling
- **Styling**: TailwindCSS for responsive design
- **Animations**: Framer Motion for smooth interactions
- **State Management**: React Context for authentication
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt
- **File Upload**: Multer for handling multipart/form-data
- **Validation**: Express-validator for input validation
- **Security**: Helmet, CORS, and rate limiting
- **Environment**: dotenv for configuration

### Database Schema
```javascript
// Users Collection
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'client' | 'admin',
  isActive: Boolean,
  lastLogin: Date,
  profileImage: String
}

// DietPlans Collection
{
  title: String,
  description: String,
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  assignedUsers: [ObjectId],
  createdBy: ObjectId,
  isActive: Boolean,
  tags: [String]
}

// Notes Collection
{
  user: ObjectId,
  message: String,
  createdBy: ObjectId,
  isRead: Boolean,
  priority: 'low' | 'medium' | 'high'
}

// WeeklyUpdates Collection
{
  user: ObjectId,
  weight: Number,
  mood: 'excellent' | 'good' | 'okay' | 'poor' | 'terrible',
  photoUrl: String,
  notes: String,
  weekStartDate: Date,
  isReviewed: Boolean,
  adminFeedback: String
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd dietience
   node setup.js
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Configuration**
   - Backend: `backend/.env` (created by setup.js)
   - Frontend: `frontend/.env.local` (created by setup.js)

4. **Database Setup**
   ```bash
   cd backend
   npm run seed
   ```

5. **Start Development Servers**
   ```bash
   # From root directory
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Demo Accounts
- **Admin**: admin@dietience.com / admin123
- **Client**: john@example.com / password123

## 📁 Project Structure

```
dietience/
├── backend/                 # Express.js API server
│   ├── models/             # MongoDB models
│   ├── routes/             # API route handlers
│   ├── middleware/          # Authentication & validation
│   ├── scripts/            # Database seeding
│   └── server.js           # Main server file
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context providers
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── uploads/                # File storage directory
├── package.json            # Root package configuration
└── README.md              # Project documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Diet Plans
- `GET /api/diet-plans` - Get diet plans
- `POST /api/diet-plans` - Create diet plan (admin)
- `PUT /api/diet-plans/:id` - Update diet plan (admin)
- `DELETE /api/diet-plans/:id` - Delete diet plan (admin)

### Weekly Updates
- `GET /api/updates` - Get weekly updates
- `POST /api/updates` - Submit weekly update (client)
- `PUT /api/updates/:id` - Update weekly update (client)
- `PUT /api/updates/:id/feedback` - Add admin feedback
- `DELETE /api/updates/:id` - Delete weekly update

### Notes
- `GET /api/notes` - Get notes
- `POST /api/notes` - Send note (admin)
- `PUT /api/notes/:id/read` - Mark note as read
- `DELETE /api/notes/:id` - Delete note (admin)

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Blue and purple gradients with semantic colors
- **Typography**: Inter font family for readability
- **Components**: Consistent Radix UI components
- **Responsive**: Mobile-first design with TailwindCSS
- **Accessibility**: Proper ARIA labels and keyboard navigation

### User Experience
- **Intuitive Navigation**: Clear sidebar navigation for both roles
- **Real-time Feedback**: Loading states and success/error messages
- **Data Visualization**: Progress tracking with charts and trends
- **File Management**: Easy upload, preview, and download functionality
- **Communication**: Seamless messaging between clients and nutritionists

## 🔒 Security Features

- **Authentication**: JWT tokens with secure secret keys
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Type and size validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Proper cross-origin resource sharing
- **Helmet Security**: Security headers for protection

## 📊 Performance Optimizations

- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js built-in image optimization
- **Lazy Loading**: Components loaded on demand
- **Caching**: Proper HTTP caching headers
- **Database Indexing**: Optimized MongoDB queries
- **File Compression**: Gzip compression for responses

## 🧪 Testing & Quality

- **TypeScript**: Type safety throughout the application
- **ESLint**: Code quality and consistency
- **Error Handling**: Comprehensive error handling
- **Input Validation**: Both client and server-side validation
- **Security Headers**: Proper security configuration

## 🚀 Deployment

The application is ready for deployment with:
- Environment variable configuration
- Production build optimization
- Docker support (see DEPLOYMENT.md)
- Cloud deployment guides
- Database migration scripts

## 📈 Future Enhancements

- **Real-time Notifications**: WebSocket integration
- **Advanced Analytics**: Detailed progress charts
- **Mobile App**: React Native companion app
- **AI Integration**: Smart meal recommendations
- **Payment Integration**: Subscription management
- **Video Consultations**: Built-in video calling
- **Recipe Database**: Integrated recipe management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API endpoints
- Check the deployment guide
- Open an issue on GitHub

---

**Built with ❤️ for better health and nutrition management**
