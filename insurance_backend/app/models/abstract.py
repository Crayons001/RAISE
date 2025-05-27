from app import db
from datetime import datetime

class Abstract(db.Model):
    __tablename__ = 'abstracts'
    
    id = db.Column(db.Integer, primary_key=True)
    accident_id = db.Column(db.Integer, db.ForeignKey('accidents.id'), nullable=False, unique=True)
    file_path = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(10), nullable=False)  # 'pdf' or 'image'
    file_size = db.Column(db.Integer, nullable=False)  # Size in bytes
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'accident_id': self.accident_id,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'uploaded_at': self.uploaded_at.isoformat(),
            'uploaded_by': self.uploaded_by
        }
    
    def __repr__(self):
        return f'<Abstract {self.id} - Accident {self.accident_id}>' 