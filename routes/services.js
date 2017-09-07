const express = require('express');
const router = express.Router();
const data = require("../data");
const serviceData = data.services;

router.get("/:id", (req, res) => {
    serviceData.getServicesById(req.params.id).then((service) => {
        serviceData.getAllReviewsFromServiceId(service._id).then((reviews) => {
            res.render("pages/services", { service: service, reviews: reviews });
        })
    }).catch(() => {
        res.status(404).json({ error: "service not found" });
    });
});




router.post("/", (req, res) => {
    let serviceBody = req.body;
    serviceData.addService(serviceBody.vendorId, serviceBody.serviceName,
        serviceBody.description, serviceBody.cost)
        .then((newServive) => {
            res.redirect('/vendors/' + newServive.vendorId);
            //res.json(newServive);
        }).catch((e) => {
            res.status(500).json({ error: e });
        });
});

router.put("/:id", (req, res) => {
    let updatedData = req.body;

    let getService = serviceData.getServicesById(req.params.id);

    getService.then(() => {
        return serviceData.updateServiceInfo(req.params.id, updatedData)
            .then((updatedService) => {
                res.json(updatedService);
            }).catch((e) => {
                res.status(500).json({ error: e });
            });
    }).catch((e) => {
        console.log(e);
        res.status(404).json({ error: "Service not found" });
    });

});

router.delete("/:id", (req, res) => {
    let getService = serviceData.getServicesById(req.params.id);

    getService.then(() => {
        return serviceData.removeService(req.params.id)
            .then(() => {
                res.sendStatus(200);
            }).catch((e) => {
                res.status(500).json({ error: e });
            });
    }).catch(() => {
        res.status(404).json({ error: "Service not found" });
    });
});
module.exports = router;