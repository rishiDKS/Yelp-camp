const CampGround=require('./models/campground.js');
const Review=require('./models/review.js');
const ExpressError=require('./utils/ExpressError.js');

module.exports.isLoggedIn=(req,res,next)=>{
    // console.log("user: ",req.user);
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl;
        req.flash('error','you must logged in first');
        return res.redirect('/login');
    }
    next();
}
module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params
    const campground=await CampGround.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash('error','you donot have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id,reviewId}=req.params
    const review=await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){
        req.flash('error','you donot have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}