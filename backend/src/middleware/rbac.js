/**
 * Role-Based Access Control Middleware.
 * 
 * Role hierarchy:
 *   VIEWER  → read only (GET requests on records)
 *   ANALYST → read + dashboard access
 *   ADMIN   → full access (CRUD on users + records + dashboard)
 * 
 * Usage: authorize('ADMIN') or authorize('ANALYST', 'ADMIN')
 */

const ROLE_HIERARCHY = {
  VIEWER: 1,
  ANALYST: 2,
  ADMIN: 3,
};

/**
 * Returns middleware that checks if the authenticated user
 * has one of the allowed roles.
 * @param  {...string} allowedRoles - Roles permitted for this route
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${userRole}.`,
      });
    }

    next();
  };
}

module.exports = { authorize, ROLE_HIERARCHY };
