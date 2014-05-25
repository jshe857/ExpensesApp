/**
 * This is the JavaScript controller for expense type
 * @author Katie Barnett and Michael Bunn
 */

var SelectTrip = (function() {
	return {
		init : function(expenseID) {
			console.log("selectTrip :: init");
			
			//draw thumbNail with latest receipt or saved receipt if it exists
			DB.getExpense(expenseID, function(expense){
				var receipt = expense["receipt"];
				Utils.getThumbNail(receipt, $('#selectTripThumb')[0]);

				$('.receiptThumb').on('click', function(){
					Utils.getFullImage(receipt, expenseID, SelectTrip);
				});

				// Change the date selection depending on the platform
				// Commenting this out until a placeholder has been decided on.
//				if (!Utils.isAndroid()) {
//					$("#startDate").attr("type", "date");
//					$("#endDate").attr("type", "date");
//				}
				
				DB.getUnprocessedTrips(function(data){

					if (data.length > 0) {
						// Build the list
						SelectTrip._buildList(data);
					} else {
						$("#selectTripList").removeClass("ui-shadow");
						$("#selectTripList li:first-child").addClass("ui-shadow");
						$("#noTripsMsg").removeClass("hidden");
					}
					
					// On Selection of trip, move to next screen
					$('#selectTripList').on('click', '.tripSelected', function() {
						var selectedTrip = $(this).attr("data-trip");
						DB.getExpense(expenseID, function(expense){
							DB.updateExpense(expense["expenseID"], expense["expenseTypeID"], expense["accountProjectID"], 
									expense["receipt"], selectedTrip, function () {
								if (Utils.getPreviousPage() == "editExpense") {
									Utils.goBackWithAnimation();
								} else {
									Utils.loadPage("mainPage", function() {
										Utils.displayExpenseCreatedAlert(true);
										Utils.saveCurrentPageObject(SelectTrip);
										MainPage.init();
									});									
								}
							});
						});
					});
				});

				// Navigation buttons functionality
				$('.back').on('click', function() {
					Utils.goBackWithAnimation();
				});

				// Handler for when the new trip button is clicked
				$('#newTrip').on('click', function() {
					$('#descriptionErrorMsg').addClass('hidden');
					// Clear any value in the inputs
					$('#tripDescription').val("");
					$('#startDate').val("");
					$('#endDate').val("");
					
					$("#addTripModal").popup("open");
					//$('.opacity').css('display', 'block');
				});
				
				// Handler for when the cancel button is clicked on the modal
				$('#cancelAddTrip').on('click', function(){
				    $("#addTripModal").popup("close");
				    $('.opacity').css('display', 'none');
				});
				
				// Handler for when the submit button is clicked on the modal
				$('#submitAddTrip').on('click', function() {
					if ($('#tripDescription').val().length >= 1) {
						var tripDescription = $('#tripDescription').val();
						var	startDate = $('#startDate').val();
						var	endDate = $('#endDate').val();
							
						var callback = function(newTripID) {
							// Clear the list so the list can be repopulated on screen
							SelectTrip._removeList();
							
							// Query the DB for the information to rebuild the list
							DB.getUnprocessedTrips(function(data) {
								
								// Hide the message
								$("#noTripsMsg").addClass("hidden");
								
								// Build the list
								SelectTrip._buildList(data);
								
								// Refresh the page so the scrolling will still work on the page.
								$.mobile.activePage.trigger('pagecreate');
								
								// Close the modal once completed
								$('#addTripModal').popup("close");
								$('.opacity').css('display', 'none');
							});
						};
	
						DB.addTrip(tripDescription, startDate, endDate, callback);
					} else {
						$('#descriptionErrorMsg').removeClass('hidden');  
					};
				});

				// Attach modal handler to the screen
				Utils.confirmModalHandler(expenseID);
				
				$('.finishLater').on('click',function() {
					// Add function for requirement of the Finish this later button
					if (Utils.getPreviousPage() != "editExpense") {
						Utils.loadPageWithAnimation('mainPage', expenseID, function() {
							Utils.displayExpenseCreatedAlert(false);
							Utils.saveCurrentPageObject(SelectTrip);
							MainPage.init();
						});							
					} else if (Utils.getPreviousPage() == "editExpense") {
						Utils.loadPageWithAnimation('mainPage', expenseID, function() {
							Utils.saveCurrentPageObject(SelectTrip);
							MainPage.init();
						});
					}
				});
				
			});
		},
		
		/**
		 * Function to build the list of trips into the list DOM
		 * @param data the returned data from the DB
		 */
		_buildList : function(data) {
			//Populate trip list
			var tripUL=document.getElementById("selectTripList");
			
			for(var i=0; i<data.length; i++){
				tripLI = document.createElement("li");

				tripAnchor = document.createElement("a");
				tripAnchor.appendChild(document.createTextNode(data[i]["tripName"]));				
				if (Utils.getPreviousPage() == "editExpense") {
					tripLI.setAttribute("class", "tripSelected ui-icon-hide");
				} else {
					tripLI.setAttribute("class", "tripSelected");
				}
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
			
			// Refresh the list view
			$('#selectTripList').listview('refresh');
		},
		
		/**
		 * Function to clear the list DOM to prepare for new list to be generated.
		 * @param none
		 */
		_removeList : function() {
			$('#selectTripList li + li').nextAll('li').remove();
		}
	};
}());

