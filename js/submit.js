
// get query parameters on click of the submit button and send a request 
$("#submit").click(function (e) {
	//remove focus in bottom bar
	var delay = ":00";
	$(".ui-btn-active").removeClass('ui-btn-active');
	
	 var start = $("#datePickerStart").val();
	if (start=="")
	{
		$("#datePickerStart").val(getnow());
		var start = $("#datePickerStart").val();
	}
	var park = $( "select option:selected").val();
	
	// add the delay time get from the routing to the current time for the query
	if (delay !=":00"){
		getDelay();
		start = $("#datePickerStart").val().setMinutes(delay);
	}

	 //change datetime format for desktop version
	var appname = navigator.userAgent.toLowerCase();
		if(appname.search("mobile")==-1){
		start=start.replace(/\//g,"-");
		start=start.substr(0, 10) + "T" + start.substr(11);
		}
		start=start.replace("Z","");
		
	var query = "http://localhost:9999/services/forecast?park=" + park + "&start=" + start +":00";

		
	 ajaxRequest(query);
})
