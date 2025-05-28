import re
from typing import Tuple, List

def validate_password(password: str) -> Tuple[bool, List[str]]:
    """
    Validate password strength.
    Returns a tuple of (is_valid, list_of_errors)
    """
    errors = []
    
    # Check minimum length
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    # Check for uppercase letters
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    
    # Check for lowercase letters
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    
    # Check for numbers
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one number")
    
    # Check for special characters
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)")
    
    # Check for common patterns
    common_patterns = [
        r'123456',
        r'password',
        r'qwerty',
        r'admin',
        r'welcome',
        r'letmein',
        r'111111',
        r'abc123'
    ]
    for pattern in common_patterns:
        if pattern.lower() in password.lower():
            errors.append("Password contains a common pattern")
            break
    
    return len(errors) == 0, errors 