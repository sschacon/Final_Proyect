sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/UploadCollectionParameter"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.core.routing.History} History
     * @param {typeof sap.m.MessageBox} MessageBox
     * @param {typeof sap.m.UploadCollectionParameter} UploadCollectionParameter
     */
    function (Controller, History, MessageBox, UploadCollectionParameter) {
        "use strict";

        //Función al cancelar la creación
        function onCancel() {
            //Se muestra un mensaje de confirmación
            sap.m.MessageBox.confirm(this.oView.getModel("i18n").getResourceBundle().getText("preguntaCancelar"), {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        //Regresamos al menú principal
                        //Se obtiene el conjuntos de routers del programa
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        //Se navega hacia el router "menu"
                        oRouter.navTo("menu", {}, true);
                    }
                }.bind(this)
            });

        }

        function onBeforeRendering() {
            this._wizard = this.byId("CreateEmployeeWizard");

            this._model = new sap.ui.model.json.JSONModel({});
            this.getView().setModel(this._model);

            var oFirstStep = this._wizard.getSteps()[0];
            this._wizard.discardProgress(oFirstStep);
            this._wizard.goToStep(oFirstStep);
            oFirstStep.setValidated(false);

        }

        function toNavPass2(oEvent) {
            //Paso 1
            var dataEmployeeStep = this.byId("WizardPass2");
            //Paso 2
            var typeEmployeeStep = this.byId("WizardPass1");

            //Se obtiene el tipo seleccionado con el "CustomData"
            var button = oEvent.getSource();
            var typeEmployee = button.data("buttonTypeEmployee");

            //Dependiendo del tipo, el salario bruto por defecto es:
            // Interno: 24000
            // autonomo : 400
            // Gerente : 70000
            var Salary, Type;
            switch (typeEmployee) {
                case "interno":
                    Salary = 24000;
                    Type = "0";
                    break;
                case "autonomo":
                    Salary = 400;
                    Type = "1";
                    break;
                case "gerente":
                    Salary = 70000;
                    Type = "2";
                    break;
                default:
                    break;
            }

            this._model.setData({
                _type: typeEmployee,
                Type: Type,
                _Salary: Salary
            });

            //Se comprueba si se está en el paso 1, ya que se debe usar la función "nextStep" para activar el paso 2.
            if (this._wizard.getCurrentStep() === typeEmployeeStep.getId()) {
                this._wizard.nextStep();
            } else {
                this._wizard.goToStep(dataEmployeeStep);
            }
        }

        function checkDNI(oEvent) {

            if (this._model.getProperty("_type") !== "autonomo") {
                var dni = oEvent.getParameter("value");
                var number;
                var letter;
                var letterList;
                var regularExp = /^\d{8}[a-zA-Z]$/;
                //Se comprueba que el formato es válido
                if (regularExp.test(dni) === true) {
                    //Número
                    number = dni.substr(0, dni.length - 1);
                    //Letra
                    letter = dni.substr(dni.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    if (letterList !== letter.toUpperCase()) {
                        this._model.setProperty("/_DniState", "Error");
                    } else {
                        this._model.setProperty("/_DniState", "None");
                        this.dataEmployeeValidation();
                    }
                } else {
                    this._model.setProperty("/_DniState", "Error");
                }
            }
        }

        function checkDataEmployee(oEvent, callback) {
            var object = this._model.getData();
            var isValid = true;
            //Nombre
            if (!object.FirstName) {
                object._FirstNameState = "Error";
                isValid = false;
            } else {
                object._FirstNameState = "None";
            }

            //Apellidos
            if (!object.LastName) {
                object._LastNameState = "Error";
                isValid = false;
            } else {
                object._LastNameState = "None";
            }

            //Fecha
            if (!object.CreationDate) {
                object._CreationDateState = "Error";
                isValid = false;
            } else {
                object._CreationDateState = "None";
            }

            //DNI
            if (!object.Dni) {
                object._DniState = "Error";
                isValid = false;
            } else {
                object._DniState = "None";
            }

            if (isValid) {
                this._wizard.validateStep(this.byId("WizardPass2"));
            } else {
                this._wizard.invalidateStep(this.byId("WizardPass2"));
            }
            //Si hay callback se devuelve el valor isValid
            if (callback) {
                callback(isValid);
            }
        }

        function wizardCompletedHandler(oEvent) {
            //Se comprueba que no haya error
            this.checkDataEmployee(oEvent, function (isValid) {
                if (isValid) {
                    //Se navega a la página review
                    var wizardNavContainer = this.byId("wizardNavContainer");
                    wizardNavContainer.to(this.byId("ReviewPage"));
                    //Se obtiene los archivos subidos
                    var uploadCollection = this.byId("UploadCollection");
                    var files = uploadCollection.getItems();
                    var numFiles = uploadCollection.getItems().length;
                    this._model.setProperty("/_numFiles", numFiles);
                    if (numFiles > 0) {
                        var arrayFiles = [];
                        for (var i in files) {
                            arrayFiles.push({ DocName: files[i].getFileName(), MimeType: files[i].getMimeType() });
                        }
                        this._model.setProperty("/_files", arrayFiles);
                    } else {
                        this._model.setProperty("/_files", []);
                    }
                } else {
                    this._wizard.goToStep(this.byId("WizardPass2"));
                }
            }.bind(this));
        }

        function _editStep(step) {
            var wizardNavContainer = this.byId("wizardNavContainer");
            var fnAfterNavigate = function () {
                this._wizard.goToStep(this.byId(step));
                wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
            }.bind(this);

            wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
            wizardNavContainer.back();
        }

        function editStepOne() {
            _editStep.bind(this)("WizardPass1");
        }

        function editStepTwo() {
            _editStep.bind(this)("WizardPass2");
        }

        function editStepThree() {
            _editStep.bind(this)("WizardPass3");
        }

        function onSaveEmployee() {
            var json = this.getView().getModel().getData();
            var body = {};
            //Se obtienen aquellos campos que no empicen por "_", ya que son los que vamos a enviar
            for (var i in json) {
                if (i.indexOf("_") !== 0) {
                    body[i] = json[i];
                }
            }
            body.SapId = this.getOwnerComponent().SapId;
            body.UserToSalary = [{
                Ammount: parseFloat(json._Salary).toString(),
                Comments: json.Comments,
                Waers: "EUR"
            }];
            this.getView().setBusy(true);
            this.getView().getModel("odataModel").create("/Users", body, {
                success: function (data) {
                    this.getView().setBusy(false);

                    this.newUser = data.EmployeeId;
                    sap.m.MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("empleadoNuevo") + ": " + this.newUser, {
                        onClose: function () {

                            var wizardNavContainer = this.byId("wizardNavContainer");
                            wizardNavContainer.back();

                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                            oRouter.navTo("menu", {}, true);
                        }.bind(this)
                    });

                    this.onStartUpload();
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                }.bind(this)
            });
        }

        function onChange(oEvent) {
            var oUploadCollection = oEvent.getSource();

            var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("odataModel").getSecurityToken()
            });
            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        }

        function onBeforeUploadStart(oEvent) {
            var oCustomerHeaderSlug = new UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this.newUser + ";" + oEvent.getParameter("fileName")
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        }

        function onStartUpload(ioNum) {
            var that = this;
            var oUploadCollection = that.byId("UploadCollection");
            oUploadCollection.upload();
        }

        return Controller.extend("logaligroup.HTML5Project.controller.CreateEmployee", {
            onCancel: onCancel,
            onBeforeRendering: onBeforeRendering,
            toNavPass2: toNavPass2,
            checkDNI: checkDNI,
            checkDataEmployee: checkDataEmployee,
            wizardCompletedHandler: wizardCompletedHandler,
            editStepOne: editStepOne,
            editStepTwo: editStepTwo,
            editStepThree: editStepThree,
            onSaveEmployee: onSaveEmployee,
            onChange: onChange,
            onBeforeUploadStart: onBeforeUploadStart,
            onStartUpload: onStartUpload


        });
    });