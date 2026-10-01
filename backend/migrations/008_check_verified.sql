CREATE OR REPLACE FUNCTION is_user_verified(p_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_verified BOOLEAN;
BEGIN
    SELECT COALESCE((raw_user_meta_data->>'is_verified')::BOOLEAN, FALSE)
    INTO v_verified
    FROM auth.users
    WHERE email = p_email
    LIMIT 1;
    
    RETURN COALESCE(v_verified, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
