from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from datetime import datetime
from app.models import User, UserRole
from app import db
from app.services.auth_service import AuthService
from marshmallow import Schema, fields, validate, ValidationError

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Request validation schemas
class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))

class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    name = fields.Str(required=True, validate=validate.Length(min=2))
    role = fields.Str(required=True, validate=validate.OneOf([role.value for role in UserRole]))
    company_id = fields.Str(allow_none=True)

@bp.route('/login', methods=['POST'])
def login():
    """Handle user login and return JWT tokens."""
    try:
        # Validate request data
        schema = LoginSchema()
        data = schema.load(request.get_json())
        
        # Authenticate user
        user = AuthService.authenticate_user(data['email'], data['password'])
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200
        
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh the access token using a refresh token."""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Invalid or inactive user'}), 401
        
        access_token = create_access_token(identity=current_user_id)
        return jsonify({'access_token': access_token}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Handle user logout."""
    try:
        # In a real application, you might want to blacklist the token
        # For now, we'll just return a success message
        return jsonify({'message': 'Successfully logged out'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/register', methods=['POST'])
@jwt_required()
def register():
    """Register a new user (admin only)."""
    try:
        # Check if current user is admin
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Validate request data
        schema = RegisterSchema()
        data = schema.load(request.get_json())
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        new_user = User(
            email=data['email'],
            password=data['password'],
            name=data['name'],
            role=UserRole(data['role']),
            company_id=data.get('company_id')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': new_user.to_dict()
        }), 201
        
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user's information."""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 