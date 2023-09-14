"use strict";

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

router.put("/:code", checkValidEntry("code"), checkValidBody, async function(req, res) {
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
  return res.json({ company });
})

router.delete("/:code", checkValidEntry("code"), async function(req, res) {
  await db.query(
    "DELETE FROM companies WHERE code = $1", [req.params.code],
  );

  return res.json({ status: "deleted" });
})

module.exports = router;
