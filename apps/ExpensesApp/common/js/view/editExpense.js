/**
 * This is the JavaScript controller for expense type
 * @author Katie Barnett and Michael Bunn
 */

var EditExpense = (function() {
	DEFAULT_ACCOUNTING = "Default Accounting";
	return {
		init : function(expenseID) {
			console.log("EditExpense :: init");
			DB.getExpense(expenseID, function(expense) {
			    // Get the trip description from unprocessed trip
				DB.getTrip(expense["tripID"], function(trip) {
					console.log(expense);
					//draw thumbNail with receipt
					Utils.getThumbNail(expense["receipt"], $('#editExpenseReceipt')[0]);
					
					$('.receiptThumb').on('click', function(){
						Utils.getFullImage(expense.receipt, expenseID, EditExpense);
					});
					
					expenseUL = document.getElementById("expenseDetailsList");
					var blnInProcess = (trip["originalProcessDate"] == null || trip["originalProcessDate"] == "null");
					expenseLI = document.createElement("li");
					expenseLI.setAttribute("class", "expenseType");
					
					// Create an anchor tag if the trip has not been processed.
					if (blnInProcess) {
						expenseA = document.createElement("a");
						expenseA.appendChild(document.createTextNode(expense["expenseTypeID"]));
						expenseLI.appendChild(expenseA);
					} else {
						expenseLI.appendChild(document.createTextNode(expense["expenseTypeID"]));
					}
				
					expenseUL.appendChild(expenseLI);
					
					expenseLI = document.createElement("li");
					expenseLI.setAttribute("data-role", "list-divider");
					expenseLI.setAttribute("data-theme", "f");
					expenseLI.appendChild(document.createTextNode("Charge to"));
					expenseUL.appendChild(expenseLI);
					
					expenseLI = document.createElement("li");
					expenseLI.setAttribute("class", "expenseCharge");
					
					if (blnInProcess) {
						expenseA = document.createElement("a");
						expenseA.appendChild(document.createTextNode(EditExpense.findChargeToString(expense["accountProjectCode"], expense["accountProjectName"])));
						expenseLI.appendChild(expenseA);
					} else {
						expenseLI.appendChild(document.createTextNode(EditExpense.findChargeToString(expense["accountProjectCode"], expense["accountProjectName"])));
					}
					expenseUL.appendChild(expenseLI);
					
					expenseLI = document.createElement("li");
					expenseLI.setAttribute("data-role", "list-divider");
					expenseLI.setAttribute("data-theme", "f");
					expenseLI.appendChild(document.createTextNode("Trip"));
					expenseUL.appendChild(expenseLI);
					
					expenseLI = document.createElement("li");
					expenseLI.setAttribute("class", "expenseTrip");
					if (blnInProcess) {
						expenseA = document.createElement("a");
						expenseA.appendChild(document.createTextNode(trip.tripName));
						expenseLI.appendChild(expenseA);
					} else {
						expenseLI.appendChild(document.createTextNode(trip.tripName));
					}
					
					expenseUL.appendChild(expenseLI);
					    
					$('#expenseDetailsList').trigger('create');
					$('#expenseDetailsList').listview('refresh');
					
					// Only attach these event listeners if the trip has not been processed
					if (blnInProcess) {
						// Move to selected screen
						$('.expenseType').on('click', function() {
							Utils.loadPageWithAnimation("expenseType", expenseID, function() {
								Utils.saveCurrentPageObject(EditExpense);
								ExpenseType.init(expenseID);
							});
						});
						
						$('.expenseCharge').on('click', function() {
							Utils.loadPageWithAnimation("chargeTo", expenseID, function() {
								Utils.saveCurrentPageObject(EditExpense);
								ChargeTo.init(expenseID);
							});
						});
						
						$('.expenseTrip').on('click', function() {
							Utils.loadPageWithAnimation("selectTrip", expenseID, function() {
								Utils.saveCurrentPageObject(EditExpense);
								SelectTrip.init(expenseID);
							});
						});
					}
				
					// Navigation buttons functionality
					$('.back').on('click', function() {
						Utils.goBackWithAnimation();
					});
					
					// Attach handler to screen
					EditExpense.deleteModalHandler(expenseID);
				});
			});
			
			// Display the 'Delete Expense' button and the horizontal rule if the user did not come from the History page
			if ($.inArray('history', Utils.getPageHistory()) < 0) {
				$('#deleteBtn').removeClass('hidden');
				$('.horizontal-rule').removeClass('hidden');
			}
		},
		
		/**
		 * Handler for the Delete confirmation popup
		 */
		deleteModalHandler : function(expenseID) {
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
				
				DB.deleteExpense(expenseID, function() {
					Utils.loadPageWithAnimation('mainPage', null, function() {
						Utils.saveCurrentPageObject(EditExpense);
						MainPage.init();
					});
				});
			});
		},
		
		/**
		 * Function that will return the correct string to display according to the account code.
		 * @param accountCode, the account code for the expense
		 * @param accountName, the name of the account
		 */
		findChargeToString : function(accountCode, accountName) {
			if (accountCode == DEFAULT_ACCOUNTING) {
				return accountCode;
			} else if (accountCode != null) {
				return accountName + " (" + accountCode + ")";
			} else {
				return accountName;
			}
		}
	};
}());



