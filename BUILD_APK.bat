@echo off
echo ================================================
echo E-Voting Mobile App - APK Builder
echo ================================================
echo.
echo This will build the APK file for your mobile app.
echo It will take 15-20 minutes. Please be patient!
echo.
echo Starting build process...
echo.

REM Navigate to project directory
cd /d "D:\Wazar Project\UniversityEVotingApp"

echo [Step 1/4] Checking dependencies...
call npm install --silent
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [Step 2/4] Dependencies installed successfully!
echo.

echo [Step 3/4] Building APK... This takes 10-15 minutes!
echo Please wait... Do not close this window!
echo.

cd android
call gradlew.bat clean assembleDebug

if errorlevel 1 (
    echo.
    echo ================================================
    echo BUILD FAILED!
    echo ================================================
    echo.
    echo Please check the error messages above.
    echo You may need to:
    echo - Install Android SDK
    echo - Set ANDROID_HOME environment variable
    echo - Or use Android Studio to build instead
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo BUILD SUCCESSFUL!
echo ================================================
echo.
echo Your APK file is located at:
echo D:\Wazar Project\UniversityEVotingApp\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo [Step 4/4] Opening APK folder...
echo.

REM Open the folder containing the APK
start "" "D:\Wazar Project\UniversityEVotingApp\android\app\build\outputs\apk\debug"

echo.
echo SUCCESS! You can now:
echo 1. Copy app-debug.apk to your phone
echo 2. Install it on your Android device
echo 3. Open the E-Voting app!
echo.
echo Press any key to exit...
pause >nul

