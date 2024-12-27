from flask import Flask, jsonify, request, make_response
from flask_cors import CORS, cross_origin
from handlers import KEY_MAPPING, OS_KEY_MAPPING, handleKeyPress, handleCustomOSAction
import sys, logging

print("interpreter: ", sys.executable)

app = Flask(__name__)
cors = CORS(app)

logging.basicConfig(
    level=logging.INFO
)
logger = app.logger

@app.route('/os_action')
@cross_origin()
def key_action():
    action = request.args.get('action')

    if action in KEY_MAPPING:
        data = handleKeyPress(action)
        response = make_response(jsonify(data), 200)
        return response
    
    if action in OS_KEY_MAPPING:
        data = handleCustomOSAction(action)
        response = make_response(jsonify(data), 200)
        return response
    
    return jsonify({'error': 'Invalid or missing action'}), 400

@app.errorhandler(404)
def not_found():
    return jsonify({'error': 'Not Found'}), 404

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5001, debug=False)
    except KeyboardInterrupt:
        print("\nServer shutting down...")
        sys.exit(0)