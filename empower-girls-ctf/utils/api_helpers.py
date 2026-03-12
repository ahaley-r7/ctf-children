"""
API Helper Functions for Empower Girls CTF

This module provides common helper functions and decorators for API endpoints
to reduce code duplication and ensure consistent response formatting.
"""

from functools import wraps
from flask import jsonify, request


def validate_json_request(required_fields):
    """
    Decorator to validate JSON request contains required fields.
    
    Args:
        required_fields: List of field names that must be present in the JSON request
        
    Returns:
        Decorator function that validates the request before calling the endpoint
        
    Example:
        @app.route('/api/submit', methods=['POST'])
        @validate_json_request(['challenge_id', 'score'])
        def submit_score():
            data = request.get_json()
            # data is guaranteed to have 'challenge_id' and 'score' fields
            return success_response({'received': True})
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Request must be JSON'}), 400
            
            data = request.get_json()
            missing = [field for field in required_fields if field not in data]
            
            if missing:
                return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400
            
            return f(*args, **kwargs)
        return wrapper
    return decorator


def success_response(data, message='Success'):
    """
    Standard success response format.
    
    Args:
        data: The data to include in the response
        message: Success message (default: 'Success')
        
    Returns:
        JSON response with success=True, message, and data fields
        
    Example:
        return success_response({'score': 100}, 'Score submitted successfully')
    """
    return jsonify({
        'success': True,
        'message': message,
        'data': data
    })


def error_response(message, status_code=400):
    """
    Standard error response format.
    
    Args:
        message: Error message to return
        status_code: HTTP status code (default: 400)
        
    Returns:
        JSON response with success=False and error message, with specified status code
        
    Example:
        return error_response('Invalid challenge ID', 404)
    """
    return jsonify({
        'success': False,
        'error': message
    }), status_code
