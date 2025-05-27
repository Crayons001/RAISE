from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from enum import Enum
from flask_login import UserMixin

class UserRole(str, Enum):
    ADMIN = 'admin'
    POLICE = 'police'
    INSURANCE_AGENT = 'insurance_agent'

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, police, insurance_agent
    name = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    company_id = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    accidents_reported = db.relationship('Accident', backref='reporter', lazy=True, foreign_keys='Accident.reporter_id')
    insurance_claims = db.relationship('InsuranceClaim', backref='agent', lazy=True, foreign_keys='InsuranceClaim.agent_id')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'is_active': self.is_active,
            'company_id': self.company_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class Accident(db.Model):
    __tablename__ = 'accidents'
    
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # minor, moderate, severe
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, under_review, closed
    reporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    insurance_claims = db.relationship('InsuranceClaim', backref='accident', lazy=True)
    
    # Additional fields for accident details
    weather_conditions = db.Column(db.String(100))
    road_conditions = db.Column(db.String(100))
    number_of_vehicles = db.Column(db.Integer)
    number_of_injuries = db.Column(db.Integer)
    number_of_fatalities = db.Column(db.Integer)
    police_report_number = db.Column(db.String(50))
    evidence_files = db.Column(db.JSON)  # Store file paths/URLs

class InsuranceClaim(db.Model):
    __tablename__ = 'insurance_claims'
    
    id = db.Column(db.Integer, primary_key=True)
    accident_id = db.Column(db.Integer, db.ForeignKey('accidents.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    claim_number = db.Column(db.String(50), unique=True, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, under_review, approved, rejected
    amount_claimed = db.Column(db.Float)
    amount_approved = db.Column(db.Float)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Additional fields for claim details
    policy_number = db.Column(db.String(50))
    claimant_name = db.Column(db.String(100))
    claimant_contact = db.Column(db.String(100))
    vehicle_details = db.Column(db.JSON)  # Store vehicle information
    damage_assessment = db.Column(db.Text)
    supporting_documents = db.Column(db.JSON)  # Store document paths/URLs
    notes = db.Column(db.Text)
    
    def generate_claim_number(self):
        """Generate a unique claim number"""
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        return f'CLM-{timestamp}-{self.id}' 