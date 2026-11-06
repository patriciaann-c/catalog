export default function checkProductId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: `parametro id "${req.params.id}" errato`,
            data: null
        });
    }
    next();
}