/**
 * This is the JavaScript controller for the history page
 */

var History = (function() {
	return {
		init : function() {
			console.log("History :: init");
			
			/* Review below for history screen */			
			DB.getProcessedTrips(function(data){
				
				if (data.length > 0) {
					//Populate trip list
					var tripUL=document.getElementById("historyList");
					
					for(var i=0; i<data.length; i++){
						tripLI = document.createElement("li");
						
						tripAnchor = document.createElement("a");
						tripAnchor.appendChild(document.createTextNode(data[i]["tripName"]));
						tripLI.setAttribute("class", "tripSelected");
						tripLI.setAttribute("data-trip", data[i]["tripID"]);
						tripLI.appendChild(tripAnchor);
						tripDates = document.createElement("p");
						if (data[i]["startDate"]) {				
							var startDate = (data[i]["startDate"]).split("-");
							tripDates.appendChild(document.createTextNode(startDate[2] + "-" + startDate[1] + "-" + startDate[0]));
						}
						if (data[i]["startDate"] && data[i]["endDate"]) {
							tripDates.appendChild(document.createTextNode("/"));
						} else if (!data[i]["startDate"] && !data[i]["endDate"]) {
							tripDates.appendChild(document.createTextNode("No trip dates specified."));
						}
						if (data[i]["endDate"]) {
							var endDate = (data[i]["endDate"]).split("-");
							tripDates.appendChild(document.createTextNode(endDate[2] + "-" + endDate[1] + "-" + endDate[0]));							
						}
						tripLI.appendChild(tripDates);
						tripUL.appendChild(tripLI);
					}
					$('#historyList').listview('refresh');
				} else {
					$("#historyList").removeClass("ui-shadow");
					$("#historyList li:first-child").addClass("ui-shadow");
					$("#noTripsMsg").removeClass("hidden");
				}	
				
				// On Selection of trip, move to next screen
				$('.tripSelected').on('click', function() {
					var selectedTrip = $(this).attr("data-trip");
					Utils.loadPageWithAnimation("tripExpenses", null, function() {
						Utils.saveCurrentPageObject(History);						
						// Pass selected 
						TripExpenses.init(selectedTrip);
					});
				});	
			});
			
			
			$('.back').on('click', function() {
				Utils.goBackWithAnimation();
			});
		}
	};
}());

