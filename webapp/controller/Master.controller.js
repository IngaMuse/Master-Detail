sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
  ],
  function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    Fragment
  ) {
    "use strict";

    return Controller.extend("sap.ui.demo.fiori2.controller.Master", {
      onInit: function () {
        this.oView = this.getView();
        this._bDescendingSort = false;
        this.oItemsTable = this.oView.byId("itemsTable");
        this.oModel = this.getOwnerComponent().getModel();
        this.oRouter = this.getOwnerComponent().getRouter();

        const oViewModel = new JSONModel({
          sCount: "0",
        });
        this.getView().setModel(oViewModel, "masterView");
        sap.ui.getCore().getEventBus().subscribe("Master", "Refresh", this._loadData, this);
      },

      onBeforeRendering: function () {
        this._getTableCounter();
      },

      _getTableCounter() {
        this.oModel.read("/zjblessons_base_Items/$count", {
          success: (sCount) => {
            this.getView()
              .getModel("masterView")
              .setProperty("/sCount", sCount);
          },
        });
      },

      onSearch: function (oEvent) {
        var oTableSearchState = [],
          sQuery = oEvent.getParameter("query");

        if (sQuery && sQuery.length > 0) {
          oTableSearchState = [
            new Filter("ItemID", FilterOperator.Contains, sQuery),
          ];
        }

        this.oItemsTable
          .getBinding("items")
          .filter(oTableSearchState, "Application");
      },

      onAdd: function () {
        this._loadCreateDialog();
      },

      _loadCreateDialog: async function () {
        if (!this._oDialog) {
          this._oDialog = await Fragment.load({
            name: "sap.ui.demo.fiori2.view.fragment.CreateDialog",
            controller: this,
            id: this.getView().getId(),
          }).then((oDialog) => {
            this.getView().addDependent(oDialog);
            return oDialog;
          });
        }
        this._oDialog.open();
      },

      onDialogBeforeOpen(oEvent) {
        const oDialog = oEvent.getSource();
        const oParams = {
          ItemID: "0",
          IntegrationID: null
        };
        const oEntry = this.oModel.createEntry("/zjblessons_base_Items", {
          properties: oParams
        });
        oDialog.setBindingContext(oEntry);
      },

      onPressCancel() {
        this.oModel.resetChanges();
        this._oDialog.destroy();
      },

      onPressSave(oEvent) {
        this.oModel.submitChanges({
          success: () => {
            this._loadData();
          },
        });
        this._oDialog.destroy();
      },

      _loadData: function () {
        const oTable = this.byId("itemsTable");
        oTable.getBinding("items").refresh();
        oTable.getModel().read("/zjblessons_base_Items", {
          success: function (oData) {
          },
          error: function (oError) {
          },
        });
        this._getTableCounter();
      },

      onSort: function () {
        this._bDescendingSort = !this._bDescendingSort;
        var oBinding = this.oItemsTable.getBinding("items"),
          oSorter = new Sorter("ItemID", this._bDescendingSort);

        oBinding.sort(oSorter);
      },

      onListItemPress: function (oEvent) {
        var itemPath = oEvent.getSource().getBindingContext().getPath(),
          product = itemPath.split("/").slice(-1).pop(),
          oNextUIState;
        this.getOwnerComponent()
          .getHelper()
          .then(
            function (oHelper) {
              oNextUIState = oHelper.getNextUIState(1);
              this.oRouter.navTo("detail", {
                layout: oNextUIState.layout,
                product: product,
              });
            }.bind(this)
          );
      },
    });
  }
);
