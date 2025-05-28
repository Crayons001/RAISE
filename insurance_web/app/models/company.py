from datetime import datetime
from app import db

class CompanyInfo(db.Model):
    __tablename__ = 'company_info'
    
    company_reg_no = db.Column(db.String(20), primary_key=True)
    company_name = db.Column(db.String(100), nullable=False)
    license_no = db.Column(db.String(50), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    contact = db.relationship('CompanyContact', backref='company', uselist=False)
    agents = db.relationship('AgentInfo', backref='company', lazy='dynamic')
    vehicles = db.relationship('VehicleOwnership', backref='company', lazy='dynamic')
    users = db.relationship('User', lazy='dynamic')
    
    def __repr__(self):
        return f'<Company {self.company_name}>'

class CompanyContact(db.Model):
    __tablename__ = 'company_contact'
    
    company_reg_no = db.Column(db.String(20), db.ForeignKey('company_info.company_reg_no'), primary_key=True)
    physical_address = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    website = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Contact for Company {self.company_reg_no}>'

class AgentInfo(db.Model):
    __tablename__ = 'agent_info'
    
    agent_id = db.Column(db.Integer, primary_key=True)
    agent_name = db.Column(db.String(100), nullable=False)
    company_reg_no = db.Column(db.String(20), db.ForeignKey('company_info.company_reg_no'), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'claims_officer', etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Agent {self.agent_name}>' 