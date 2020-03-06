process.env.NODE_ENV = "test";

let chai = require("chai");
let chaiHttp = require("chai-http");
let app = require("../app");
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

let token = "null";

describe("/GET login", () => {
  it("should login with correct credentials", done => {
    chai
      .request(app)
      .post("/api/login")
      .send({
        username: "klefcodes",
        password: "happy"
      })
      .end((error, response) => {
        response.should.have.status(200);
        response.body.should.have.property("token");
        done();
      });
  });
  it("should not login with incorrect credentials", done => {
    chai
      .request(app)
      .post("/api/login")
      .send({
        username: "klefcodes",
        password: "angry"
      })
      .end((error, response) => {
        response.should.have.status(400);
        done();
      });
  });
});

describe("/PATCH jsonpatch", () => {
  before(done => {
    chai
      .request(app)
      .post("/api/login")
      .send({
        username: "klefcodes",
        password: "happy"
      })
      .end((error, response) => {
        token = response.body.token;
        done();
      });
  });

  it("should apply the patch when sending correct document", done => {
    chai
      .request(app)
      .patch("/api/jsonpatch")
      .set("Authorization", token)
      .send({
        json: {
          baz: "qux",
          foo: "bar"
        },
        patch: [
          {
            op: "replace",
            path: "/baz",
            value: "patched"
          }
        ]
      })
      .end((error, response) => {
        response.should.have.status(200);
        done();
      });
  });

  it("should reject patch if document is not jsonpatch", done => {
    chai
      .request(app)
      .patch("/api/jsonpatch")
      .set("Authorization", token)
      .send({
        json: {
          baz: "qux",
          foo: "bar"
        }
      })
      .end((error, response) => {
        response.should.have.status(400);
        done();
      });
  });

  it("should not apply patch if token is missing", done => {
    chai
      .request(app)
      .patch("/api/jsonpatch")
      .send({
        json: {
          baz: "qux",
          foo: "bar"
        },
        patch: [
          {
            op: "replace",
            path: "/baz",
            value: "patched"
          }
        ]
      })
      .end((error, response) => {
        response.should.have.status(401);
        done();
      });
  });
});

describe("/POST thumbnail", () => {
  before(done => {
    chai
      .request(app)
      .post("/api/login")
      .send({
        username: "klefcodes",
        password: "happy"
      })
      .end((error, response) => {
        token = response.body.token;
        done();
      });
  });

  it("should create a thumbnail", done => {
    chai
      .request(app)
      .post("/api/thumbnail")
      .set("Authorization", token)
      .send({
        url:
          "https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/MarioNSMBUDeluxe.png/220px-MarioNSMBUDeluxe.png"
      })
      .end((error, response) => {
        response.should.have.status(200);
        done();
      });
  });

  it("should not create thumbnail if url is invalid", done => {
    chai
      .request(app)
      .post("/api/thumbnail")
      .set("Authorization", token)
      .send({
        url: "https://upload.wikimedia.org"
      })
      .end((error, response) => {
        response.should.have.status(400);
        done();
      });
  });

  it("should not create a thumbnail if there is no token", done => {
    chai
      .request(app)
      .post("/api/thumbnail")
      .send({
        url: "https://upload.wikimedia.org/wikipedia"
      })
      .end((error, response) => {
        response.should.have.status(401);
        done();
      });
  });
});
