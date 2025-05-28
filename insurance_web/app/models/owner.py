from datetime import datetime
from app import db

class Owner(db.Model):
    __tablename__ = 'owners_info'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_name = db.Column(db.String(100), nullable=False)
    national_id = db.Column(db.String(50), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    # user relationship removed; handled from User side
    vehicle_ownerships = db.relationship('VehicleOwnership', backref='owner', lazy='dynamic')
    
    def __repr__(self):
        return f'<Owner {self.owner_name}>'
    
    @property
    def full_name(self):
        return self.owner_name
    
    @property
    def vehicle_count(self):
        return self.vehicle_ownerships.count()
    
    @property
    def total_accidents(self):
        return sum(ownership.vehicle.accident_history.count() for ownership in self.vehicle_ownerships)
    
    def to_dict(self):
        return {
            'id': self.id,
            'owner_name': self.owner_name,
            'national_id': self.national_id,
            'phone': self.phone,
            'email': self.email,
            'vehicle_count': self.vehicle_count,
            'total_accidents': self.total_accidents,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 