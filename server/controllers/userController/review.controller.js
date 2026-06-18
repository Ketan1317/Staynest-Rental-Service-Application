import Review from "../../models/Review.model.js";

const createReview = async (req,res) => {
    try {
        if(!req.user || !req.user.id){
            return res.status(401).json({message: "Unauthorized"});
        }
        console.log(req.body);
        const { propertyId, rating, comment } =  req.body;
        if(!propertyId || !rating){
            return res.status(400).json({message: "Property ID and rating are required"});
        }

        const prevOne = await Review.findOne({propertyId, userId: req.user.id});
        if(prevOne){
            prevOne.rating = rating;
            prevOne.comment = comment;
            await prevOne.save();
            return res.status(200).json({message: "Review updated successfully", review: prevOne});
        }

        const newOne = await Review.create({
            propertyId,
            userId: req.user.id,
            rating,
            comment 
        })
        newOne.save();
        res.status(201).json({message: "Review created successfully", review: newOne});
    } catch (error) {
        res.status(500).json({message: "Failed to create review"});
    }
}


const deleteReview = async (req,res) => {
    try{
        if(!req.user || !req.user.id){
            return res.status(401).json({message: "Unauthorized"});
        }

        const { propertyId } =  req.body;
        if(!propertyId){
            return res.status(400).json({message: "Property ID and rating are required"});
        }
        const review = await Review.findOne({propertyId, userId: req.user.id});

        if(!review){
            return res.status(404).json({message: "Review not found"});
        }

        await Review.deleteOne({propertyId, userId: req.user.id});
        res.status(200).json({message: "Review deleted successfully"});

    } catch (error) {
        res.status(500).json({message: "Failed to delete review"});
    }
}

export { createReview, deleteReview }