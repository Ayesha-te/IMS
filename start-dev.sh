#!/bin/bash

echo "========================================"
echo "   IMS - Inventory Management System"
echo "========================================"
echo
echo "Choose what to start:"
echo "1. Frontend only (React + Vite)"
echo "2. Backend only (Django API)"
echo "3. Both Frontend and Backend"
echo "4. Setup Backend (first time)"
echo "5. Setup Frontend (first time)"
echo
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo
        echo "Starting Frontend Development Server..."
        echo "Frontend will be available at: http://localhost:5173"
        echo
        npm run dev
        ;;
    2)
        echo
        echo "Starting Backend Development Server..."
        echo "Backend API will be available at: http://localhost:8000"
        echo
        cd backend
        python manage.py runserver
        ;;
    3)
        echo
        echo "Starting Both Frontend and Backend..."
        echo "Frontend: http://localhost:5173"
        echo "Backend API: http://localhost:8000"
        echo
        echo "Starting Backend in background..."
        cd backend
        python manage.py runserver &
        BACKEND_PID=$!
        cd ..
        sleep 3
        echo "Starting Frontend..."
        npm run dev
        # Kill backend when frontend stops
        kill $BACKEND_PID 2>/dev/null
        ;;
    4)
        echo
        echo "Setting up Backend (Django)..."
        echo
        cd backend
        echo "Creating virtual environment..."
        python -m venv venv
        echo
        echo "Activating virtual environment..."
        source venv/bin/activate
        echo
        echo "Installing Python dependencies..."
        pip install -r requirements.txt
        echo
        echo "Setting up environment file..."
        if [ ! -f .env ]; then
            cp .env.example .env
            echo "Please edit backend/.env with your configuration"
        fi
        echo
        echo "Running database migrations..."
        python manage.py migrate
        echo
        echo "Creating superuser (optional)..."
        read -p "Create superuser now? (y/n): " create_super
        if [[ $create_super == "y" || $create_super == "Y" ]]; then
            python manage.py createsuperuser
        fi
        echo
        echo "Backend setup complete!"
        echo "Run this script again and choose option 2 to start the backend."
        ;;
    5)
        echo
        echo "Setting up Frontend (React + TypeScript)..."
        echo
        echo "Installing Node.js dependencies..."
        npm install
        echo
        echo "Frontend setup complete!"
        echo "Run this script again and choose option 1 to start the frontend."
        ;;
    *)
        echo
        echo "Invalid choice. Please run the script again and choose 1-5."
        ;;
esac

echo
echo "Script finished."