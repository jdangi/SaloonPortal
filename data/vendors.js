/******************************************
 *  Author : Ruchika Batukbhai Sutariya & Harsh Jagdishbhai Kevadia
 *  Created On : Mon Aug 14 2017
 *  File : vendors.js
 *******************************************/
const mongoCollections = require("../config/mongoCollections");
const vendors = mongoCollections.vendors;
const services = mongoCollections.services;
const hairCutters = mongoCollections.hairCutters;
const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let exportedMethods = {
    getVendorByEmail(email) {
        return vendors().then((vendorsCollection) => {
            return vendorsCollection.findOne({ email: email }).then((vendor) => {
                if (!vendor) throw "Email not found in DB";
                return vendor;
            });
        });
    },
    getVendorById(id) {
        return vendors().then((vendorsCollection) => {
            return vendorsCollection.findOne({ _id: id }).then((vendor) => {
                if (!vendor) throw "Vendor not found";
                return vendor;
            });
        });
    },
    addVendor(saloonName, address, contactNumber, state, city, zipCode, email, password) {
        return vendors().then((vendorsCollection) => {
            let newVendor = {
                _id: uuid(),
                saloonName: saloonName,
                address: address,
                contactNumber: contactNumber,
                state: state,
                city: city,
                zipCode: zipCode,
                email: email,
                hashedPassword: bcrypt.hashSync(password, saltRounds)
            };

            return vendorsCollection.insertOne(newVendor).then((newInsertInformation) => {
                return newInsertInformation.insertedId;
            }).then((newId) => {
                return this.getVendorById(newId);
            });
        });
    },
    removeVendor(id) {
        return vendors().then((vendorsCollection) => {
            return vendorsCollection.removeOne({ _id: id }).then((deletionInfo) => {
                if (deletionInfo.deletedCount === 0) {
                    throw (`Could not found Vendor with id of ${id}`)
                }
            });
        });
    },
    updateVendorInfo(id, updatedVendorInfo) {
        return this.getVendorById(id).then((currentVendorInfo) => {
            let updatedInfo = {};
            if ('saloonName' in updatedVendorInfo) {
                updatedInfo.saloonName = updatedVendorInfo.saloonName;
            }
            if ('address' in updatedVendorInfo) {
                updatedInfo.address = updatedVendorInfo.address;
            }
            if ('contactNumber' in updatedVendorInfo) {
                updatedInfo.contactNumber = updatedVendorInfo.contactNumber;
            }
            if ('state' in updatedVendorInfo) {
                updatedInfo.state = updatedVendorInfo.state;
            }
            if ('city' in updatedVendorInfo) {
                updatedInfo.city = updatedVendorInfo.city;
            }
            if ('zipCode' in updatedVendorInfo) {
                updatedInfo.zipCode = updatedVendorInfo.zipCode;
            }
            if ('email' in updatedVendorInfo) {
                updatedInfo.email = updatedVendorInfo.email;
            }
            if ('password' in updatedVendorInfo) {
                updatedInfo.hashedPassword = bcrypt.hashSync(updatedVendorInfo.password, saltRounds);
            }

            let updateCommand = {
                $set: updatedInfo
            };

            return vendors().then((vendorsCollection) => {
                return vendorsCollection.updateOne({ _id: id }, updateCommand).then(() => {
                    return this.getVendorById(id);
                });
            });
        });
    },

    getReviewsFromReviewId(reviewId) {
        if (!reviewId)
            return Promise.reject("You must provide an ReviewID");
        return vendors().then((vendorsCollection) => {
            return vendorsCollection.findOne({ $where: "this.reviews._id = '" + reviewId + "'" }).then((data) => {
                console.log(data);
                if (!data)
                    throw "Reviews not Found !";
                let vendordata = data.reviews.filter(function (reviews) {
                    return reviews._id == reviewId;
                })[0];
                vendordata._id = data._id;
                vendordata.saloonName = data.saloonName;
                vendordata.address = data.address;
                vendordata.contactNumber = data.contactNumber;
                vendordata.state = data.state;
                vendordata.city = data.city;
                vendordata.zipCode = data.zipCode;
                vendordata.email = data.email;
                return vendordata;
            });
        });
    },
    addReviews(vendorId, userId, rating, review) {
        return vendors().then((vendorsCollection) => {
            reviewId = uuid()
            let addReviews = {
                _id: reviewId,
                userId: userId,
                rating: rating,
                review: review
            };
            return vendorsCollection.updateOne({ _id: vendorId }, { $push: { "reviews": addReviews } }).then(function () {
                return exportedMethods.getReviewsFromReviewId(reviewId).then((reviewdata) => {
                    return reviewdata;
                }, (err) => {
                    return Promise.reject("Cannot add this review");
                });
            });
        });
    },

    removeReviews(reviewId) {
        return vendors().then((vendorsCollection) => {
            return vendorsCollection.updateOne(
                { "reviews._id": reviewId },
                { $unset: { "reviews.$._id": reviewId } }
            ).then((deletionInfo) => {
                if (deletionInfo.updatedCount === 0) {
                    throw (`Could not get reviews with id of ${reviewId}`)
                }
            });
        });
    },

    updateReviews(vendorId, reviewId, updateddata) {
        return this.getReviewsFromReviewId(reviewId).then((currentReview) => {
            if (!currentReview) throw "Reviews not found !";

            let reviewInfo = currentReview;
            if ('userId' in updateddata) {
                reviewInfo.userId = updateddata.userId;
            }
            if ('rating' in updateddata) {
                reviewInfo.rating = updateddata.rating;
            }
            if ('reviews' in updateddata) {
                reviewInfo.reviews = updateddata.reviews;
            }
            delete reviewInfo['vendorId'];
            delete reviewInfo['saloonName'];
            delete reviewInfo['address'];
            delete reviewInfo['contactNumber'];
            delete reviewInfo['state'];
            delete reviewInfo['city'];
            delete reviewInfo['zipcode'];
            delete reviewInfo['email'];
            let updateReviewdata = {
                $set: { "reviews.$": reviewInfo }
            };
            return vendors().then((vendorsCollection) => {
                return vendorsCollection.updateOne({ "reviews._id": reviewId }, updateReviewdata).then(() => {
                    return this.getReviewsFromReviewId(reviewId);
                });
            });
        });
    },

    getAllReviewsFromVendorId(vendorId) {
        if (vendorId === undefined)
            return Promise.reject("You must provide an ID");
        return vendors().then((vendorsCollection) => {
            return vendorsCollection.findOne({ _id: vendorId }).then((data) => {
                if (data === 'undefined')
                    throw "Vendor not found !";
                let vendordata = data.reviews;
                return vendordata;
            });
        });
    },


    getAllHairCuttersFromVendorId(id) {
        if (id === undefined)
            return Promise.reject("You must provide an ID");
        return hairCutters().then((hairCuttersCollection) => {
            return hairCuttersCollection.find({ vendorId: id }).toArray();
        });
    },

    getAllServicesFromVendorId(id) {
        if (id === undefined)
            return Promise.reject("You must provide an ID");
        return services().then((servicesCollection) => {
            return servicesCollection.find({ vendorId: id }).toArray();
        });
    },
    getReviewsFromReviewId(reviewId) {
        if (!reviewId)
            return Promise.reject("You must provide an ReviewID");
        return vendors().then((vendorsCollection) => {
            return vendorsCollection.findOne({ $where: "this.reviews._id = '" + reviewId + "'" }).then((data) => {
                console.log(data);
                if (!data)
                    throw "Reviews not Found !";
                let vendordata = data.reviews.filter(function (reviews) {
                    return reviews._id == reviewId;
                })[0];
                vendordata._id = data._id;
                vendordata.saloonName = data.saloonName;
                vendordata.address = data.address;
                vendordata.contactNumber = data.contactNumber;
                vendordata.state = data.state;
                vendordata.city = data.city;
                vendordata.zipCode = data.zipCode;
                vendordata.email = data.email;
                return vendordata;
            });
        });
    },

    addReviews(vendorId, userId, rating, review) {
        return vendors().then((vendorsCollection) => {
            reviewId = uuid()
            let addReviews = {
                _id: reviewId,
                userId: userId,
                rating: rating,
                review: review
            };
            return vendorsCollection.updateOne({ _id: vendorId }, { $push: { "reviews": addReviews } }).then(function () {
                return exportedMethods.getReviewsFromReviewId(reviewId).then((reviewdata) => {
                    return reviewdata;
                }, (err) => {
                    return Promise.reject("Cannot add this review");
                });
            });
        });
    },

    removeReviews(reviewId) {
        return vendors().then((vendorsCollection) => {
            return vendorsCollection.updateOne(
                { "reviews._id": reviewId },
                { $unset: { "reviews.$._id": reviewId } }
            ).then((deletionInfo) => {
                if (deletionInfo.updatedCount === 0) {
                    throw (`Could not get reviews with id of ${reviewId}`)
                }
            });
        });
    },

    updateReviews(vendorId, reviewId, updateddata) {
        return this.getReviewsFromReviewId(reviewId).then((currentReview) => {
            if (!currentReview) throw "Reviews not found !";

            let reviewInfo = currentReview;
            if ('userId' in updateddata) {
                reviewInfo.userId = updateddata.userId;
            }
            if ('rating' in updateddata) {
                reviewInfo.rating = updateddata.rating;
            }
            if ('reviews' in updateddata) {
                reviewInfo.reviews = updateddata.reviews;
            }
            delete reviewInfo['vendorId'];
            delete reviewInfo['saloonName'];
            delete reviewInfo['address'];
            delete reviewInfo['contactNumber'];
            delete reviewInfo['state'];
            delete reviewInfo['city'];
            delete reviewInfo['zipcode'];
            delete reviewInfo['email'];
            let updateReviewdata = {
                $set: { "reviews.$": reviewInfo }
            };
            return vendors().then((vendorsCollection) => {
                return vendorsCollection.updateOne({ "reviews._id": reviewId }, updateReviewdata).then(() => {
                    return this.getReviewsFromReviewId(reviewId);
                });
            });
        });
    },

    getVendorsBySearch(searchText) {
        return vendors().then((vendorsCollection) => {
            return vendorsCollection.find({ $or: [{ "saloonName": { '$regex': searchText, '$options': 'i' } }, { "state": { '$regex': searchText, '$options': 'i' } }, { "city": { '$regex': searchText, '$options': 'i' } }, { "zipCode": searchText }] }).toArray();
        });
    }

}
module.exports = exportedMethods;

// exportedMethods.addVendor("SalonX", "3588 John F Kennedy Blvd", "501-990-0091", "NJ", "Jersey City", "07307", "salonx@salon.com", "salonx").then((data) => {
//     console.log(data);
// });  

// exportedMethods.addVendor("SalonY", "3588 John F Kennedy Blvd", "200-900-8800", "NJ", "Hoboken", "07307", "salony@salon.com", "salony").then((data) => {
//     console.log(data);
// }); 

// exportedMethods.addVendor("SalonZ", "3588 John F Kennedy Blvd", "200-900-8891", "NJ", "Secaucus", "07307", "salonz@salon.com", "salonz").then((data) => {
//     console.log(data);
// }); 

// exportedMethods.addReviews("2df1e667-fe7a-4076-8aeb-5f4abb83e8ee", "2cac8312-16f0-4504-9755-6e702709fd00", "5", "It is TOO good").then((data) => {
//     console.log(data);
// });
/* 
exportedMethods.addReviews("7f111dc0-19da-4dfe-8346-d41ad021cffc", "c925049f-098e-4b00-8543-15c46e7617b6", "7", "It is extremely good").then((data) => {
    console.log(data);
}); */

// exportedMethods.getAllReviewsFromVendorId("626e9c5f-8792-484f-83d5-b05098661e77").then((data) => {
//     console.log(data);
// }); 
/*
exportedMethods.getAllServicesFromVendorId("626e9c5f-8792-484f-83d5-b05098661e77").then((data) => {
    console.log(data);
}); 
*/
// exportedMethods.getAllHairCuttersFromVendorId("626e9c5f-8792-484f-83d5-b05098661e77").then((data) => {
//     console.log(data);
// }); 




