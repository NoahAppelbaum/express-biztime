"use strict";

const db = require("./db")
const { NotFoundError, BadRequestError } = require("./expressError");


/** Error handling middleware for validating JSON body */
function checkValidBody(req, res, next){
  if (!req.body) {
    throw new BadRequestError();
  }

  return next();
}

//This middleware Error Handler is cool! It works! But not as well as just
// validating the query result.

// function checkValidEntry(identifier){
//  return async function (req, res, next) {
//   const lookupValue = req.params[identifier];

//   const results = await db.query(
//     `SELECT code, name description
//     FROM companies
//     WHERE ${identifier} = $1`, [lookupValue]
//   )

//   if (!results.rows.length){
//     throw new NotFoundError()
//   }

//   return next()
// }
// }
module.exports = {checkValidBody}
