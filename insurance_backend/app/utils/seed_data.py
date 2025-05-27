from app import create_app, db
from app.models import User, UserRole
from datetime import datetime

def seed_database():
    """Seed the database with initial test data."""
    app = create_app()
    
    with app.app_context():
        # Clear existing data
        User.query.delete()
        
        # Create admin user
        admin_user = User(
            email='admin@raise.ke',
            name='System Administrator',
            role=UserRole.ADMIN.value,
            is_active=True
        )
        admin_user.set_password('Admin@123')
        db.session.add(admin_user)
        
        # Create insurance companies and their officers
        insurance_companies = [
            {
                'id': 'INS001',
                'name': 'Kenya Insurance Co.',
                'officers': [
                    {
                        'email': 'john.doe@kenyainsurance.co.ke',
                        'password': 'Officer@123',
                        'name': 'John Doe',
                        'role': UserRole.INSURANCE_AGENT.value
                    },
                    {
                        'email': 'jane.smith@kenyainsurance.co.ke',
                        'password': 'Officer@123',
                        'name': 'Jane Smith',
                        'role': UserRole.INSURANCE_AGENT.value
                    }
                ]
            },
            {
                'id': 'INS002',
                'name': 'East Africa Insurance',
                'officers': [
                    {
                        'email': 'michael.brown@eastafricainsurance.co.ke',
                        'password': 'Officer@123',
                        'name': 'Michael Brown',
                        'role': UserRole.INSURANCE_AGENT.value
                    },
                    {
                        'email': 'sarah.wilson@eastafricainsurance.co.ke',
                        'password': 'Officer@123',
                        'name': 'Sarah Wilson',
                        'role': UserRole.INSURANCE_AGENT.value
                    }
                ]
            }
        ]
        
        # Add insurance officers
        for company in insurance_companies:
            for officer_data in company['officers']:
                officer = User(
                    email=officer_data['email'],
                    name=officer_data['name'],
                    role=officer_data['role'],
                    company_id=company['id'],
                    is_active=True
                )
                officer.set_password(officer_data['password'])
                db.session.add(officer)
        
        # Create police officers
        police_stations = [
            {
                'name': 'Central Police Station',
                'officers': [
                    {
                        'email': 'officer1@police.go.ke',
                        'password': 'Police@123',
                        'name': 'James Kamau',
                        'role': UserRole.POLICE.value
                    },
                    {
                        'email': 'officer2@police.go.ke',
                        'password': 'Police@123',
                        'name': 'Mary Wanjiku',
                        'role': UserRole.POLICE.value
                    }
                ]
            },
            {
                'name': 'Westlands Police Station',
                'officers': [
                    {
                        'email': 'officer3@police.go.ke',
                        'password': 'Police@123',
                        'name': 'Peter Ochieng',
                        'role': UserRole.POLICE.value
                    },
                    {
                        'email': 'officer4@police.go.ke',
                        'password': 'Police@123',
                        'name': 'Grace Muthoni',
                        'role': UserRole.POLICE.value
                    }
                ]
            }
        ]
        
        # Add police officers
        for station in police_stations:
            for officer_data in station['officers']:
                officer = User(
                    email=officer_data['email'],
                    name=officer_data['name'],
                    role=officer_data['role'],
                    is_active=True
                )
                officer.set_password(officer_data['password'])
                db.session.add(officer)
        
        # Commit all changes
        try:
            db.session.commit()
            print("Database seeded successfully!")
            print("\nTest Users Created:")
            print("\nAdmin:")
            print(f"Email: admin@raise.ke")
            print(f"Password: Admin@123")
            
            print("\nInsurance Officers:")
            for company in insurance_companies:
                print(f"\n{company['name']} ({company['id']}):")
                for officer in company['officers']:
                    print(f"Email: {officer['email']}")
                    print(f"Password: {officer['password']}")
            
            print("\nPolice Officers:")
            for station in police_stations:
                print(f"\n{station['name']}:")
                for officer in station['officers']:
                    print(f"Email: {officer['email']}")
                    print(f"Password: {officer['password']}")
                    
        except Exception as e:
            db.session.rollback()
            print(f"Error seeding database: {str(e)}")

if __name__ == '__main__':
    seed_database() 