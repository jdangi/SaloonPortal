/******************************************
 *  Author : Harsh Jagdishbhai Kevadia   
 *  Created On : Fri Jul 21 2017
 *  File : index.js
 *******************************************/
const vendors = require("./vendors");
const users = require("./users");
const hairCutters = require("./hairCutters");
const services = require("./services");

module.exports = {
    users: users,
    vendors: vendors,
    hairCutters: hairCutters,
    services: services
};