var markerList = []; //global variables 
var routes;
var map;
var routePath;
var storedName;

window.onload=function(){ //this function is executed after DOM has fully loaded

    //buttons onclick
    document.getElementById("busButton").onclick = showBuses; //show current location of all buses operating on the bus line selected
    document.getElementById("refreshButton").onclick = refreshBuses; //when clicking the search button, we used the API and parse the data. 
    document.getElementById("routeButton").onclick = showRoutes; //when clicking the search button, we used the API and parse the data. 

    document.getElementById('lineList').onchange = function() { //if you change the route line, "Hide buses" button becomes "Show buses"
        document.getElementById("busButton").value = "Show buses";
    }

    getRequest("https://data.foli.fi/gtfs/v0/20171130-162538/routes", fetchRouteList); //we need to fetch the route names to the drop-down list
}

// A SIMPLE GET REQUEST FUNCTION
function getRequest(url, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function(){ //called when the server responds with data
        if(this.readyState == 4 && this.status == 200){
            var fetchData = JSON.parse(xmlHttp.responseText);
            callback(fetchData); //pass the list to callback function, in this case the fetchRoutes function.
        }
    }
    xmlHttp.open("GET", url, true); //true for asynchronous
    xmlHttp.send();
}

//A SIMPLE COMPARATOR 
function compare(item1,item2) { 
        if (String(item1[1]) < String(item2[1])){ //lexicographic compare
            return -1;
        }
        else if (String(item1[1]) > String(item2[1])){
            return 1;
        }
        return 0;
}

//GOOGLE MAPS FUNCTIONS

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 60.45, lng: 22.35}, //initially around turku 
        zoom: 10
        });
}
function addMarker(location) {
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });
    markerList.push(marker); //add to list of markers
    var bounds = new google.maps.LatLngBounds();
    for (i = 0; i < markerList.length; i++) {
        bounds.extend(markerList[i].getPosition());
    }
    map.fitBounds(bounds); //fit bounds according to markers
}
function deleteMarkers(){
    setMapOnAll(null);
    markerList = [];
}
function hideMarkers(){
    for (i=0;i<markerList.length;i++){ //loop through list of markers
        markerList[i].setVisible(false); //hides markers
    }
}
function setMapOnAll(map) {
    for (var i = 0; i < markerList.length; i++) {
      markerList[i].setMap(map);
    }
}

//THREE BUTTONS FUNCTIONS
function showBuses(){ //event fired when user clicks on Show buses / Hide buses
    var button = document.getElementById("busButton");
    if (button.value == "Show buses"){
        getRequest("http://data.foli.fi/siri/vm", showLocations); //fallback to showLocations
        button.value = "Hide buses";
    }
    else if (button.value == "Hide buses"){
        hideMarkers();
        button.value = "Show buses";
    }
}
function refreshBuses(){ //just run the showLocations
    getRequest("http://data.foli.fi/siri/vm", showLocations); //fallback to showLocations
}
function showRoutes(){
    var routeList = document.getElementById("lineList");
    var routeId = routeList.options[routeList.selectedIndex].value; //we use ID because that is what FÖLI uses
    acquireTrips(routeId); 
}


//CALLBACK FUNCTIONS

//FETCH ROUTE LIST TO DROPDOWN MENU
function fetchRouteList(routeList){
    var routeChoices = [];
    for(i=0; i<routeList.length; i++){
        var routeIdAndName = [routeList[i].route_id, routeList[i].route_short_name]; //json ID of bus number and the actual bus number. 
        routeChoices.push(routeIdAndName);
    }
    routeChoices.sort(compare); //sort with compare function on the actual bus number

    for(i=0; i<routeChoices.length; i++){ //add the routes to the dropdown menu
        var routeId = routeChoices[i][0];
        var routeName = routeChoices[i][1];
        $("#lineList").append($("<option></option>").attr("value", routeId).text(routeName)); //add element to dropdown list
    }
}

//SHOW BUSES BUTTON AND REFRESH BUTTON CALLBACK FUNCTION

function showLocations(data){ //fetch the locations by filtering the bus line from the JSON which we got from showBuses and then add markers on map
    var routeList = document.getElementById("lineList");

    deleteMarkers(); //delete old markers
    if (routePath != undefined && routeList.options[routeList.selectedIndex].text != storedName){ //if there is an old path for another route line..
        routePath.setMap(null); //..we delete the old path
    }

    var routeList = document.getElementById("lineList");
    var routeName = routeList.options[routeList.selectedIndex].text; //get the name from the dropdown menu
    var busPositions = [];

    storedName = routeName;

    busList = data.result.vehicles;

    var empty = true; //variable to check if there are any buses on move

    for (var bus in busList){ // loop through the elements in the JSON
        if (routeName == busList[bus].publishedlinename){ //if the linenames match, we create a marker

            var latitude = busList[bus].latitude;
            var longitude = busList[bus].longitude;
            var location = {lat: latitude, lng: longitude};
            addMarker(location); //add marker
            empty = false; //we have found buses on the map
        }
    }
    if (empty){ //if we havent found buses, we alert with message
        alert("No buses found");
        var button = document.getElementById("busButton");
        button.value = "Show buses";
    }
}

//SHOW ROUTES BUTTON CALLBACK FUNCTIONS

function acquireTrips(routeId){ //acquire trips for this route id
    getRequest("http://data.foli.fi/gtfs/v0/20171130-162538/trips/route/" + routeId, acquireShape); //fallback to acquire shape
}
function acquireShape(trips){ //choose random shape_id and use it for acquiring coordinates from shapes.txt
    getRequest("http://data.foli.fi/gtfs/v0/20171130-162538/shapes/" + trips[1].shape_id, drawRoute); 
}
function drawRoute(coordinates){ //draw route based on fetched coordinates

    var locations = [];
    var bounds = new google.maps.LatLngBounds();

    if (routePath != undefined){ //if there is and old path
        routePath.setMap(null); //delete old path
    }

    for (i=0; i<coordinates.length; i++){ //push coordinates to locations list
        locations.push({lat: coordinates[i].lat, 
                        lng: coordinates[i].lon});
        var latlng = new google.maps.LatLng(coordinates[i].lat,coordinates[i].lon);
        bounds.extend(latlng);
    }

    routePath = new google.maps.Polyline({ //create a polyline
        path: locations,
        strokeColor: '#FE7569',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
    routePath.setMap(map);
    map.fitBounds(bounds); //fit map according to the bounds

}
