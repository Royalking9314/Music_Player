from django import template
import json

register = template.Library()

@register.filter
def jsonify(value):
    """Convert a Python object to JSON string"""
    if value is None:
        return ''
    return json.dumps(value)
