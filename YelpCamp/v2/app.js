var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
//     {name: "Granite Hill", image: "https://pixabay.com/get/e83db50929f0033ed1584d05fb1d4e97e07ee3d21cac104491f4c571a1e4bcbf_340.jpg",
//         description: "This is a huge granite hill, no bathroom, No water, Beautiful granite!"
//     }, function( err, campground){
//         if(err){
//             console.log(err)
//         }else{
//             console.log("Newly created campground:");
//             console.log(campground);
//         }
//     }
// )



app.get("/", function(req,res){
    res.render("landing");
});

//INDEX - show all campgrounds
app.get("/campgrounds", function(req,res){
    // Get all the campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("index", {campgrounds:allCampgrounds});
        }
    });
        
});

app.post("/campgrounds", function(req, res){
   
    //get data from form and add to campgrounds 
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image, description: desc};
    //Create the new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            // redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
    
});

app.get("/campgrounds/new", function(req, res) {
    res.render("new.ejs");
});

//SHOW - shows more info about one campground
app.get("/campgrounds/:id", function(req,res){
    //find the campgrounds with provided ID
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
            //render show template with that campground
            res.render("show", {campground: foundCampground});
        }
    });
    
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp Server Has Started!");
})