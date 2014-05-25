/**
* @license
* Licensed Materials - Property of IBM
* 5725-G92 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

function wlCommonInit(){ 

	/*
	 * Application is started in offline mode as defined by a connectOnStartup property in initOptions.js file.
	 * In order to begin communicating with Worklight Server you need to either:
	 * 
	 * 1. Change connectOnStartup property in initOptions.js to true. 
	 *    This will make Worklight framework automatically attempt to connect to Worklight Server as a part of application start-up.
	 *    Keep in mind - this may increase application start-up time.
	 *    
	 * 2. Use WL.Client.connect() API once connectivity to a Worklight Server is required. 
	 *    This API needs to be called only once, before any other WL.Client methods that communicate with the Worklight Server.
	 *    Don't forget to specify and implement onSuccess and onFailure callback functions for WL.Client.connect(), e.g:
	 *    
	 *    WL.Client.connect({
	 *    		onSuccess: onConnectSuccess,
	 *    		onFailure: onConnectFailure
	 *    });
	 *     
	 */
	
	
	// Common initialization code goes here

}

$(document).ready(function() {
	// Show the AJAX loading screen while the DB is being initiated
	$.mobile.loading("show");
	
   if(Utils.isiOS7()){
	   document.body.style.webkitTransform = 'translate3d(0, 20px, 0)';
   }
	   
	
	DB.initDB(function() {
		//DB.addTrip("Manual Trip","2014-01-08","2014-02-09");
		// Load the login page
		Utils.loadPage("mainPage", function() {
			// Call the init function
			MainPage.init();
		});
		
		$(document).on("backbutton", function(e) {
			e.preventDefault();
			Utils.goBackWithAnimation(null);
		});
		
		// The css change to display block is to prevent the jquery mobile to hide the 
		// page when the active page is changed. This will stop the initial flash from occurring.
		$('#content-page').css('display', 'block');
		$('#content-page-2').css('display', 'none');
		
		// Hide the AJAX loading
		$.mobile.loading("hide");
	});
});			
