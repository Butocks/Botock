CREATE TABLE IF NOT EXISTS login_attempts (
    email VARCHAR(255) PRIMARY KEY,
    failed_attempts INT DEFAULT 0,
    lock_until TIMESTAMP WITH TIME ZONE,
    is_24h_locked BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to record failed attempt
CREATE OR REPLACE FUNCTION record_failed_login(p_email VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_attempts INT;
    v_is_24h BOOLEAN;
    v_lock_until TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Upsert the record
    INSERT INTO login_attempts (email, failed_attempts, updated_at)
    VALUES (p_email, 1, NOW())
    ON CONFLICT (email) DO UPDATE 
    SET failed_attempts = login_attempts.failed_attempts + 1,
        updated_at = NOW()
    RETURNING failed_attempts, is_24h_locked, lock_until INTO v_attempts, v_is_24h, v_lock_until;

    IF v_is_24h AND v_lock_until > NOW() THEN
        -- Already 24h locked, do nothing
        RETURN json_build_object('status', 'locked', 'lock_until', v_lock_until);
    END IF;

    IF v_attempts = 3 AND NOT v_is_24h THEN
        -- First 3 strikes -> 15 min lock
        UPDATE login_attempts SET lock_until = NOW() + INTERVAL '15 minutes' WHERE email = p_email;
        RETURN json_build_object('status', 'locked_15m', 'lock_until', NOW() + INTERVAL '15 minutes');
    ELSIF v_attempts >= 6 THEN
        -- Next 3 strikes -> 24 hour lock
        UPDATE login_attempts SET lock_until = NOW() + INTERVAL '24 hours', is_24h_locked = TRUE WHERE email = p_email;
        RETURN json_build_object('status', 'locked_24h', 'lock_until', NOW() + INTERVAL '24 hours');
    END IF;

    RETURN json_build_object('status', 'warn', 'failed_attempts', v_attempts);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check login status
CREATE OR REPLACE FUNCTION check_login_status(p_email VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_record RECORD;
BEGIN
    SELECT * INTO v_record FROM login_attempts WHERE email = p_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object('status', 'ok');
    END IF;

    IF v_record.lock_until IS NOT NULL AND v_record.lock_until > NOW() THEN
        RETURN json_build_object('status', 'locked', 'lock_until', v_record.lock_until);
    END IF;

    -- If lock expired, we should reset if it was a 15m lock?
    -- Actually, if 15m lock expired, and they fail again, they are on attempt 4. 
    -- If they succeed, we reset.
    RETURN json_build_object('status', 'ok');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear attempts on success
CREATE OR REPLACE FUNCTION clear_login_attempts(p_email VARCHAR)
RETURNS VOID AS $$
BEGIN
    DELETE FROM login_attempts WHERE email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
