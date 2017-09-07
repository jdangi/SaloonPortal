const usersRoutes = require("./users");
const vendorsRoutes = require("./vendors");
const hairCuttersRoutes = require("./hairCutters");
const servicesRoutes = require("./services");

const constructorMethod = (app) => {
    app.use("/", usersRoutes);
    app.use("/vendors", vendorsRoutes);
    app.use("/hairCutters", hairCuttersRoutes);
    app.use("/services", servicesRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Not found" });
    });
};

module.exports = constructorMethod;