@echo off
setlocal

:: Заливает собранную демку на сервер в sites/<slug>/.
:: Использование: deploy-site.bat <slug> <путь к собранному dist>
:: Пример:        deploy-site.bat poopseek E:\Projects\poopseek\dist

set "SLUG=%~1"
set "SRC=%~2"
if "%SLUG%"=="" goto :usage
if "%SRC%"=="" goto :usage
if not exist "%SRC%\index.html" (
    echo [x] %SRC%\index.html не найден — это точно собранный dist?
    exit /b 1
)

:: Defaults — перекрываются значениями из .env / .env.local
set "DEPLOY_HOST=127.0.0.1"
set "DEPLOY_USER=root"
set "DEPLOY_KEY=C:\ssh\key"
set "DEPLOY_PATH=aaaver-app"

for %%F in (.env .env.local) do (
    if exist "%%F" (
        for /f "usebackq tokens=1,* delims==" %%A in ("%%F") do (
            if /i "%%A"=="DEPLOY_HOST" set "DEPLOY_HOST=%%B"
            if /i "%%A"=="DEPLOY_USER" set "DEPLOY_USER=%%B"
            if /i "%%A"=="DEPLOY_KEY" set "DEPLOY_KEY=%%B"
            if /i "%%A"=="DEPLOY_PATH" set "DEPLOY_PATH=%%B"
        )
    )
)

set "REMOTE=%DEPLOY_USER%@%DEPLOY_HOST%"
set "SITES=%DEPLOY_PATH%/sites"

echo Uploading %SLUG% to %REMOTE%:%SITES%/%SLUG% ...
ssh %REMOTE% -i "%DEPLOY_KEY%" "mkdir -p %SITES% && rm -rf %SITES%/.upload-%SLUG%"
scp -i "%DEPLOY_KEY%" -r "%SRC%" %REMOTE%:%SITES%/.upload-%SLUG%
if errorlevel 1 (
    echo [x] scp не отработал, старая версия демки не тронута
    exit /b 1
)
:: атомная подмена: старая версия живёт, пока новая не долетела целиком
ssh %REMOTE% -i "%DEPLOY_KEY%" "cd %SITES% && rm -rf %SLUG% && mv .upload-%SLUG% %SLUG%"
echo Done: /%SLUG%/
exit /b 0

:usage
echo Использование: deploy-site.bat ^<slug^> ^<путь к собранному dist^>
echo Пример:        deploy-site.bat poopseek E:\Projects\poopseek\dist
exit /b 1
