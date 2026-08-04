@echo off
setlocal EnableExtensions DisableDelayedExpansion

for %%F in ("1 (*.png") do (
    if exist "%%~fF" call :RENAME_FILE "%%~fF"
)

echo.
echo Rename completed.
pause
exit /b

:RENAME_FILE
set "original=%~nx1"
set "base=%~n1"
set "number="

for /f "tokens=2 delims=()" %%N in ("%base%") do set "number=%%N"

if not defined number (
    echo [FAILED] "%original%"
    exit /b
)

if exist "%number%%~x1" (
    echo [SKIPPED] "%number%%~x1" already exists.
    exit /b
)

ren "%~f1" "%number%%~x1"

if errorlevel 1 (
    echo [FAILED] "%original%"
) else (
    echo [RENAMED] "%original%" to "%number%%~x1"
)

exit /b