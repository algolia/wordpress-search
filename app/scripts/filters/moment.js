"strict";

var fromNow = function(moment) {
  return function(date) {
    return moment(date, "YYYY-MM-DD h:m Z").fromNow();
  };
};

module.exports = {
  fromNow: fromNow
};
