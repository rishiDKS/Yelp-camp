const express=require('express')
const passport=require('passport');
const router=express.Router()
const catchAsync=require('../utils/catchAsync');
const {isLoggedIn,isAuthor}=require('../middleware.js');
// const ExpressError=require('../utils/ExpressError.js')
const CampGround=require('../models/campground.js');
const methodOverride=require('method-override');
const Review=require("../models/review.js");
const {storage}=require('../cloudinary');
const multer=require('multer');
const upload=multer({storage});
const {cloudinary}=require('../cloudinary');


router.get("/",catchAsync(async(req,res)=>{
    const campgrounds=await CampGround.find({});
    res.render('campgrounds/index',{campgrounds});
}))

router.get("/new",isLoggedIn,(req,res)=>{
    res.render("campgrounds/new");
})

router.post("/",isLoggedIn,upload.array('image'),catchAsync(async(req,res,next)=>{
        const campground=new CampGround(req.body.campground);
        campground.images= req.files.map(f=>({url:f.path,filename:f.filename}));
        campground.author=req.user._id;
        await campground.save();
        req.flash('success',"Successfully created a new Campground")
        res.redirect(`/campgrounds/${campground._id}`)
}))



router.get("/:id",catchAsync(async(req,res)=>{
    const campground=await CampGround.findById(req.params.id).populate({
        path:'reviews',
        populate:{
        path:'author'
        }
    }).populate('author');
    console.log(campground)
    if(!campground){
        req.flash('error',"Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show",{campground});
}))

router.get("/:id/edit",isLoggedIn,isAuthor,catchAsync(async (req,res)=>{
    const {id}=req.params;
    const campground=await CampGround.findById(id);
    if(!campground){
        req.flash('error',"Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit",{campground});
}))

router.put("/:id",isLoggedIn,isAuthor,upload.array('image'),catchAsync(async(req,res)=>{
    const {id}=req.params;
    const campground= await CampGround.findByIdAndUpdate(id,{...req.body.campground});
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});
        console.log(campground);
    }
    await campground.save();
    req.flash('success',"Successfully updated Campground")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete("/:id",isLoggedIn,isAuthor,catchAsync(async(req,res)=>{
    const {id}=req.params;
    await CampGround.findByIdAndDelete(id);
    req.flash('success',"Successfully deleted campground")
    res.redirect("/campgrounds");
}))

module.exports=router;