pygmy3_0.showNameOnDeploymentHistory = (function() {
    var isLoaded = false

    function overrideEventListingTemplate() {
        console.debug("Loading BlueFin feature 'show name on deployment history'.");

        console.debug(" - creating new angular filter 'userNameToDisplayNameFormatter'")
        var script = document.createElement('script');
        script.id = 'bluefin-shownameondeploymenthistory-userNameToDisplayNameFormatter'
        script.type = 'text/javascript';
        script.text = 'window.showNameOnDeploymentHistoryUserCache = {}; angular.module("templates-obj/templates-app.js").filter("userNameToDisplayNameFormatter", function() { return function(email) { var result = email; if (window.showNameOnDeploymentHistoryUserCache[email]) { return window.showNameOnDeploymentHistoryUserCache[email]; } console.debug("showNameOnDeploymentHistory: looking up display name for " + email); octopusRoot = window.location.href.substring(0,window.location.href.indexOf("/app"));$.ajax({url: octopusRoot + "/api/users", success: function(users) { for(i = 0; i < users.Items.length; i++) { if (users.Items[i].EmailAddress == email || users.Items[i].Username == email) { result = (users.Items[i].DisplayName); window.showNameOnDeploymentHistoryUserCache[email] = users.Items[i].DisplayName;} } }, async: false}); return result;} });';
        document.body.appendChild( script );

        console.debug(" - creating new definition of event-listing template")
        script = document.createElement( 'script' );
        script.type = 'text/ng-template';
        script.id = 'areas/shared/views/event-listing.html';
        script.text = '<div>\n  <p class="tutorial pad-text" ng-show="!events.Items.length">\n    No events were found.\n  </p>\n\n  <div class="narrow-left margin-top-bottom-20" ng-show="events.Items.length">\n\n    <table class="table table-striped table-bordered">\n      <thead>\n      <tr>\n        <th>When</th>\n        <th>Who</th>\n        <th>What</th>\n      </tr>\n      </thead>\n      <tbody>\n      <tr ng-repeat="e in events.Items">\n        <td><span title="{{ e.Occurred | moment }}">{{ e.Occurred | momentAgo }}</span></td>\n        <td title="{{ e.Username }}">{{ e.Username | userNameToDisplayNameFormatter }}</td>\n        <td ng-bind-html-unsafe="formatMessageHtml(e)"></td>\n      </tr>\n      </tbody>\n    </table>\n\n    <octo-paginator collection=\'events\'></octo-paginator>\n  </div>\n\n</div>\n';
        document.body.appendChild( script );
    }

    function observe(content) {
        if (!isLoaded) {
            isLoaded = true;
            overrideEventListingTemplate();
        }
        return;
    }

    return {
        observe: observe
    };
})();