from datetime import datetime
from app import db

class JurisdictionInfo(db.Model):
    __tablename__ = 'jurisdiction_info'
    
    station_id = db.Column(db.String(20), primary_key=True)
    station_name = db.Column(db.String(100), nullable=False)
    county = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    officers = db.relationship('PoliceInfo', backref='station', lazy='dynamic')
    
    def __repr__(self):
        return f'<Station {self.station_name}>'

class PoliceInfo(db.Model):
    __tablename__ = 'police_info'
    
    badge_no = db.Column(db.String(20), primary_key=True)
    police_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    rank = db.Column(db.String(50), nullable=False)
    station_id = db.Column(db.String(20), db.ForeignKey('jurisdiction_info.station_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    contact = db.relationship('PoliceContact', backref='officer', uselist=False)
    reports = db.relationship('Report', backref='officer', lazy='dynamic')
    
    def __repr__(self):
        return f'<Officer {self.police_name}>'

class PoliceContact(db.Model):
    __tablename__ = 'police_contact'
    
    badge_no = db.Column(db.String(20), db.ForeignKey('police_info.badge_no'), primary_key=True)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Contact for Officer {self.badge_no}>' 