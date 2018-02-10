var app = angular.module('TrainApp', []);

app.controller('TrainController', function ($scope, $http, $filter) {
    $scope.stationSelect = null;
    $scope.stationList = [];
    $scope.depList = [];
    $scope.arrList = [];
    var stationData = null;
    
    //List of stations is populated 
    $http.get('asemat.json').success(function (result) {
        $scope.stationList = result;
        stationData = result;
    });
    
    //When user presses the "Hae"-button, info about trains is fetched and showed
    $scope.fetch = function () {
        //Previous search is cleared
        $scope.depList = [];
        $scope.arrList = [];

        //User selected station
        var value = $scope.stationSelect;
        
        //VR API url
        var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + value 
        + "?arrived_trains=0&arriving_trains=8&departed_trains=0&departing_trains=8&version=";
        
        //VR url is searched for train info
        $http.get(url).success(function (data) {
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].timeTableRows.length; j++) {                
                    if (data[i].timeTableRows[j].stationShortCode == value) {
                        //Info of a train is put to a new object
                        var obj = {};
 
                        //Time info                       
                        var date = new Date(data[i].timeTableRows[j].scheduledTime);
                        var min = date.getMinutes();
                        var h = date.getHours();
                        if (min < 10) {
                            min = "0" + min;
                        }
                        if (h < 10) {
                            h = "0" + h;
                        }
                        obj.time = h + ":" + min;                     

                        //Track info                      
                        var track;
                        if (data[i].timeTableRows[j].commercialTrack != "") {
                            track = parseInt(data[i].timeTableRows[j].commercialTrack, 10);
                        }
                        else {
                            track = " ";
                        }
                        obj.track = track;           
    
                        //Train number and name info
                        obj.name = data[i].trainType + " " + data[i].trainNumber;
                        
                        //Station info   
                        if (data[i].timeTableRows[j].type == "DEPARTURE") {
                            var stat = data[i].timeTableRows[data[i].timeTableRows.length - 1].stationShortCode;                         
                        }
                        else if (data[i].timeTableRows[j].type == "ARRIVAL") {
                            var stat = data[i].timeTableRows[0].stationShortCode;
                        }
                        for (var k = 0; k < stationData.length; k++) {
                            if (stat == stationData[k].Lyh) {
                                obj.station = stationData[k].Nimi;
                            }
                        }
                        
                        //Train object is pushed to a correct list of trains
                        if (data[i].timeTableRows[j].type == "DEPARTURE") {
                            $scope.depList.push(obj);                          
                        }
                        else if (data[i].timeTableRows[j].type == "ARRIVAL") {
                            $scope.arrList.push(obj); 
                        }
                        
                        //Lists are sorted by time
                        $scope.depList = $filter('orderBy')($scope.depList, 'time');          
                        $scope.arrList = $filter('orderBy')($scope.arrList, 'time');                   
                    }
                }            
            }
        });        
    }   
});