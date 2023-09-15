"use strict";

const db = require("./db");
const { NotFoundError, BadRequestError } = require("./expressError");

/** Error handling middleware for validating JSON body
 * Throws error on missing body
 * Optional arguments for required keys in request body
 * Returns a middleware function
 */
function checkValidBody(...keys) {
  return function (req, res, next) {
    if (!req.body) {
      throw new BadRequestError("Did not receive body");
    }

    if (keys.length) {
      for (const key of keys) {
        if (!(key in req.body)) {
          throw new BadRequestError(`Required: ${keys}`);
        }
      }
    }

    return next();
  };
}


module.exports = { checkValidBody };
