﻿/**
 * @ngdoc service
 * @name umbraco.services.macroService
 *
 *  
 * @description
 * A service to return macro information such as generating syntax to insert a macro into an editor
 */
function macroService() {

    return {
        
        /** parses the special macro syntax like <?UMBRACO_MACRO macroAlias="Map" /> and returns an object with the macro alias and it's parameters */
        parseMacroSyntax: function (syntax) {

            var expression = /(<\?UMBRACO_MACRO macroAlias=["']([\w\.]+?)["'].+?)(\/>|>.*?<\/\?UMBRACO_MACRO>)/im;
            var match = expression.exec(syntax);
            if (!match || match.length < 3) {
                return null;
            }
            var alias = match[2];

            //this will leave us with just the parameters
            var paramsChunk = match[1].trim().replace(new RegExp("UMBRACO_MACRO macroAlias=[\"']" + alias + "[\"']"), "").trim();
            
            var paramExpression = new RegExp("(\\w+?)=['\"](.*?)['\"]", "g");
            var paramMatch;
            var returnVal = {
                macroAlias: alias,
                marcoParamsDictionary: {}
            };
            while (paramMatch = paramExpression.exec(paramsChunk)) {
                returnVal.marcoParamsDictionary[paramMatch[1]] = paramMatch[2];
            }
            return returnVal;
        },

        /**
         * @ngdoc function
         * @name umbraco.services.macroService#generateWebFormsSyntax
         * @methodOf umbraco.services.macroService
         * @function    
         *
         * @description
         * generates the syntax for inserting a macro into a rich text editor - this is the very old umbraco style syntax
         * 
         * @param {object} args an object containing the macro alias and it's parameter values
         */
        generateMacroSyntax: function (args) {

            // <?UMBRACO_MACRO macroAlias="BlogListPosts" />

            var macroString = '<?UMBRACO_MACRO macroAlias=\"' + args.macroAlias + "\" ";

            if (args.marcoParamsDictionary) {

                _.each(args.marcoParamsDictionary, function (val, key) {
                    //check for null
                    val = val ? val : "";
                    //need to detect if the val is a string or an object
                    var keyVal;
                    if (angular.isString(val)) {
                        keyVal = key + "=\"" + (val ? val : "") + "\" ";
                    }
                    else {
                        //if it's not a string we'll send it through the json serializer
                        var json = angular.toJson(val);
                        //then we need to url encode it so that it's safe
                        var encoded = encodeURIComponent(json);
                        keyVal = key + "=\"" + encoded + "\" ";
                    }
                    
                    macroString += keyVal;
                });

            }

            macroString += "/>";

            return macroString;
        },

        /**
         * @ngdoc function
         * @name umbraco.services.macroService#generateWebFormsSyntax
         * @methodOf umbraco.services.macroService
         * @function    
         *
         * @description
         * generates the syntax for inserting a macro into a webforms templates
         * 
         * @param {object} args an object containing the macro alias and it's parameter values
         */
        generateWebFormsSyntax: function(args) {
            
            var macroString = '<umbraco:Macro ';

            if (args.marcoParamsDictionary) {
                
                _.each(args.marcoParamsDictionary, function (val, key) {
                    var keyVal = key + "=\"" + (val ? val : "") + "\" ";
                    macroString += keyVal;
                });

            }

            macroString += "Alias=\"" + args.macroAlias + "\" runat=\"server\"></umbraco:Macro>";

            return macroString;
        },
        
        /**
         * @ngdoc function
         * @name umbraco.services.macroService#generateMvcSyntax
         * @methodOf umbraco.services.macroService
         * @function    
         *
         * @description
         * generates the syntax for inserting a macro into an mvc template
         * 
         * @param {object} args an object containing the macro alias and it's parameter values
         */
        generateMvcSyntax: function (args) {

            var macroString = "@Umbraco.RenderMacro(\"" + args.macroAlias + "\"";

            var hasParams = false;
            var paramString;
            if (args.marcoParamsDictionary) {
                
                paramString = ", new {";

                _.each(args.marcoParamsDictionary, function(val, key) {

                    hasParams = true;
                    
                    var keyVal = key + "=\"" + (val ? val : "") + "\", ";

                    paramString += keyVal;
                });
                
                //remove the last , 
                paramString = paramString.trimEnd(", ");

                paramString += "}";
            }
            if (hasParams) {
                macroString += paramString;
            }

            macroString += ")";
            return macroString;
        }

    };

}

angular.module('umbraco.services').factory('macroService', macroService);