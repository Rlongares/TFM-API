const { EnapsoGraphDBClient } = require("@innotrade/enapso-graphdb-client");

// Config
const GRAPHDB_BASE_URL = "http://localhost:7200",
    GRAPHDB_REPOSITORY = "1",
    GRAPHDB_USERNAME = "Admin",
    GRAPHDB_PASSWORD = "1234",
    GRAPHDB_CONTEXT_TEST = "http://ont.enapso.com/repo";
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
export let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: GRAPHDB_BASE_URL,
    repository: GRAPHDB_REPOSITORY,
    prefixes: DEFAULT_PREFIXES
});

//Authenticate (Optional)
 export graphDBEndpoint.login(GRAPHDB_USERNAME,GRAPHDB_PASSWORD)
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


// read the class
graphDBEndpoint
    .query(
        `select *from <${GRAPHDB_CONTEXT_TEST}>
        where {
          ?class rdf:type owl:Class
          filter(regex(str(?class), "http://ont.enapso.com/test#TestClass", "i")) .
        }`        )
    .then((result) => {
        console.log("Read a class:\n" + JSON.stringify(result, null, 2));
    })
    .catch((err) => {
        console.log(err);
    });
