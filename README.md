
In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:8080](http://localhost:8080) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

In order to use the connection to the database we will use the following library 
npm i @innotrade/enapso-graphdb-client --save
On the other hand, most of the interesting current actions can modified from the Service - DefaultService.js


const 

    GRAPHDB_BASE_URL = "http://localhost:7200",

    GRAPHDB_REPOSITORY = "1",
    
    GRAPHDB_USERNAME = "admin",
    
    GRAPHDB_PASSWORD = "123",
    
    GRAPHDB_CONTEXT_TEST = "http://ont.enapso.com/repo";

The first constant specifies where we the database server is exposed. The repository name is defined in the following constant. 

In case we have security activated we will need a user with the adecuate permissions which will be defined in the next two constants.

This is the code where the authentication occurs.

    graphDBEndpoint.login(GRAPHDB_USERNAME,GRAPHDB_PASSWORD)
    .then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
    });
    
Finally the query is made inside the function that answers to the API get request. Which  is exports.getUser = function(user).
         
         const query = graphDBEndpoint
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
