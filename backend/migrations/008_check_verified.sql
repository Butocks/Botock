CREATE OR REPLACE FUNCTION is_user_verified(p_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_verified BOOLEAN;
BEGIN
    SELECT COALESCE(
        (raw_app_meta_data->>'is_verified')::BOOLEAN,
        (email_confirmed_at IS NOT NULL),
        FALSE
    )
    INTO v_verified
    FROM auth.users
    WHERE LOWER(email) = LOWER(TRIM(p_email))
    LIMIT 1;
    
    RETURN COALESCE(v_verified, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION is_user_verified(VARCHAR) FROM public, anon;
GRANT EXECUTE ON FUNCTION is_user_verified(VARCHAR) TO authenticated, service_role;

