@echo off
echo ========================================
echo    IMS - Inventory Management System
echo ========================================
echo.
echo Choose what to start:
echo 1. Frontend only (React + Vite)
echo 2. Backend only (Django API)
echo 3. Both Frontend and Backend
echo 4. Setup Backend (first time)
echo 5. Setup Frontend (first time)
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto frontend
if "%choice%"=="2" goto backend
if "%choice%"=="3" goto both
if "%choice%"=="4" goto setup_backend
if "%choice%"=="5" goto setup_frontend
goto invalid

:frontend
echo.
echo Starting Frontend Development Server...
echo Frontend will be available at: http://localhost:5173
echo.
npm run dev
goto end

:backend
echo.
echo Starting Backend Development Server...
echo Backend API will be available at: http://localhost:8000
echo.
cd backend
python manage.py runserver
goto end

:both
echo.
echo Starting Both Frontend and Backend...
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo.
echo Starting Backend in background...
start /B cmd /c "cd backend && python manage.py runserver"
timeout /t 3 /nobreak > nul
echo Starting Frontend...
npm run dev
goto end

:setup_backend
echo.
echo Setting up Backend (Django)...
echo.
cd backend
echo Creating virtual environment...
python -m venv venv
echo.
echo Activating virtual environment...
call venv\Scripts\activate
echo.
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo Please edit backend\.env with your configuration
)
echo.
echo Running database migrations...
python manage.py migrate
echo.
echo Creating superuser (optional)...
set /p create_super="Create superuser now? (y/n): "
if /i "%create_super%"=="y" python manage.py createsuperuser
echo.
echo Backend setup complete!
echo Run this script again and choose option 2 to start the backend.
pause
goto end

:setup_frontend
echo.
echo Setting up Frontend (React + TypeScript)...
echo.
echo Installing Node.js dependencies...
npm install
echo.
echo Frontend setup complete!
echo Run this script again and choose option 1 to start the frontend.
pause
goto end

:invalid
echo.
echo Invalid choice. Please run the script again and choose 1-5.
pause
goto end

:end
echo.
echo Script finished.
pause