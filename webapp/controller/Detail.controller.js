sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/demo/fiori2/model/formatter",
  ],
  function (Controller, JSONModel, MessageToast, formatter) {
    "use strict";

    return Controller.extend("sap.ui.demo.fiori2.controller.Detail", {
      formatter: formatter,

      onInit: function () {
        this.oOwnerComponent = this.getOwnerComponent();
        this.oRouter = this.oOwnerComponent.getRouter();
        this.oModel = this.oOwnerComponent.getModel("items");
        this.oItemModel = this.oOwnerComponent.getModel("component");

        this.oRouter
          .getRoute("master")
          .attachPatternMatched(this._onProductMatched, this);
        this.oRouter
          .getRoute("detail")
          .attachPatternMatched(this._onProductMatched, this);
        this.oRouter
          .getRoute("detailDetail")
          .attachPatternMatched(this._onProductMatched, this);

        const oViewModel = new JSONModel({
          sDocumentNumber: "",
          sDocumentDate: "",
          sMaterialText: "",
          sMaterialDescription: "",
          sGroupText: "",
          sGroupDescription: "",
        });
        this.getView().setModel(oViewModel, "detailView");
        
        const oCurrencyModel = new JSONModel();
        this.getView().setModel(oCurrencyModel, "currencyData");
      },

      _onProductMatched: function (oEvent) {
        this._item =
          oEvent.getParameter("arguments").product || this._item || "0";
        this._getDetailData(this._item, "HeaderID");
        this._getDetailData(this._item, "MaterialID");
        this._getDetailData(this._item, "GroupID");
        this.getView().bindElement({
          path: "/" + this._item,
          model: "items",
        });
      },

      _getDetailData: function (itemID, typeEssence) {
        this.oModel.read(`/${itemID}/${typeEssence}`, {
          success: (oData) => {
            const sData = Object.values(oData)[0];
            switch (typeEssence) {
              case "HeaderID":
                const sHeaderPath = this.oModel.createKey(
                  "zjblessons_base_Headers",
                  {
                    HeaderID: sData,
                  }
                );
                this._setPropertyDataDetail(sHeaderPath, "DocumentNumber");
                this._setPropertyDataDetail(sHeaderPath, "DocumentDate");
                break;
              case "MaterialID":
                const sMaterialPath = this.oModel.createKey(
                  "zjblessons_base_Materials",
                  {
                    MaterialID: sData,
                  }
                );
                this._setPropertyDataDetail(sMaterialPath, "MaterialText");
                this._setPropertyDataDetail(
                  sMaterialPath,
                  "MaterialDescription"
                );
                break;
              case "GroupID":
                const sGroupPath = this.oModel.createKey(
                  "zjblessons_base_Groups",
                  {
                    GroupID: sData,
                  }
                );
                this._setPropertyDataDetail(sGroupPath, "GroupText");
                this._setPropertyDataDetail(sGroupPath, "GroupDescription");
                break;
            }
          },
        });
      },

      _getDetailDataObject: function (sObjectPath) {
        return new Promise((resolve, reject) => {
          this.oModel.read(sObjectPath, {
            success: (oData) => {
              const sData = Object.values(oData)[0];
              resolve(sData);
            },
            error: (oError) => {
              reject(oError);
            },
          });
        });
      },

      _setPropertyDataDetail(sObjectPath, sDataField) {
        const sPathDataField = `/${sObjectPath}/${sDataField}`;
        this._getDetailDataObject(sPathDataField)
          .then((oData) => {
            this.getView()
              .getModel("detailView")
              .setProperty(`/s${sDataField}`, oData);
          })
          .catch((error) => {
            console.error(
              `Ошибка при получении данных ${sDataField}, попробуй другой item:`,
              error
            );
            this.getView()
              .getModel("detailView")
              .setProperty(`/s${sDataField}`, "");
          });
      },

      onAmountBYNButtonPress: function () {
        const objectNumber = this.getView().byId("AmountID");
        const euroAmount = objectNumber.getNumber().slice(0, -4);
        this._convertCurrency(euroAmount);
      },

      _convertCurrency: function (euroAmount) {
        const oModel = this.getView().getModel("currencyData");
        const sUrl = "https://www.nbrb.by/api/exrates/rates/EUR?parammode=2";
        oModel.loadData(sUrl);   
        oModel.attachRequestCompleted(function (oEvent) {
          const data = oModel.getData();
          if (data && data.Cur_OfficialRate) {
            var rate = data.Cur_OfficialRate;
            var bynAmount = euroAmount * rate;
            MessageToast.show(
              "Стоимость всех товаров в белорусских рублях: " +
                bynAmount.toFixed(2),
              { at: "center center" }
            );
          } else {
            MessageToast.show("Ошибка получения курса.");
          }
        });
        oModel.attachRequestFailed(function () {
          MessageToast.show("Ошибка при обращении к API НБРБ.");
        });
      },

      handleFullScreen: function () {
        var sNextLayout = this.oItemModel.getProperty(
          "/actionButtonsInfo/midColumn/fullScreen"
        );
        this.oRouter.navTo("detail", {
          layout: sNextLayout,
          product: this._item,
        });
      },

      handleExitFullScreen: function () {
        var sNextLayout = this.oItemModel.getProperty(
          "/actionButtonsInfo/midColumn/exitFullScreen"
        );
        this.oRouter.navTo("detail", {
          layout: sNextLayout,
          product: this._item,
        });
      },

      handleClose: function () {
        var sNextLayout = this.oItemModel.getProperty(
          "/actionButtonsInfo/midColumn/closeColumn"
        );
        this.oRouter.navTo("master", { layout: sNextLayout });
      },

      onExit: function () {
        this.oRouter
          .getRoute("master")
          .detachPatternMatched(this._onProductMatched, this);
        this.oRouter
          .getRoute("detail")
          .detachPatternMatched(this._onProductMatched, this);
      },
    });
  }
);
