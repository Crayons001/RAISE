from datetime import datetime
from app import db

class Report(db.Model):
    __tablename__ = 'reports_info'
    
    incident_no = db.Column(db.String(20), primary_key=True)
    vehicle_reg_no = db.Column(db.String(20), db.ForeignKey('vehicle_info.vehicle_reg_no'), nullable=False)
    badge_no = db.Column(db.String(20), db.ForeignKey('police_info.badge_no'), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    incident_datetime = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    attachments = db.relationship('ReportAttachment', backref='report', lazy='dynamic')
    accident_history = db.relationship('VehicleAccidentHistory', backref='report', lazy='dynamic')
    
    def __repr__(self):
        return f'<Report {self.incident_no}>'

class ReportAttachment(db.Model):
    __tablename__ = 'reports_attachments'
    
    id = db.Column(db.Integer, primary_key=True)
    incident_no = db.Column(db.String(20), db.ForeignKey('reports_info.incident_no'), nullable=False)
    photo_url = db.Column(db.String(200))
    video_url = db.Column(db.String(200))
    abstract_url = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Attachment for Report {self.incident_no}>' 