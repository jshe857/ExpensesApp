/**
 * This is the JavaScript controller for process trip
 * @author Andrew Lee
 */

var ProcessTrips = (function() {
	return {
		init : function() {
			console.log("ProcessTrips :: init");
			
			DB.getUnassociatedExpenses(function(expenseData){
				if (expenseData.length > 0) {										
					for (var i=0; i < expenseData.length; i++){						
						
						expenseLI = document.createElement("li");
						expenseLI.setAttribute("data-expense", expenseData[i]["expenseID"]);
						expenseLI.setAttribute("class", "unassociatedExpenseItem");
						expenseAnchor = document.createElement("a");					
						if (expenseData[i]["expenseTypeID"] == null || expenseData[i]["expenseTypeID"] == "null"){
							expenseAnchor.appendChild(document.createTextNode("Please complete the expense questions"));
						} else {
							expenseAnchor.appendChild(document.createTextNode(expenseData[i]["expenseTypeID"]));
							if (expenseData[i]["accountProjectName"] != null){
								expenseAnchor.appendChild(document.createTextNode(expenseData[i]["accountProjectName"]));
								if (expenseData[i]["accountProjectCode"] != null){
									expenseAnchor.appendChild(document.createTextNode("(" + expenseData[i]["accountProjectCode"]+ ")" ));
								};
							};
						}
						
						receiptThumbnail = document.createElement("img");
						if (expenseData[i]["receipt"] == "undefined"){
							receiptThumbnail.setAttribute("src", "images//no-receipt.gif");
						} else {
							receiptThumbnail.setAttribute("src", expenseData[i]["receipt"]);
						}
						
						expenseAnchor.appendChild(receiptThumbnail);
						expenseLI.appendChild(expenseAnchor);
						unassociatedExpenseList.appendChild(expenseLI);
					};					
					$('#unassociatedExpenseList').listview('refresh');
					$('#unassociatedExpenseList').removeClass('hidden');
				}

				// Move to next page after trip is selected, pass expenseTypeID
				$('.tripSelected').on('click', function() {
					var expenseID = $(this).attr("data-expense");
					Utils.loadPageWithAnimation("editExpense", null, function() {
						Utils.saveCurrentPageObject(ProcessTrips);
						EditExpense.init(expenseID);
					});
				});
				
				// Handler for when the user clicks on the unassociated item.
				$('.unassociatedExpenseItem').on('click', function(event) {
					
					var expenseID = parseInt($(this).attr("data-expense"));			
					// Check if the element type of this event element is the image, if so, just display the thumbnail
					if (event.target.nodeName.toUpperCase() == "IMG") {
						Utils.getFullImage(event.target.getAttribute("src"), expenseID, ProcessTrips);
					} else {
						// Otherwise complete the expense details
						// Get the expense entry from the DB from the selected item
						DB.getExpense(expenseID, function(singleExpense) {
							console.log(singleExpense);
							if (singleExpense.expenseTypeID == "null") {
								// Move the user to the beginning of the process flow
								Utils.loadPageWithAnimation("expenseType", null, function() {
									Utils.saveCurrentPageObject(ProcessTrips);
									ExpenseType.init(expenseID);
								});
							} else if (singleExpense.accountProjectID == "null") {
								// Move the user to select the charge to code
								Utils.loadPageWithAnimation("chargeTo", null, function() {
									Utils.saveCurrentPageObject(ProcessTrips);
									ChargeTo.init(expenseID);
								});
							} else if (singleExpense.tripID) {
								// Move the user to select a trip to associate the expense to
								Utils.loadPageWithAnimation("selectTrip", null, function() {
									Utils.saveCurrentPageObject(ProcessTrips);
									SelectTrip.init(expenseID);
								});
							}
						});
					}
				});
			});



			DB.getUnprocessedTrips(function(data){

				if (data.length > 0) {
					//Populate trip list
					var tripUL=document.getElementById("tripList");
					
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
					
					$('#tripList').listview('refresh');
					
				} else {
					$("#tripList").removeClass("ui-shadow");
					$("#tripList li:first-child").addClass("ui-shadow");
					$("#noTripsMsg").removeClass("hidden");
				}				
				
				// On Selection of trip, move to next screen
				$('.tripSelected').on('click', function() {
					var selectedTrip = $(this).attr("data-trip");
					Utils.loadPageWithAnimation("tripExpenses", null, function() {
						Utils.saveCurrentPageObject(ProcessTrips);						
						// Pass selected 
						TripExpenses.init(selectedTrip, false);
					});
				});	
			});
			
			
			$('.back').on('click', function() {
				Utils.goBackWithAnimation();
			});
			
			$('.forward').on('click', function() {
				Utils.loadPageWithAnimation("tripExpenses", null, function() {
					Utils.saveCurrentPageObject(ProcessTrips);
					Test.init();
				});
			});
		}
	};
}());

