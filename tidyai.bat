@echo off
setlocal

REM Check if TIDYAI_API_KEY is set
if "%TIDYAI_API_KEY%"=="" (
    echo Warning: TIDYAI_API_KEY environment variable is not set.
    echo The application will use default folder suggestions.
    echo.
)

REM If no folder path is provided, just run the application to show help
if "%1"=="" (
    echo Usage: %0 [folder_path]
    echo Example: %0 "C:\Users\YourName\Downloads"
    echo.
    echo Drag and drop a folder onto this batch file to organize it.
    echo.
    tidyai-win.exe
    echo.
    pause
    exit /b
)

REM Run the TidyAI application
tidyai-win.exe %1

echo.
echo Organization complete.
pause