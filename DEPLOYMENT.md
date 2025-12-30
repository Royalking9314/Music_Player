# Deploying Music Player to PythonAnywhere

This guide provides step-by-step instructions for deploying the Music Player Django application to PythonAnywhere.

## Prerequisites

- A PythonAnywhere account (free or paid)
- Basic knowledge of Django and command line
- Your Django application code ready for deployment

## Deployment Steps

### 1. Account Setup

1. Sign up for a free account at [PythonAnywhere](https://www.pythonanywhere.com/)
2. Verify your email address
3. Log in to your PythonAnywhere dashboard

### 2. Clone the Repository

Open a Bash console from your PythonAnywhere dashboard and clone your repository:

```bash
cd ~
git clone https://github.com/Royalking9314/Music_Player.git
cd Music_Player/Music_Player
```

### 3. Create Virtual Environment

Create and activate a virtual environment for your project:

```bash
# Create virtual environment
python3.10 -m venv venv

# Activate the virtual environment
source venv/bin/activate
```

**Note:** Use the Python version that matches your project requirements. PythonAnywhere supports Python 3.8, 3.9, 3.10, and 3.11.

### 4. Install Dependencies

Install all required Python packages from requirements.txt:

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file in the `Music_Player/Music_Player/` directory:

```bash
cd ~/Music_Player/Music_Player/Music_Player
nano .env
```

Add the following content (replace values as needed):

```
DJANGO_SECRET_KEY=your-production-secret-key-here
DEBUG=False
```

**Important:** Generate a new SECRET_KEY for production. You can generate one using:

```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Save the file (Ctrl+O, Enter, Ctrl+X in nano).

### 6. Database Migration

Run Django migrations to set up your database:

```bash
cd ~/Music_Player/Music_Player
python manage.py migrate
```

### 7. Create Superuser

Create an admin user for the Django admin interface:

```bash
python manage.py createsuperuser
```

Follow the prompts to set username, email, and password.

### 8. Collect Static Files

Collect all static files into the STATIC_ROOT directory:

```bash
python manage.py collectstatic --noinput
```

### 9. Configure WSGI

1. Go to the **Web** tab in your PythonAnywhere dashboard
2. Click **Add a new web app**
3. Select **Manual configuration** (not the Django option)
4. Choose the Python version that matches your virtual environment (e.g., Python 3.10)

#### Update WSGI Configuration File

1. Click on the WSGI configuration file link (e.g., `/var/www/yourusername_pythonanywhere_com_wsgi.py`)
2. Replace the entire content with:

```python
import os
import sys

# Add your project directory to the sys.path
path = '/home/yourusername/Music_Player/Music_Player'
if path not in sys.path:
    sys.path.insert(0, path)

# Set environment variable for Django settings
os.environ['DJANGO_SETTINGS_MODULE'] = 'Music_Player.settings'

# Activate virtual environment
activate_this = '/home/yourusername/Music_Player/Music_Player/venv/bin/activate_this.py'
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

# Import Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

**Important:** Replace `yourusername` with your actual PythonAnywhere username in all paths.

3. Save the file (Click the Save button)

### 10. Configure Virtual Environment Path

1. In the **Web** tab, scroll to the **Virtualenv** section
2. Enter the path to your virtual environment:
   ```
   /home/yourusername/Music_Player/Music_Player/venv
   ```
   (Replace `yourusername` with your actual username)

### 11. Configure Static Files Mapping

In the **Web** tab, scroll to the **Static files** section and add:

| URL          | Directory                                              |
|--------------|--------------------------------------------------------|
| /static/     | /home/yourusername/Music_Player/Music_Player/staticfiles |
| /media/      | /home/yourusername/Music_Player/Music_Player/media      |

**Note:** Replace `yourusername` with your actual PythonAnywhere username.

### 12. Reload Your Web App

1. Scroll to the top of the **Web** tab
2. Click the green **Reload** button
3. Wait for the reload to complete

### 13. Test Your Application

1. Click on the link to your application (e.g., `yourusername.pythonanywhere.com`)
2. Verify that the application loads correctly
3. Test the admin interface at `yourusername.pythonanywhere.com/admin`

## Environment Variables Setup

The application uses environment variables for configuration:

- **DJANGO_SECRET_KEY**: Your Django secret key (required for production)
- **DEBUG**: Set to 'False' for production, 'True' for development

You can set these in a `.env` file or configure them in the WSGI file directly:

```python
# In your WSGI file, before importing Django
os.environ['DJANGO_SECRET_KEY'] = 'your-secret-key-here'
os.environ['DEBUG'] = 'False'
```

## Updating Your Application

When you make changes to your code:

1. Open a Bash console and navigate to your project:
   ```bash
   cd ~/Music_Player/Music_Player
   ```

2. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```

3. Pull the latest changes:
   ```bash
   git pull origin main
   ```

4. Install any new dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run migrations if models changed:
   ```bash
   python manage.py migrate
   ```

6. Collect static files if they changed:
   ```bash
   python manage.py collectstatic --noinput
   ```

7. Reload the web app from the **Web** tab

## Troubleshooting

### Issue: Application shows "Something went wrong" error

**Solution:**
1. Check the error log in the **Web** tab under "Log files"
2. Look for the latest error in the error log
3. Common issues:
   - Wrong path in WSGI configuration
   - Missing environment variables
   - Database not migrated
   - Missing static files

### Issue: Static files (CSS, JS) not loading

**Solution:**
1. Verify static files mapping in the **Web** tab
2. Run `python manage.py collectstatic --noinput` again
3. Check that STATIC_ROOT path is correct
4. Reload the web app

### Issue: "DisallowedHost" error

**Solution:**
1. Check that your PythonAnywhere domain is in ALLOWED_HOSTS in settings.py
2. The setting should include: `['*.pythonanywhere.com', 'localhost', '127.0.0.1']`
3. Reload the web app

### Issue: Media files (uploaded files) not accessible

**Solution:**
1. Verify media files mapping in the **Web** tab
2. Check MEDIA_ROOT and MEDIA_URL in settings.py
3. Ensure the media directory has proper permissions:
   ```bash
   chmod -R 755 ~/Music_Player/Music_Player/media
   ```

### Issue: Database errors after deployment

**Solution:**
1. Run migrations:
   ```bash
   cd ~/Music_Player/Music_Player
   source venv/bin/activate
   python manage.py migrate
   ```
2. If using SQLite, ensure db.sqlite3 file permissions are correct:
   ```bash
   chmod 664 ~/Music_Player/Music_Player/db.sqlite3
   ```

### Issue: Import errors or module not found

**Solution:**
1. Verify virtual environment is activated in WSGI file
2. Check that all dependencies are installed:
   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Verify sys.path includes your project directory in WSGI

### Viewing Logs

To debug issues, check the following logs in the **Web** tab:

1. **Error log**: Shows Python errors and Django exceptions
2. **Server log**: Shows web server activity
3. **Access log**: Shows HTTP requests to your application

You can also view logs from the Bash console:

```bash
# Error log
tail -f /var/log/yourusername.pythonanywhere.com.error.log

# Server log
tail -f /var/log/yourusername.pythonanywhere.com.server.log
```

## Security Recommendations

1. **Never commit `.env` files** to version control
2. **Use a strong, unique SECRET_KEY** for production
3. **Keep DEBUG=False** in production
4. **Regularly update dependencies** to patch security vulnerabilities
5. **Use HTTPS** (automatically provided by PythonAnywhere)
6. **Set up regular backups** of your database

## Additional Resources

- [PythonAnywhere Help Pages](https://help.pythonanywhere.com/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [PythonAnywhere Forums](https://www.pythonanywhere.com/forums/)

## Support

If you encounter issues not covered in this guide:

1. Check the PythonAnywhere help documentation
2. Review the error logs for specific error messages
3. Search the PythonAnywhere forums
4. Contact PythonAnywhere support (for paid accounts)

## Notes

- Free PythonAnywhere accounts have some limitations (e.g., no SSH, limited CPU time)
- The application will go to sleep after 3 months of inactivity on free accounts
- Consider upgrading to a paid account for production applications
