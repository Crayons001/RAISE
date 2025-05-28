from flask import Blueprint, jsonify, render_template, redirect, url_for, flash, request, session
from flask_login import login_required, current_user, logout_user, login_user
from datetime import datetime, timedelta
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Email

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    """Redirect to dashboard for UI preview"""
    return redirect(url_for('main.dashboard'))

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
    form = LoginForm()
    if form.validate_on_submit():
        # Temporarily bypass authentication for UI preview
        flash('Login successful! (Preview Mode)', 'success')
        return redirect(url_for('main.dashboard'))
    
    return render_template('auth/login.html', form=form)

@bp.route('/dashboard')
def dashboard():
    """Serve the dashboard page with dummy data for UI preview"""
    try:
        # Dummy data for statistics
        context = {
            'total_reports': 42,
            'pending_reports': 15,
            'investigating_reports': 12,
            'completed_reports': 15,
            'recent_reports': [
                {
                    'id': 1,
                    'report_number': 'ACC-2024-001',
                    'date': '2024-05-28',
                    'time': '14:30',
                    'location': 'Main Street, Downtown',
                    'vehicles': 2,
                    'status': 'pending'
                },
                {
                    'id': 2,
                    'report_number': 'ACC-2024-002',
                    'date': '2024-05-28',
                    'time': '13:15',
                    'location': 'Highway 101, Exit 45',
                    'vehicles': 3,
                    'status': 'verified'
                },
                {
                    'id': 3,
                    'report_number': 'ACC-2024-003',
                    'date': '2024-05-27',
                    'time': '16:45',
                    'location': 'Park Avenue, Near Mall',
                    'vehicles': 2,
                    'status': 'resolved'
                },
                {
                    'id': 4,
                    'report_number': 'ACC-2024-004',
                    'date': '2024-05-27',
                    'time': '11:20',
                    'location': 'River Road, Bridge',
                    'vehicles': 1,
                    'status': 'pending'
                },
                {
                    'id': 5,
                    'report_number': 'ACC-2024-005',
                    'date': '2024-05-26',
                    'time': '09:30',
                    'location': 'School Street, Near Park',
                    'vehicles': 2,
                    'status': 'verified'
                }
            ],
            'time_labels': [
                '2024-05-22', '2024-05-23', '2024-05-24', 
                '2024-05-25', '2024-05-26', '2024-05-27', '2024-05-28'
            ],
            'time_data': [3, 5, 2, 4, 6, 3, 5]
        }

        return render_template('dashboard.html', **context)
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"Dashboard error: {str(e)}")
        print(traceback.format_exc())
        flash(f'Error loading dashboard: {str(e)}', 'error')
        return render_template('error.html', error=str(e)), 500

@bp.route('/logout')
def logout():
    """Handle user logout"""
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('main.login')) 