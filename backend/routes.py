from flask import jsonify, request, Blueprint, url_for, redirect, current_app
from models import db, Donor, Donation, Campaign, User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import json

# Create blueprints for different route groups
api = Blueprint('api', __name__)
admin = Blueprint('admin', __name__)
auth = Blueprint('auth', __name__)

# Donor Routes
@api.route('/donors', methods=['GET'])
@jwt_required()
def get_donors():
    """Get all donors"""
    donors = Donor.query.all()
    return jsonify({
        'success': True,
        'data': [donor.to_dict() for donor in donors]
    })

@api.route('/donors/<int:donor_id>', methods=['GET'])
@jwt_required()
def get_donor(donor_id):
    """Get a specific donor"""
    donor = Donor.query.get_or_404(donor_id)
    return jsonify({
        'success': True,
        'data': donor.to_dict()
    })

@api.route('/donors', methods=['POST'])
@jwt_required()
def create_donor():
    """Create a new donor"""
    data = request.get_json()
    
    # Validate required fields
    if not data or 'first_name' not in data or 'last_name' not in data:
        return jsonify({
            'success': False,
            'message': 'First name and last name are required'
        }), 400
    
    # Check if email already exists
    if 'email' in data and data['email']:
        existing_donor = Donor.query.filter_by(email=data['email']).first()
        if existing_donor:
            return jsonify({
                'success': False,
                'message': 'A donor with this email already exists'
            }), 400
    
    # Create new donor
    new_donor = Donor(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data.get('email'),
        phone=data.get('phone'),
        address=data.get('address'),
        city=data.get('city'),
        province=data.get('province'),
        postal_code=data.get('postal_code'),
        donor_type=data.get('donor_type', 'individual'),
        notes=data.get('notes')
    )
    
    db.session.add(new_donor)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Donor created successfully',
        'data': new_donor.to_dict()
    }), 201

@api.route('/donors/<int:donor_id>', methods=['PUT'])
@jwt_required()
def update_donor(donor_id):
    """Update a donor"""
    donor = Donor.query.get_or_404(donor_id)
    data = request.get_json()
    
    # Update donor fields
    if 'first_name' in data:
        donor.first_name = data['first_name']
    if 'last_name' in data:
        donor.last_name = data['last_name']
    if 'email' in data:
        donor.email = data['email']
    if 'phone' in data:
        donor.phone = data['phone']
    if 'address' in data:
        donor.address = data['address']
    if 'city' in data:
        donor.city = data['city']
    if 'province' in data:
        donor.province = data['province']
    if 'postal_code' in data:
        donor.postal_code = data['postal_code']
    if 'donor_type' in data:
        donor.donor_type = data['donor_type']
    if 'notes' in data:
        donor.notes = data['notes']
    
    donor.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Donor updated successfully',
        'data': donor.to_dict()
    })

@api.route('/donors/<int:donor_id>', methods=['DELETE'])
@jwt_required()
def delete_donor(donor_id):
    """Delete a donor"""
    donor = Donor.query.get_or_404(donor_id)
    
    # Check if donor has donations
    if donor.donations:
        return jsonify({
            'success': False,
            'message': 'Cannot delete donor with existing donations'
        }), 400
    
    db.session.delete(donor)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Donor deleted successfully'
    })

# Donation Routes
@api.route('/donations', methods=['GET'])
@jwt_required()
def get_donations():
    """Get all donations"""
    donations = Donation.query.all()
    return jsonify({
        'success': True,
        'data': [donation.to_dict() for donation in donations]
    })

@api.route('/donations/<int:donation_id>', methods=['GET'])
@jwt_required()
def get_donation(donation_id):
    """Get a specific donation"""
    donation = Donation.query.get_or_404(donation_id)
    return jsonify({
        'success': True,
        'data': donation.to_dict()
    })

@api.route('/donors/<int:donor_id>/donations', methods=['GET'])
@jwt_required()
def get_donor_donations(donor_id):
    """Get all donations for a specific donor"""
    donor = Donor.query.get_or_404(donor_id)
    return jsonify({
        'success': True,
        'data': [donation.to_dict() for donation in donor.donations]
    })

@api.route('/donations', methods=['POST'])
@jwt_required()
def create_donation():
    """Create a new donation"""
    data = request.get_json()
    
    # Validate required fields
    if not data or 'donor_id' not in data or 'amount' not in data:
        return jsonify({
            'success': False,
            'message': 'Donor ID and amount are required'
        }), 400
    
    # Check if donor exists
    donor = Donor.query.get(data['donor_id'])
    if not donor:
        return jsonify({
            'success': False,
            'message': 'Donor not found'
        }), 404
    
    # Create new donation
    new_donation = Donation(
        donor_id=data['donor_id'],
        amount=data['amount'],
        donation_date=datetime.fromisoformat(data['donation_date']) if 'donation_date' in data else datetime.utcnow(),
        payment_method=data.get('payment_method'),
        is_recurring=data.get('is_recurring', False),
        receipt_number=data.get('receipt_number'),
        campaign=data.get('campaign'),
        notes=data.get('notes')
    )
    
    db.session.add(new_donation)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Donation recorded successfully',
        'data': new_donation.to_dict()
    }), 201

@api.route('/donations/<int:donation_id>', methods=['PUT'])
@jwt_required()
def update_donation(donation_id):
    """Update a donation"""
    donation = Donation.query.get_or_404(donation_id)
    data = request.get_json()
    
    # Update donation fields
    if 'amount' in data:
        donation.amount = data['amount']
    if 'donation_date' in data:
        donation.donation_date = datetime.fromisoformat(data['donation_date'])
    if 'payment_method' in data:
        donation.payment_method = data['payment_method']
    if 'is_recurring' in data:
        donation.is_recurring = data['is_recurring']
    if 'receipt_number' in data:
        donation.receipt_number = data['receipt_number']
    if 'campaign' in data:
        donation.campaign = data['campaign']
    if 'notes' in data:
        donation.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Donation updated successfully',
        'data': donation.to_dict()
    })

@api.route('/donations/<int:donation_id>', methods=['DELETE'])
@jwt_required()
def delete_donation(donation_id):
    """Delete a donation"""
    donation = Donation.query.get_or_404(donation_id)
    
    db.session.delete(donation)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Donation deleted successfully'
    })

# Campaign Routes
@api.route('/campaigns', methods=['GET'])
@jwt_required()
def get_campaigns():
    """Get all campaigns"""
    campaigns = Campaign.query.all()
    return jsonify({
        'success': True,
        'data': [campaign.to_dict() for campaign in campaigns]
    })

@api.route('/campaigns/<int:campaign_id>', methods=['GET'])
@jwt_required()
def get_campaign(campaign_id):
    """Get a specific campaign"""
    campaign = Campaign.query.get_or_404(campaign_id)
    return jsonify({
        'success': True,
        'data': campaign.to_dict()
    })

# Authentication Routes
@auth.route('/login', methods=['POST'])
def login():
    """Login a user and return a JWT token"""
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({
            'success': False,
            'message': 'Email and password are required'
        }), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({
            'success': False,
            'message': 'Invalid email or password'
        }), 401
    
    # Create JWT token
    access_token = create_access_token(identity=user.id)
    
    # Login user for session-based auth
    login_user(user)
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'data': {
            'access_token': access_token,
            'user': user.to_dict()
        }
    })

@auth.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout the current user"""
    logout_user()
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    })

@auth.route('/register', methods=['POST'])
@jwt_required()
def register_user():
    """Register a new staff user (admin only)"""
    # Check if current user is admin
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role != 'admin':
        return jsonify({
            'success': False,
            'message': 'Admin privileges required'
        }), 403
    
    data = request.get_json()
    
    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({
            'success': False,
            'message': 'Username, email, and password are required'
        }), 400
    
    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({
            'success': False,
            'message': 'Username already exists'
        }), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({
            'success': False,
            'message': 'Email already exists'
        }), 400
    
    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email'],
        role=data.get('role', 'staff')
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'User registered successfully',
        'data': new_user.to_dict()
    }), 201

# Admin Routes
@admin.route('/campaigns', methods=['POST'])
@jwt_required()
def create_campaign():
    """Create a new fundraising campaign"""
    # Check if current user is admin
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role != 'admin':
        return jsonify({
            'success': False,
            'message': 'Admin privileges required'
        }), 403
    
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({
            'success': False,
            'message': 'Campaign name is required'
        }), 400
    
    # Create new campaign
    new_campaign = Campaign(
        name=data['name'],
        description=data.get('description'),
        start_date=datetime.fromisoformat(data['start_date']).date() if 'start_date' in data else None,
        end_date=datetime.fromisoformat(data['end_date']).date() if 'end_date' in data else None,
        goal_amount=data.get('goal_amount')
    )
    
    db.session.add(new_campaign)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Campaign created successfully',
        'data': new_campaign.to_dict()
    }), 201

@admin.route('/campaigns/<int:campaign_id>', methods=['PUT'])
@jwt_required()
def update_campaign(campaign_id):
    """Update a campaign"""
    # Check if current user is admin
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role != 'admin':
        return jsonify({
            'success': False,
            'message': 'Admin privileges required'
        }), 403
    
    campaign = Campaign.query.get_or_404(campaign_id)
    data = request.get_json()
    
    # Update campaign fields
    if 'name' in data:
        campaign.name = data['name']
    if 'description' in data:
        campaign.description = data['description']
    if 'start_date' in data:
        campaign.start_date = datetime.fromisoformat(data['start_date']).date()
    if 'end_date' in data:
        campaign.end_date = datetime.fromisoformat(data['end_date']).date()
    if 'goal_amount' in data:
        campaign.goal_amount = data['goal_amount']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Campaign updated successfully',
        'data': campaign.to_dict()
    })

@admin.route('/campaigns/<int:campaign_id>', methods=['DELETE'])
@jwt_required()
def delete_campaign(campaign_id):
    """Delete a campaign"""
    # Check if current user is admin
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.role != 'admin':
        return jsonify({
            'success': False,
            'message': 'Admin privileges required'
        }), 403
    
    campaign = Campaign.query.get_or_404(campaign_id)
    
    db.session.delete(campaign)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Campaign deleted successfully'
    })

@admin.route('/reports/donations', methods=['GET'])
@jwt_required()
def donation_reports():
    """Generate donation reports"""
    # Check if current user is admin or staff
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({
            'success': False,
            'message': 'Authentication required'
        }), 401
    
    # Get date range parameters
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    
    try:
        if start_date_str:
            start_date = datetime.fromisoformat(start_date_str)
        else:
            # Default to 30 days ago
            start_date = datetime.utcnow() - timedelta(days=30)
            
        if end_date_str:
            end_date = datetime.fromisoformat(end_date_str)
        else:
            end_date = datetime.utcnow()
    except ValueError:
        return jsonify({
            'success': False,
            'message': 'Invalid date format. Use ISO format (YYYY-MM-DD)'
        }), 400
    
    # Query donations in date range
    donations = Donation.query.filter(
        Donation.donation_date >= start_date,
        Donation.donation_date <= end_date
    ).all()
    
    # Calculate statistics
    total_amount = sum(float(donation.amount) for donation in donations)
    avg_amount = total_amount / len(donations) if donations else 0
    donor_count = len(set(donation.donor_id for donation in donations))
    recurring_count = sum(1 for donation in donations if donation.is_recurring)
    
    # Group by payment method
    payment_methods = {}
    for donation in donations:
        method = donation.payment_method or 'Unknown'
        if method not in payment_methods:
            payment_methods[method] = 0
        payment_methods[method] += float(donation.amount)
    
    return jsonify({
        'success': True,
        'data': {
            'total_amount': total_amount,
            'donation_count': len(donations),
            'average_amount': avg_amount,
            'donor_count': donor_count,
            'recurring_count': recurring_count,
            'payment_methods': payment_methods,
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }
    })

def register_routes(app):
    """Register all blueprints with the app"""
    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(admin, url_prefix='/admin')
