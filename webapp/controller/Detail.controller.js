sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/demo/fiori2/model/formatter" 
], function (Controller, formatter) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.Detail", {
		formatter: formatter,
		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oModel = this.oOwnerComponent.getModel("items");

			this.oRouter.getRoute("master").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onProductMatched, this);
		},

	// 	formatPriceQuantity: function(price, quantity) {
	// 		return price * quantity;
	// },

		onSupplierPress: function (oEvent) {
			var supplierPath = oEvent.getSource().getBindingContext("items").getPath(),
				supplier = supplierPath.split("/").slice(-1).pop(),
				oNextUIState;

			this.oOwnerComponent.getHelper().then(function (oHelper) {
				oNextUIState = oHelper.getNextUIState(2);
				this.oRouter.navTo("detailDetail", {
					layout: oNextUIState.layout,
					supplier: supplier,
					product: this._product
				});
			}.bind(this));
		},

		_onProductMatched: function (oEvent) {
			this._product = oEvent.getParameter("arguments").product || this._product || "0";			
				this.getView().bindElement({
					path: "/" + this._product,
					model: "items"
				});	
			// const sPath = "/" + this._product;
			// this.oModel.read(sPath, {
			// 	success: function (oData) {
			// 			console.log("Данные продукта: ", oData);
			// 	},
			// 	error: function (oError) {
			// 			console.error("Ошибка при загрузке данных: ", oError);
			// 	}
			// });
		},

		onEditToggleButtonPress: function() {
			var oObjectPage = this.getView().byId("ObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();

			oObjectPage.setShowFooter(!bCurrentShowFooterState);
		},

		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this._product});
		},

		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this._product});
		},

		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {layout: sNextLayout});
		},

		onExit: function () {
			this.oRouter.getRoute("master").detachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").detachPatternMatched(this._onProductMatched, this);
		}
	});
});
