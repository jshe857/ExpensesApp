/**
 * This is the JavaScript controller for expense type
 * @author Katie Barnett and Michael Bunn
 */

var ExpenseType = (function() {
	return {
		setReceiptURI : function(URI) {
			ImageURI.setCurrentImageURI(URI);
			this.init();
		},
		
		init : function(expenseID) {
			console.log("ExpenseType :: init");
			// Get the expense object if it exists
			DB.getExpense(expenseID, function(expenseObject) {
				var thumbNailURI = "images/no-receipt.gif";
				//draw thumbNail with latest receipt
				if (expenseObject && expenseObject.receipt != 'undefined') {
					thumbNailURI = expenseObject.receipt;
				} else if (ImageURI.getCurrentImageURI()) {
					thumbNailURI = ImageURI.getCurrentImageURI();
				}

				Utils.getThumbNail(thumbNailURI, $('#expenseTypeThumb')[0]);
			    
			    $('.receiptThumb').on('click', function(){
			    	Utils.getFullImage(thumbNailURI, expenseID, ExpenseType);
			    });
				
			    // Populate list of expenses
			    var group = 0;
			    var currentGroup = 0;
			    var expenseTypes = DB.getExpenseTypes();
			    
			    expenseUL = $('#expenseList');
			    
			    for (var i=0; i<expenseTypes.length; i++){
			    	
			    	group = expenseTypes[i]["expenseGroupID"];
			    	
			    	var expenseSubUL;
			    	var expenseLI;
			    	
			    	// If parent of new sub group, set up collapsible list item
			    	if (group > currentGroup) {
			    		expenseLI = $('<li />', { 'class': 'expenseTypeLI',
			    		                          'data-role': 'collapsible',
			    		                          'data-iconpos': 'right',
			    		                          'data-theme': 'd'});
			    		parentText = $('<h2 />', { text: expenseTypes[i]["expenseTypeID"] }).appendTo(expenseLI);
			    		expenseSubUL = $('<ul />', { 'data-role': 'listview' });
			    		currentGroup = group;
			    	}
			    	// If child of existing sub group, add to collapsible list
			    	else if (group > 0){
			    		
			    		var expenseSubLI;
			    		
			    		if (Utils.getPreviousPage() == "editExpense") {
				    		expenseSubLI = $('<li />', { 'class': 'expenseTypeLI chargeTo ui-icon-hide', 
				    		                             'data-expense': expenseTypes[i]["expenseTypeID"],
				    		                             'data-theme': 'd' });
			    		} else {
				    		expenseSubLI = $('<li />', { 'class': 'expenseTypeLI chargeTo',
				    	                                 'data-expense': expenseTypes[i]["expenseTypeID"],
				    	                                 'data-theme': 'd' });
			    		}
			    		
			    		expenseA = $('<a />', { text: expenseTypes[i]["expenseTypeID"] }).appendTo(expenseSubLI);
			    		expenseSubLI.appendTo(expenseSubUL);
				    	
				    	// If last of subgroup, close collapsible menu
				    	if (expenseTypes[i+1]["expenseGroupID"] != currentGroup){
				    		expenseSubUL.appendTo(expenseLI);
				    		expenseLI.appendTo(expenseUL);
				    	}
			    	}
			    	// If single type, add to main list
			    	else {
			    		
			    		if (Utils.getPreviousPage() == "editExpense") {
			    			expenseLI = $('<li />', { 'class': 'expenseTypeLI chargeTo ui-icon-hide',
			    			                          'data-expense': expenseTypes[i]["expenseTypeID"] });
			    		} else {
			    			expenseLI = $('<li />', { 'class': 'expenseTypeLI chargeTo', 
			    	                                  'data-expense': expenseTypes[i]["expenseTypeID"] });
			    		}
			    		
			    		expenseA = $('<a />', { text: expenseTypes[i]["expenseTypeID"] }).appendTo(expenseLI);
			    		expenseLI.appendTo(expenseUL);
			    	}
			    }
			    $('#expenseList').trigger('create');
			    $('#expenseList').listview('refresh');
			    
			    console.log("refresh list");
			    
				// Navigation buttons functionality
				$('.back').on('click', function() {
					// Reset the current image URI
					ImageURI.resetCurrentImageURI();
					Utils.goBackWithAnimation();
				});
				
				// Attach modal handler to the screen
				Utils.confirmModalHandler(expenseID);
				
				$('.finishLater').on('click',function() {
					// Reset the current image URI
					ImageURI.resetCurrentImageURI();
					
					// If expense does exist, then update the expense, otherwise create a new one.
					if (expenseObject) {
						DB.updateExpense(expenseObject["expenseID"], expenseObject["expenseTypeID"], expenseObject["accountProjectID"], 
								expenseObject["receipt"], expenseObject["tripID"], function () {
							if (Utils.getPreviousPage() != "editExpense") {
								Utils.loadPage("mainPage", function() {
									Utils.displayExpenseCreatedAlert(false);
									Utils.saveCurrentPageObject(ExpenseType);
									MainPage.init();
								});								
							} else if (Utils.getPreviousPage() == "editExpense") {
								Utils.loadPage("mainPage", function() {
									Utils.saveCurrentPageObject(ExpenseType);
									MainPage.init();
								});
							}
						});
					} else {
						// Update the expense and then move to the main page
						DB.addExpense(null, null, thumbNailURI, null, function(expenseID) {
							Utils.loadPage("mainPage", function() {
								Utils.displayExpenseCreatedAlert(false);
								Utils.saveCurrentPageObject(ExpenseType);
								MainPage.init();
							});	
						});	
					}	
				});
				
				// After expense type is selected, create or update expense record and pass id to next screen
				$('.chargeTo').on('click', function() {
					// Reset the current image URI
					ImageURI.resetCurrentImageURI();
					
					var selectedType = $(this).attr("data-expense");
					// If expense does exist, then update the expense, otherwise create a new one.
					if (expenseObject) {
						DB.updateExpense(expenseObject["expenseID"], selectedType, expenseObject["accountProjectID"], 
											expenseObject["receipt"], expenseObject["tripID"], function() {
							if (Utils.getPreviousPage() == "editExpense") {
								Utils.goBackWithAnimation();
							} else {
								Utils.loadPageWithAnimation("chargeTo", expenseObject["expenseID"], function() {
									Utils.saveCurrentPageObject(ExpenseType);
									ChargeTo.init(expenseObject["expenseID"]);
								});
							}
						});
					} else {
						DB.addExpense(selectedType, null, thumbNailURI, null, function(newExpenseID) {
							Utils.loadPageWithAnimation("chargeTo", newExpenseID, function() {
								Utils.saveCurrentPageObject(ExpenseType);
								ChargeTo.init(newExpenseID);
							});
						});	
					}	 
				});	
			});
		}
	};
}());

