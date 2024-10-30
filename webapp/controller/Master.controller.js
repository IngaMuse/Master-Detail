sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
  ],
  function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    MessageBox,
    Fragment
  ) {
    "use strict";

    return Controller.extend("sap.ui.demo.fiori2.controller.Master", {
      onInit: function () {
        this.oView = this.getView();
        this._bDescendingSort = false;
        this.oItemsTable = this.oView.byId("itemsTable");
        this.oModel = this.getOwnerComponent().getModel("items");
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
            oDialog.setDraggable(true);
            return oDialog;
          });
        }
        this._oDialog.open();
      },

      onDialogBeforeOpen(oEvent) {
        const oDialog = oEvent.getSource();
        const oParams = {
          IntegrationID: "",
        };
        const oEntry = this.oModel.createEntry("/tItems", {
          properties: oParams,
        });
        oDialog.setBindingContext(oEntry, "items");
      },

      onPressCancel() {
        this.oModel.resetChanges();
        this._oDialog.destroy();
      },

      onPressSave(oEvent) {
        debugger;
        const oDialog = this._oDialog,
          oBindingContext = oDialog.getBindingContext("items");
        const oData = oBindingContext.getObject();
        oData.Quantity = Number(oData.Quantity);
        oData.Price = Number(oData.Price);
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
            console.log(oData);
          },
          error: function (oError) {
            console.log("Ошибка загрузки данных");
          },
        });
      },

      // onQuantityChange: function (oEvent) {
      //   const oInput = oEvent.getSource();
      //   const newValue = oInput.getValue();
      //   console.log("Новое значение Quantity:", newValue);
      //   const oDialog = this._oDialog;
      //   const oBindingContext = oDialog.getBindingContext("items");

      //   if (oBindingContext) {
      //     const path = oBindingContext.getPath();
      //     const oModel = oBindingContext.getModel();
      //     oModel.setProperty(path + "/Quantity", newValue);
      //   }

      //   const oData = oBindingContext.getObject();
      //   if (oData) {
      //     oData.Quantity = Number(newValue); // Приведите к числу
      //     console.log("Обновленный объект oData:", oData);
      //   } else {
      //     console.error("Контекст данных oData не найден");
      //   }
      // },

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
