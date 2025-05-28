from flask import render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.reports import bp
from app.models.report import Report
from app.models.vehicle import VehicleInfo, VehicleOwnership
from datetime import datetime, timedelta
from sqlalchemy import and_

@bp.route('/')
@login_required
def index():
    """List all reports for the current user's company."""
    # Join with vehicle ownership to get company-specific reports
    reports = Report.query.join(
        VehicleOwnership,
        and_(
            Report.vehicle_reg_no == VehicleOwnership.vehicle_reg_no,
            VehicleOwnership.company_reg_no == current_user.company_reg_no
        )
    ).order_by(Report.created_at.desc()).all()
    return render_template('reports/index.html', reports=reports)

@bp.route('/<incident_no>')
@login_required
def view(incident_no):
    """View a specific report."""
    report = Report.query.get_or_404(incident_no)
    # Ensure user has access to this report through vehicle ownership
    ownership = VehicleOwnership.query.filter_by(
        vehicle_reg_no=report.vehicle_reg_no,
        company_reg_no=current_user.company_reg_no
    ).first()
    if not ownership:
        flash('You do not have permission to view this report.', 'error')
        return redirect(url_for('reports.index'))
    return render_template('reports/view.html', report=report)

@bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    """Create a new accident report."""
    if request.method == 'POST':
        # Handle report creation
        vehicle_reg_no = request.form.get('vehicle_reg_no')
        incident_datetime = datetime.strptime(request.form.get('incident_datetime'), '%Y-%m-%d %H:%M')
        location = request.form.get('location')
        badge_no = request.form.get('badge_no')
        
        # Verify vehicle belongs to company
        ownership = VehicleOwnership.query.filter_by(
            vehicle_reg_no=vehicle_reg_no,
            company_reg_no=current_user.company_reg_no
        ).first()
        if not ownership:
            flash('Invalid vehicle selection.', 'error')
            return redirect(url_for('reports.create'))
        
        # Create new report
        report = Report(
            vehicle_reg_no=vehicle_reg_no,
            badge_no=badge_no,
            incident_datetime=incident_datetime,
            location=location,
            status='pending'
        )
        
        db.session.add(report)
        db.session.commit()
        
        flash('Report created successfully.', 'success')
        return redirect(url_for('reports.view', incident_no=report.incident_no))
    
    # Get vehicles owned by the current company
    vehicles = VehicleInfo.query.join(
        VehicleOwnership,
        and_(
            VehicleInfo.vehicle_reg_no == VehicleOwnership.vehicle_reg_no,
            VehicleOwnership.company_reg_no == current_user.company_reg_no
        )
    ).all()
    return render_template('reports/create.html', vehicles=vehicles)

@bp.route('/<incident_no>/update', methods=['POST'])
@login_required
def update(incident_no):
    """Update a report's status."""
    report = Report.query.get_or_404(incident_no)
    # Ensure user has access to this report through vehicle ownership
    ownership = VehicleOwnership.query.filter_by(
        vehicle_reg_no=report.vehicle_reg_no,
        company_reg_no=current_user.company_reg_no
    ).first()
    if not ownership:
        flash('You do not have permission to update this report.', 'error')
        return redirect(url_for('reports.index'))
    
    new_status = request.form.get('status')
    if new_status in ['pending', 'approved', 'rejected']:
        report.status = new_status
        db.session.commit()
        flash('Report status updated successfully.', 'success')
    
    return redirect(url_for('reports.view', incident_no=report.incident_no)) 