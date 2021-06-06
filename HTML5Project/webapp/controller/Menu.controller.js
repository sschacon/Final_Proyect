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

        function onNavToDisplayEmployee() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            oRouter.navTo("DisplayEmployee", {}, false);
        }

        function onAfterRendering() {
            // Error en el framework: Al agregar la dirección URL de "Firmar pedidos", el componente GenericTile debería navegar directamente a dicha URL, // pero no funciona en la versión 1.78. Por tanto, una solución encontrada es eliminando la propiedad id del componente por jquery
            var genericTileFirmarPedido = this.byId("linkFirmarPedido");
            //Id del dom
            var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
            //Se vacía el id
            jQuery("#" + idGenericTileFirmarPedido)[0].id = "";
        }

        return Controller.extend("logaligroup.HTML5Project.controller.Menu", {
            onInit: onInit,
            onNavToCreateEmployee: onNavToCreateEmployee,
            onNavToDisplayEmployee: onNavToDisplayEmployee,
            onAfterRendering: onAfterRendering

        });
    });
