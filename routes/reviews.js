const express=require('express')
const router=express.Router({mergeParams:true})
const catchAsync=require('../utils/catchAsync');
// const ExpressError=require('../utils/ExpressError.js')
const CampGround=require('../models/campground.js');
const methodOverride=require('method-override');
const Review=require("../models/review.js");
const {isLoggedIn,isReviewAuthor}=require('../middleware.js');

router.post("/",isLoggedIn,catchAsync(async(req,res)=>{
    const campground=await CampGround.findById(req.params.id);
    const review=new Review(req.body.review);
    review.author=req.user._id;   
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success',"Created new review")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete("/:reviewId",isLoggedIn,isReviewAuthor,catchAsync(async(req,res)=>{
    const {id,reviewId}=req.params;
    await CampGround.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId)
    req.flash('success',"Successfully deleted review")
    res.redirect(`/campgrounds/${id}`);
}));

module.exports=router;