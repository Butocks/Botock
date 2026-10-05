-- Migration 009: Secure Password Recovery Eligibility and Reset Engine
-- Handles distinction between:
-- 1. Unregistered email addresses (returns not_found)
-- 2. Google OAuth-only accounts without an application password (returns google_only)
-- 3. Accounts with application passwords (either native or Google users who set a password)

CREATE OR REPLACE FUNCTION check_password_reset_eligibility(p_email VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_user RECORD;
    v_has_password BOOLEAN := FALSE;
BEGIN
    -- Query user from auth.users (case-insensitive)
    SELECT 
        id, 
        email, 
        encrypted_password, 
        raw_app_meta_data,
        raw_user_meta_data
    INTO v_user
    FROM auth.users
    WHERE LOWER(email) = LOWER(TRIM(p_email))
    LIMIT 1;

    -- Case 1: Account does not exist in database
    IF NOT FOUND THEN
        RETURN json_build_object(
            'status', 'not_found',
            'eligible', FALSE,
            'message', 'Account not found. No account is registered with this email address.'
        );
    END IF;

    -- Check if user has an application password set
    IF v_user.encrypted_password IS NOT NULL AND LENGTH(TRIM(v_user.encrypted_password)) > 0 THEN
        v_has_password := TRUE;
    END IF;

    -- Case 2: User registered via Google and has NO application password
    IF NOT v_has_password THEN
        RETURN json_build_object(
            'status', 'google_only',
            'eligible', FALSE,
            'message', 'This account is registered using Google Sign-In and does not have an application password. Please sign in with Google.'
        );
    END IF;

    -- Case 3: User has an application password (eligible for reset)
    RETURN json_build_object(
        'status', 'eligible',
        'eligible', TRUE,
        'user_id', v_user.id,
        'message', 'Eligible for password recovery.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure procedure to update user password upon OTP verification
CREATE OR REPLACE FUNCTION admin_set_user_password(p_email VARCHAR, p_password VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE auth.users
    SET encrypted_password = crypt(p_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE LOWER(email) = LOWER(TRIM(p_email));
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
