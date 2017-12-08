window.onload=function(){ //this function is executed after DOM has loaded
    document.getElementById("searchbutton").onclick = fetchInformation; //when clicking the search button, we used the API and parse the data. 
    loadInformation(); //load localstorage
}

function loadInformation(){
    //we now load the localstorage JSON
    var historicaldata = JSON.parse(localStorage.getItem("datalist") || "[]"); //request the old list, historicaldata is an empty list if localstorage is empty.
    if (historicaldata === "[]"){
        return;
    }
    var count = Object.keys(historicaldata).length; //amount of locations in history
    
    var tbl = document.getElementById("myTable");
    var div = document.getElementById("searchhistory");
    
    tbl.style.display = "table"; //display the hidden table
    div.style.display = "block"; //display the hidden div with search history

    for(i = 0; i < count; i++){ //loop through the list of data
                var row = tbl.insertRow(1); //add a new row
                var placecell = row.insertCell(0);
                var longitudecell = row.insertCell(1);
                var latitudecell = row.insertCell(2);
                placecell.innerHTML = historicaldata[i][0];
                longitudecell.innerHTML = historicaldata[i][1];
                latitudecell.innerHTML = historicaldata[i][2];
                
                var paragraphtext = document.createTextNode(historicaldata[i][3] + " - " + historicaldata[i][4]);
                var paragraph = document.createElement('p');
                paragraph.appendChild(paragraphtext);
                paragraph.style.padding = "10px";
                paragraph.style.fontSize = "16px";
                
                div.insertBefore(paragraph, div.children[1]);
                var height= div.offsetHeight; //set the div to resize after every new location
                var newHeight = height + 50;
                div.style.height = newHeight + 'px';
   } 
    
    //GOOGLE MAPS
    var map = new google.maps.Map(
            document.getElementById('map'), {
            zoom: 9, 
            center: new google.maps.LatLng(historicaldata[0][2], historicaldata[0][1]),}); 
            
    var marker; 
    for(i = 0; i < count; i++){ //loop to put all markers on map
            marker = new google.maps.Marker({
            position: new google.maps.LatLng(historicaldata[i][2], historicaldata[i][1]),
            map: map
            });
            marker.setMap(map);
    }
    map.setCenter(new google.maps.LatLng(historicaldata[count-1][2], historicaldata[count-1][1])); //center the newest location
}
function fetchInformation(){
    countrylist = document.getElementById("countrylist"); 
    zipcode = document.getElementById("zipcodeinput").value.trim(); //trim spaces away
    country = countrylist.options[countrylist.selectedIndex].value;
    url = "http://api.zippopotam.us/" + country + "/" + zipcode;
    
    //some of the code is from the zippopotamus frontpage JSON example
    var client = new XMLHttpRequest();
    var data;
    client.open("GET", url, true);
    client.onreadystatechange = function() {
        if(client.readyState == 4) {
        data = JSON.parse(client.responseText);
        
        var datalist = [];
        var placename = data.places[0]["place name"]; //for the table containing placename, longitude and latitude
        var longitude = data.places[0].longitude; 
        var latitude = data.places[0].latitude; 
        var country = data.country;
        var zipcode = data["post code"];
        
        datalist.push(placename);
        datalist.push(longitude);
        datalist.push(latitude);
        datalist.push(country);
        datalist.push(zipcode);
        
        var historicaldata = JSON.parse(localStorage.getItem("datalist") || "[]"); //request the old list, historicaldata is an empty list if localstorage is empty.
        
        var oldCount = Object.keys(historicaldata).length; //amount of locations in history
        localStorage.setItem('datalist', JSON.stringify(datalist)); //save to localstorage the new item
        if (oldCount > 9){ //we have reached the limit, we store only 10 searches maximum
            historicaldata[9] = datalist;
            localStorage.setItem('datalist', JSON.stringify(historicaldata)); //save the list
            count = Object.keys(historicaldata).length;
        }
        else{
            historicaldata.push(datalist); //add the new item to the old list
            localStorage.setItem('datalist', JSON.stringify(historicaldata)); //save the list
            count = Object.keys(historicaldata).length;
        }
        
        document.getElementById("myTable").style.display = "table"; //display the hidden table
        document.getElementById("searchhistory").style.display = "block"; //display the hidden div with search history
        
        var tbl = document.getElementById("myTable");
        var div = document.getElementById("searchhistory");
        
        if (oldCount == 10){ //we do not add more rows and paragraphs in this case
        
            tbl.rows[1].cells[0].innerHTML = placename;
            tbl.rows[1].cells[1].innerHTML = longitude;
            tbl.rows[1].cells[2].innerHTML = latitude;
            
            //add paragraph
            var paragraphtext = document.createTextNode(country + " - " + zipcode);
            var paragraph = document.createElement('p');
            paragraph.appendChild(paragraphtext)
            div.insertBefore(paragraph, div.children[1]);
            paragraph.style.padding = "10px";
            paragraph.style.fontSize = "16px";
            
            //remove the old tenth location paragraph with a line of jQuery: 
            $('#searchhistory').children().last().remove();
        }
        else{ //in case the history is not full we add a new row and paragraph
            var row = tbl.insertRow(1); //add a new row
            var placecell = row.insertCell(0);
            var longitudecell = row.insertCell(1);
            var latitudecell = row.insertCell(2); 
            placecell.innerHTML = placename;
            longitudecell.innerHTML = longitude;
            latitudecell.innerHTML = latitude;
                
            var paragraphtext = document.createTextNode(country + " - " + zipcode);
            var paragraph = document.createElement('p');
            paragraph.appendChild(paragraphtext);
            paragraph.style.padding = "10px";
            paragraph.style.fontSize = "16px";
                    
            div.insertBefore(paragraph, div.children[1]);
            var height= div.offsetHeight; //set the div to resize after every new location
            var newHeight = height + 50;
            div.style.height = newHeight + 'px';     
        } 
        
        //GOOGLE MAPS 
        var map = new google.maps.Map(
            document.getElementById('map'), {
            zoom: 9, 
            center: new google.maps.LatLng(latitude, longitude),}); 
            
        var marker;
        for(i = 0; i < count; i++){ //loop to put all markers on map
            marker = new google.maps.Marker({
            position: new google.maps.LatLng(historicaldata[i][2], historicaldata[i][1]),
            map: map
            });
            marker.setMap(map);
        }
        map.setCenter(new google.maps.LatLng(latitude, longitude)); //center the newest location
    };
        
        
	};
    client.send();
    alert("FETCH");
}
