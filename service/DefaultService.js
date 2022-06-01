'use strict';

const { getFile, isRawData, isContainer,getResourceInfo, getContentType, getSourceUrl,getPodUrlAll, getSolidDataset, getContainedResourceUrlAll, getThing, getUrlAll, getAgentAccessAll } = require("@inrupt/solid-client");
const { RDF, ODRL }= require("@inrupt/vocab-common-rdf");
const myJsonCat = require('./personaldata.json');
const myJsonPur = require('./purposes.json');
/**
 * Returns data from pod
 * Makes a query to the SOLID pod of the user in order to comply with a Right of access request.
 *
 * webID String The WebId of the user making the Right of access petition.
 * catPData List The categories of data that the user making the Right of access petition wants to know.
 * purPData List The purposes of data that the user making the Right of access petition wants to know.
 * returns RightOfAccess -
                      name: Obtain from uri - uri.substring(url.lastIndexOf("/") + 1);
                      uri: 2 steps 1- getSourceUrl 2- encodeURIComponent()
                      category: from the category that matches
                      purpose: run the
                      recipients: check
                      duration: Make string
 **/

 function insertSpaces(string) {
      string = string.replace(/([a-z])([A-Z])/g, '$1 $2');
      string = string.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      return string;
  }
 // Log to console
 const getParent = (root, id) =>  {
        var node;

        root.some(function (n) {
            if (n.label == id) {
                  return node = n;
            }
            if (n.children) {
                return node = getParent(n.children, id);
            }
        });
        return node|| null;
    }
const dpvpd = "https://www.w3id.org/dpv/dpv-pd/#" ;
const oac = "https://w3id.org/oac/" ;
const dpv = "http://www.w3.org/ns/dpv#";


exports.getQuery = async function(webID,catPData,purPData) {

  var result = {processed:false,
                format:{dataSubjectRights:"Out of the scope of this TFM.",
                           safeguards:"Out of the scope of this TFM.",
                           resource:[]
                         }
};
  //Obtain root of the pod
  let podRoot = "";
   //const getAuthorizedData = () => {
    await getPodUrlAll(webID).then(response => {
       podRoot = response[0];
      //console.log(podRoot);
    });
  //};

  const policiesContainer = podRoot+'public/podrl_policies/';

  // get list of policies

  console.log("get list of policies ");
  console.log(policiesContainer);
  const policyDataset = await getSolidDataset(policiesContainer, { fetch: fetch });
  const policyList = getContainedResourceUrlAll(policyDataset);
  console.log(policyList);

  var policyListPermission=[];
  var policyListProhibition=[];
  for (var i = 0; i < policyList.length; i++){
    const policy = await getSolidDataset( policyList[i], { fetch: fetch });
    if(JSON.stringify(policy.graphs.default).indexOf("prohibition1") < 0){
      policyListPermission.push(policyList[i]);
    }else{
      policyListProhibition.push(policyList[i]);
    }
  }
console.log("Permissions: \n"+policyListPermission);
console.log("Prohibitions: \n"+policyListProhibition);

  // get list of files in personal_data/ container

  console.log("get list of files in all containers");
  const personalDataset = await getSolidDataset(podRoot+'public/', { fetch: fetch });
  let personalDataFilesList = getContainedResourceUrlAll(personalDataset);
  for (var i = 0; i < personalDataFilesList.length; i++){
    if(isContainer(personalDataFilesList[i])){
      const dataset = await getSolidDataset(personalDataFilesList[i], { fetch: fetch });
      personalDataFilesList = personalDataFilesList.concat(getContainedResourceUrlAll(dataset));
    }
  }
  personalDataFilesList = personalDataFilesList.filter( function( el ) {
    return !policyList.includes( el );
    }
  );
  console.log(personalDataFilesList);

  //Cleaning policyList depending on the parameters passed.
console.log("Cleaning policyList depending on the categories passed.");
  if(catPData != "0"){
    console.log(catPData);
    console.log(policyListPermission);
    for (var k = 0; k < policyListPermission.length; k++){
      const policyPermission = await getSolidDataset( policyListPermission[k], { fetch: fetch });
      const policyPermissionThing = `${policyListPermission[k]}#permission1`
      const thing = getThing( policyPermission, policyPermissionThing);
      // get category of data targeted by the policy
      console.log("Get category of data targeted by the permission policy.");

      const targetDataPolicy = getUrlAll(thing, ODRL.target);
      console.log(policyListPermission[k].substring(policyListPermission[k].lastIndexOf("/") + 1) +" "+targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1));
      console.log(catPData.includes(targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1)));
      console.log(catPData.some((e) => getParent(myJsonCat,targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1)).parents.includes(e)));
      if(!catPData.includes(targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1)) && !catPData.some((e) => getParent(myJsonCat,targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1)).parents.includes(e)) ){
        console.log("Eliminating permission policy");
        policyListPermission.splice(k, 1);
        k--;
      }
    }
    console.log(policyListProhibition);
    for (var k = 0; k < policyListProhibition.length; k++){
      const policyProhibition = await getSolidDataset( policyListProhibition[k], { fetch: fetch });
      const policyProhibitionThing = `${policyListProhibition[k]}#prohibition1`
      const thing = getThing( policyProhibition, policyProhibitionThing);
      // get category of data targeted by the policy
      console.log("Get category of data targeted by the prohibition policy.");

      const targetDataPolicy = getUrlAll(thing, ODRL.target);
      console.log(catPData.includes(targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1)));
      console.log(catPData.some((e) => getParent(myJsonCat,targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1)).parents.includes(e)));
      if(!catPData.includes(targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1)) && !catPData.some((e) => getParent(myJsonCat,targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1)).parents.includes(e)) ){
        console.log("Eliminating prohibition policy");
        policyListProhibition.splice(k, 1);
        k--;
      }

    }
  }
  console.log("Cleaning policyList depending on the purposes passed.");
  if(purPData != "0"){
    console.log(purPData);
    console.log(policyListPermission);
    console.log(policyListPermission.length);
    for (var k = 0; k < policyListPermission.length; k++){
      const policyPermission = await getSolidDataset( policyListPermission[k], { fetch: fetch });
      const purposeConstraintThing = `${policyListPermission[k]}#purposeConstraint`;
      const purposeThing = getThing( policyPermission, purposeConstraintThing);
      const purposeData = getUrlAll(purposeThing, ODRL.rightOperand);
      console.log(purposeData);
      console.log(purPData.some((e) => purposeData.includes("http://www.w3.org/ns/dpv#"+e)));
      console.log(purPData.some((e) => purposeData.some((e2) => getParent(myJsonPur,insertSpaces(e2.split("#").pop())).parents.includes(e))));

      if(!purPData.some((e) => purposeData.includes("http://www.w3.org/ns/dpv#"+e))  &&  !purPData.some((e) => purposeData.some((e2) => getParent(myJsonPur,insertSpaces(e2.split("#").pop())).parents.includes(e))) ) {
        console.log("Eliminating permission policy");
        policyListPermission.splice(k, 1);
        k--;
      }

    }
    console.log(policyListProhibition + policyListProhibition.length);
    for (var k = 0; k < policyListProhibition.length; k++){
      const policyProhibition = await getSolidDataset( policyListProhibition[k], { fetch: fetch });
      const purposeConstraintThing = `${policyListProhibition[k]}#purposeConstraint`;
      const purposeThing = getThing( policyProhibition, purposeConstraintThing);
      const purposeData = getUrlAll(purposeThing, ODRL.rightOperand);
      console.log(purposeData);
      console.log(purPData.some((e) => purposeData.includes("http://www.w3.org/ns/dpv#"+e)));
      console.log(purPData.some((e) => purposeData.some((e2) => getParent(myJsonPur,insertSpaces(e2.split("#").pop())).parents.includes(e))));
      if(!purPData.some((e) => purposeData.includes("http://www.w3.org/ns/dpv#"+e))&&  !purPData.some((e) => purposeData.some((e2) => getParent(myJsonPur,insertSpaces(e2.split("#").pop())).parents.includes(e))) ) {
        console.log("Eliminating prohibition policy");
        policyListProhibition.splice(k, 1);
        k--;
      }

    }
  }
  console.log("POLICY PERMISSION LIST: ")
  console.log(policyListPermission);
  console.log("POLICY PROHIBITION LIST: ")
  console.log(policyListProhibition);


  //Start getting list of files to give back.

  console.log("Start getting list of files to give back.");

  //Going through each file to see with which policies it identifies.
  var count = 1;
  for (var pdfl = 0; pdfl< personalDataFilesList.length;pdfl++){
    var personalDataFile = await getFile( personalDataFilesList[pdfl], { fetch: fetch });
    if(!isRawData(personalDataFile)){

      personalDataFile = await getSolidDataset( personalDataFilesList[pdfl], { fetch: fetch });

      const personalDataFileThing = getThing(personalDataFile, personalDataFilesList[pdfl]);

      const targetDataURL = getUrlAll(personalDataFileThing, RDF.type);

      const categoryIndex = targetDataURL.findIndex(element => element.includes("dpv"));

      if(categoryIndex > -1){
      console.log("TargetDataURl \n" + targetDataURL);
      console.log(targetDataURL[categoryIndex].split("#").pop());
      console.log("Creando resource to add "+personalDataFilesList[pdfl] );
      const resourceName = personalDataFilesList[pdfl].substring(personalDataFilesList[pdfl].lastIndexOf("/") + 1).length > 0 ? personalDataFilesList[pdfl].substring(personalDataFilesList[pdfl].lastIndexOf("/") + 1) : "Container " + count;
      var urlList = [personalDataFilesList[pdfl]];
      console.log(urlList);
      if(isContainer(personalDataFilesList[pdfl])){
          urlList = urlList.concat(getContainedResourceUrlAll(personalDataFile));
          count++;
        }
      console.log(urlList);

      var resourceToAdd = {
         name: resourceName,
         uri: urlList,
         categories: targetDataURL[categoryIndex].split("#").pop(),
         policies: [],
         recipients:"", //await getAgentAccessAll(personalDataFilesList[pdfl]),
         duration: "For as long as it is on the pod under a policy."
      };
      //We deal with the policies that add permissions.

      for (var i = 0; i < policyListPermission.length; i++){
        const policyPermission = await getSolidDataset( policyListPermission[i], { fetch: fetch });
        const policyPermissionThing = `${policyListPermission[i]}#permission1`
        const thing = getThing( policyPermission, policyPermissionThing);
        // get category of data targeted by the policy
        console.log("get category of data targeted by the permission policy.");

        const targetDataPolicy = getUrlAll(thing, ODRL.target);

        //Comprobamos si la categoria de la politica y la del fichero son la misma o si la categoria del fichero es una subcategoria de la de la politica.
          if((targetDataURL[categoryIndex].split("#").pop() == targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1)) || getParent(myJsonCat,targetDataURL[categoryIndex].split("#").pop()).parents.includes(targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1))){

            var policy = {
              polName:  policyListPermission[i].substring(policyListPermission[i].lastIndexOf("/") + 1) +" category: " + targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1),
              purpose: "",
              action: "",
            };

            const purposeConstraintThing = `${policyListPermission[i]}#purposeConstraint`;
            const purposeThing = getThing( policyPermission, purposeConstraintThing);
            const purposeData = getUrlAll(purposeThing, ODRL.rightOperand);
            console.log(purposeData);

            const actionData = getUrlAll(thing, ODRL.action);
            console.log(actionData);
            var purposeData2 = purposeData.map(function(d) {return d.replace('http://www.w3.org/ns/dpv#', '');})
            var actionData2 = actionData.map(function(d) {return d.replace('https://w3id.org/oac/', '');})
            policy.purpose = purposeData2;
            policy.action = actionData2;
            console.log(policy);
            resourceToAdd.policies.push(policy);
          }

      }
/*
      //We deal with the Prohibitions
      for (var i = 0; i < policyListProhibition.length; i++){

        const policyProhibition = await getSolidDataset( policyListProhibition[i], { fetch: fetch });
        const policyProhibitionThing = `${policyListProhibition[i]}#prohibition1`;
        const thing = getThing( policyProhibition, policyProhibitionThing);
        const targetDataPolicy = getUrlAll(thing, ODRL.target);
        const purposeConstraintThing = `${policyListProhibition[i]}#purposeConstraint`;
        const purposeThing = getThing( policyProhibition, purposeConstraintThing);
        const purposeData = getUrlAll(purposeThing, ODRL.rightOperand);
        const actionData = getUrlAll(thing, ODRL.action);

        // get category of data targeted by the policy
        console.log("get category of data targeted by the prohibition policy.");


        const element = targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1);
        console.log(purposeData);
        for (var j = 0; j < resourceToAdd.policies.length; j++) {
          console.log("Entered for: "+j);
          console.log("Target del archivo: " +targetDataURL[0].split("#").pop());
          console.log("Target de la policy: " +targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1) );
          console.log(targetDataURL[0].split("#").pop() == targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1));
          console.log(getParent(myJsonCat,targetDataURL[0].split("#").pop()).parents.includes(targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1)));
          //Comprobamos si las categorias de los archivos son iguales
          if((targetDataURL[0].split("#").pop() ==  targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1)) || getParent(myJsonCat,targetDataURL[0].split("#").pop()).parents.includes(targetDataPolicy[0].substring(targetDataPolicy[0].lastIndexOf("/") + 1))){
            console.log("Categories are the same so we check for something prohibited here." + j);

            //console.log(resourceToAdd.policies[j].purpose);
            //console.log(resourceToAdd.policies[j].purpose.split("#").pop());
            //console.log(getParent(myJsonPur,resourceToAdd.policies[j].purpose.split("#").pop()));
            if(purposeData.some((e) => resourceToAdd.policies[j].purpose.includes(e) || getParent(myJsonPur,resourceToAdd.policies[j].purpose.split("#").pop()).parents.includes(e.split("#").pop()) )  ){

              console.log("We have something prohibited here.");
              console.log(resourceToAdd.policies[j].action);
              console.log(actionData);
              resourceToAdd.policies[j].action = resourceToAdd.policies[j].action.split(",").filter(val => !actionData.includes(val)).toString();
              console.log(resourceToAdd.policies[j].action);
          }
        }

      }
      console.log("Out of " + j +" policy");
    }
    */

      if(resourceToAdd.policies.length > 0 ){
        console.log(resourceToAdd);
        result.format.resource.push(resourceToAdd);
      }
    }

    }

  }

  console.log(result);


  return new Promise(function(resolve, reject) {

      resolve(result);

  });
}




/**
 * Returns the contents of one file from the users pod
 * Makes a query to the SOLID pod of the user in order to get the contents of a file.
 *
 * webID String The WebId of the user making the Right of access petition.
 * uri String The uri of the file.
 * no response value expected for this operation
 **/

exports.getQueryFile =  async function(webID,uri) {
  let podRoot = "";
   //const getAuthorizedData = () => {
    await getPodUrlAll(webID).then(response => {
       podRoot = response[0];
      //console.log(podRoot);
    });
  //};
    // We descompose the parameter uri, to obtain the
    const fileURL =  decodeURIComponent(uri);

    //Obtain file as a blob
    const file = await getFile(
        fileURL,               // File in Pod to Read
        { fetch: fetch }       // fetch from authenticated session
      );
      const text = await file.text();
      //
      //console.log(file);
      console.log(getContentType(file));
      //console.log(["text/","application/json"].some(s=>getContentType(file).includes(s)));
      //Transformation of the blob into undertandable depending on content type
      //let res = new File([file],fileURL.substring(fileURL.lastIndexOf("/") + 1), { type: getContentType(file),});
      //console.log(text);
      //console.log(file);

      //console.log(typeof(text));
      //console.log(typeof(file));
      //const url= window.URL.createObjectURL(file);
  return new Promise(function(resolve, reject) {
    resolve(text);
  });
}
