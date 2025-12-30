from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Song
from django.core.paginator import Paginator
import json

# Create your views here.
def index(request):
    paginator = Paginator(Song.objects.all(), 1)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    context = {'page_obj': page_obj}
    return render(request, 'index.html', context)

@csrf_exempt
@require_http_methods(["POST"])
def save_synced_lyrics(request, song_id):
    """
    Save synchronized lyrics for a song
    Expects JSON data: [{"time": "0:12.5", "lyrics": "First line"}, ...]
    """
    try:
        # Check for empty request body
        if not request.body:
            return JsonResponse({'success': False, 'error': 'Empty request body'}, status=400)
        
        song = get_object_or_404(Song, id=song_id)
        data = json.loads(request.body)
        
        # Validate data structure
        if not isinstance(data, list):
            return JsonResponse({'success': False, 'error': 'Invalid data format'}, status=400)
        
        for item in data:
            if not isinstance(item, dict) or 'time' not in item or 'lyrics' not in item:
                return JsonResponse({'success': False, 'error': 'Invalid lyric entry format'}, status=400)
            
            # Validate data types
            if not isinstance(item['lyrics'], str):
                return JsonResponse({'success': False, 'error': 'Lyrics must be a string'}, status=400)
            
            # Validate time is either string or None
            if item['time'] is not None and not isinstance(item['time'], str):
                return JsonResponse({'success': False, 'error': 'Time must be a string or null'}, status=400)
        
        # Save synced lyrics
        song.synced_lyrics = data
        song.save()
        
        return JsonResponse({'success': True, 'message': 'Synced lyrics saved successfully'})
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)