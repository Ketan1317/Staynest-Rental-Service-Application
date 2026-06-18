const rbac = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }
      console.log()
      next();
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: "RBAC middleware error" });
    }
  };
};

export default rbac;
