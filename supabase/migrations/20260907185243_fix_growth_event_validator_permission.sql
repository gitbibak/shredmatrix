-- CHECK constraints run their validator with the caller's function privileges.
-- This pure JSON validator exposes no stored data and remains in private.
GRANT EXECUTE ON FUNCTION private.analytics_properties_are_safe(JSONB) TO authenticated;

-- Rollback: REVOKE EXECUTE ON FUNCTION private.analytics_properties_are_safe(JSONB) FROM authenticated;
-- No table privileges, RLS policies, event records, or consent settings change.
