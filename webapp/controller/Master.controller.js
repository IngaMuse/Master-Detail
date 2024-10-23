sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, Sorter, MessageBox) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.Master", {
		onInit: function () {
			this.oView = this.getView();
			this._bDescendingSort = false;
			this.oItemsTable = this.oView.byId("itemsTable");
			this.oModel = this.getOwnerComponent().getModel("items");
			this.oItemModel = this.getOwnerComponent().getModel("component");
			this.oRouter = this.getOwnerComponent().getRouter();

			const oViewModel = new JSONModel({
				sCount: "0",
			});
			this.getView().setModel(oViewModel, "masterView");
		},
			

		onBeforeRendering: function () {
			this._getTableCounter();
		},

		_getTableCounter() {
			this.oModel.read("/zjblessons_base_Items/$count", {
				success: (sCount) => {
					this.getView().getModel("masterView").setProperty("/sCount", sCount);
				},
			});
		},


		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("ItemID", FilterOperator.Contains, sQuery)];
			}

			this.oItemsTable.getBinding("items").filter(oTableSearchState, "Application");
		},

		onAdd: function () {
			MessageBox.information("This functionality is not ready yet.", {title: "Aw, Snap!"});
		},

		onSort: function () {
			this._bDescendingSort = !this._bDescendingSort;
			var oBinding = this.oItemsTable.getBinding("items"),
				oSorter = new Sorter("ItemID", this._bDescendingSort);

			oBinding.sort(oSorter);
		},

		onListItemPress: function (oEvent) {
			var productPath = oEvent.getSource().getBindingContext().getPath(),
				product = productPath.split("/").slice(-1).pop(),
				oNextUIState;
			this.getOwnerComponent().getHelper().then(function (oHelper) {
				debugger;
				oNextUIState = oHelper.getNextUIState(1);
				this.oRouter.navTo("detail", {
					layout: oNextUIState.layout,
					product: product
				});
			}.bind(this));
		}
	});
});
