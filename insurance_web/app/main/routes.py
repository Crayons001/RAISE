from flask import render_template, flash, redirect, url_for, request
from flask_login import login_required, current_user
from app import db
from app.main import bp
from app.models.report import Report
from app.models.vehicle import VehicleOwnership
from datetime import datetime, timedelta
from sqlalchemy import func, and_, text

@bp.route('/')
@bp.route('/index')
@login_required
def index():
    # Base query for reports
    report_query = Report.query
    
    # If user is not admin, filter by their company through vehicle ownership
    if current_user.role != 'admin':
        # Join with vehicle ownership to get company-specific reports
        report_query = report_query.join(
            VehicleOwnership,
            and_(
                Report.vehicle_reg_no == VehicleOwnership.vehicle_reg_no,
                VehicleOwnership.company_reg_no == current_user.company_reg_no
            )
        )
    
    # Get statistics for the dashboard
    total_reports = report_query.count()
    
    # Reports in last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_reports = report_query.filter(
        Report.created_at >= thirty_days_ago
    ).count()
    
    # Pending reports (not yet processed)
    pending_reports = report_query.filter(
        Report.status == 'pending'
    ).count()
    
    # Reports flagged for review (rejected status)
    flagged_reports = report_query.filter(
        Report.status == 'rejected'
    ).count()
    
    # Get recent reports for the dashboard
    recent_reports_list = report_query.order_by(
        Report.created_at.desc()
    ).limit(5).all()
    
    # Get monthly report statistics for the chart using SQLite date functions
    monthly_stats = db.session.query(
        func.strftime('%Y-%m', Report.created_at).label('month'),
        func.count(Report.incident_no).label('count')
    ).filter(
        Report.created_at >= thirty_days_ago
    )
    
    # Add company filter for non-admin users
    if current_user.role != 'admin':
        monthly_stats = monthly_stats.join(
            VehicleOwnership,
            and_(
                Report.vehicle_reg_no == VehicleOwnership.vehicle_reg_no,
                VehicleOwnership.company_reg_no == current_user.company_reg_no
            )
        )
    
    monthly_stats = monthly_stats.group_by('month').order_by('month').all()
    
    return render_template('main/index.html',
                         title='Dashboard',
                         total_reports=total_reports,
                         recent_reports=recent_reports,
                         pending_reports=pending_reports,
                         fraud_reports=flagged_reports,
                         recent_reports_list=recent_reports_list,
                         monthly_stats=monthly_stats) 