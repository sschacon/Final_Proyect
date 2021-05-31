sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        function onInit() {

        }

        function onNavToCreateEmployee() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            oRouter.navTo("CreateEmployee", {}, false);
        }

        return Controller.extend("logaligroup.HTML5Project.controller.Menu", {
            onInit: onInit,
            onNavToCreateEmployee: onNavToCreateEmployee

        });
    });
