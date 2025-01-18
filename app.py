from flask import Flask, request, jsonify
import requests
import os
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)
@app.route('/process', methods=['POST'])
def process_media():
    data = request.json
    video_url = data['videoUrl']
    music_url = data['musicUrl']
    narration_path = data['narrationPath']

    video_file = 'video.mp4'
    music_file = 'music.mp3'
    narration_file = 'narration.mp3'
    output_file = 'final_video.mp4'

    # Download media files
    download_file(video_url, video_file)
    download_file(music_url, music_file)

    # Merge media using FFmpeg
    command = [
        'ffmpeg', '-i', video_file, '-i', narration_file, '-i', music_file,
        '-filter_complex', '[1:a][2:a]amix=inputs=2:duration=longest[aout]',
        '-map', '0:v', '-map', '[aout]', '-shortest', output_file
    ]
    subprocess.run(command)

    return jsonify({"videoUrl": output_file})

def download_file(url, filename):
    response = requests.get(url)
    with open(filename, 'wb') as file:
        file.write(response.content)

if __name__ == '__main__':
    app.run(debug=True)
