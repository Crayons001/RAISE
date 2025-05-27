from app import db
from datetime import datetime
from enum import Enum

class AccidentStatus(Enum):
    PENDING = 'pending'
    VERIFIED = 'verified'
    FLAGGED = 'flagged'
    RESOLVED = 'resolved'
    CLAIMS_PROCESSING = 'claims_processing'

class Accident(db.Model):
    __tablename__ = 'accidents'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_reg = db.Column(db.String(20), nullable=False, index=True)
    driver_name = db.Column(db.String(100), nullable=False)
    driver_license = db.Column(db.String(50), nullable=True)
    insurance_company = db.Column(db.String(100), nullable=False, index=True)
    insurance_policy = db.Column(db.String(50), nullable=True)
    location = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    accident_date = db.Column(db.DateTime, nullable=False)
    police_station = db.Column(db.String(100), nullable=False)
    officer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Enum(AccidentStatus), default=AccidentStatus.PENDING)
    risk_score = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    media_files = db.relationship('MediaFile', backref='accident', lazy=True)
    abstract = db.relationship('Abstract', backref='accident', uselist=False, lazy=True)
    review_notes = db.relationship('ReviewNote', backref='accident', lazy=True)
    
    def to_dict(self):
        """Convert accident object to dictionary."""
        return {
            'id': self.id,
            'vehicle_reg': self.vehicle_reg,
            'driver_name': self.driver_name,
            'driver_license': self.driver_license,
            'insurance_company': self.insurance_company,
            'insurance_policy': self.insurance_policy,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'accident_date': self.accident_date.isoformat(),
            'police_station': self.police_station,
            'officer_id': self.officer_id,
            'status': self.status.value,
            'risk_score': self.risk_score,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'media_files': [media.to_dict() for media in self.media_files],
            'abstract': self.abstract.to_dict() if self.abstract else None,
            'review_notes': [note.to_dict() for note in self.review_notes]
        }
    
    def __repr__(self):
        return f'<Accident {self.id} - {self.vehicle_reg}>'

class MediaFile(db.Model):
    __tablename__ = 'media_files'
    
    id = db.Column(db.Integer, primary_key=True)
    accident_id = db.Column(db.Integer, db.ForeignKey('accidents.id'), nullable=False)
    file_type = db.Column(db.String(10), nullable=False)  # 'image' or 'video'
    file_path = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'accident_id': self.accident_id,
            'file_type': self.file_type,
            'file_path': self.file_path,
            'uploaded_at': self.uploaded_at.isoformat()
        }

class ReviewNote(db.Model):
    __tablename__ = 'review_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    accident_id = db.Column(db.Integer, db.ForeignKey('accidents.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'accident_id': self.accident_id,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        } 