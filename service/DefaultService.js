'use strict';

const { EnapsoGraphDBClient } = require("@innotrade/enapso-graphdb-client");

// Config
const GRAPHDB_BASE_URL = "http://localhost:7200",
    GRAPHDB_REPOSITORY = "1",
    GRAPHDB_USERNAME = "admin",
    GRAPHDB_PASSWORD = "123",
    GRAPHDB_CONTEXT_TEST = "http://www.ontotext.com/explicit";
const DEFAULT_PREFIXES = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS,
    EnapsoGraphDBClient.PREFIX_XSD,
    EnapsoGraphDBClient.PREFIX_PROTONS,
    {
        prefix: "",
        iri: "http://ont.enapso.com/1#",
    }
];


//Create an Endpoint.
let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: GRAPHDB_BASE_URL,
    repository: GRAPHDB_REPOSITORY,
    prefixes: DEFAULT_PREFIXES
});

//Authenticate (Optional)
graphDBEndpoint.login(GRAPHDB_USERNAME,GRAPHDB_PASSWORD)
.then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
});
//insert a class
graphDBEndpoint
  .update(
    `insert data {
      graph <${GRAPHDB_CONTEXT_TEST}> {
      entest:TestClass rdf:type owl:Class}
  }`
         )
  .then((result) => {
    console.log("inserted a class :\n" + JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.log(err);
  });
  var response = {};
/**
 * Returns a hello world to a user
 * Returns a hello world to a user
 *
 * user String The name of the user to greet.
 * returns User
 **/
exports.getUser = function(user) {

  graphDBEndpoint
        .query(
            `select * from <${GRAPHDB_CONTEXT_TEST}>
              where {
                ?class rdf:type owl:Class
                filter(regex(str(?class), "http://ont.enapso.com/test#TestClass", "i")) .
              }`        )
        .then((result) => {
            response.query =result;
            console.log("Read a class:\n" + JSON.stringify(result, null, 2));

        })
        .catch((err) => {
          response.query = err;
        });

    return new Promise(function(resolve, reject) {



    response.username = "Hello world " + user;
    response.cumplido = "Que chico tan guapo, " + user;
    // read the class


    resolve(response);
  });
}
