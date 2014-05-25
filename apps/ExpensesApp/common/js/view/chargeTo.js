
/**
 * This is the JavaScript controller for charge to
 * @author Katie Barnett and Shasha Pendit
 */

var ChargeTo = (function() {
	return {
		// expenseTypeID is passed in from previous screen
		init : function(expenseID) {
			console.log("ChargeTo :: init");
			console.log("expenseID is "+expenseID);
			
			//draw thumbNail with latest receipt or saved receipt if it exists
			DB.getExpense(expenseID, function(expense){
				var receipt = expense["receipt"];
				Utils.getThumbNail(receipt, $('#chargeToThumb')[0]);

				$('.receiptThumb').on('click', function(){
					Utils.getFullImage(receipt, expenseID, ChargeTo);
				});
			    
				DB.getClientCodes(function(data){
					// Build the list
					ChargeTo._buildCodeList(data);
				});
				
			
				//build combobox options
				ChargeTo._buildComboboxOptions(DB.getChargeAccountCodes());
				
				// Click handler for each client code
				$('#selectCodeList').on('click', '.selectCode', function() {
					console.log("button pressed.");
					var selectedCodeID = $(this).attr("data-code");
					DB.updateExpense(expense["expenseID"], expense["expenseTypeID"], selectedCodeID, 
							expense["receipt"], expense["tripID"], function () {
						if (Utils.getPreviousPage() == "editExpense") {
							Utils.goBackWithAnimation();								
						} else {
							Utils.loadPageWithAnimation("selectTrip", expense["expenseID"], function() {
								Utils.saveCurrentPageObject(ChargeTo);
								SelectTrip.init(expense["expenseID"]);
							});
						}
					});
				});	

				$('#selectCodeList').listview('refresh');
	
				
				// Navigation buttons functionality
				$('.back').on('click', function() {
					Utils.goBackWithAnimation();
				});
				
				$('#closeAttachmentOptions').on('click',function() {
					// Close the attachment modal
					closeAttachmentOptions();
				});
				$('.finishLater').on('click',function() {
					// Add function for requirement of the Finish this later button
					if (Utils.getPreviousPage() != "editExpense") {
						Utils.loadPageWithAnimation('mainPage', expenseID, function() {
							Utils.displayExpenseCreatedAlert(false);
							Utils.saveCurrentPageObject(ChargeTo);
							MainPage.init();
						});						
					} else if (Utils.getPreviousPage() == "editExpense") {
						Utils.loadPageWithAnimation('mainPage', expenseID, function() {
							Utils.saveCurrentPageObject(ChargeTo);
							MainPage.init();
						});
					}
				});
				
				// Move to next page after expense type is selected
				$('.selectTrip').on('click', function() {
					Utils.loadPageWithAnimation("selectTrip", expenseID, function() {
						Utils.saveCurrentPageObject(ChargeTo);
						// Save selection here - to be done
						SelectTrip.init(expenseID);
					});
				});
				
				Utils.confirmModalHandler(expense["expenseID"]);
				
				// trigger add client code modal
				$('.btnShowModal').on('click', function() {
	
					$( ".ui-select div" ).addClass( "ui-icon-alt" ); /*change the icon colour of the select*/
					$('#descriptionErrorMsg').addClass('hidden');
					
					  console.log("Function called");
					// Clear any value in the inputs
					$('#accDescription').val("");
					$('#accID').val("");
					
					// Re-build the drop-down list
					$('#combobox').empty();
					ChargeTo._buildComboboxOptions(DB.getChargeAccountCodes());
					
					// Hide the error messages
					$('div[id$="ErrorMsg"]').addClass('hidden');
					
					// Display the pop-up
					$("#popupDialogue").popup("open");
				});
				
				// Handler for when the cancel button is clicked on the modal
				$('#cancelAddCode').on('click', function(event){
					event.preventDefault();
				    console.log("close modal");
				    $("#popupDialogue").popup("close");
	
				});
	           
				// Handler for when the submit button is clicked on the modal
				$('#submitAddCode').on('click', function(event) {
					event.preventDefault();
					console.log("add button clicked");
					
					// If at least the description is populated, add the client code
					if ($('#accDescription').val().length >= 1) {
						var apName = $('#accDescription').val();
						
						var apCode;
						if ($('#accID').val().length >= 1) {
							apCode = $('#accID').val();
						} else {
							apCode = null;
						}
						
						var chargeCode;
						if ($('#combobox option:first').is(":selected")) {
							chargeCode = null;
						} else {
							chargeCode = $('#combobox').val();
						}
							
						var callback = function(newCodeID) {
							// Clear the list so the list can be repopulated on screen
							ChargeTo._removeCodeList();
							
							// Query the DB for the information to rebuild the list
							DB.getClientCodes(function(data) {
								// Build the list
								ChargeTo._buildCodeList(data);
								
								// Refresh the page so the scrolling will still work on the page.
								$.mobile.activePage.trigger('pagecreate');
								
								// Close the modal once completed
								$('#popupDialogue').popup("close");
							});
						};
	
						DB.addClientCode(apCode, apName, chargeCode, callback);		
						
					} else {
						// Validate data
						if ($('#accDescription').val().length == 0) {
							$('#descriptionErrorMsg').removeClass('hidden');
						} else {
							$('#descriptionErrorMsg').addClass('hidden');
						}
					}
				});
			});
		},
		
		/**
		 * Function to build the list of codes into the list DOM
		 * @param data the returned data from the DB
		 */
		_buildCodeList : function(data) {

			//build list divider
			$('<li>', {"data-role":"list-divider", text: "Charge To:"}).appendTo("#selectCodeList");
			
			//populate rest of list
			
			for (var i=0; i<data.length; i++){
				var chargeToLI = null;
				
				//Populate Client Code list
				if (Utils.getPreviousPage() == "editExpense") {
					chargeToLI = $('<li>', {"class" : "selectCode ui-icon-hide", "data-code" : data[i].accountProjectID});
				} else {
					chargeToLI = $('<li>', {"class" : "selectCode", "data-code" : data[i].accountProjectID});
				}
//				$('<a>', { "data-icon" : "arrow-r", text : data[i].accountProjectName + " " + "(" + data[i].accountProjectCode + ")"}).appendTo(chargeToLI);
//				chargeToLI.appendTo('#selectCodeList');
				
				if (data[i].accountProjectCode == "Default Accounting"){
					console.log("checking defaccount");
					$('<a>', { "data-icon" : "arrow-r", text : data[i].accountProjectCode }).appendTo(chargeToLI);
				} else if (data[i].accountProjectCode != null) {
					$('<a>', { "data-icon" : "arrow-r", text : data[i].accountProjectName + " (" + data[i].accountProjectCode + ")"}).appendTo(chargeToLI);
				} else {
					$('<a>', { "data-icon" : "arrow-r", text : data[i].accountProjectName }).appendTo(chargeToLI);
				}
				
				chargeToLI.appendTo('#selectCodeList');
			}
			
			// Refresh the list view
			$('#selectCodeList').listview('refresh');
		},
		
		/**
		 * Function to clear the list DOM to prepare for new list to be generated.
		 * @param none
		 */
		_removeCodeList : function() {
			$('#selectCodeList').empty();
		},
		
		/**
		 * Function to create combobox
		 * @param none
		 */
		_buildComboboxOptions : function(data) {
			console.log(data);
			
			// Create the default option
			$('<option />', { text: 'To be charged to: '} ).appendTo('#combobox');
			
			// Create the remaining options
			for (var i in data) {
				$('<option />', { text : data[i]}).appendTo('#combobox');				
			}
			
			// Refresh the combobox view
			$('#combobox').selectmenu('refresh');
		}
	};		
}());
