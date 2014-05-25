/**
 * This is the JavaScript controller for process trip
 * @author Andrew Lee
 */

var TripExpenses = (function() {
	var fromHistoryPage = false;
	return {
		// Constants used in the function
		EMAIL_SENT : 2,
		
		init : function(selectedTrip) {
			console.log("TripExpenses :: init");
			
			var emailAttachments = new Array();
			var expenseBody = "";
			var headingPublished = false;

			// Set if the page originally came from the history page or not
			if ($.inArray('history', Utils.getPageHistory()) < 0) {
				fromHistoryPage = false;
			} else {
				fromHistoryPage = true;
			}
			
			// Get the selected trip from the DB with the details
			TripExpenses._getTrip(selectedTrip, function(tripName, tripStart, tripEnd) {
				// Make the date fields use the native date picker if it's not android
				if (!Utils.isAndroid()) {
					$("#editStartDate").attr("type", "date");
					$("#editEndDate").attr("type", "date");
				}
				// Publish trip details
				TripExpenses._fillTitles(tripName, tripStart, tripEnd);
			});
			
			DB.getTripExpenses(selectedTrip, function(data) {
				
				var expenseTypes = DB.getExpenseTypes();
				var expenseList = document.getElementById("expenseList");
				
				var count = 1;
				for (var i=0; i<expenseTypes.length; i++){
					for (var j=0; j<data.length; j++){
						if (expenseTypes[i]["expenseTypeID"] == data[j]["expenseTypeID"]){
							console.log(data[j]);
							// Publish list divider for each existing expense type
							if (headingPublished == false){
								expenseLI = document.createElement("li");
								expenseLI.setAttribute("data-role", "list-divider");
								expenseLI.appendChild(document.createTextNode(expenseTypes[i]["expenseTypeID"]));
								expenseList.appendChild(expenseLI);
								headingPublished = true;
							}
							expenseLI = document.createElement("li");
							expenseLI.setAttribute("data-expense", data[j]["expenseID"]);
							expenseLI.setAttribute("class", "expenseItem");
							expenseAnchor = document.createElement("a");
							if (data[j]["accountProjectCode"] == "Default Accounting") {
								expenseAnchor.appendChild(document.createTextNode(data[j]["accountProjectCode"]));
							} else {
								expenseAnchor.appendChild(document.createTextNode(data[j]["accountProjectName"]));
								
								if (data[j]["accountProjectCode"] != null) {
									expenseAnchor.appendChild(document.createTextNode(" (" + data[j]["accountProjectCode"]+ ")" ));
								} 
							}
							receiptThumbnail = document.createElement("img");
							if (data[j]["receipt"] == "undefined"){
								receiptThumbnail.setAttribute("src", "images//no-receipt.gif");
							} else {
								receiptThumbnail.setAttribute("src", data[j]["receipt"]);
								// Add the image to the array of attachments
								emailAttachments[count - 1] = Utils.stripFile(data[j]["receipt"]);
							}
							expenseAnchor.appendChild(receiptThumbnail);
							expenseLI.appendChild(expenseAnchor);
							expenseList.appendChild(expenseLI);
							
							// Build the email body while we are here
							expenseBody = expenseBody + "<br/><strong>Expense " + count + "</strong><br/>" + expenseTypes[i]["expenseTypeID"] + "<br/>";
							if (data[j]["accountProjectName"]) {
								expenseBody = expenseBody + data[j]["accountProjectName"] + " - ";
							}
							expenseBody = expenseBody + data[j]["accountProjectCode"] + "<br/>" + "Filename: " + Utils.convertFile(data[j]["receipt"]) + "<br/><br/>";
							count++;
						}
					}
					headingPublished = false;
					
				}
				$('#expenseList').listview('refresh');
				
				// Move to next page after expense type is selected, pass expenseTypeID
				$('.expenseItem').on('click', function() {
					var expenseID = $(this).attr("data-expense");
					// Check if the element type of this event element is the image, if so, just display the thumbnail
					if (event.target.nodeName.toUpperCase() == "IMG") {
						Utils.getFullImage(event.target.getAttribute("src"), selectedTrip, TripExpenses);
					} else {
						// Otherwise load the expense details
						Utils.loadPageWithAnimation("editExpense", selectedTrip, function() {
							Utils.saveCurrentPageObject(TripExpenses);
							EditExpense.init(expenseID);
						});
					}
				});
			});
			
			$('.back').on('click', function() {
				Utils.goBackWithAnimation();
			});
			
			// Attach modal handler to the screen.
			TripExpenses._modalHandler(selectedTrip);
			
			// Handler for when the send details button is clicked
			$('#sendTripDetailsBtn').on('click', function() {
				$('#emailError').addClass("hidden");
				TripExpenses._animateTripPopup();
				
				// Handler for when the cancel button is clicked
				$('#cancelSendDetailsBtn').on('click', function() {
					$('.opacity').css('display','none');
					$('.sendDetailsContainer').animate({bottom:'-284px'}, 500, function() { 
						$('.sendDetailsContainer').css("display","none");
					});
				});
			});
			
			// Handler for when the submit button is clicked
			$('#submitTripDetailsBtn').on('click', function() {
				TripExpenses._sendTrip(selectedTrip, expenseBody, emailAttachments);
			});
			
			// If the previous page was from the history list, call function
			if (fromHistoryPage) {
				TripExpenses._changeToHistory(selectedTrip);
				
				// Modify the list divider
				$('#emailListDivider').html('Email trip was sent to');
				
				// Get the email last used to send the trip and display it to the user
				DB.getEmailLogs(selectedTrip, function(emailAddresses) {
					console.log(emailAddresses);
					if (emailAddresses.length > 0) {
						TripExpenses._showLastEmail(emailAddresses);
					}
				}); 
			} else {
				
				// Display the 'Delete Expense' button if the user did not come from the History page
				$('#deleteBtn').removeClass('hidden');
				
				// Get the last email the user tried to send an email to and display it
				DB.getLastEmail(function(emailAddress) {
					if (emailAddress.length > 0) {
						TripExpenses._showLastEmail(emailAddress);
					}
				});
			}
		},
		
		/**
		 * Function that will attach all the handlers required by the modal. It will also
		 * grab refreshed data from the database to display to the user.
		 * @param selectedTrip the Trip ID.
		 */
		_modalHandler : function(selectedTrip) {
			$('#editTrip').on('click', function() {
				// Get the new information from the data base and then populate the fields in the modal.
				TripExpenses._getTrip(selectedTrip, function(tripName, tripStart, tripEnd) {
					// Prefil the details on the modal
					$('#editTripDescription').val(tripName);
					$('#editStartDate').val(tripStart);
					$('#editEndDate').val(tripEnd);
					
					// Hide the error message
					$('#editTripError').addClass("hidden");
					
					// Bring up the modal
					$('#editTripModal').popup("open");
					//$('.opacity').css('display','block');
				});
		
				// Handler to close the popup
				$('#cancelEditTrip').on('click', function() {
					$('#editTripModal').popup("close");
					//$('.opacity').css('display','none');
				});
				
				// Handler for when the submit button is pressed
				$('#submitEditTrip').on('click', function() {
					var tripDescription = $('#editTripDescription').val();
					var tripStartDate = $('#editStartDate').val();
					var tripEndDate = $('#editEndDate').val();
					
					if (tripDescription.length > 0) {
						// Submit the update to the DB
						DB.updateTrip(selectedTrip, tripDescription, tripStartDate, tripEndDate, function() {
							// Close the modal
							$('#editTripModal').popup("close");
							//$('.opacity').css('display','none');
							
							// Clear the current title
							TripExpenses._removeTitles();
							
							// Reload the current page
							TripExpenses._fillTitles(tripDescription, tripStartDate, tripEndDate);
							
						});
					} else {
						$('#editTripError').removeClass("hidden");
					}
				});
			});
			
			// Click handler for 'Delete' button
			$('#deleteBtn').on('click', function() {
				$('.confirm').css('display', 'block');	
				$('.opacity').css('display', 'block');
				if(Utils.isiOS7()){
					$('.confirm').animate({bottom:'20px'}, 500);
				} else{
					$('.confirm').animate({bottom:'0px'}, 500);	
				}
			});
			
			// Click handler for 'No' button
			$('#noBtn').on('click', function() {				
				$('.opacity').css('display', 'none');				
				$('.confirm').animate({bottom:'-210px'}, 500, function() { 
					$(".confirm").css('display', 'none');
				});				
			});

			// Click handler for 'Yes' button
			$('#yesBtn').on('click', function() {				
				DB.deleteTrip(selectedTrip, function() {
					Utils.loadPageWithAnimation('mainPage', null, function() {
						Utils.saveCurrentPageObject(TripExpenses);
						MainPage.init();
					});
				});
			});
		},
		
		/**
		 * Function that will clear the trip name, start and end dates on screen
		 * @param none
		 */
		_removeTitles : function() {
			$('#tripName').empty();
			$('#tripStart').empty();
			$('#tripEnd').empty();
		},
		
		/**
		 * Function that will populate the title
		 * @param tripName the title of the trip
		 * @param tripStart the start date of the trip
		 * @param tripEnd the end date of the trip
		 */
		_fillTitles : function(tripName, tripStart, tripEnd) {
			if (tripName) {
				$('#tripName').html(tripName);
			}
			if (tripStart) {
				var startDate = tripStart.split("-");
				$('#tripStart').html(document.createTextNode(startDate[2] + "-" + startDate[1] + "-" + startDate[0]));
				$('#tripStartTitle').css("display","block");
			} else {
				$('#tripStartTitle').css("display","none");
			}
			if (tripEnd) {
				var endDate = tripEnd.split("-");
				$('#tripEnd').html(document.createTextNode(endDate[2] + "-" + endDate[1] + "-" + endDate[0]));			
				$('#tripEndTitle').css("display","block");
			} else {
				$('#tripEndTitle').css("display","none");
			}
		},
		
		/**
		 * Function that will get the data from the DB and then will complete
		 * the call back function as specified.
		 * @param selectedTrip the trip ID
		 * @param callback the callback function
		 */
		_getTrip : function(selectedTrip, callback) {
			console.log(selectedTrip);
			DB.getTrip(selectedTrip, function(data) {
				var tripName = data.tripName;
				var tripStart = data.startDate;
				var tripEnd = data.endDate;
				
				if (callback) {
					callback(tripName, tripStart, tripEnd);
				}
			});
		},
		
		/**
		 * Function that will take the expense data, format it into a prefilled email for the user
		 * to send it to desired email address entered.
		 * @param selectedTrip
		 */
		_sendTrip : function(selectedTrip, expenseBody, emailAttachments) {
			var sendEmail = true;
			// Get the trip name that is being emailed.
			var emailSubject = "Expenses for " + $('#tripName').html();
			
			// Build the body of the email
			
			var emailBody = "<html><head></head>Please find attached the expense receipts for the trip <span>" + $('#tripName').html() + "</span> ";
			if ($('#tripStart').length > 0 && $('#tripEnd').length > 0) {
				emailBody = emailBody + "for the period <span>" + $('#tripStart').html() + "</span> to <span>" + $('#tripEnd').html() + "</span>"; 
			} else if ($('#tripStart').length > 0) {
				emailBody = emailBody + "for <span>" + $('#tripStart').html() + "</span>";
			} else if ($('#tripEnd').length > 0) {
				emailBody = emailBody + "for <span>" + $('#tripEnd').html() + "</span>"; 
			}
			emailBody = emailBody + ".<br/><br/>" + expenseBody + "</html>";
			
			// Get the entered in email address
			var emailAddress = $('#sendTripEmailAddress').val();
			if (emailAddress.length > 1) {
				var callback = function() {
					// Check if the email was sent properly
					var onComplete = function(returnValue) {
						if (Utils.isAndroid()) {
							// Setting up the confirmation text for Android
							var confirmText = "Has the email been sent to " + emailAddress + "?";
							
							// The rest of the confirmation text will change depending on where the user came from
							if (fromHistoryPage) {
								confirmText += " The submit date will be updated.";
							} else {
								confirmText += " This will process the trip and be moved to history.";
							}
							
							// The user will need to press ok for the app to process the trip, as there is no return code for Androids
							if (confirm(confirmText)) {
								// Process the trip to the history
								TripExpenses._processEmail(selectedTrip);
							} else {
								// Alerting the user if they cancelled the process
								alert("This trip has not been processed.");
							}
						} else {
							// The iOS will not need the user to actively set the confirmation
							if (returnValue == TripExpenses.EMAIL_SENT) {
								TripExpenses._processEmail(selectedTrip);
							}
						}
					};
					
					// Alerts after the call back will break iOS, so confirmation should be used instead.
					if (!Utils.isAndroid()) {
						var alertText = "Once the trip has been emailed to " + emailAddress + ".";
						
						// The rest of the alert text will change depending on where the user came from
						if (fromHistoryPage) {
							alertText += " The submit date will be updated.";
						} else {
							alertText += " The trip will be moved to history.";
						}
						
						if (confirm(alertText)) {
							sendEmail = true;
						} else {
							sendEmail = false;
						}
					}
					
					/*
					 * To use the email composer plugin, the following arguments are as follows:
					 * showEmailComposerWithCallback(callback, subject, body, to, cc, bcc, boolean HTML, attachments)
					 */
					if (sendEmail) {
						console.log("GOING TO SEND EMAIL");
//						var email = new EmailComposer();
//						email.open({
//							to: emailAddress,
//							subject: emailSubject,
//							body:emailBody,
//							isHTML: true,
//							attachments: emailAttachments
//						},onComplete);
						
						
						window.plugins.emailComposer.showEmailComposerWithCallback(
								onComplete,
								emailSubject, 
								emailBody, 
								[emailAddress],
								[],
								[],
								true,
								emailAttachments);
					}
				};
				
				// Save the email address to the DB
				DB.logTrip(selectedTrip, emailAddress, Utils.getTodaysDate(), callback);
			} else {
				// Show the error message
				$('#emailError').removeClass("hidden");
			}
		},
		
		/**
		 * Function that will change certain elements to match the trip details when arriving from the
		 * history list page.
		 * @param none
		 */
		_changeToHistory : function(selectedTrip) {
			// Display the hidden email log button
			$('#emailLogBtnArea').removeClass("hidden");
			
			// Hide the 'Edit Trip' button
			$('#editTrip').parent().addClass('hidden');
			
			// Change the text in the send email button
			$('#sendTripDetailsBtn').text("Resend Trip Details").button('refresh');
			
			// Find the processed date of the trip and print it to screen
			DB.getProcessedDate(selectedTrip, function(trip) {
				var processDate = (trip.originalProcessDate).split("-");
				$('#processedDate').html("Originally submitted: " + processDate[2] + "-" + processDate[1] + "-" + processDate[0]);
				$('#processedDate').css('display', 'block');
			});
			
			// Attach handler for when email log is clicked
			$('#emailLogBtn').on('click', function() {
				Utils.loadPageWithAnimation("EmailLog", selectedTrip, function() {
					Utils.saveCurrentPageObject(TripExpenses);
					EmailLog.init(selectedTrip);
				
			});
		});
			
		},
		
		/**
		 * Function that will animate the popup to show the email log and send trip buttons.
		 * @param none
		 */
		_animateTripPopup : function() {
			$('.sendDetailsContainer').css('display','block');
			$('.opacity').css('display', 'block');
			$('.sendDetailsContainer').animate({bottom:'0px'}, 500);
		},
		
		/**
		 * Function that will show the last email entered by the user
		 * @param emailAddress the last email entered by the user
		 */
		_showLastEmail : function(emailAddress) {
			$('#recentEmailArea').removeClass("hidden");
			var firstEmail = null;
			var secondEmail = null;
			
			// Find the email addresses and determine whether one should be displayed or two
			firstEmail = emailAddress[0].email;
			for (var i in emailAddress) {
				if (firstEmail != emailAddress[i].email) {
					secondEmail = emailAddress[i].email;
					break;
				}
			}
			
			// Add the email address to a button
			$('<a>', { href:"#", text: firstEmail, "data-icon":"false"}).appendTo(
					$('<li>', {"class" : "recentEmail", "data-email" : firstEmail}).appendTo('#recentEmailList'));
			
			if (secondEmail) {
				$('<a>', { href:"#", text: secondEmail, "data-icon":"false"}).appendTo(
						$('<li>', {"class" : "recentEmail", "data-email" : secondEmail}).appendTo('#recentEmailList'));
			}
			
			// Refresh the list view for the CSS
			$('#recentEmailList').listview('refresh');
			
			// Attach handler to the recent email address
			$('.recentEmail').on('click',function() {
				// Fill the input field with the text
				$('#sendTripEmailAddress').val($(this).attr("data-email"));
			});
		},
		
		/**
		 * Function that will mark the trip as processed so it will appear in the history page.
		 * @param selectedTrip, the trip ID
		 */
		_processEmail : function(selectedTrip) {
			// Update the trip to be processed
			DB.processTrip(selectedTrip, Utils.getTodaysDate(), function() {
				// Go to the main page after trip has been processed
				Utils.loadPage("mainPage", function() {
					MainPage.init();
				});
			});
		}
	};
}());

