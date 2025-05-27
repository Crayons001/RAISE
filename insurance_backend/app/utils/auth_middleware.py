from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models import User, UserRole

def role_required(roles):
    """
    Decorator to check if the current user has the required role(s).
    
    Args:
        roles: Single role or list of roles that are allowed to access the endpoint
        
    Returns:
        Decorated function with role check
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user or not user.is_active:
                return jsonify({'error': 'Invalid or inactive user'}), 401
            
            if isinstance(roles, list):
                if user.role.value not in [role.value for role in roles]:
                    return jsonify({'error': 'Insufficient permissions'}), 403
            else:
                if user.role != roles:
                    return jsonify({'error': 'Insufficient permissions'}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def company_required():
    """
    Decorator to check if the current user belongs to a company
    and if they have access to the requested company's data.
    
    Returns:
        Decorated function with company access check
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user or not user.is_active:
                return jsonify({'error': 'Invalid or inactive user'}), 401
            
            # Admin can access all companies
            if user.role == UserRole.ADMIN:
                return fn(*args, **kwargs)
            
            # Insurance officers can only access their company's data
            if user.role == UserRole.INSURANCE_OFFICER:
                if not user.company_id:
                    return jsonify({'error': 'User not associated with any company'}), 403
                
                # Check if the request is for the user's company
                company_id = request.view_args.get('company_id')
                if company_id and company_id != user.company_id:
                    return jsonify({'error': 'Access denied to other company data'}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def admin_required(fn):
    """
    Decorator to check if the current user is an admin.
    
    Returns:
        Decorated function with admin check
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Invalid or inactive user'}), 401
        
        if user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        return fn(*args, **kwargs)
    return wrapper

def police_required(fn):
    """
    Decorator to check if the current user is a police officer.
    
    Returns:
        Decorated function with police officer check
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Invalid or inactive user'}), 401
        
        if user.role != UserRole.POLICE:
            return jsonify({'error': 'Police officer access required'}), 403
        
        return fn(*args, **kwargs)
    return wrapper 