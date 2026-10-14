-- Migration 013: Enhanced Account Type and Google OAuth Detection
-- Accurately identifies Google-only accounts vs Email/Password accounts

CREATE OR REPLACE FUNCTION check_password_reset_eligibility(p_email VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_user RECORD;
    v_has_password BOOLEAN := FALSE;
    v_is_google BOOLEAN := FALSE;
    v_has_email_provider BOOLEAN := FALSE;
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

    -- Check if provider is google in metadata
    IF (v_user.raw_app_meta_data->>'provider' = 'google' OR v_user.raw_app_meta_data->'providers' @> '["google"]'::jsonb) THEN
        v_is_google := TRUE;
    END IF;

    -- Check if user has email provider in metadata
    IF (v_user.raw_app_meta_data->>'provider' = 'email' OR v_user.raw_app_meta_data->'providers' @> '["email"]'::jsonb) THEN
        v_has_email_provider := TRUE;
    END IF;

    -- Check identities table
    IF EXISTS (
        SELECT 1 FROM auth.identities 
        WHERE user_id = v_user.id AND provider = 'google'
    ) AND NOT EXISTS (
        SELECT 1 FROM auth.identities 
        WHERE user_id = v_user.id AND provider = 'email'
    ) THEN
        v_is_google := TRUE;
        v_has_email_provider := FALSE;
    END IF;

    -- Case 2: User registered via Google and has NO email password
    IF v_is_google AND (NOT v_has_email_provider OR NOT v_has_password) THEN
        RETURN json_build_object(
            'status', 'google_only',
            'eligible', FALSE,
            'provider', 'google',
            'message', 'This account is registered using Google Sign-In and does not have an application password. Please sign in with Google.'
        );
    END IF;

    IF NOT v_has_password THEN
        RETURN json_build_object(
            'status', 'google_only',
            'eligible', FALSE,
            'provider', 'google',
            'message', 'This account does not have an application password. Please sign in with Google.'
        );
    END IF;

    -- Case 3: User has an application password (eligible for reset)
    RETURN json_build_object(
        'status', 'eligible',
        'eligible', TRUE,
        'user_id', v_user.id,
        'provider', 'email',
        'message', 'Eligible for password recovery.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure procedure to update user password
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

REVOKE ALL ON FUNCTION admin_set_user_password(VARCHAR, VARCHAR) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_set_user_password(VARCHAR, VARCHAR) TO service_role;

