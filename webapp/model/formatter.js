sap.ui.define([], function() {
  "use strict";

  return {
    calculatePriceQuantity: function (price, quantity) {
          if (price && quantity) {
              return price * quantity + " EUR";
      }
          return "0 EUR";    
    },
  };
});