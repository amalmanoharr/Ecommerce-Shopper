const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
app.use(express.json());
app.use(cors());

//Database connection with Mongodb
mongoose.connect("mongodb+srv://amalmanoharr:Suku8921Muni@cluster9526.v46xo0a.mongodb.net/e-commerce")

//API creation

app.get('/',(req,res)=>{
    res.send("Express App is Running");
})
app.listen(port,(error)=>{
    if(!error){
        console.log('Server Running on port'+port);
    }
    else{
        console.log('Error :'+error);
    }

});

//Image Storage Engine
//to add product in db
const storage = multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

//Creating uplaod end point for images

app.use('/images',express.static('upload/images'))

app.post('/upload',upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`https://localhost:${port}/images/${req.file.filename}`
    })
    console.log("upload")
})

//Schema for creating products

const Product = mongoose.model("Product",{
    id:{
        type:Number,
        Required:true,
    },
    name:{
        type:String,
        Required:true,
    },
    image:{
        type:String,
        Required:true,
    },
    category:{
        type:String,
        Required:true,
    },
    new_price:{
        type:Number,
        Required:true,
    },
    old_price:{
        type:Number,
        Required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },
})

app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else{
        id = 1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price
    })
    console.log(product)
    await product.save();
    console.log("Saved");
    res.json({
        success:"true",
        name:req.body.name,
    })
})

//Creating API for deleting products

app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id})
    console.log('Removed');
    res.json({
        success:true,
        name:req.body.name,
    })
})

//Creating API for getting all products

app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    console.log("all products fetched");
    res.send(products);
})

//Schema creating for user model

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now(),
    },
})

//Creating the endpoint for registering the user

app.post('/signup',async(req,res)=>{
    let check = await Users.findOne({email:req.body.email});
    if (check){
        return res.status(400).json({success:false,errors:"Existing account found with the same email address"})
    }
    cart = {}
    for(let i=0;i<300;i++){
        cart[i] = 0
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart
    })
    await user.save();
    const data = {
        user:{
            id:user.id
        }
    }
    const token = jwt.sign(data,'secret_ecom')
    res.json({success:true,token})
})

//Creating endpoint for userlogin

app.post('/login',async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if (user) {
        passCompare = req.body.password === user.password;
        if (passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,"secret_ecom")
            res.json({success:true,token})
        }
        else{
            res.json({success:false,errors:"Wrong Password"})
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email-id"})
    }
})