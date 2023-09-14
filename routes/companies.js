const express = require("express");
const router = new express.Router();
const db = require("../db")
const {checkValidBody, checkValidEntry} = require("../utils");

const { NotFoundError, BadRequestError } = require("../expressError");


router.get("/", async function(req, res) {
  const results = await db.query(
    `SELECT code, name
      FROM companies`
  )

  return res.json({companies: results.rows})
})

router.get("/:code", checkValidEntry("code"), async function(req, res) {
  //Error handling via middleware!
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name description
      FROM companies
      WHERE code = $1`, [code]
  );

  return res.json({company: results.rows[0]});
})




module.exports = router;
