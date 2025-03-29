# AI Chatbot Platform

A web-based AI chatbot platform that offers advanced document processing, multi-model AI interactions, and comprehensive admin management.

## Features

- **Groq API Integration**: Fast AI responses through the Groq API
- **Document Processing**: PDF and image uploads with OCR capabilities
- **Admin Dashboard**: Complete analytics and system management
- **Webhook System**: Automated notification system for external integrations
- **User Achievement System**: Gamified experience with badges and rewards

## Deployment Guide for cPanel

### Prerequisites

- A cPanel hosting account with Node.js support (Node.js 18+ recommended)
- Access to a PostgreSQL database or MySQL database
- SSH access to your hosting (for initial setup)

### Step 1: Prepare Your Application

1. Clone this repository to your local machine:
   ```
   git clone https://github.com/yourusername/ai-chatbot-platform.git
   cd ai-chatbot-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a production build:
   ```
   npm run build
   ```

### Step 2: Set Up Database Connection

1. Log into your cPanel account and create a new PostgreSQL database.
2. Note down the database name, username, password, and host.
3. Update the database connection details in your application by creating a `.env` file with:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   GROQ_API_KEY=your_groq_api_key
   ```

### Step 3: Upload Files to cPanel

1. Compress your application folder (excluding node_modules):
   ```
   zip -r application.zip . -x "node_modules/*"
   ```

2. In cPanel, navigate to File Manager and upload the zip file to your desired directory.
3. Extract the zip file through the cPanel File Manager.

### Step 4: Set Up Node.js Application

1. In cPanel, go to "Setup Node.js App".
2. Set the application path to your extracted folder.
3. Set the Application mode to "Production".
4. For the Application URL, choose your domain or subdomain.
5. Set the Application startup file to `server/index.js`.
6. Define the following environment variables:
   - NODE_ENV=production
   - PORT=8080 (or your preferred port)
   - DATABASE_URL=postgresql://username:password@host:port/database
   - GROQ_API_KEY=your_groq_api_key

### Step 5: Install Dependencies and Start Application

1. Connect to your server via SSH:
   ```
   ssh username@yourdomain.com
   ```

2. Navigate to your application directory:
   ```
   cd /path/to/your/application
   ```

3. Install production dependencies:
   ```
   npm install --production
   ```

4. Start your application:
   ```
   npm start
   ```

### Step 6: Set Up Persistent Process Management

For keeping your Node.js application running persistently:

1. In cPanel, navigate to "Setup Node.js App".
2. Enable "Run application in the background".
3. Set up a cron job to ensure the application restarts if it crashes:
   - Go to "Cron Jobs" in cPanel
   - Add a new cron job that runs every 10 minutes:
     ```
     */10 * * * * curl http://yourdomain.com/api/health > /dev/null 2>&1
     ```

### Data Persistence

This application is designed to persist data across sessions through:

1. Database storage for all user data, conversations, and uploaded documents
2. File system storage for uploaded documents in the `/uploads` directory

The application never deletes data at the end of a session, ensuring all conversations, documents, and user achievements are permanently stored.

### API Endpoints

The platform provides a comprehensive API for integration with other systems:

- **Authentication**: `/api/auth/login`
- **Conversations**: `/api/conversations`
- **Messages**: `/api/messages`
- **Documents**: `/api/documents`
- **Webhooks**: `/api/webhooks`
- **Analytics**: `/api/analytics`
- **User Achievements**: `/api/achievements`

Full API documentation is available at `/api/docs` when the application is running.

## Support

For any issues during deployment or usage, please open an issue on this repository or contact our support team.