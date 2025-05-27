from app import create_app, db
from app.models import User, UserRole, Accident, InsuranceClaim
from datetime import datetime, timedelta

def init_db():
    app = create_app()
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create admin user
        admin = User(
            email='admin@example.com',
            name='Admin User',
            role=UserRole.ADMIN.value,
            is_active=True
        )
        admin.set_password('admin123')
        
        # Create police user
        police = User(
            email='police@example.com',
            name='Police Officer',
            role=UserRole.POLICE.value,
            is_active=True
        )
        police.set_password('police123')
        
        # Create insurance agent
        agent = User(
            email='agent@example.com',
            name='Insurance Agent',
            role=UserRole.INSURANCE_AGENT.value,
            is_active=True,
            company_id='INS001'
        )
        agent.set_password('agent123')
        
        # Add users to session
        db.session.add_all([admin, police, agent])
        db.session.commit()
        
        # Create some test accidents
        accident1 = Accident(
            location='123 Main St, City',
            description='Two-car collision at intersection',
            date_time=datetime.utcnow() - timedelta(days=1),
            severity='moderate',
            status='pending',
            reporter_id=police.id,
            weather_conditions='Clear',
            road_conditions='Dry',
            number_of_vehicles=2,
            number_of_injuries=1,
            police_report_number='PR-2024-001'
        )
        
        accident2 = Accident(
            location='456 Oak Ave, Town',
            description='Single vehicle rollover',
            date_time=datetime.utcnow() - timedelta(days=2),
            severity='severe',
            status='under_review',
            reporter_id=police.id,
            weather_conditions='Rainy',
            road_conditions='Wet',
            number_of_vehicles=1,
            number_of_injuries=2,
            police_report_number='PR-2024-002'
        )
        
        # Add accidents to session
        db.session.add_all([accident1, accident2])
        db.session.commit()
        
        # Create some test insurance claims
        claim1 = InsuranceClaim(
            accident_id=accident1.id,
            agent_id=agent.id,
            claim_number='CLM-2024-001',
            status='pending',
            amount_claimed=5000.00,
            description='Vehicle damage claim',
            policy_number='POL-001',
            claimant_name='John Doe',
            claimant_contact='john@example.com',
            vehicle_details={
                'make': 'Toyota',
                'model': 'Camry',
                'year': 2020,
                'license_plate': 'ABC123'
            }
        )
        
        claim2 = InsuranceClaim(
            accident_id=accident2.id,
            agent_id=agent.id,
            claim_number='CLM-2024-002',
            status='under_review',
            amount_claimed=15000.00,
            description='Total loss claim',
            policy_number='POL-002',
            claimant_name='Jane Smith',
            claimant_contact='jane@example.com',
            vehicle_details={
                'make': 'Honda',
                'model': 'Civic',
                'year': 2021,
                'license_plate': 'XYZ789'
            }
        )
        
        # Add claims to session
        db.session.add_all([claim1, claim2])
        db.session.commit()
        
        print("Database initialized with test data!")
        print("\nTest Users:")
        print("Admin - email: admin@example.com, password: admin123")
        print("Police - email: police@example.com, password: police123")
        print("Insurance Agent - email: agent@example.com, password: agent123")

if __name__ == '__main__':
    init_db() 