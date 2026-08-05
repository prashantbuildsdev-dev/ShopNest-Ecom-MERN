const admin = (req, res, next) =>{
    if(req.user && String(req.user.role).trim().toLowerCase() === 'admin'){
        next();
    } else{
        res.status(403).json({message: 'Access denied, admin only'});
    }
};

module.exports = {admin};
