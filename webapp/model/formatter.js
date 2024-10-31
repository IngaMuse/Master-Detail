sap.ui.define([], function () {
  "use strict";

  return {
    calculatePriceQuantity: function (price, quantity) {
      if (price && quantity) {
        return (price * quantity).toFixed(2) + " EUR";
      }
      return "0 EUR";
    },

    formatDate: function (oData) {
      const oDateFormatter = sap.ui.core.format.DateFormat.getDateInstance({
        style: 'medium'
      })
      return oDateFormatter.format(oData);
  }
  };
});