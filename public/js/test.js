var ViewModel = function(first, last) {
  this.firstName = ko.observable(first);
  this.lastName = ko.observable(last);

  this.fullName = ko.computed(function() {
    return this.firstName() + " " + this.lastName();
  }, this);
}

	this.fullNameCaps = function() {
  	var currentVal = this.firstName();
    var otherVal = this.lastName();
    this.firstName(currentVal.toUpperCase());
    this.lastName(otherVal.toUpperCase());
  }

ko.applyBindings(new ViewModel("My", "Face"));