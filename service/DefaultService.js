'use strict';

const { EnapsoGraphDBClient } = require("@innotrade/enapso-graphdb-client");

// Config
const GRAPHDB_BASE_URL = "http://localhost:7200",
    GRAPHDB_REPOSITORY = "1",
    GRAPHDB_USERNAME = "admin",
    GRAPHDB_PASSWORD = "123",
    GRAPHDB_CONTEXT_TEST = "http://ont.enapso.com/repo";
    //GRAPHDB_CONTEXT_TEST = "http://www.ontotext.com/explicit";
const DEFAULT_PREFIXES = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS,
    EnapsoGraphDBClient.PREFIX_XSD,
    EnapsoGraphDBClient.PREFIX_PROTONS,
    {
        prefix: "entest",
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
      entest:TestClass3 rdf:type owl:Class}
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
  return new Promise(function(resolve, reject) {

      graphDBEndpoint
            .query(
                `PREFIX : <http://www.ontogrid.net/StickyNote#>
                  select * where {
    	             :event3 ?p ?o
                  } limit 10`        )
            .then((result) => {
                response.query = result;
                //console.log("Read a class:\n" + JSON.stringify(result, null, 2));
            })
            .catch((err) => {
              response.query = "error";
            });

    response.username = "Hello world " + user;
    response.cumplido = "Que chico tan guapo, " + user;


    resolve(response);
  });
}
