"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db")
const {checkValidBody} = require("../utils");

const { NotFoundError, BadRequestError } = require("../expressError");


/** Returns list of companies, like {companies: [{code, name}, ...]} */
router.get("/", async function(req, res) {
  const result = await db.query(
    `SELECT code, name
      FROM companies`
  )

  return res.json({companies: result.rows})
})


/** Return obj of company: {company: {code, name, description}}. */
router.get("/:code", async function(req, res) {
  const code = req.params.code;

  const result = await db.query(
    `SELECT code, name description
      FROM companies
      WHERE code = $1`, [code]
  );

  if (!result.rows[0]) throw new NotFoundError()


  return res.json({company: result.rows[0]});
})


/** Creates new company in DB and returns in json */
router.post("/", checkValidBody, async function(req, res) {
  for (const key of ["code", "name", "description"]) {
    if (!(key in req.body)) {
      throw new BadRequestError();
    }
  }

  const { code, name, description } = req.body;
  const result = await db.query(
  `INSERT INTO companies(code, name, description)
  VALUES($1, $2, $3)
  RETURNING code, name, description`,
  [code, name, description],
  );

  const company = result.rows[0];
  return res.status(201).json({ company });
})


/** Updates company in DB and returns company in JSON */
router.put("/:code", checkValidBody, async function(req, res) {
  for (const key of ["name", "description"]) {
    if (!(key in req.body)) {
      throw new BadRequestError();
    }
  }

  const { name, description } = req.body;
  const result = await db.query(
  `UPDATE companies
   SET name=$1,
       description=$2
   WHERE code = $3
   RETURNING code, name, description`,
  [name, description, req.params.code],
  );

  const company = result.rows[0];
  if (!company) throw new NotFoundError()

  return res.json({ company });
})


/** Deletes company from DB */
router.delete("/:code", async function(req, res) {
  const result = await db.query(
    "DELETE FROM companies WHERE code = $1 RETURNING code", [req.params.code]
  );

  if (!result.rows[0]) throw new NotFoundError()
  return res.json({ status: "deleted" });
})

module.exports = router;
