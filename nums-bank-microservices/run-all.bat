@echo off
title NUMS Bank Microservices Orchestrator
color 0B
echo =====================================================================
echo          NUMS Bank Microservices Orchestration Controller
echo =====================================================================
echo [INFO] Step 1: Building all Maven sub-modules...
echo [INFO] This might take a minute. Please wait...
echo =====================================================================
call mvn clean package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo =====================================================================
    echo [ERROR] Maven build failed! Please check code or database connection.
    echo =====================================================================
    pause
    exit /b %ERRORLEVEL%
)

echo =====================================================================
echo [SUCCESS] Maven build completed successfully.
echo [INFO] Step 2: Starting all Microservices...
echo =====================================================================

echo [STARTING] Auth Service on port 8081...
start "Auth Service - Port 8081" cmd /k "title Auth Service [8081] && cd auth-service && java -jar target\auth-service-1.0.0.jar"
timeout /t 5

echo [STARTING] Account Service on port 8082...
start "Account Service - Port 8082" cmd /k "title Account Service [8082] && cd account-service && java -jar target\account-service-1.0.0.jar"
timeout /t 3

echo [STARTING] Transaction Service on port 8083...
start "Transaction Service - Port 8083" cmd /k "title Transaction Service [8083] && cd transaction-service && java -jar target\transaction-service-1.0.0.jar"
timeout /t 3

echo [STARTING] Loan Service on port 8084...
start "Loan Service - Port 8084" cmd /k "title Loan Service [8084] && cd loan-service && java -jar target\loan-service-1.0.0.jar"
timeout /t 3

echo [STARTING] Admin Service on port 8085...
start "Admin Service - Port 8085" cmd /k "title Admin Service [8085] && cd admin-service && java -jar target\admin-service-1.0.0.jar"
timeout /t 3

echo [STARTING] API Gateway on port 8080...
start "API Gateway - Port 8080" cmd /k "title API Gateway [8080] && cd api-gateway && java -jar target\api-gateway-1.0.0.jar"

echo =====================================================================
echo [SUCCESS] All NUMS Bank microservices have been launched.
echo [INFO] API Gateway Port: 8080
echo [INFO] React Frontend expects backend at: http://localhost:8080/api/...
echo =====================================================================
echo Keep this window open if you wish to monitor them, or close it.
echo =====================================================================
pause
