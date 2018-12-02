angular.module('AlertsApp', [])

.filter("orderedKeys", function(){
    return function(someObj){
        var keys = Object.keys(someObj);
        keys.sort();
        return keys;
    }
})

.service('AlertsService', function($http){
    return {
        get_alerts: function(query){
            return $http({
                url: "/alert-manager/api/v1/alerts/groups",
                params: {
                    c: new Date()
                },
                headers: {
                    "X-Requested-With": "XMLHttpRequest"
                }
            });
        }
    }
})

.controller("AlertsCtrl", function($scope, AlertsService, $interval){
    $scope.hosts  = [];
    $scope.alerts = {};
    $scope.last_alerts = {};

    var query = function(){
        AlertsService.get_alerts().then(function(result){
            console.log(result);
            var all_alerts = [];

            angular.forEach(result.data.data || [], function(group){
                angular.forEach(group.blocks || [], function(block){
                    angular.forEach(block.alerts || [], function(alert){
                        all_alerts.push({
                            hostname:   alert.labels.fqdn || alert.labels.instance,
                            summary:    alert.annotations.summary,
                            severity:   alert.labels.severity,
                        });
                    });
                });
            });
            console.log(all_alerts);

            // Now, group those alertés by their summaraizia.
            var alerts_by_description = {};
            angular.forEach(all_alerts, function(alert){
                if( !(alert.summary in alerts_by_description)){
                    alerts_by_description[alert.summary] = [];
                }
                alerts_by_description[alert.summary].push(alert);
            });

            $scope.prev_resp_alerts = $scope.resp_alerts;
            $scope.resp_alerts = alerts_by_description;
            console.log(alerts_by_description);

            $scope.alerts    = {};
            $scope.hosts     = {};
            angular.forEach($scope.resp_alerts, function(alerts, summary){
                $scope.alerts[summary] = {};
                alerts.forEach(function(alert){
                    $scope.alerts[summary][alert.hostname] = alert;
                    $scope.hosts[alert.hostname] = alert.host;
                });
            });
            angular.forEach($scope.prev_resp_alerts, function(alerts, summary){
                // Check if alerts from last_alerts are still there, and if not,
                // add a {"severity": "normal"} dummy alert to indicate they were fixed
                if( typeof $scope.alerts[summary] == "undefined" ){
                    $scope.alerts[summary] = {};
                }
                angular.forEach(alerts, function(alert, hostname){
                    if( typeof $scope.alerts[summary][alert.hostname] == "undefined" ){
                        // Alert is gone! Fixed! Woohoo!
                        alert.severity = "normal";
                        $scope.alerts[summary][alert.hostname] = alert;
                        if( typeof $scope.hosts[alert.hostname] == "undefined" ){
                            $scope.hosts[alert.hostname] = alert.host;
                        }
                    }
                });
            });
            $scope.noAlerts = angular.equals($scope.alerts, {});
        });
    };

    $interval(query, 60000);
    query();
});
