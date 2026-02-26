# Taplejung Sekuwa House

Restaurant website with separate public and staff interfaces.

## Quick Start

```bash
npm install
npm start
```

Server runs at: http://localhost:3000

## Access

### Public Website (No Login)
- Homepage: http://localhost:3000/public/index.html
- Menu: http://localhost:3000/public/menu.html

### Staff System (Login Required)
- Login: http://localhost:3000/staff/login.html
- Dashboard: http://localhost:3000/staff/dashboard.html

## Default Login

**Email:** admin@taplejung.com  
**Password:** admin123

⚠️ Change password immediately after first login!

## Features

### Public
- Restaurant information
- Browse menu (read-only)
- Location map
- Contact details

### Staff (Clerk & Manager)
- Add/Edit/Delete menu items
- Change password
- View dashboard

### Manager Only
- Add new staff users
- Delete staff users
- Manage roles

## Architecture

- Single backend: Node.js + Express
- Single database: SQLite
- Separated interfaces: /public (no auth) and /staff (auth required)

## Stop Server

Press `Ctrl + C` in terminal
