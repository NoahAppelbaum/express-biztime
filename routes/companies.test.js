const request = require("supertest");
const db = require("../db");
const app = require("../app");

let testCompany;

beforeEach(async function() {
  await db.query("DELETE FROM companies");
  let result = await db.query(
    `INSERT INTO companies
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.');`
  )
  testCompany = result.rows[0]
})

/** GET /companies - returns {} */

describe("GET /companies", function() {
  test("Returns JSON", async function() {
    const resp = await request(app).get("/companies");

    expect(resp.body).toEqual({
      "companies": [
        {
          "code": "apple",
          "name": "Apple Computer"
        }
      ]
    });
    expect(resp.statusCode).toEqual(200);
  })
})

