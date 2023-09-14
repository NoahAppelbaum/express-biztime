const db = require("./db")
const { NotFoundError, BadRequestError } = require("./expressError");

function checkValidBody(){
  //TODO: this
}


function checkValidEntry(identifier){
 return async function (req, res, next) {
  const lookupValue = req.params[identifier];

  results = await db.query(
    `SELECT code, name description
    FROM companies
    WHERE ${identifier} = $1`, [lookupValue]
  )

  if (!results.rows.length){
    throw new NotFoundError()
  }

  return next()
}
}
module.exports = {checkValidBody, checkValidEntry}
