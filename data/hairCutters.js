/******************************************
 *  Author : Ruchika Batukbhai Sutariya   
 *  Created On : Sat Aug 26 2017
 *  File : hairCutters.js
 *******************************************/
const mongoCollections = require("../config/mongoCollections");
const hairCutters = mongoCollections.hairCutters;
const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let exportedMethods = {
    gethairCutterById(id) {
        return hairCutters().then((hairCuttersCollection) => {
            return hairCuttersCollection.findOne({ _id: id }).then((hairCutter) => {
                if (!hairCutter) throw "HairCutter not found";
                return hairCutter;
            });
        });
    },
    addhairCutter(vendorId, firstName, lastName, heading, image, description) {
        return hairCutters().then((hairCuttersCollection) => {
            let newhairCutter = {
                _id: uuid(),
                vendorId: vendorId,
                firstName: firstName,
                lastName: lastName,
                heading: heading,
                image: image,
                description: description
            };

            return hairCuttersCollection.insertOne(newhairCutter).then((newInsertInformation) => {
                return newInsertInformation.insertedId;
            }).then((newId) => {
                return this.gethairCutterById(newId);
            });
        });
    },
    removehairCutter(id) {
        return hairCutters().then((hairCuttersCollection) => {
            return hairCuttersCollection.removeOne({ _id: id }).then((deletionInfo) => {
                if (deletionInfo.deletedCount === 0) {
                    throw (`Could not found hairCutter with id of ${id}`)
                }
            });
        });
    },
    updatehairCutterInfo(id, updatedhairCutterInfo) {
        return this.gethairCutterById(id).then((currenthairCutterInfo) => {
            let updatedInfo = {};
            if ('vendorId' in updatedhairCutterInfo) {
                updatedInfo.vendorId = updatedhairCutterInfo.vendorId;
            }

            if ('firstName' in updatedhairCutterInfo) {
                updatedInfo.firstName = updatedhairCutterInfo.firstName;
            }
            if ('lastName' in updatedhairCutterInfo) {
                updatedInfo.lastName = updatedhairCutterInfo.lastName;
            }
            if ('heading' in updatedhairCutterInfo) {
                updatedInfo.heading = updatedhairCutterInfo.heading;
            }
            if ('image' in updatedhairCutterInfo) {
                updatedInfo.image = updatedhairCutterInfo.image;
            }
            if ('description' in updatedhairCutterInfo) {
                updatedInfo.description = updatedhairCutterInfo.description;
            }
            let updateCommand = {
                $set: updatedInfo
            };

            return hairCutters().then((hairCuttersCollection) => {
                return hairCuttersCollection.updateOne({ _id: id }, updateCommand).then(() => {
                    return this.gethairCutterById(id);
                });
            });
        });
    },
    getReviewsFromReviewId(reviewId) {
        if (!reviewId)
            return Promise.reject("You must provide an ReviewID");
        return hairCutters().then((hairCuttersCollection) => {
            return hairCuttersCollection.findOne({ $where: "this.reviews._id = '" + reviewId + "'" }).then((data) => {
                if (!data)
                    throw "Reviews not Found !";
                let hairCutterdata = data.reviews.filter(function (reviews) {
                    return reviews._id == reviewId;
                })[0];
                hairCutterdata._id = data._id;
                hairCutterdata.vendorId = data.vendorId,
                    hairCutterdata.firstName = data.firstName,
                    hairCutterdata.lastName = data.lastName,
                    hairCutterdata.heading = data.heading,
                    hairCutterdata.image = data.image,
                    hairCutterdata.description = data.description
                return hairCutterdata;
            });
        });
    },
    addReviews(hairCutterId, userId, rating, review) {
        return hairCutters().then((hairCutterCollection) => {
            reviewId = uuid();
            let addReviews = {
                _id: reviewId,
                userId: userId,
                rating: rating,
                review: review
            };
            return hairCutterCollection.updateOne({ _id: hairCutterId }, { $push: { "reviews": addReviews } }).then(function () {
                return exportedMethods.getReviewsFromReviewId(reviewId).then((data) => {
                    return data;
                }, (err) => {
                    return Promise.reject("Cannot add this reviews");
                });
            });
        });
    },

    getAllReviewsFromhairCutterId(hairCutterId) {
        if (hairCutterId === undefined)
            return Promise.reject("You must provide an ID");
        return hairCutters().then((hairCuttersCollection) => {
            return hairCuttersCollection.findOne({ _id: hairCutterId }).then((data) => {
                if (data === 'undefined')
                    throw "Vendor not found !";
                let hairCutterdata = data.reviews;
                return hairCutterdata;
            });
        });
    },
}
module.exports = exportedMethods;



// exportedMethods.addhairCutter("7f111dc0-19da-4dfe-8346-d41ad021cffc","Jai","Patel", "Hair Stylist", "stylist2.jpeg", "I have been working in a salon since I was 17. After a few years of shampooing and assisting many talented stylists, I decided that I wanted to be the one behind the chair. I started beauty school and while there I attended as many extra classes as I could.").then((data) => {
//      console.log(data);
// });

/* 
exportedMethods.addReviews("fc5ae36d-8160-4f76-ae40-e18509d6e956", "c925049f-098e-4b00-8543-15c46e7617b6", "5", "Harsh is very good person!").then((data) => {
    console.log(data);
}); */


//exportedMethods.getAllReviewsFromVendorId("9c4ba232-aae0-4307-82fc-ddfec2c9f280").then((data) => {
//     console.log(data);
// });
