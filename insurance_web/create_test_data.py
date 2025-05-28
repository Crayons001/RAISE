from app import create_app, db
from app.models import User, CompanyInfo, CompanyContact

def create_test_data():
    app = create_app()
    with app.app_context():
        # Create admin user
        admin = User(
            email='admin@raiseinsurance.com',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        admin.password = 'A9!x7$zQpL#2@bTn'  # Very strong password
        
        # Create test companies
        companies = [
            {
                'company_reg_no': 'INS001',
                'company_name': 'Kenya Insurance Co. Ltd',
                'license_no': 'LIC001',
                'contact': {
                    'physical_address': '123 Insurance Street, Nairobi',
                    'email': 'info@kenyainsurance.co.ke',
                    'phone': '+254 700 000001',
                    'website': 'https://www.kenyainsurance.co.ke'
                }
            },
            {
                'company_reg_no': 'INS002',
                'company_name': 'East Africa Insurance Ltd',
                'license_no': 'LIC002',
                'contact': {
                    'physical_address': '456 Business Park, Mombasa',
                    'email': 'contact@eastafricainsurance.com',
                    'phone': '+254 700 000002',
                    'website': 'https://www.eastafricainsurance.com'
                }
            },
            {
                'company_reg_no': 'INS003',
                'company_name': 'Coast Insurance Services',
                'license_no': 'LIC003',
                'contact': {
                    'physical_address': '789 Beach Road, Mombasa',
                    'email': 'info@coastinsurance.co.ke',
                    'phone': '+254 700 000003',
                    'website': 'https://www.coastinsurance.co.ke'
                }
            }
        ]
        
        try:
            # Add admin user
            db.session.add(admin)
            
            # Add companies
            for company_data in companies:
                company = CompanyInfo(
                    company_reg_no=company_data['company_reg_no'],
                    company_name=company_data['company_name'],
                    license_no=company_data['license_no']
                )
                db.session.add(company)
                
                contact = CompanyContact(
                    company_reg_no=company_data['company_reg_no'],
                    **company_data['contact']
                )
                db.session.add(contact)
            
            db.session.commit()
            print("Test data created successfully!")
            print("\nAdmin credentials:")
            print("Email: admin@raiseinsurance.com")
            print("Password: A9!x7$zQpL#2@bTn")
            print("\nTest companies created:")
            for company in companies:
                print(f"- {company['company_name']} ({company['company_reg_no']})")
                
        except Exception as e:
            db.session.rollback()
            print(f"Error creating test data: {str(e)}")

if __name__ == '__main__':
    create_test_data() 