/******************************************
 *  Author : Harsh Jagdishbhai Kevadia   
 *  Created On : Mon Aug 14 2017
 *  File : users.js
 *******************************************/
const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let exportedMethods = {
    getUserByEmail(email) {
        return users().then((usersCollection) => {
            return usersCollection.findOne({ email: email }).then((user) => {
                if (!user) throw "Email not found in DB";
                return user;
            });
        });
    },
    getUserById(id) {
        return users().then((usersCollection) => {
            return usersCollection.findOne({ _id: id }).then((user) => {
                if (!user) throw "User not found";
                return user;
            });
        });
    },
    addUser(firstName, lastName, address, contactNumber, state, city, zipCode, email, password) {
        return users().then((usersCollection) => {
            let newUser = {
                _id: uuid(),
                firstName: firstName,
                lastName: lastName,
                address: address,
                contactNumber: contactNumber,
                state: state,
                city: city,
                zipCode: zipCode,
                email: email,
                hashedPassword: bcrypt.hashSync(password, saltRounds)
            };

            return usersCollection.insertOne(newUser).then((newInsertInformation) => {
                return newInsertInformation.insertedId;
            }).then((newId) => {
                return this.getUserById(newId);
            });
        });
    },
    removeUser(id) {
        return users().then((usersCollection) => {
            return usersCollection.removeOne({ _id: id }).then((deletionInfo) => {
                if (deletionInfo.deletedCount === 0) {
                    throw (`Could not found user with id of ${id}`)
                }
            });
        });
    },
    updateUserInfo(id, updatedUserInfo) {
        return this.getUserById(id).then((currentUserInfo) => {
            let updatedInfo = {};
            if ('firstName' in updatedUserInfo) {
                updatedInfo.firstName = updatedUserInfo.firstName;
            }
            if ('lastName' in updatedUserInfo) {
                updatedInfo.lastName = updatedUserInfo.lastName;
            }
            if ('address' in updatedUserInfo) {
                updatedInfo.address = updatedUserInfo.address;
            }
            if ('contactNumber' in updatedUserInfo) {
                updatedInfo.contactNumber = updatedUserInfo.contactNumber;
            }
            if ('state' in updatedUserInfo) {
                updatedInfo.state = updatedUserInfo.state;
            }
            if ('city' in updatedUserInfo) {
                updatedInfo.city = updatedUserInfo.city;
            }
            if ('zipCode' in updatedUserInfo) {
                updatedInfo.zipCode = updatedUserInfo.zipCode;
            }
            if ('email' in updatedUserInfo) {
                updatedInfo.email = updatedUserInfo.email;
            }
            if ('password' in updatedUserInfo) {
                updatedInfo.hashedPassword = bcrypt.hashSync(updatedUserInfo.password, saltRounds);
            }

            let updateCommand = {
                $set: updatedInfo
            };

            return users().then((usersCollection) => {
                return usersCollection.updateOne({ _id: id }, updateCommand).then(() => {
                    return this.getUserById(id);
                });
            });
        });
    }
}
module.exports = exportedMethods;



// exportedMethods.addUser("Ruchika", "Sutariya", "3588 John F Kennedy Blvd", "201-993-8891", "NJ", "Jersey City", "07307", "rsutariy@stevens.edu", "Harsh7894").then((data) => {
//     console.log(data);
// });  


