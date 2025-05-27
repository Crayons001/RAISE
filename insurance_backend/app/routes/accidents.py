from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Accident
from app.utils import role_required

bp = Blueprint('accidents', __name__, url_prefix='/api/accidents')

@bp.route('/', methods=['GET'])
@jwt_required()
@role_required(['admin', 'insurance_agent', 'police'])
def get_accidents():
    """Get all accidents (filtered by role)"""
    return jsonify({'message': 'Accidents endpoint - to be implemented'}), 200

@bp.route('/<int:accident_id>', methods=['GET'])
@jwt_required()
@role_required(['admin', 'insurance_agent', 'police'])
def get_accident(accident_id):
    """Get a specific accident by ID"""
    return jsonify({'message': f'Get accident {accident_id} - to be implemented'}), 200

@bp.route('/', methods=['POST'])
@jwt_required()
@role_required(['police'])
def create_accident():
    """Create a new accident report"""
    return jsonify({'message': 'Create accident - to be implemented'}), 201

@bp.route('/<int:accident_id>', methods=['PUT'])
@jwt_required()
@role_required(['admin', 'police'])
def update_accident(accident_id):
    """Update an existing accident report"""
    return jsonify({'message': f'Update accident {accident_id} - to be implemented'}), 200 