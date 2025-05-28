from flask import render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app import db
from app.admin import bp
from app.models.user import User
from app.models.company import CompanyInfo
from app.models.report import Report
from app.utils.decorators import admin_required

@bp.route('/')
@login_required
@admin_required
def index():
    """Admin dashboard."""
    # Get statistics
    total_users = User.query.count()
    total_companies = CompanyInfo.query.count()
    total_reports = Report.query.count()
    pending_reports = Report.query.filter_by(status='pending').count()
    
    # Get recent reports
    recent_reports = Report.query.order_by(Report.created_at.desc()).limit(5).all()
    
    # Get recent users
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
    
    return render_template('admin/index.html',
                         total_users=total_users,
                         total_companies=total_companies,
                         total_reports=total_reports,
                         pending_reports=pending_reports,
                         recent_reports=recent_reports,
                         recent_users=recent_users)

@bp.route('/users')
@login_required
@admin_required
def users():
    """List all users."""
    users = User.query.order_by(User.created_at.desc()).all()
    return render_template('admin/users.html', users=users)

@bp.route('/companies')
@login_required
@admin_required
def companies():
    """List all companies."""
    companies = CompanyInfo.query.order_by(CompanyInfo.created_at.desc()).all()
    return render_template('admin/companies.html', companies=companies)

@bp.route('/reports')
@login_required
@admin_required
def reports():
    """List all reports."""
    reports = Report.query.order_by(Report.created_at.desc()).all()
    return render_template('admin/reports.html', reports=reports)

@bp.route('/user/<int:user_id>/toggle-status', methods=['POST'])
@login_required
@admin_required
def toggle_user_status(user_id):
    """Toggle a user's active status."""
    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    flash(f'User {user.email} {"activated" if user.is_active else "deactivated"} successfully.', 'success')
    return redirect(url_for('admin.users'))

@bp.route('/company/<int:company_id>/toggle-status', methods=['POST'])
@login_required
@admin_required
def toggle_company_status(company_id):
    """Toggle a company's active status."""
    company = CompanyInfo.query.get_or_404(company_id)
    company.is_active = not company.is_active
    db.session.commit()
    flash(f'Company {company.name} {"activated" if company.is_active else "deactivated"} successfully.', 'success')
    return redirect(url_for('admin.companies'))

@bp.route('/company/register', methods=['GET', 'POST'])
@login_required
@admin_required
def register_company():
    """Register a new insurance company."""
    if request.method == 'POST':
        company_reg_no = request.form.get('company_reg_no')
        company_name = request.form.get('company_name')
        license_no = request.form.get('license_no')
        physical_address = request.form.get('physical_address')
        email = request.form.get('email')
        phone = request.form.get('phone')
        website = request.form.get('website')

        # Validate required fields
        if not all([company_reg_no, company_name, license_no, physical_address, email, phone]):
            flash('All fields marked with * are required', 'error')
            return redirect(url_for('admin.register_company'))

        # Check if company already exists
        if CompanyInfo.query.filter_by(company_reg_no=company_reg_no).first():
            flash('Company registration number already exists', 'error')
            return redirect(url_for('admin.register_company'))

        if CompanyInfo.query.filter_by(license_no=license_no).first():
            flash('License number already exists', 'error')
            return redirect(url_for('admin.register_company'))

        try:
            # Create company
            company = CompanyInfo(
                company_reg_no=company_reg_no,
                company_name=company_name,
                license_no=license_no
            )
            db.session.add(company)

            # Create company contact
            contact = CompanyContact(
                company_reg_no=company_reg_no,
                physical_address=physical_address,
                email=email,
                phone=phone,
                website=website
            )
            db.session.add(contact)

            db.session.commit()
            flash('Company registered successfully', 'success')
            return redirect(url_for('admin.companies'))
        except Exception as e:
            db.session.rollback()
            flash(f'Error registering company: {str(e)}', 'error')
            return redirect(url_for('admin.register_company'))

    return render_template('admin/register_company.html', title='Register Company') 