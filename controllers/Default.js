'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.getQuery = function getQuery (req, res, next) {
  var webID = req.swagger.params['webID'].value;
  var catPData = req.swagger.params['catPData'].value;
  var purPData = req.swagger.params['purPData'].value;
  Default.getQuery(webID,catPData,purPData)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getQueryFile = function getQueryFile (req, res, next) {

  var webID = req.swagger.params['webID'].value;
  var uri = req.swagger.params['uri'].value;
  Default.getQueryFile(webID,uri)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
