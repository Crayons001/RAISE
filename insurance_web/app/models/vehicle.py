from datetime import datetime
from app import db

class VehicleInfo(db.Model):
    __tablename__ = 'vehicle_info'
    
    vehicle_reg_no = db.Column(db.String(20), primary_key=True)
    chassis_no = db.Column(db.String(50), unique=True, nullable=False)
    engine_no = db.Column(db.String(50), unique=True, nullable=False)
    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    body_type = db.Column(db.String(20), nullable=False)
    color = db.Column(db.String(30), nullable=False)
    transmission = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    accident_history = db.relationship('VehicleAccidentHistory', backref='vehicle', lazy='dynamic')
    reports = db.relationship('Report', backref='vehicle', lazy='dynamic')
    
    def __repr__(self):
        return f'<Vehicle {self.vehicle_reg_no}>'
    
    @property
    def accident_count(self):
        return self.accident_history.count()
    
    @property
    def last_accident_date(self):
        last_report = self.reports.order_by(Report.created_at.desc()).first()
        return last_report.created_at if last_report else None
    
    def to_dict(self):
        return {
            'vehicle_reg_no': self.vehicle_reg_no,
            'chassis_no': self.chassis_no,
            'engine_no': self.engine_no,
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'body_type': self.body_type,
            'color': self.color,
            'transmission': self.transmission,
            'accident_count': self.accident_count,
            'last_accident_date': self.last_accident_date.isoformat() if self.last_accident_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class VehicleOwnership(db.Model):
    __tablename__ = 'vehicle_ownership'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_reg_no = db.Column(db.String(20), db.ForeignKey('vehicle_info.vehicle_reg_no'), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('owners_info.id'), nullable=True)
    company_reg_no = db.Column(db.String(20), db.ForeignKey('company_info.company_reg_no'), nullable=True)
    ownership_type = db.Column(db.String(20), nullable=False)  # 'individual' or 'company'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Ownership for {self.vehicle_reg_no}>'

class VehicleAccidentHistory(db.Model):
    __tablename__ = 'vehicle_accident_history'
    
    entry_id = db.Column(db.Integer, primary_key=True)
    vehicle_reg_no = db.Column(db.String(20), db.ForeignKey('vehicle_info.vehicle_reg_no'), nullable=False)
    incident_no = db.Column(db.String(20), db.ForeignKey('reports_info.incident_no'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Accident History Entry {self.entry_id}>' 