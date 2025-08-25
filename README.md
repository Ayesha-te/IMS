# IMS - Inventory Management System

A comprehensive full-stack inventory management system with React frontend and Django REST API backend, featuring multi-store support, Excel import, barcode generation, and real-time analytics.

## 🏗️ Project Structure

```
IMS/
├── backend/              # Django REST API Backend
│   ├── ims_backend/      # Main Django project settings
│   ├── accounts/         # User authentication & management
│   ├── inventory/        # Product & inventory management
│   ├── supermarkets/     # Store/supermarket management
│   ├── notifications/    # Email notifications & reminders
│   ├── pos_integration/  # POS system integration
│   ├── file_processing/  # Excel/CSV import processing
│   ├── analytics/        # Analytics and reporting
│   └── manage.py         # Django management script
├── src/                  # React Frontend
│   ├── components/       # React components
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── context/          # React context providers
│   └── features/         # Feature-specific components
├── public/               # Static assets
├── dist/                 # Built frontend files
└── docs/                 # Documentation
```

## 🚀 Features

### 🏪 Multi-Store Management
- **Single User, Multiple Stores** - Manage all your locations from one account
- **Store Hierarchy** - Main store with sub-stores organization
- **Cross-Store Operations** - Copy/move products between stores
- **Store-Specific Analytics** - Individual store performance tracking
- **Bulk Operations** - Efficient management across multiple stores

### 📦 Inventory Management
- **Product Catalog** - Comprehensive product management with categories and suppliers
- **Barcode Generation** - Automatic barcode generation and printing
- **Stock Tracking** - Real-time inventory levels and movements
- **Expiry Management** - Track expiration dates and automated alerts
- **Halal Certification** - Special support for halal product tracking

### 📊 Analytics & Reporting
- **Dashboard Analytics** - Real-time metrics and KPIs
- **Multi-Store Comparison** - Compare performance across locations
- **Inventory Reports** - Stock levels, movements, and trends
- **Financial Tracking** - Revenue, costs, and profit margins
- **Export Capabilities** - Excel and PDF report generation

### 📁 File Processing
- **Excel Import** - Bulk product import from Excel/CSV files
- **Smart Column Mapping** - Automatic detection of product fields
- **Name-to-ID Conversion** - Convert category/supplier names to database IDs
- **Error Handling** - Comprehensive validation and error reporting
- **Template Downloads** - Pre-formatted import templates

### 🔔 Notifications & Alerts
- **Low Stock Alerts** - Automated notifications for low inventory
- **Expiry Reminders** - Email alerts for expiring products
- **Custom Notifications** - Configurable alert preferences
- **Email Templates** - Professional branded email notifications

### 🔌 Integrations
- **POS System Integration** - Connect with popular POS systems
- **API Support** - RESTful API for third-party integrations
- **Barcode Scanning** - Mobile barcode scanning capabilities
- **Image Processing** - OCR for product information extraction

## 🚀 Quick Start

### Prerequisites
- **Frontend**: Node.js 18+, npm/yarn
- **Backend**: Python 3.11+, pip
- **Database**: SQLite (development) / PostgreSQL (production)
- **Optional**: Redis (for caching and task queue)

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The frontend will be available at `http://localhost:5173`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

## 🔧 Configuration

### Frontend Configuration (`src/config/api.ts`)
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',  // Backend URL
  TIMEOUT: 30000,
  ENDPOINTS: {
    AUTH: '/api/auth',
    INVENTORY: '/api/inventory',
    SUPERMARKETS: '/api/supermarkets',
    // ... other endpoints
  }
};
```

### Backend Configuration (`backend/.env`)
```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# CORS Settings (for frontend)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 🏪 Multi-Store Features

### Store Management
- **Main Store**: Primary store created during user registration
- **Sub-Stores**: Additional locations under the main store
- **Store Profiles**: Manage store details, locations, and contact information
- **Store Status**: Active/inactive store management

### Product Operations
- **Store Assignment**: Assign products to specific stores during creation
- **Product Duplication**: Copy products to multiple stores with one click
- **Cross-Store Movement**: Move products between stores
- **Bulk Operations**: Select multiple products and perform batch operations

### Analytics
- **Store Comparison**: Compare performance metrics across all stores
- **Individual Analytics**: Detailed analytics for each store
- **Combined Reports**: Generate reports across all stores or specific stores
- **Performance Tracking**: Monitor sales, inventory, and profitability by store

## 📚 API Documentation

### Authentication
```
POST /api/auth/register/     # User registration
POST /api/auth/login/        # User login
POST /api/auth/refresh/      # Refresh JWT token
GET  /api/auth/user/         # Get current user profile
```

### Inventory Management
```
GET    /api/inventory/products/              # List products
POST   /api/inventory/products/              # Create product
GET    /api/inventory/products/{id}/         # Get product details
PUT    /api/inventory/products/{id}/         # Update product
DELETE /api/inventory/products/{id}/         # Delete product
POST   /api/inventory/products/bulk/         # Bulk operations
```

### Multi-Store Operations
```
GET    /api/supermarkets/                    # List all stores
POST   /api/supermarkets/                    # Create new store
POST   /api/supermarkets/{id}/sub-stores/    # Create sub-store
POST   /api/inventory/products/copy-stores/  # Copy products between stores
POST   /api/inventory/products/move-stores/  # Move products between stores
```

### File Processing
```
POST   /api/file-processing/upload/         # Upload Excel/CSV file
GET    /api/file-processing/mappings/       # Get name-to-ID mappings
POST   /api/file-processing/convert/        # Convert names to IDs
POST   /api/inventory/products/import/      # Import processed products
```

## 🧪 Testing

### Frontend Testing
```bash
npm run test          # Run tests
npm run test:coverage # Run with coverage
npm run lint          # Lint code
```

### Backend Testing
```bash
cd backend
python manage.py test                    # Run all tests
python manage.py test inventory         # Run specific app tests
coverage run --source='.' manage.py test # Run with coverage
coverage report                         # View coverage report
```

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to static hosting (Netlify, Vercel, etc.)
# Upload dist/ folder contents
```

### Backend Deployment

**Render/Heroku:**
```bash
# Already configured with Procfile and requirements.txt
# Set environment variables in platform dashboard
# Deploy from GitHub repository
```

**Manual Server:**
```bash
cd backend
pip install -r requirements-production.txt
python manage.py collectstatic
python manage.py migrate
gunicorn ims_backend.wsgi:application
```

## 📱 Mobile Support

The application is fully responsive and works on:
- **Desktop**: Full feature set with optimized layouts
- **Tablet**: Touch-friendly interface with adapted navigation
- **Mobile**: Mobile-first design with swipe gestures and touch controls
- **PWA Support**: Can be installed as a Progressive Web App

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for frontend-backend communication
- **Input Validation**: Comprehensive data validation on both ends
- **SQL Injection Protection**: Django ORM prevents SQL injection
- **XSS Protection**: React's built-in XSS protection
- **Rate Limiting**: API rate limiting for abuse prevention

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Implement your feature
4. **Add tests**: Write tests for new functionality
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**: Submit your changes for review

### Development Guidelines
- Follow React and Django best practices
- Write comprehensive tests
- Update documentation for new features
- Use TypeScript for frontend development
- Follow PEP 8 for Python code

## 📞 Support & Documentation

### Getting Help
- **Frontend Issues**: Check React components and API service files
- **Backend Issues**: Review Django logs in `backend/logs/`
- **API Issues**: Use the API documentation at `/api/schema/swagger-ui/`
- **Database Issues**: Check migrations and model definitions

### Additional Documentation
- **Multi-Store Guide**: `MULTI_STORE_GUIDE.md`
- **Backend API**: `backend/README.md`
- **Deployment Guide**: `backend/DEPLOYMENT_GUIDE.md`
- **File Processing**: `BULK_IMPORT_README.md`

## 🔄 Version History

### v2.0.0 - Multi-Store Release
- ✅ Multi-store management for single users
- ✅ Enhanced product catalog with cross-store operations
- ✅ Advanced bulk operations and filtering
- ✅ Improved analytics and reporting
- ✅ Mobile-responsive design updates

### v1.0.0 - Initial Release
- ✅ Single-store inventory management
- ✅ Product catalog and forms
- ✅ Excel import/export functionality
- ✅ Barcode generation and printing
- ✅ Basic analytics and reporting
- ✅ User authentication and management

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ready to manage your inventory across multiple stores! 🏪📊**

For detailed setup instructions, see the respective README files in the `backend/` directory and the frontend documentation.