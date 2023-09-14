"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db")
const {checkValidBody} = require("../utils");

const { NotFoundError, BadRequestError } = require("../expressError");

const CREATE_REQUIRED_KEYS = ["comp_code", "amt"]
const UPDATE_REQUIRED_KEYS = ["amt"]

/** Return info on invoices: like {invoices: [{id, comp_code}, ...]} */
router.get("/", async function (req, res) {
  const result = await db.query(
    `SELECT id, comp_code, amt, paid, add_date, paid_date
      FROM invoices
      ORDER BY id`
  );

  return res.json({ invoices: result.rows });
});


/** Returns obj on given invoice.

If invoice cannot be found, returns 404.

Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}} */
router.get("/:id", async function (req, res) {
  const id = req.params.id;

  const invoiceData = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
      FROM invoices
      WHERE id = $1`, [id]
  );

  const invoice = invoiceData.rows[0]

  if (!invoice) throw new NotFoundError();

  const companyData = await db.query(
    `SELECT code, name, description
    FROM companies
    WHERE companies.code = $1`, [invoice.comp_code] // TODO: Why does ${invoice.comp_code} not work
  );

  const company = companyData.rows[0];

  delete invoice.comp_code;


  return res.json({ invoice, company });
});


/** Adds an invoice.

Needs to be passed in JSON body of: {comp_code, amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.post(
  "/",
  checkValidBody(...CREATE_REQUIRED_KEYS),
  async function (req, res) {

    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices(comp_code, amt)
    VALUES($1, $2)
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt],
    );

    const invoice = result.rows[0];
    return res.status(201).json({ invoice });
});


/** Updates an invoice.

If invoice cannot be found, returns a 404.

Needs to be passed in a JSON body of {amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.put(
  "/:id",
  checkValidBody(...UPDATE_REQUIRED_KEYS),
  async function (req, res) {

    const { amt } = req.body;
    const result = await db.query(
      `UPDATE invoices
    SET amt=$1
    WHERE id = $2
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, req.params.id],
    );

    const invoice = result.rows[0];
    if (!invoice) throw new NotFoundError();

    return res.json({ invoice });
});




module.exports = router;