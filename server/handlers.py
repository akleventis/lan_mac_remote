import subprocess
import logging

logger = logging.getLogger("flask.app")

# valid request actions
KEY_MAPPING = {
    "play_pause": 100,
    "previous_track": 98,
    "next_track": 101,
    "left_arrow": 123,
    "right_arrow": 124,
    "brightness_up": 144,
    "brightness_down": 145,
}

OS_KEY_MAPPING = {
    "volume_up": lambda: adjust_volume("up"),
    "volume_down": lambda: adjust_volume("down"),
    "current": lambda: adjust_volume("current")
}

# handlers
def handleKeyPress(action):
    if action not in KEY_MAPPING:
        return {'error': 'Invalid key action'}
    
    key_code = KEY_MAPPING[action]
    subprocess.run(['osascript', '-e', f'tell application "System Events" to key code {key_code}'])
    return {'status': f'{action}'}

def handleCustomOSAction(action):
    if action not in OS_KEY_MAPPING:
        return {'error': 'Invalid OS action'}
    return OS_KEY_MAPPING[action]()

# helper for volume adjustment
def adjust_volume(command):
    current_volume_script = 'output volume of (get volume settings)'
    result = subprocess.run(['osascript', '-e', current_volume_script], capture_output=True, text=True)
    current_volume = int(result.stdout.strip())

    if command == 'current':
        new_volume = current_volume
    elif command == 'up':
        new_volume = min(current_volume + 10, 100)
    elif command == 'down':
        new_volume = max(current_volume - 10, 0)
    else:
        return {'error': 'invalid command'}

    set_volume_script = f'set volume output volume {new_volume}'
    subprocess.run(['osascript', '-e', set_volume_script])

    return {'status': f'{command}', 'volume': f'{new_volume}'}