const express = require('express');
const router = express.Router();
const data = require("../data");
const vendorsData = data.vendors;
var multer = require('multer');
var fs = require("fs");

router.get("/", (req, res) => {
    res.render("pages/SalonSignUp", {});
});

router.get("/signup", (req, res) => {
    res.render("pages/SalonSignUp", {});
});

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/SalonImages');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});
var upload = multer({ storage: storage }).single('file');
router.post('/vendors/upload', function (req, res) {

    upload(req, res, function (err) {

        if (err) {
            console.log(err);
            res.send(500);
        } else {
            res.render("pages/owner", {
                message: 'File uploaded successfully',
                filename: req.file.filename
            });
        }
    });
});
router.get("/:id", (req, res) => {
    vendorsData.getVendorById(req.params.id).then((vendor) => {
        vendorsData.getAllHairCuttersFromVendorId(vendor._id).then((stylst) => {
            vendorsData.getAllServicesFromVendorId(vendor._id).then((services) => {
                vendorsData.getAllReviewsFromVendorId(vendor._id).then((reviews) => {
                    res.render("pages/owner", { vendor: vendor, stylst: stylst, services: services, reviews: reviews });
                })
            })
        })
    }).catch(() => {
        res.status(404).json({ error: "Vendor not found" });
    });
});

router.post("/signup", (req, res) => {
    let vendorBody = req.body;
    vendorsData.addVendor(vendorBody.saloonName, vendorBody.address, vendorBody.contactNumber, vendorBody.state,
        vendorBody.city, vendorBody.zipCode, vendorBody.email, vendorBody.password)
        .then((newVendor) => {
            res.redirect('/vendors/' + newVendor._id);
        }).catch((e) => {
            res.status(500).json({ error: e });
        });
});


router.put("/:id", (req, res) => {
    let updatedData = req.body;
    let getVendor = vendorsData.getVendorById(req.params.id);
    getVendor.then(() => {
        return vendorsData.updateVendorInfo(req.params.id, updatedData)
            .then((updatedVendor) => {
                res.json(updatedVendor);
            }).catch((e) => {
                res.status(500).json({ error: e });
            });
    }).catch((e) => {
        console.log(e);
        res.status(404).json({ error: "Vendor not found" });
    });

});
router.delete("/:id", (req, res) => {
    let getVendor = vendorsData.getVendorById(req.params.id);

    getVendor.then(() => {
        return vendorsData.removeVendor(req.params.id)
            .then(() => {
                res.sendStatus(200);
            }).catch((e) => {
                res.status(500).json({ error: e });
            });
    }).catch(() => {
        res.status(404).json({ error: "Vendor not found" });
    });
});



module.exports = router;