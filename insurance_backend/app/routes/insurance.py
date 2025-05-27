from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import InsuranceClaim
from app.utils import role_required

bp = Blueprint('insurance', __name__, url_prefix='/api/insurance')

@bp.route('/claims', methods=['GET'])
@jwt_required()
@role_required(['admin', 'insurance_agent'])
def get_claims():
    """Get all insurance claims (filtered by role)"""
    return jsonify({'message': 'Insurance claims endpoint - to be implemented'}), 200

@bp.route('/claims/<int:claim_id>', methods=['GET'])
@jwt_required()
@role_required(['admin', 'insurance_agent'])
def get_claim(claim_id):
    """Get a specific insurance claim by ID"""
    return jsonify({'message': f'Get claim {claim_id} - to be implemented'}), 200

@bp.route('/claims', methods=['POST'])
@jwt_required()
@role_required(['insurance_agent'])
def create_claim():
    """Create a new insurance claim"""
    return jsonify({'message': 'Create claim - to be implemented'}), 201

@bp.route('/claims/<int:claim_id>', methods=['PUT'])
@jwt_required()
@role_required(['admin', 'insurance_agent'])
def update_claim(claim_id):
    """Update an existing insurance claim"""
    return jsonify({'message': f'Update claim {claim_id} - to be implemented'}), 200

@bp.route('/claims/<int:claim_id>/status', methods=['PATCH'])
@jwt_required()
@role_required(['admin', 'insurance_agent'])
def update_claim_status(claim_id):
    """Update the status of an insurance claim"""
    return jsonify({'message': f'Update claim status {claim_id} - to be implemented'}), 200 