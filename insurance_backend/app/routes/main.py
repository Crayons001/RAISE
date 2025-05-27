from flask import Blueprint, jsonify, render_template, redirect, url_for, flash, request, session
from flask_login import login_required, current_user, logout_user, login_user
from app.models import User, Accident, InsuranceClaim, db
from app.utils.auth_middleware import role_required
from datetime import datetime
from werkzeug.security import check_password_hash
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Email
from app.models import UserRole

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    """Redirect to appropriate page based on authentication status"""
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return redirect(url_for('main.login'))

@bp.route('/docs')
def api_docs():
    """Serve API documentation"""
    return render_template('api_docs.html')

@bp.route('/api')
def api_info():
    """Return basic API information"""
    return jsonify({
        'name': 'RAISE Insurance API',
        'version': '1.0.0',
        'description': 'API for managing accident reports and insurance claims',
        'documentation': '/docs',
        'endpoints': {
            'auth': '/api/auth',
            'accidents': '/api/accidents',
            'insurance': '/api/insurance'
        }
    })

@bp.route('/login', methods=['GET', 'POST'])
def login():
    """Handle login page and form submission"""
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        
        if user and check_password_hash(user.password_hash, form.password.data):
            login_user(user, remember=form.remember_me.data)
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'access_token': user.generate_access_token(),
                    'refresh_token': user.generate_refresh_token(),
                    'message': 'Login successful'
                })
            flash('Login successful!', 'success')
            next_page = request.args.get('next')
            if not next_page or not next_page.startswith('/'):
                next_page = url_for('main.dashboard')
            return redirect(next_page)
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'message': 'Invalid email or password'
                }), 401
            flash('Invalid email or password', 'error')
    
    # Clear any existing flash messages when showing the login form
    if request.method == 'GET':
        session.pop('_flashes', None)
    
    return render_template('auth/login.html', form=form)

@bp.route('/dashboard')
@login_required
def dashboard():
    """Serve the dashboard page with role-specific content"""
    try:
        context = {}
        
        # Debug logging
        print(f"Current user: {current_user.email}, Role: {current_user.role}")
        
        # Convert role to string for comparison
        role_str = str(current_user.role)
        
        if role_str == 'admin':
            # Get counts for admin dashboard
            context.update({
                'total_users': User.query.count(),
                'total_accidents': Accident.query.count(),
                'total_claims': InsuranceClaim.query.count()
            })
        elif role_str == 'police':
            # Get recent accidents for police dashboard
            context['recent_accidents'] = Accident.query.order_by(Accident.date_time.desc()).limit(5).all()
        elif role_str in ['insurance_agent', 'insurance_officer']:
            # Get recent claims for insurance officer dashboard
            context['recent_claims'] = InsuranceClaim.query.order_by(InsuranceClaim.created_at.desc()).limit(5).all()
        else:
            # Handle unknown role
            flash('Invalid user role', 'error')
            return redirect(url_for('main.logout'))
        
        return render_template('dashboard.html', **context)
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"Dashboard error: {str(e)}")
        print(traceback.format_exc())
        flash(f'Error loading dashboard: {str(e)}', 'error')
        return render_template('error.html', error=str(e)), 500

@bp.route('/logout')
@login_required
def logout():
    """Handle user logout"""
    logout_user()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('main.login')) 