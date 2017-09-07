const express = require('express');

const router = express.Router();
const data = require("../data");
const usersData = data.users;
const vendorsData = data.vendors;

router.get("/", (req, res) => {
    res.render("pages/search_salon", {});
});

router.get("/signup", (req, res) => {
    res.render("pages/CustSignUp", {});
});
router.get("/salon/:id", (req, res) => {
    vendorsData.getVendorById(req.params.id).then((vendor) => {
        vendorsData.getAllHairCuttersFromVendorId(vendor._id).then((stylst) => {
            vendorsData.getAllServicesFromVendorId(vendor._id).then((services) => {
                vendorsData.getAllReviewsFromVendorId(vendor._id).then((reviews) => {
                    res.render("pages/salon", { vendor: vendor, stylst: stylst, services: services, reviews: reviews });
                })
            })
        })
    }).catch(() => {
        res.status(404).json({ error: "Salon not found" });
    });
});

router.post("/stylist/:id", (req, res) => {
    vendorsData.getAllHairCuttersFromVendorId(req.params.id).then((vendor) => {
        res.render("pages/salon", vendor);
    }).catch(() => {
        res.status(404).json({ error: "Haircutter not found" });
    });
});
router.post("/serv/:id", (req, res) => {
    vendorsData.getAllServicesFromVendorId(req.params.id).then((vendor) => {
        res.render("pages/salon", vendor);
    }).catch(() => {
        res.status(404).json({ error: "Services not found" });
    });
});
router.post("/rev/:id", (req, res) => {
    vendorsData.getAllReviewsFromVendorId(req.params.id).then((vendor) => {
        res.render("pages/salon", vendor);
    }).catch(() => {
        res.status(404).json({ error: "Reviews not found" });
    });
});

router.get("/reviews/:id", (req, res) => {
    vendorsData.getReviewsFromReviewId(req.params.id).then((reviews) => {
        res.json(reviews);
    }).catch((e) => {
        console.log(e);
        res.status(500).json({ error: e });
    });
});

router.post("/reviews/:id", (req, res) => {
    let reviewBody = req.body;
    var rating;
    if (reviewBody.five) {
        rating = "5";
    }
    if (reviewBody.four) {
        rating = "4";
    }
    if (reviewBody.three) {
        rating = "3";
    }
    if (reviewBody.two) {
        rating = "2";
    }
    if (reviewBody.one) {
        rating = "1";
    }
    console.log(req.params.id);
    console.log(rating);
    console.log(reviewBody.review);

    vendorsData.addReviews(req.params.id, "dadb705c-1844-46ee-ad1b-7df5b6ff8f7b", rating, reviewBody.review)
        .then((newComment) => {
            console.log(newComment);
            res.render("pages/salon", newComment);
        }).catch((e) => {
            console.log(e);

            res.status(500).json({ error: e });
        });
});



router.post("/search", (req, res) => {
    let vendorBody = req.body;
    console.log(vendorBody.searchText);
    vendorsData.getVendorsBySearch(vendorBody.searchText)
        .then((newVendor) => {
            res.render("pages/search_salon", newVendor);
        }).catch((e) => {
            res.status(500).json({ error: e });
        });
});
router.get("/:id", (req, res) => {
    usersData.getUserById(req.params.id).then((user) => {
        res.render("pages/search_salon", user);
    }).catch(() => {
        res.status(404).json({ error: "User not found" });
    });
});

router.post("/signup", (req, res) => {
    let userBody = req.body;
    usersData.addUser(userBody.firstName, userBody.lastName, userBody.address, userBody.contactNumber,
        userBody.state, userBody.city, userBody.zipCode, userBody.email, userBody.password)
        .then((newUser) => {
            res.redirect('/' + newUser._id);
        }).catch((e) => {
            res.status(500).json({ error: e });
        });
});

router.put("/:id", (req, res) => {
    let updatedData = req.body;
    let getUser = usersData.getUserById(req.params.id);
    getUser.then(() => {
        return usersData.updateUserInfo(req.params.id, updatedData)
            .then((updatedUser) => {
                res.json(updatedUser);
            }).catch((e) => {
                res.status(500).json({ error: e });
            });
    }).catch((e) => {
        console.log(e);
        res.status(404).json({ error: "User not found" });
    });

});

router.delete("/:id", (req, res) => {
    let getUser = usersData.getUserById(req.params.id);

    getUser.then(() => {
        return usersData.removeUser(req.params.id)
            .then(() => {
                res.sendStatus(200);
            }).catch((e) => {
                res.status(500).json({ error: e });
            });
    }).catch(() => {
        res.status(404).json({ error: "User not found" });
    });
});
module.exports = router;