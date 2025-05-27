from app import db
from datetime import datetime
import bcrypt
from enum import Enum

class UserRole(Enum):
    ADMIN = 'admin'
    INSURANCE_OFFICER = 'insurance_officer'
    POLICE = 'police'

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False)
    company_id = db.Column(db.String(50), nullable=True)  # For insurance officers
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    review_notes = db.relationship('ReviewNote', backref='user', lazy=True)
    
    def __init__(self, email, password, name, role, company_id=None):
        self.email = email.lower()
        self.set_password(password)
        self.name = name
        self.role = role
        self.company_id = company_id
    
    def set_password(self, password):
        """Hash and set the user's password."""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        """Check if the provided password matches the hash."""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )
    
    def to_dict(self):
        """Convert user object to dictionary."""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role.value,
            'company_id': self.company_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def __repr__(self):
        return f'<User {self.email}>' 