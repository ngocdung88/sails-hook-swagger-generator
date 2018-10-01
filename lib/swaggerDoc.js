'use strict';
var _ = require('lodash');
var generators = require('./generators');
var fs = require('fs');
var pluralize = require('pluralize');
module.exports = function (sails, context) {
    if (sails.config[context.configKey].disabled === true) {
        return;
    }
    const blueprints = sails.config.blueprints;
    let models = _.cloneDeep(sails.models);
    if (blueprints.pluralize){
      models = _.map(models, model => {
        model.identity = pluralize(model.identity)
        return model;
      })
    }

    var specifications = sails.config[context.configKey].swagger;
    specifications.tags = generators.tags(models);
    specifications.definitions = generators.definitions(models);
    specifications.parameters = generators.parameters(sails.config, context);


    var generatedRoutes = generators.routes(sails.controllers, sails.config, specifications.tags);
    specifications.paths = generators.paths(generatedRoutes, specifications.tags, sails.config[context.configKey].blueprint_parameters);


    /**
     * clean up of specification
     * removing unwanted params
     */
    specifications.tags = _.map(specifications.tags, function (tag) {
        delete tag.identity;
        return tag;
    });

    fs.writeFile(sails.config[context.configKey].swaggerJsonPath, JSON.stringify(specifications), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("Swagger generated successfully");
    });

    return specifications;

};
