# Render Database Setup Guide

Follow these steps to set up a new PostgreSQL database on Render and restore your data.

## 1. Create a New Database on Render

1.  Log in to your [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** and select **PostgreSQL**.
3.  Fill in the details:
    - **Name**: `joyce-suites-db`
    - **Database Name**: `joyce_suites`
    - **User**: `joyce_admin`
    - **Region**: Same as your web service.
4.  Select the **Free** tier (or higher if needed).
5.  Click **Create Database**.

## 2. Get the Connection String

Once the database is created, find the **Internal Database URL** (for Render services) or **External Database URL** (for local access).
It will look like this:
`postgresql://joyce_admin:password@host/joyce_suites`

## 3. Update Environment Variables

### In Render (Web Service)
1.  Go to your **Backend Web Service** settings in Render.
2.  Navigate to the **Environment** tab.
3.  Find `SQLALCHEMY_DATABASE_URI` (create it if missing).
4.  Update its value with the new **Internal Database URL**.
5.  Save changes. This triggers a redeploy.

## 4. Data Restoration (Automatic & Manual)

### Automatic (Recommended)
Your system has an **Auto-Seed** feature. If the database is empty when the app starts, it will automatically:
- Create all database tables.
- Run `seed_rooms.py` to restore the 26 rooms and core users.

To trigger this, just follow Step 3 and wait for the redeploy to finish.

### Manual
If for some reason auto-seeding does not trigger, run these commands from the `backend` directory:
```bash
python force_init_db.py
python seed_rooms.py
```

## 5. Files Mentioning the Database URL
If you ever change your database provider, these are the files to check:
- **`backend/.env`**: Used for local development.
- **`backend/config.py`**: The core configuration file that reads the `SQLALCHEMY_DATABASE_URI` environment variable.
- **`backend/app.py`**: Handles initialization and auto-seeding.
- **`migrations/env.py`**: Handles database migrations using the configured URL.

> [!IMPORTANT]
> Always ensure `SQLALCHEMY_DATABASE_URI` is set correctly in both your Render environment and your local `.env` file.
