import os
import sys

# Add the project root directory to the sys.path so Django can find settings.py and wsgi.py
path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.append(path)

from wsgi import application as app
