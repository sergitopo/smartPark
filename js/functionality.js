		
		//for desktop applications use another date and time picker
		var appname = navigator.userAgent.toLowerCase();
		var delay = null;
		var query = "http://localhost:9999/services/hello/";
		var global_SP = -1;
		var delay= "00";
		var parkings = [];
		
		if(appname.search("mobile")==-1){
			$('#datePickerStart').replaceWith("<input id='datePickerStart' data-theme='a' />");
			$('#datePickerStart').datetimepicker();
		}
		$('#datePickerStart').datetimepicker({
			minuteStep: 5});
			
		function ajaxRequest(query)
		{// request using jQuery
			console.log(query); //just for testing
			$.getJSON(query, function( data ) {
				parkings = data['clusters'];
			});		
			createResultList(parkings);
			return parkings;
		}


		// botons
		
		$("#search").click(function () {
			query = "http://localhost:9999/services/hello";
			ajaxRequest(query);
			mapHandler.init("map");
		});
		
		// botó ubicació
		$("#ubicacio").click(function () {
			mapHandler.localize();
			
		});
		
		// botó routing
		$("#routing").click(function () {
			$("#datePickerStart").val(getnow());
			
			switch ($("select option:selected").val()){
				case "Ceam" :
					i = 0;
					break;
				case "Plaça de les Sufragistes" :
					i = 1;
					break;
			}
					
			query = "http://localhost:9999/services/hello"
			parkings = ajaxRequest(query);
			createResultList(parkings);
			var lat = parkings[i].latitude;
			var long = parkings[i].longitude;
			delay = mapHandler.calcRoute(lat, long);
			
			
		
		});
		
		// botó pronòstic
		$("#pronostic").click(function () {
			
			$("#leftpanel2").panel("open");
			$("#query").collapsible("expand")
			$("#datePickerStart").focus();
		});

		
		 // Move button used to open the sidebar when the sidebar is opened/closed 
		$("#leftpanel2").on("panelbeforeopen", function (e) {
		    var w = $("#leftpanel2").width() + 30; //ui panel inner has padding of 15px
		    w = "+=" + w + "px";
		    $("#open_sb").animate({
		        "left": w
		    }, 250);
		});

		$("#leftpanel2").on("panelbeforeclose", function (e) {
		    var w = $("#leftpanel2").width() + 30;
		    w = "-=" + w + "px";
		    $("#open_sb").animate({
		        "left": w
		    }, 220);
		});


		 // No Scrollbar
		$('html, body').css({
		    'overflow': 'hidden',
		    'height': '100%'
		})

		 // gets current date and time
		function getDelay() {
			return delay
		}
			
		function getnow() {
		    var now = new Date();
		    var tnow = "";
		    var month = "";
		    var day = "";
		    var hours = "";
		    var minutes = "";
		    if ((parseInt(now.getMonth()) + 1) < 10) month = "0" + parseInt(now.getMonth() + 1);
		    else month = parseInt(now.getMonth() + 1);
		    if ((parseInt(now.getDate()) < 10)) day = "0" + parseInt(now.getDate());
		    else day = parseInt(now.getDate());
		    if ((parseInt(now.getHours()) < 10)) hours = "0" + parseInt(now.getHours());
		    else hours = parseInt(now.getHours());
		    if ((parseInt(now.getMinutes())) < 10) minutes = "0" + parseInt(now.getMinutes());
		    else minutes = parseInt(now.getMinutes());
		    tnow = now.getFullYear() + "-" + month + "-" + day + "T" + hours + ":" + minutes;
		    return tnow;
		}



		function createResultList(parkings){ 
			
			$("#query").collapsible("option", "collapsed", true);
			document.getElementById("result_text").style.display = "block";
			deleteResults();
			
			for (var i = 0; i < parkings.length; i++){
				
				var content = '<div data-role="collapsible" id="parking_'+parkings[i].spot_id+'" onclick= " global_SP = i ">' +
					'<h3>'+parkings[i].name+'</h3></br>' +
					'<p class = "entry"><b>Total:</b> '+parkings[i].count+'</p>' +					
					'<p class = "entry"><b>Lliures:</b> '+parkings[i].free+'</p>' +
   				    '<button onclick="moveTo('+parkings[i].latitude+','+parkings[i].longitude+');">Vore</button></div>';

				$("#result").append(content).collapsibleset("refresh");
				
			}
		}


		
		function moveTo(latitude,longitude){

		    var position = new google.maps.LatLng(latitude, longitude);
			mapHandler.moveTo(position);
	
			$("#leftpanel2").panel("close");
		}
		
		
		function deleteResults() {
		    document.getElementById("result").innerHTML = "";
		}
		
		
	function doesFileExist(urlToFile)
		{
			var xhr = new XMLHttpRequest();
			xhr.open('HEAD', urlToFile, false);
			xhr.send();
			 
			if (xhr.status == "404") {
				return false;
			} else {
				return true;
			}
		}
