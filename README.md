# CCTV_BACKEND
A robust NestJS backend project for managing and controlling CCTV mobile application.
It provides APIs for device control, authentication, and configuration.

📂 Table of Contents

About

Features

Installation

Configuration

Running the Project

API Documentation

Technologies

Contributing

License

📝 About

CCTV_BACKEND is a NestJS-based backend application that acts as the core server for a CCTV management system.
It handles device control, video stream access, authentication, and system configuration.

⚡ Features

RESTful API architecture using NestJS

JWT-based authentication and role-based access control

Database integration with PostgreSQL

Modular structure for scalability

Swagger API documentation

Environment-based configuration for flexibility

💻 Installation

Prerequisites:

Node.js v16 or later

npm or yarn

PostgreSQL

Docker (optional)

Steps:

# Clone the repository
git clone https://github.com/your-username/CCTV_BACKEND.git
cd CCTV_BACKEND

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

⚙ Configuration

Your .env file should look like this:

APP_NAME=central-backend
NODE_ENV=development

PORT=3020

# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cctv_main
DB_USER=postgres
DB_PASS=root
DB_SSL=false
DB_POOL_MAX=10
DB_IDLE_MS=30000
DB_CONN_MS=5000

# SQL sanitization
SQLI_MAX_BYTES=1048576
SQLI_LOG=warn
SQLI_EXCLUDE=/^\/api\/v1\/health/,/^\/docs

# JWT configuration
JWT_SECRET=llmkjhgasdiuoe12344321qwertyhtrgfi
JWT_EXPIRATION=3600s

🚀 Running the Project
Development
npm run start:dev

Production
npm run build
npm run start:prod

Using Docker
docker-compose up --build

📄 API Documentation

Swagger API docs are available at:

http://localhost:3020/docs

🛠 Technologies

NestJS

TypeORM

PostgreSQL

JWT

Swagger

🤝 Contributing

Contributions are welcome!
Please fork the repository and submit a pull request with your changes.
Check CONTRIBUTING.md
 for more guidelines.

📜 License

This project is licensed under the MIT License