const mongoose=require('mongoose');
const CampGround=require('../models/campground.js');
const cities=require('./cities.js');
const {places,descriptors}=require('./seedHelpers.js')

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    // useCreateIndex:true,
    useUnifiedTopology:true
});

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected")
});


const sample=(array=>array[Math.floor(Math.random()*array.length)])

const seedDB=async()=>{
    await CampGround.deleteMany({});
    // const c=new CampGround ({title:"purple field"});
    // await c.save();
    for(let i=0;i<50;i++){
        const rand1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new CampGround({
            author:'686c835e5528106258e81a97',
            location:`${cities[rand1000].city}, ${cities[rand1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            image:"https://picsum.photos/600/400",
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quo, quod blanditiis quia laudantium soluta consectetur praesentium! A veritatis, maxime nemo voluptatibus, dolore doloribus eius minus nihil eos itaque cum!",
            price,
            images:[
                {
                  url: 'https://res.cloudinary.com/du8tscbnr/image/upload/v1754906437/YelpCamp/ibj4s9g3ivaogx6cetvd.jpg',        
                  filename: 'YelpCamp/ibj4s9g3ivaogx6cetvd'
                },
                {
                  url: 'https://res.cloudinary.com/du8tscbnr/image/upload/v1754906441/YelpCamp/aafcmfo2mmjgrhebli8n.jpg',        
                  filename: 'YelpCamp/aafcmfo2mmjgrhebli8n'
                }
              ],
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});