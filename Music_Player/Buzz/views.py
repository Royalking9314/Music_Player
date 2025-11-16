from django.shortcuts import render
from django.http import JsonResponse
from .models import Song, Lyrics
from django.core.paginator import Paginator

# Create your views here.
def index(request):
    paginator = Paginator(Song.objects.all(), 1)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    context = {'page_obj': page_obj}
    return render(request, 'index.html', context)


def get_lyrics(request, song_id):
    """
    API endpoint to fetch synchronized lyrics for a specific song.
    Returns JSON with timestamps and lyrics text.
    """
    try:
        song = Song.objects.get(id=song_id)
        lyrics = Lyrics.objects.filter(song=song).first()
        
        if lyrics:
            return JsonResponse({
                'success': True,
                'song_id': song.id,
                'song_title': song.title,
                'timestamps': lyrics.timestamps,
                'lyrics_text': lyrics.lyrics_text
            })
        else:
            # Fallback to simple lyrics if synchronized lyrics not available
            return JsonResponse({
                'success': True,
                'song_id': song.id,
                'song_title': song.title,
                'timestamps': [],
                'lyrics_text': song.lyrics or ''
            })
    except Song.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Song not found'
        }, status=404)