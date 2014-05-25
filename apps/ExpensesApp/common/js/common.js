/**
 * This is the common utilities that will be used across the different pages on the application.
 * @author Andrew Lee
 */

var Utils = (function() {
	// Variable that will store all the page history so back can be implemented as a hardware button.
	var pageHistory = [];
	var callbackFunction = "";
	var objectHistory = [];
	var receipts = [];
	var expenseIDHistory = [];
		
	return {
		/**
		 * Method that will load the desired page with params and callback
		 * @param pageToLoad the page to be loaded.
		 * @param callback The function to callback to once the page has finished loading.
		 * @param expenseId optional argument if there is no animation
		 */
		loadPage : function(pageToLoad, callback, expenseId) {
			if (typeof pageToLoad === "string") {
				if (pageToLoad == "mainPage") {
					// Reset the page history and expense history if at the main page
					pageHistory.length = 0;
					objectHistory.length = 0;
					expenseIDHistory.length = 0;
				} else if (expenseId) { // Save the expenseId if it exists
					var intExpenseId = expenseId && expenseId.seq ? expenseId.seq : expenseId;
					expenseIDHistory.push(intExpenseId);
				}
				
				console.log(expenseIDHistory);
				
				// Add the loaded page to the history so going back can be performed
				pageHistory.push(pageToLoad);
				console.log(pageHistory);
				$(PageChangeHelper.getCurrentContainer()).load('pages/' + pageToLoad + '.html', function() {
					// Reload the dynamic CSS from jQuery mobile once the page has loaded into active page.
					$.mobile.activePage.trigger('pagecreate');
					callback();
				});
			} else {
				alert("Error: page cannot be loaded");
			}
		},
		
		/**
		 * Method that will load the previous page
		 */
		goBack : function(callback) {
			var currentPage = pageHistory.pop();
			var page = pageHistory[pageHistory.length-1];
			console.log(expenseIDHistory);
			if(currentPage == "mainPage") {
				if (confirm("Are you sure you want to exit?")) {
					if(navigator.app) {
						navigator.app.exitApp();
						return false;
					}
				}
			}
			$(PageChangeHelper.getCurrentContainer()).load('pages/' + page + '.html', function() {
				// Reload the dynamic CSS from jQuery mobile once the page has been loaded into active page.
				$.mobile.activePage.trigger('pagecreate');
				
				var currentObject = Utils.getCurrentPageObject();
				var currentExpenseId = Utils.getCurrentExpenseId();
				
				if (currentExpenseId) {
					currentObject.init(currentExpenseId);
				} else {
					currentObject.init();
				}
				callback();
			});
		},
		
		/**
		 * This method will load the desired page similar to loadPage, but will
		 * also animate the page loading process.
		 * @param pageToLoad the page to be loaded
		 * @param expenseId the current expense Id on the page
		 * @param callback the call back functionality once the page has loaded.
		 */
		loadPageWithAnimation : function (pageToLoad, expenseId, callback) {
			// Do the animation of moving the content pane off screen.
			console.log("Utils :: loadPageWithAnimation");
			
			var intExpenseId = expenseId && expenseId.seq ? expenseId.seq : expenseId;
			expenseIDHistory.push(intExpenseId);
			
			callbackFunction = callback;
			// Toggle the current container to the other one so the movement can be completed.
			PageChangeHelper.toggleCurrentContainer();
			
			// Change the active page so the CSS can be reloaded for jQuery mobile. Remove transition effects so it
			// does not flash on screen when the page is changing.
			$.mobile.changePage(PageChangeHelper.getCurrentContainer(), {changeHash: false, transition: "none"});
			
			// Call the load page function
			Utils.loadPage(pageToLoad, function() {
				var currentContainer = $(PageChangeHelper.getCurrentContainer());
				var otherContainer = $(PageChangeHelper.getOtherContainer());
				// Move the container off screen on the right so it can be animated right to left.
				currentContainer.css('left','100%').css('display', 'block');
				// Move the other container off screen to the left
				otherContainer.animate({left:"-100%"}, 500);
				// Move the current container into the centre of the screen and then hide the other container
				currentContainer.animate({left:"0%"}, 500, function() {
					otherContainer.css('display','none').empty();
					
					// Execute the call back function if it exists
					if (callbackFunction == null) {
						alert("Missing callback function. Need init");
					} else {
						callbackFunction();
					}
				});
			});
		},
		
		/**
		 * Method that will go back to the previous page with an sliding animation.
		 * @param callback The callback function once the animation has been completed.
		 */
		goBackWithAnimation : function(callback) {
			console.log("Utils :: goBackWithAnimation");
			callbackFunction = callback;
			// Toggle the current container to the other one so the transition can be completed.
			PageChangeHelper.toggleCurrentContainer();
			
			// Change the active page so the CSS can be reloaded for jQuery mobile. Remove transition effects so it
			// does not flash on screen when the page is changing.
			$.mobile.changePage(PageChangeHelper.getCurrentContainer(), {changeHash: false, transition: "none"});
			
			// Call the function to load the previous page
			Utils.goBack(function() {
				var currentContainer = $(PageChangeHelper.getCurrentContainer());
				var otherContainer = $(PageChangeHelper.getOtherContainer());
				// Move the current container to the left of the centre so it can be animated from left to right
				currentContainer.css('left','-100%').css('display','block');
				// Move the other container off screen going to the right
				otherContainer.animate({left:'100%'}, 500);
				currentContainer.animate({left:'0%'}, 500, function() {
					otherContainer.css('display','none').empty();
					// Execute the call back function
					if (callbackFunction) {
						callbackFunction();
					}
				});
			});
		},
		
		/**
		 * Saves the current page object so it can return when the back button is pressed.
		 * @param obj, the return object to be initiated.
		 */
		saveCurrentPageObject : function(obj) {
			objectHistory.push(obj);
		},
		
		/**
		 * Gets the last page object from the list
		 * @return object, the last object
		 */
		getCurrentPageObject : function() {
			var previousObject = objectHistory.pop();
			return previousObject;
		},
		
		/**
		 * Gets the name of the previous page from the list
		 * @return  The name of the previous page
		 */
		getPreviousPage : function() {
			return pageHistory[pageHistory.length - 2];
		},
		
		/**
		 * Gets the page navigation history
		 * @return  An array of previously visited page names
		 */
		getPageHistory : function() {
			return pageHistory;
		},
		
		/**
		 * Function that will get the full image (if it is not the no image image)
		 * @param ref, the URI of the image
		 * @param page, the page that is calling the full image
		 */
		getFullImage: function(ref, expenseID, page) {
			if (ref != "images/no-receipt.gif") {
				console.log('loading viewReceipt');
				//load viewReceiptPage
				Utils.loadPageWithAnimation('viewReceipt',expenseID, function() {
					Utils.saveCurrentPageObject(page); 
					//change this to dynamically retrieve current page
					ViewReceipt.init(ref);
				});
			}
		},
		
		getReceipt : function(ref){
			return receipts[ref];
		},
		
		addReceipt : function(receiptUri){
			receipts.push(receiptUri);
		},
			 		
		getThumbNail : function(uri, canvas) {
			if(uri) {
				var imageObj = new Image();
				var context = canvas.getContext('2d');
			    imageObj.onload = function(){
			        context.drawImage(imageObj, 0, 0, 75, 75);
			    };
			    imageObj.src = uri;
			}
		},
		
		/**
		 * Function that will return the last expense ID that was saved.
		 * @return the last expense ID
		 */
		getCurrentExpenseId : function() {
			return expenseIDHistory.pop();
		},
		
		/**
		 * Function that will return today's date in the format of yyyy/mm/dd
		 */
		getTodaysDate : function() {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; // As the month starts from 0
			var yyyy = today.getFullYear();
			
			if (dd<10) {
				dd = '0' + dd;
			}
			
			if (mm<10) {
				mm = '0' + mm;
			}
			
			return yyyy + '-' + mm  + '-' + dd;
		},
		
		/** 
		 * Function to strip the 'file:///' from the file name
		 * @params stringToStrip the string containing the full path
		 * @return string
		 */
		stripFile : function(stringToStrip) {
			var strippedString = stringToStrip.replace(/file:\/\/\//g, '');
			return strippedString;
		},
		
		/** 
		 * Function to convert the file name into xxxxx.jpg (human readable format)
		 * @params 
		 */
		convertFile : function(filename) {
			var splitString = filename.split('/');
			return splitString[splitString.length-1]; 
		},
		
		/**
		 * Function to determine if the environment is android or not
		 * @return boolean
		 */
		isAndroid : function() {
			var isAndroid = WL.Client.getEnvironment() == WL.Environment.ANDROID;
			return isAndroid;
		},
		
		/**
		 * Function to determine if the environment is iOS7 or not
		 * @return boolean
		 */
		isiOS7 : function() {
			var isiOS7 = WL.Client.getEnvironment() == WL.Environment.IPHONE &&
	        parseInt(navigator.appVersion.match(/OS (\d)/)[1], 10) >= 7;
	        
	        return isiOS7;
		},
		
		/**
		 * Handler for the 'Are you sure?' confirmation popup
		 * @param  expenseID  An expense ID
		 */
		confirmModalHandler : function(expenseID) {
			console.info(expenseID);

			// Click handler for 'Cancel' button
			$('.cancelBtn').on('click', function() {
				$('.confirm').css('display', 'block');	
				$('.opacity').css('display', 'block');
				$('.confirm').animate({bottom:'0px'}, 500);	
			});
			
			// Click handler for 'No' button
			$('#noBtn').on('click', function() {				
				$('.opacity').css('display', 'none');				
				$('.confirm').animate({bottom:'-210px'}, 500, function() { 
					$('.confirm').css('display', 'none');
				});				
			});

			// Click handler for 'Yes' button
			$('#yesBtn').on('click', function() {
				if (typeof expenseID == 'undefined') {
					Utils.loadPage('mainPage', function() {
						MainPage.init();							
					});
				} else {
					console.info(expenseID);
					console.log("expense id to del: " + expenseID);
					DB.deleteExpense(expenseID, function() {
						Utils.loadPage('mainPage', function() {
							MainPage.init();							
						});
					});
				}
			});
		},
		
		/**
		 * Function to handle the 'Expense Created' alert
		 * @param  expenseCompleteIndicator  True if the expense is complete, false otherwise.
		 */
		displayExpenseCreatedAlert : function(expenseCompleteIndicator) {
			
			$('.opacity').css('display', 'block');
			$('.alert').css('display', 'block');

			// Display message
			if (expenseCompleteIndicator) {
				$('<span />', { 
							text: 'Your expense has been created. Once you have created all of your expenses, you can send the trip details from the '
						}).appendTo("#alertMsg");			
				$('<span />', { 'class': 'bold', text: 'Process Trips ' }).appendTo("#alertMsg");				
				$('<span />', { text: 'section.' }).appendTo("#alertMsg");	
			} else {				
				$('<span />', { 
							text: 'Your expense has been created, but didn\'t answer all of our questions. Please complete these questions from the '
						}).appendTo("#alertMsg");				
				$('<span />', { 'class': 'bold', text: 'Process Trips ' }).appendTo("#alertMsg");				
				$('<span />', { text: 'section.' }).appendTo("#alertMsg");	
			}
			
			// Click handler for 'OK' button
			$('#okBtn').on('click', function() {
				$('.opacity').css('display', 'none');
				$('.alert').css('display', 'none');
			});
		}
	};
} ());
