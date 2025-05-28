from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user, login_required
from app import db, mail
from app.auth import bp
from app.models.user import User
from app.models.company import CompanyInfo
from datetime import datetime, timedelta
from flask_mail import Message
import secrets
import string

def generate_reset_token():
    """Generate a secure random token for password reset."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

def send_reset_email(user, token):
    """Send password reset email to user."""
    msg = Message('Password Reset Request',
                  sender='noreply@raiseinsurance.com',
                  recipients=[user.email])
    msg.body = f'''To reset your password, visit the following link:
{url_for('auth.reset_password', token=token, _external=True)}

If you did not make this request then simply ignore this email and no changes will be made.
'''
    mail.send(msg)

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = request.form.get('remember', False)
        
        user = User.query.filter_by(email=email).first()
        if user is None or not user.verify_password(password):
            flash('Invalid email or password', 'error')
            return redirect(url_for('auth.login'))
        
        if not user.is_active:
            flash('Your account has been deactivated. Please contact your administrator.', 'error')
            return redirect(url_for('auth.login'))
        
        login_user(user, remember=remember)
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        next_page = request.args.get('next')
        if not next_page or not next_page.startswith('/'):
            next_page = url_for('main.index')
        return redirect(next_page)
    
    return render_template('auth/login.html', title='Sign In')

@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))

@bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    # Get all active companies for the dropdown
    companies = CompanyInfo.query.order_by(CompanyInfo.company_name).all()
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        password2 = request.form.get('password2')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        company_reg_no = request.form.get('company_reg_no')
        
        if password != password2:
            flash('Passwords do not match', 'error')
            return redirect(url_for('auth.register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already registered', 'error')
            return redirect(url_for('auth.register'))
        
        company = CompanyInfo.query.filter_by(company_reg_no=company_reg_no).first()
        if not company:
            flash('Invalid company selection', 'error')
            return redirect(url_for('auth.register'))
        
        try:
            user = User(
                email=email,
                first_name=first_name,
                last_name=last_name,
                role='agent',  # Default role for new registrations
                company_reg_no=company.company_reg_no
            )
            user.password = password  # This will validate the password
            
            db.session.add(user)
            db.session.commit()
            
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('auth.login'))
        except ValueError as e:
            flash(str(e), 'error')
            return redirect(url_for('auth.register'))
    
    return render_template('auth/register.html', title='Register', companies=companies)

@bp.route('/reset-password-request', methods=['GET', 'POST'])
def reset_password_request():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        user = User.query.filter_by(email=email).first()
        
        if user:
            token = generate_reset_token()
            user.reset_token = token
            user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()
            
            send_reset_email(user, token)
            flash('An email has been sent with instructions to reset your password.', 'info')
            return redirect(url_for('auth.login'))
        
        flash('Email address not found.', 'error')
        return redirect(url_for('auth.reset_password_request'))
    
    return render_template('auth/reset_password_request.html', title='Reset Password')

@bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    user = User.query.filter_by(reset_token=token).first()
    if not user or user.reset_token_expiry < datetime.utcnow():
        flash('The password reset link is invalid or has expired.', 'error')
        return redirect(url_for('auth.reset_password_request'))
    
    if request.method == 'POST':
        password = request.form.get('password')
        password2 = request.form.get('password2')
        
        if password != password2:
            flash('Passwords do not match.', 'error')
            return redirect(url_for('auth.reset_password', token=token))
        
        try:
            user.password = password  # This will validate the password
            user.reset_token = None
            user.reset_token_expiry = None
            db.session.commit()
            
            flash('Your password has been reset. You can now log in.', 'success')
            return redirect(url_for('auth.login'))
        except ValueError as e:
            flash(str(e), 'error')
            return redirect(url_for('auth.reset_password', token=token))
    
    return render_template('auth/reset_password.html', title='Reset Password') 