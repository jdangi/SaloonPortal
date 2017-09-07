/******************************************
 *  Author : Jay Dangi   
 *  Created On : Mon Aug 14 2017
 *  File : mongoCollections.js
 *******************************************/
const dbConnection = require("./mongoConnection");

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
let getCollectionFn = (collection) => {
    let _col = undefined;

    return () => {
        if (!_col) {
            _col = dbConnection().then(db => {
                return db.collection(collection);
            });
        }

        return _col;
    }
}

/* Now, you can list your collections here: */
module.exports = {
    vendors: getCollectionFn("vendors"),
    users: getCollectionFn("users"),
    hairCutters: getCollectionFn("hairCutters"),
    services: getCollectionFn("services")
};
