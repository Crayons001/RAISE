from app import db
from datetime import datetime
from enum import Enum

class AccidentStatus(Enum):
    PENDING = 'pending'
    VERIFIED = 'verified'
    FLAGGED = 'flagged'
    RESOLVED = 'resolved'
    CLAIMS_PROCESSING = 'claims_processing'

class EnvironmentalConditions(db.Model):
    __tablename__ = 'environmental_conditions'
    
    id = db.Column(db.Integer, primary_key=True)
    accident_id = db.Column(db.Integer, db.ForeignKey('accidents.id'), nullable=False)
    weather_conditions = db.Column(db.String(100), nullable=True)
    road_conditions = db.Column(db.String(100), nullable=True)
    visibility = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'accident_id': self.accident_id,
            'weather_conditions': self.weather_conditions,
            'road_conditions': self.road_conditions,
            'visibility': self.visibility,
            'created_at': self.created_at.isoformat()
        }

class Person(db.Model):
    __tablename__ = 'persons'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    address = db.Column(db.String(200), nullable=True)
    license_number = db.Column(db.String(50), nullable=True)
    id_number = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    driver_of = db.relationship('Vehicle', backref='driver', lazy=True, foreign_keys='Vehicle.driver_id')
    passenger_of = db.relationship('Vehicle', secondary='vehicle_passengers', backref='passengers', lazy=True)
    witness_of = db.relationship('Accident', secondary='accident_witnesses', backref='witnesses', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone_number': self.phone_number,
            'email': self.email,
            'address': self.address,
            'license_number': self.license_number,
            'id_number': self.id_number,
            'created_at': self.created_at.isoformat()
        }

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    
    id = db.Column(db.Integer, primary_key=True)
    accident_id = db.Column(db.Integer, db.ForeignKey('accidents.id'), nullable=False)
    registration_number = db.Column(db.String(20), nullable=False)
    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(30), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('persons.id'), nullable=True)
    damage_description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    damage_images = db.relationship('MediaFile', backref='vehicle', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'accident_id': self.accident_id,
            'registration_number': self.registration_number,
            'make': self.make,
            'model': self.model,
            'color': self.color,
            'driver': self.driver.to_dict() if self.driver else None,
            'passengers': [p.to_dict() for p in self.passengers],
            'damage_description': self.damage_description,
            'damage_images': [img.to_dict() for img in self.damage_images],
            'created_at': self.created_at.isoformat()
        }

# Association tables for many-to-many relationships
vehicle_passengers = db.Table('vehicle_passengers',
    db.Column('vehicle_id', db.Integer, db.ForeignKey('vehicles.id'), primary_key=True),
    db.Column('person_id', db.Integer, db.ForeignKey('persons.id'), primary_key=True)
)

accident_witnesses = db.Table('accident_witnesses',
    db.Column('accident_id', db.Integer, db.ForeignKey('accidents.id'), primary_key=True),
    db.Column('person_id', db.Integer, db.ForeignKey('persons.id'), primary_key=True)
)

class Accident(db.Model):
    __tablename__ = 'accidents'
    
    id = db.Column(db.Integer, primary_key=True)
    report_number = db.Column(db.String(20), unique=True, nullable=False)
    officer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    accident_date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.Enum(AccidentStatus), default=AccidentStatus.PENDING)
    risk_score = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    vehicles = db.relationship('Vehicle', backref='accident', lazy=True)
    media_files = db.relationship('MediaFile', backref='accident', lazy=True)
    environmental_conditions = db.relationship('EnvironmentalConditions', backref='accident', uselist=False, lazy=True)
    abstract = db.relationship('Abstract', backref='accident', uselist=False, lazy=True)
    review_notes = db.relationship('ReviewNote', backref='accident', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'report_number': self.report_number,
            'officer_id': self.officer_id,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'accident_date': self.accident_date.isoformat(),
            'description': self.description,
            'status': self.status.value,
            'risk_score': self.risk_score,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'vehicles': [v.to_dict() for v in self.vehicles],
            'media_files': [m.to_dict() for m in self.media_files],
            'environmental_conditions': self.environmental_conditions.to_dict() if self.environmental_conditions else None,
            'witnesses': [w.to_dict() for w in self.witnesses],
            'abstract': self.abstract.to_dict() if self.abstract else None,
            'review_notes': [note.to_dict() for note in self.review_notes]
        }
    
    def __repr__(self):
        return f'<Accident {self.report_number}>'

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