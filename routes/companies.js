"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");
const { checkValidBody } = require("../utils");

const { NotFoundError } = require("../expressError");

const CREATE_REQUIRED_KEYS = ["code", "name", "description"];
const UPDATE_REQUIRED_KEYS = ["name", "description"];


/** Returns list of companies, like {companies: [{code, name}, ...]} */
router.get("/", async function (req, res) {
  const result = await db.query(
    `SELECT code, name
      FROM companies
      ORDER BY code`
  );

  return res.json({ companies: result.rows });
});


/** Return obj of company:
* {company: {code, name, description, invoices: [id, ...]}}
* If the company given cannot be found, this should return a 404 status response.
*/
router.get("/:code", async function (req, res) {
  const code = req.params.code;

  const companyData = await db.query(
    `SELECT code, name description
      FROM companies
      WHERE code = $1`, [code]
  );

  const company = companyData.rows[0];
  if (!company) throw new NotFoundError(`Could not find ${code}`);

  const invoiceData = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
      FROM invoices
      WHERE comp_code = $1`, [company.code]
  );

  company.invoices = invoiceData.rows;
  return res.json({ company });
});


/** Adds a company.
* Needs to be given JSON like: {code, name, description}
* Returns obj of new company: {company: {code, name, description}}
*/
router.post(
  "/",
  checkValidBody(...CREATE_REQUIRED_KEYS),
  async function (req, res) {

    const { code, name, description } = req.body;
    const result = await db.query(
      `INSERT INTO companies(code, name, description)
    VALUES($1, $2, $3)
    RETURNING code, name, description`,
      [code, name, description],
    );

    const company = result.rows[0];
    return res.status(201).json({ company });
  });


/** Edit existing company.
* Should return 404 if company cannot be found.
* Needs to be given JSON like: {name, description}
* Returns update company object: {company: {code, name, description}}
*/
router.put(
  "/:code",
  checkValidBody(...UPDATE_REQUIRED_KEYS),
  async function (req, res) {
    const code = req.params.code;

    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies
    SET name=$1,
        description=$2
    WHERE code = $3
    RETURNING code, name, description`,
      [name, description, code],
    );

    const company = result.rows[0];
    if (!company) throw new NotFoundError(`Could not find ${code}`);

    return res.json({ company });
  });


/** Deletes company.
* Should return 404 if company cannot be found.
* Returns {status: "deleted"}
*/
router.delete("/:code", async function (req, res) {
  const code = req.params.code;
  const result = await db.query(
    "DELETE FROM companies WHERE code = $1 RETURNING code", [code]);

  if (!result.rows[0]) throw new NotFoundError(`Could not find ${code}`);
  return res.json({ status: "deleted" });
});

module.exports = router;
