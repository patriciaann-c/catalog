export default function checkProductBody(req, res, next) {
    const { name, description, price, image } = req.body ?? {};
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Name is required', data: null });
    }
    if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({ success: false, message: 'The description needs to be string', data: null });
    }
    let sanitizedImage = undefined;
    if (image !== undefined) {
        if (image !== null && typeof image !== 'string') {
            return res.status(400).json({ success: false, message: 'The image needs to be a string', data: null });
        }
        sanitizedImage = (image ?? '').trim() || null;
        if (sanitizedImage !== null) {
            if (sanitizedImage.length > 500) {
                return res.status(400).json({
                    success: false,
                    message: 'Image must have less than 500 characters',
                    data: null
                });
            }
            let imageUrl;
            try {
                imageUrl = new URL(sanitizedImage);
            } catch {
                imageUrl = null;
            }
            if (imageUrl === null || (imageUrl.protocol !== 'http:' && imageUrl.protocol !== 'https:')) {
                return res.status(400).json({
                    success: false,
                    message: 'The URL of image needs to start with http:// or https://',
                    data: null
                });
            }
        }
    }
    if (price === undefined || price === null || price === '' || !Number.isFinite(Number(price)) ||
        Number(price) <= 0 || Number(price) >= 100000000) {
        return res.status(400).json({
            success: false,
            message: 'The price is required and needs to have a number between 0 and 100000000',
            data: null
        });
    }
    req.sanitizedData = {
        name: name.trim(),
        description: (description ?? '').trim(),
        price: Number(price),
        image: sanitizedImage
    };
    next();
}