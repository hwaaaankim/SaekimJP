@echo off
setlocal EnableExtensions DisableDelayedExpansion

rem Recover the file renamed incorrectly by the previous command
if exist "!number!.png" (
    if not exist "1.png" (
        ren "!number!.png" "1.png"
    )
)

setlocal EnableDelayedExpansion

for %%F in ("*(1080_1080).png") do (
    if exist "%%~fF" (
        set "base=%%~nF"
        set "new=!base:* =!"
        set "new=!new:~0,-11!"

        if not exist "!new!%%~xF" (
            ren "%%~fF" "!new!%%~xF"
        )
    )
)

endlocal
endlocal

echo Rename completed.
pause