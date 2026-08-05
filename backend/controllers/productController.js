const Product = require('../model/product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uploadsDir = path.join(__dirname, '..', 'uploads');

const isCloudinaryConfigReady = () => {
    return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
        process.env.CLOUDINARY_API_KEY?.trim() &&
        process.env.CLOUDINARY_API_SECRET?.trim()
    );
};

const uploadImageToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        if (!isCloudinaryConfigReady()) {
            reject(new Error('Cloudinary credentials are missing in backend/.env'));
            return;
        }

        const stream = cloudinary.uploader.upload_stream(
            { folder: 'shopnest/products' },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        stream.end(fileBuffer);
    });
};

const shouldSaveFailedUploadsLocally = () => {
    // Product creation must not depend on a third-party image service being
    // available. Cloudinary is used first; local storage is the safe fallback.
    // Set ALLOW_LOCAL_IMAGE_FALLBACK=false only when Cloudinary uploads must be
    // enforced (for example, on a production deployment).
    return process.env.NODE_ENV !== 'production' && String(process.env.ALLOW_LOCAL_IMAGE_FALLBACK).toLowerCase() !== 'false';
};

const saveImageLocally = (req) => {
    fs.mkdirSync(uploadsDir, { recursive: true });

    const extension = path.extname(req.file.originalname) || '.jpg';
    const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, req.file.buffer);

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

    return {
        secure_url: imageUrl,
        public_id: `local/${fileName}`,
        storage: 'local'
    };
};

const uploadProductImage = async (req) => {
    try {
        return await uploadImageToCloudinary(req.file.buffer);
    } catch (error) {
        const statusCode = getErrorStatusCode(error);

        if (shouldSaveFailedUploadsLocally()) {
            console.warn(`Cloudinary upload failed (${statusCode || 'no-code'}). Saving image locally instead.`);
            return saveImageLocally(req);
        }

        throw error;
    }
};

const getErrorStatusCode = (error) => {
    return error.http_code || error.statusCode || 500;
};

const getClientErrorMessage = (error) => {
    if (getErrorStatusCode(error) === 403 || String(error.message).includes('403')) {
        return 'Cloudinary upload failed with 403. Your Cloudinary credentials authenticate, but uploads are forbidden. Check your Cloudinary account status, Upload API permissions, restricted API key settings, quota/billing, or create a new unrestricted API key. Set ALLOW_LOCAL_IMAGE_FALLBACK=true only if you want temporary local image storage.';
    }

    return error.message || 'Server error';
};

const toNumber = (value) => {
    if (value === undefined || value === null || value === '') {
        return value;
    }

    return Number(value);
};

const getImageUrlFromBody = (body) => {
    return body.imageUrl || body.imageURL || body.image || body.secureUrl;
};

const setProductImageFields = (product, imageUrl, publicId) => {
    product.image = imageUrl;
    product.imageUrl = imageUrl;
    product.imageURL = imageUrl;
    product.secureUrl = imageUrl;

    if (publicId) {
        product.cloudinaryPublicId = publicId;
    }
};

const resolveProductImage = async (req) => {
    if (req.file) {
        const result = await uploadProductImage(req);

        return {
            imageUrl: result.secure_url,
            publicId: result.public_id
        };
    }

    const imageUrl = getImageUrlFromBody(req.body);

    if (!imageUrl) {
        return null;
    }

    return {
        imageUrl,
        publicId: req.body.cloudinaryPublicId
    };
};

const getProducts = async (req, res) =>{
    try{
        const products = await Product.find({});
        res.json(products);
    } catch(error){
        console.error('Get products failed:', error.message);
        res.status(500).json({message: 'Server error'});
    }
};


const getProductById = async (req, res) =>{
    try{
        const product = await Product.findById(req.params.id);
        if(product){
            res.json(product);
        }
        else{
            res.status(404).json({message: 'Product not found'});
        }
    } catch (error){
        console.error('Get product failed:', error.message);
        res.status(500).json({message: 'Server error'});
    }
};


const createProduct = async (req, res) =>{
    try{
        const {name, description, price, category, stock} = req.body;
        const requestedImageUrl = getImageUrlFromBody(req.body);

        if (![name, description, category].every((value) => String(value || '').trim()) ||
            !Number.isFinite(Number(price)) || Number(price) < 0 ||
            !Number.isInteger(Number(stock)) || Number(stock) < 0) {
            return res.status(400).json({ message: 'Name, description, category, a non-negative price, and a whole-number stock value are required.' });
        }

        const imageDetails = await resolveProductImage(req);

        if (!imageDetails) {
            return res.status(400).json({message: 'Product image is required. Upload form-data key "image" or send imageUrl in the request body.'});
        }

        const product = new Product({
            name,
            description,
            price: toNumber(price),
            category,
            stock: toNumber(stock)
        });
        setProductImageFields(product, imageDetails.imageUrl, imageDetails.publicId);

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Create product failed:', error.message);
        res.status(getErrorStatusCode(error)).json({message: getClientErrorMessage(error)});
    }

};


const updateProduct = async (req, res) =>{
    try{
        const {name, description, price, category, stock} = req.body;
        const product = await Product.findById(req.params.id);
        if(product){
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price !== undefined ? toNumber(price) : product.price;
            product.category = category || product.category;
            product.stock = stock !== undefined ? toNumber(stock) : product.stock;

            const imageDetails = await resolveProductImage(req);
            if(imageDetails){
                setProductImageFields(product, imageDetails.imageUrl, imageDetails.publicId);
            }

            const updateProduct = await product.save();
            res.json(updateProduct);
        }
        else{
            res.status(404).json({message: 'Product not found'});
        }
    } catch(error){
        console.error('Update product failed:', error.message);
        res.status(getErrorStatusCode(error)).json({message: getClientErrorMessage(error)});
    }
};


const deleteProduct = async (req, res) =>{
    try{
        const product = await Product.findById(req.params.id);
        if(product){
            await product.deleteOne();
            res.json({message: 'Product removed'});
        }
        else{
            res.status(404).json({message: 'Product not found'});
        }

    } catch (error){
        res.status(500).json({message: 'Server error'});
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    updateProduct
}
