from app.models import User, UserRole
from app import db
from typing import Optional, Tuple
from datetime import datetime

class AuthService:
    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[User]:
        """
        Authenticate a user with email and password.
        
        Args:
            email (str): User's email address
            password (str): User's password
            
        Returns:
            Optional[User]: User object if authentication successful, None otherwise
        """
        user = User.query.filter_by(email=email.lower()).first()
        if user and user.check_password(password):
            return user
        return None
    
    @staticmethod
    def create_user(email: str, password: str, name: str, role: UserRole, company_id: Optional[str] = None) -> Tuple[User, bool]:
        """
        Create a new user.
        
        Args:
            email (str): User's email address
            password (str): User's password
            name (str): User's full name
            role (UserRole): User's role
            company_id (Optional[str]): Company ID for insurance officers
            
        Returns:
            Tuple[User, bool]: (User object, success status)
        """
        try:
            # Check if user already exists
            if User.query.filter_by(email=email.lower()).first():
                return None, False
            
            # Create new user
            user = User(
                email=email,
                password=password,
                name=name,
                role=role,
                company_id=company_id
            )
            
            db.session.add(user)
            db.session.commit()
            
            return user, True
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    @staticmethod
    def update_user(user_id: int, **kwargs) -> Tuple[User, bool]:
        """
        Update user information.
        
        Args:
            user_id (int): ID of the user to update
            **kwargs: Fields to update (name, email, password, etc.)
            
        Returns:
            Tuple[User, bool]: (Updated User object, success status)
        """
        try:
            user = User.query.get(user_id)
            if not user:
                return None, False
            
            # Update fields
            for key, value in kwargs.items():
                if key == 'password':
                    user.set_password(value)
                elif hasattr(user, key):
                    setattr(user, key, value)
            
            db.session.commit()
            return user, True
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    @staticmethod
    def deactivate_user(user_id: int) -> bool:
        """
        Deactivate a user account.
        
        Args:
            user_id (int): ID of the user to deactivate
            
        Returns:
            bool: Success status
        """
        try:
            user = User.query.get(user_id)
            if not user:
                return False
            
            user.is_active = False
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    @staticmethod
    def reactivate_user(user_id: int) -> bool:
        """
        Reactivate a user account.
        
        Args:
            user_id (int): ID of the user to reactivate
            
        Returns:
            bool: Success status
        """
        try:
            user = User.query.get(user_id)
            if not user:
                return False
            
            user.is_active = True
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    @staticmethod
    def get_users_by_role(role: UserRole) -> list:
        """
        Get all users with a specific role.
        
        Args:
            role (UserRole): Role to filter by
            
        Returns:
            list: List of User objects
        """
        return User.query.filter_by(role=role).all()
    
    @staticmethod
    def get_users_by_company(company_id: str) -> list:
        """
        Get all users from a specific insurance company.
        
        Args:
            company_id (str): Company ID to filter by
            
        Returns:
            list: List of User objects
        """
        return User.query.filter_by(company_id=company_id).all() 