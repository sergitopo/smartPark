		$(document).ready(function () {
			
			var appname = navigator.userAgent.toLowerCase();
			var now=getnow();
			var origin = null;
			var delay = "00";
		    if(appname.search("mobile")==-1){
		    now=now.replace(/-/g,"/");
		    now=now.replace("T"," ");
			$("#datePickerStart").val(now);
		    }
		    else{
		    $("#datePickerStart").val(now);
		    } 
			//var start = getnow();
			query = "http://localhost:9999/services/hello";
			
			// set current date and time as default value in the datepicker
			    mapHandler.init("map");
				ajaxRequest(query);
				//mapHandler.localize();
		});
		
		

		


var mapHandler = {

    map : null,
    markers : [],
	searchControlDiv : null,
	searchControl : null,
	center : null,
	zoom : null,
    
    options : {
        interval : 10000,
        element : null,
        mapOptions :  {
            center: new google.maps.LatLng(38.822432, -0.605686),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
			panControl: false,
		    zoomControl: true,
   		    zoomControlOptions: {
              style: google.maps.ZoomControlStyle.LARGE,
              position: google.maps.ControlPosition.RIGHT_CENTER
    		},
        },
    },
    
    init : function(element) {
        var self = this;
        self.element = element;
        this.map = new google.maps.Map(document.getElementById(self.element), self.options.mapOptions);
		geocoder = new google.maps.Geocoder();
		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsService = new google.maps.DirectionsService();
		directionsDisplay.setMap(this.map);
		this.searchControlDiv = document.createElement('div');
    	SearchControl(this.searchControlDiv, this.map);
		this.searchControlDiv.index = 1;
   		this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.searchControlDiv);
		
		if (mapHandler.zoom != null) {
			this.map.setCenter(self.center);
			this.map.setZoom(self.zoom);
		}
		
        google.maps.event.addListener(this.map, 'bounds_changed', function() {
            self.refreshSpots();
        });
        setInterval(function() { self.refreshSpots(); }, self.options.interval);    
		
		function SearchControl(controlDiv, map) {
			// Set CSS styles for the DIV containing the control
			// Setting padding to 5 px will offset the control
			// from the edge of the map.
			controlDiv.style.padding = '5px';
		
			// Set CSS for the control border.
			var controlUI = document.createElement('div');
			controlUI.style.backgroundColor = 'white';
			controlUI.style.borderStyle = 'solid';
			controlUI.style.borderWidth = '2px';
			controlUI.style.cursor = 'pointer';
			controlUI.style.textAlign = 'center';
			controlUI.title = 'Introdueix adreça';
			controlDiv.appendChild(controlUI);
		
			// Create the search box
			var controlSearchBox = document.createElement('input')
			controlSearchBox.id = 'search_address';
			document.getElementById("map").onkeydown = capturartecla;
			
			function capturartecla (event) {
				 if (event.keyCode==13) {self.codeAddress(controlSearchBox.value);}	
				 }
			
			controlSearchBox.size = '50';
			controlSearchBox.type = 'text';   
			   
			    // Set CSS for the control interior.
			var controlText = document.createElement('div');
			controlText.style.fontFamily = 'Arial,sans-serif';
			controlText.style.fontSize = '12px';
			controlText.style.paddingLeft = '4px';
			controlText.style.paddingRight = '4px';
			controlText.appendChild(controlSearchBox);
			controlUI.appendChild(controlText);
		} 
    },
	
	localize : function() {
		var self = this;
		 if (navigator.geolocation) {
			position = navigator.geolocation.getCurrentPosition(self.showLocation);
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	},
			    
	showLocation : function (position){
		var self = this;
		var demo = document.getElementById("search_address");
		demo.value = "" + position.coords.latitude +"," + position.coords.longitude;
		origin = new google.maps.LatLng(position.coords.latitude +"," + position.coords.longitude);
		mapHandler.codeAddress(demo.value);
		
	},
		   
		
    refreshSpots : function() {
        var self = this;
        $.getJSON('http://localhost:9999/services/hello', {
           zone: this.getZone(),
           zoom: this.map.getZoom(),
        }, function(data) {
            self.cleanMarkers();
            $.each(data['spots'], function(key, value) {
                self.addSpotMarker(value);
            });
            $.each(data['clusters'], function(key, value) {
                self.addClusterMarker(value);
            });            
        });
    },

    addSpotMarker : function(spot) {

        if (spot.occupied == 1) {
            spot.status = 'occupied';
        } else {
            spot.status = 'free';
        }
        
        var infowindow = new google.maps.InfoWindow({
            //content: "<p><i class=\"icon-info-sign\"></i> " + spot.status + " from " + spot.last_change  + "</p>"
            content: "<p><i class=\"icon-info-sign\"></i> " + spot.idsensor + "</p>"
        });
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(spot.latitude, spot.longitude),
            map: this.map,
            icon: '/img/marker_' + spot.status + '.png'
        });
        this.markers.push(marker);
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(this.map, marker);
        });
    },

    addClusterMarker : function(cluster) {
        var title;
        var places;
        switch (cluster.type) {
            case 'looppark':
            case 'smartpark':
                places= 'Places lliures ' + cluster.free + ' de ' + cluster.count;
                break;
            case 'staticpark':
            default:
                places = cluster.count + ' places';
        }

        var infowindow = new google.maps.InfoWindow({
            content: "<p><strong>" + cluster.name + "</strong></p><p>" + places + "</p>"
        });

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(cluster.latitude, cluster.longitude),
            map: this.map,
            icon: this.getClusterIcon(cluster.count, cluster.free, cluster.type),
            title: cluster.name + ' :: ' + places,
        });
        this.markers.push(marker);
        var self = this;
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(this.map, marker);
        });        
    },    

    cleanMarkers : function() {
        for (var i = 0; i < this.markers.length; i++ ) {
            this.markers[i].setMap(null);
        }
        this.markers = new Array();
    },

    getClusterIcon: function(count, free, type) {
        switch (type) {
            case 'looppark':
            case 'smartpark':
                return 'css/images/marker_cluster_green.png';
                break;
            case 'staticpark':
            default:
                return 'css/images/marker_cluster_blue.png';
                break;
        }
    },
    

    getZone: function() {
        var bounds = this.map.getBounds();
        var boundsNE =  bounds.getNorthEast();
        var boundsSW =  bounds.getSouthWest();
        var zone = {
            "topright":{
                "lat":boundsNE.lat(),
                "lon":boundsNE.lng()
            },
            "bottomleft":{
                "lat":boundsSW.lat(),
                "lon":boundsSW.lng()
            }
        };
        return zone;
    },
	
	codeAddress: function(value) { 
	
		geocoder.geocode( { 'address': value /**'bounds': getbounds()**/ }, 
			function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					var self = this;
					origin = results[0].geometry.location;
					mapHandler.center = results[0].geometry.location;
					mapHandler.zoom = 17;
					mapHandler.init("map");
					mapHandler.zoom = 15;
					mapHandler.center = new google.maps.LatLng(38.822432, -0.605686);
					//var marker = new google.maps.Marker({ map: this.map, position: results[0].geometry.location})
					//marker.setMap(this.map)}else{ 
					}else{
						alert("Geocode was not successful for the following reason: " + status)
					} 
				})
	},
	
	calcRoute : function (lat, long) {
		if (origin == null) { 
			alert ("punxa ubicació o introdueix una adreça")
		}
	    var destination =new google.maps.LatLng(lat, long);
	    var request = {
			origin:origin,
			destination:destination,
			travelMode: google.maps.TravelMode.DRIVING
	  	};
	    directionsService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				alert( "Distància: " + result.routes[0].legs[0].distance.value+ " metres");
				directionsDisplay.setDirections(result);
				delay = result.routes[0].legs[0].duration.value
			}else{ alert("error en la ruta")}
		 });
		 return delay;
	},
	
	moveTo : function (position)  {
		mapHandler.center = position;
		mapHandler.zoom = 17;
		mapHandler.init("map");
		mapHandler.zoom = 15;
		mapHandler.center = new google.maps.LatLng(38.822432, -0.605686)
	}
};
