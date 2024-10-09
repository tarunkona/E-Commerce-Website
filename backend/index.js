import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();
const port = 4000;
const app = express();

app.use(express.json());
app.use(cors());


// Datbase Connection with MongoDB
const mongoPassword = process.env.MONGO_PASSWORD;
mongoose.connect(`mongodb+srv://tarunsai2203:${mongoPassword}@cluster0.5msq7.mongodb.net/e-commerce`);


//API Creation
app.get("/", (req, res) =>{
    res.send("Express App is Running");
})

//Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb)=>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage : storage});

//Creating upload endpoint for images
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) =>{
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
    // console.log("Uploaded product successfully!!");
})

//Schema for Creating Products
const Product = mongoose.model("Product",{
    id: {
        type: Number,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    new_price:{
        type: Number,
        required: true
    },
    old_price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    available: {
        type: Boolean,
        default: true
    }
})

//Adding product to database
app.post('/addproduct', async (req, res)=>{
    let products = await Product.find({});
    let id;
    if(products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else{
        id = 1;
    }

    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success: true,
        name: req.body.name
    })
})

//Creating API for deleting Products
app.post('/removeproduct', async (req,res) =>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name : req.body.name
    });
})

//Creating API for getting all products
app.get('/allproducts', async (req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})  

//Schema for USER model.
const Users = mongoose.model("Users",{
    name: {
        type:String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    cartData: {
        type: Object
    },
    date: {
        type: Date,
        default: Date.now
    }
})

//Creating Endpoint for user Creation / Registering the User
app.post('/signup', async (req,res) =>{
    
    let check = await Users.findOne({email: req.body.email});
    if(check){
        return res.status(400).json({success: false, errors: "Existing User found with same email address"});
    }
    let cart = {};
    for(let i=0; i < 300; i++){
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart
    })

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }

    const token = jwt.sign(data,'secret_ecom');
    res.json({success: true, token});
    

})

//Creating endpoint for user login
app.post('/login', async (req, res)=>{
    let user = await Users.findOne({email : req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(data, 'secret_ecom');
            res.json({success : true, token});
        }
        else{
            res.json({success: false,errors: "Wrong Password"});
        }
    }
    else{
        res.json({success: false, errors: "Wrong Email Id / User does not exist"});
    }
})

//Creating endpoint for new collection data
app.get('/newcollections', async (req,res) =>{
    let products = await Product.find({});
    let newCollection = products.slice(-8);
    console.log('New Collections Fetched');
    res.send(newCollection);
})

//Creating endpoint for Popular in women
app.get('/popularinwomen', async (req,res) => {
    let products = await Product.find({category: "women"});
    let popularInWomen = products.slice(0,4);
    console.log("Popular in Women Fetched");
    res.send(popularInWomen);
})

//creating endpoints for adding products in Cart
app.post('/addtocart', async (req, res)=>{
    
})

app.listen(port, (error)=>{
    if(!error){
        console.log("Server is Running on Port " + port);
    }
    else{
        console.log("Error " + error);
    }
})