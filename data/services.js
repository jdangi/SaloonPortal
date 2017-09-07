/******************************************
 *  Author : Ruchika Batukbhai Sutariya   
 *  Created On : Sat Aug 26 2017
 *  File : services.js
 *******************************************/
const mongoCollections = require("../config/mongoCollections");
const services = mongoCollections.services;
const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let exportedMethods = {
    getServicesById(id) {
        return services().then((servicesCollection) => {
            return servicesCollection.findOne({ _id: id }).then((service) => {
                if (!service) throw "Service not found";
                return service;
            });
        });
    },
    addService(vendorId, serviceName, description, cost) {
        return services().then((servicesCollection) => {
            let newService = {
                _id: uuid(),
                vendorId: vendorId,
                serviceName: serviceName,
                description: description,
                cost: cost
            };

            return servicesCollection.insertOne(newService).then((newInsertInformation) => {
                return newInsertInformation.insertedId;
            }).then((newId) => {
                return this.getServicesById(newId);
            });
        });
    },
    removeService(id) {
        return services().then((servicesCollection) => {
            return servicesCollection.removeOne({ _id: id }).then((deletionInfo) => {
                if (deletionInfo.deletedCount === 0) {
                    throw (`Could not found Service with id of ${id}`)
                }
            });
        });
    },
    updateServiceInfo(id, updatedServiceInfo) {
        return this.getServicesById(id).then((currentServiceInfo) => {
            let updatedInfo = {};
            if ('vendorId' in updatedServiceInfo) {
                updatedInfo.vendorId = updatedServiceInfo.vendorId;
            }
            if ('serviceName' in updatedServiceInfo) {
                updatedInfo.serviceName = updatedServiceInfo.serviceName;
            }
            if ('description' in updatedServiceInfo) {
                updatedInfo.description = updatedServiceInfo.description;
            }
            if ('cost' in updatedServiceInfo) {
                updatedInfo.cost = updatedServiceInfo.cost;
            }
            let updateCommand = {
                $set: updatedInfo
            };

            return services().then((servicesCollection) => {
                return servicesCollection.updateOne({ _id: id }, updateCommand).then(() => {
                    return this.getServicesById(id);
                });
            });
        });
    },
    getReviewsFromReviewId(reviewId) {
        if (!reviewId)
            return Promise.reject("You must provide an ReviewID");
        return services().then((servicesCollection) => {
            return servicesCollection.findOne({ $where: "this.reviews._id = '" + reviewId + "'" }).then((data) => {
                if (!data)
                    throw "Reviews not Found !";
                let servicedata = data.reviews.filter(function (reviews) {
                    return reviews._id == reviewId;
                })[0];
                servicedata._id = data._id;
                servicedata.vendorId = data.vendorId,
                    servicedata.serviceName = data.serviceName,
                    servicedata.description = data.description,
                    servicedata.cost = data.cost
                return servicedata;
            });
        });
    },
    addReviews(serviceId, userId, rating, review) {
        return services().then((servicesCollection) => {
            reviewId = uuid();
            let addReviews = {
                _id: reviewId,
                userId: userId,
                rating: rating,
                review: review
            };
            return servicesCollection.updateOne({ _id: serviceId }, { $push: { "reviews": addReviews } }).then(function () {
                return exportedMethods.getReviewsFromReviewId(reviewId).then((data) => {
                    return data;
                }, (err) => {
                    return Promise.reject("Cannot add this reviews");
                });
            });
        });
    },
    getAllReviewsFromServiceId(serviceId) {
        if (!serviceId)
            return Promise.reject("You must provide an ID");
        return services().then((servicesCollection) => {
            return servicesCollection.findOne({ _id: serviceId }).then((data) => {
                if (data === 'undefined')
                    throw "HairCutter not found !";
                let servicesdata = data.reviews;
                return servicesdata;
            });
        });
    },


}
module.exports = exportedMethods;

// exportedMethods.addService("7f111dc0-19da-4dfe-8346-d41ad021cffc", "Children's Cut", "Suitable for guests 12 years and under.","50$").then((data) => {
//     console.log(data);
// });


// exportedMethods.addReviews("b3966cae-f559-4d57-9ea1-04177603f065", "c925049f-098e-4b00-8543-15c46e7617b6", "5", "It is TOO good").then((data) => {
//     console.log(data);
// });



