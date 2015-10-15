describe("show-name-on-deployment-history", function() {
	var filterFunc = '';
	var filterName = '';

	var successFunc = function(){};
	var url = '';
	var async;

	beforeEach(function() {
			//setup fake for angular
		angular = (function() {
			return { 
				module: function() {
					return {
						filter : function (name, func) {
							filterFunc = func(); //dereference the function
							filterName = name;
						}
					}
				} 
			}
		})();
		//setup fake for jquery
		$ = (function() {
			return {
				ajax: function(options) {
					successFunc = options.success;
					url = options.url;
					async = options.async;
				}
			}
		})();

		pygmy3_0.showNameOnDeploymentHistory.observe();
	});

	//todo: should we use https://github.com/ferronrsmith/angularjs-jasmine-matchers here?
	it("creates a new event-listing template", function() {
		expect(document.getElementById('areas/shared/views/event-listing.html')).not.toBeNull();
	});

	it("passes the username through the new mapping filter", function() {
		var scriptElement = document.getElementById('areas/shared/views/event-listing.html');
		expect(scriptElement.text).toContain("e.Username | userNameToDisplayNameFormatter");
	});

	it("creates a new angular filter", function() {
		expect(document.getElementById('bluefin-shownameondeploymenthistory-userNameToDisplayNameFormatter')).not.toBeNull();
	});

	it("calls the new filter 'userNameToDisplayNameFormatter'", function() {
		expect(filterName).toBe('userNameToDisplayNameFormatter');
	});

	it("the filter calls the users api", function() {
		filterFunc("fakeEmail");
		expect(url).toBe("/api/users");
		expect(async).toBe(false);
		expect(successFunc).not.toBeNull();
	});

	it("calls the ajax function only once for a given email address", function() {
		var calls = 0;
		spyOn($, 'ajax').and.callFake(function(options){
			calls++;
			options.success( {
				Items: [ { EmailAddress: 'fakeEmail', DisplayName: 'Fake Person'} ]
			});
		});
		filterFunc("fakeEmail");
		filterFunc("fakeEmail");
		expect(calls).toBe(1);
	});

	it("returns the passed in email address if it couldn't match the email address against a user", function() {
		spyOn($, 'ajax').and.callFake(function(options){
			options.success( {
				Items: [ { EmailAddress: 'aDifferentFakeEmail@example.com', DisplayName: 'Fake Person', Username: 'fakeusername'} ]
			});
		});
		var result = filterFunc("fakeEmail@example.com");
		expect(result).toBe('fakeEmail@example.com');
	});

	it("matches on email address", function() {
		spyOn($, 'ajax').and.callFake(function(options){
			options.success( {
				Items: [ { EmailAddress: 'fakeEmail@example.com', DisplayName: 'Fake Person', Username: 'fakeusername'} ]
			});
		});
		var result = filterFunc("fakeEmail@example.com");
		expect(result).toBe('Fake Person');
	});

	it("matches on username", function() {
		spyOn($, 'ajax').and.callFake(function(options){
			options.success( {
				Items: [ { EmailAddress: 'fakeEmail@example.com', DisplayName: 'Fake Person', Username: 'fakeusername'} ]
			});
		});
		var result = filterFunc("fakeusername");
		expect(result).toBe('Fake Person');
	});
});