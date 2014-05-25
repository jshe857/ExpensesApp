/**
 * JS Module containing the client side DB
 * @author Le Nguyen
 */
var DB = (function() {
	
	// Set the database name, version, display name and size
	var db = window.openDatabase("expensesDB", "1.0", "Expenses DB", 1000000);
	
	// Holds results from the database
	var expenseTypes = new Array();
	var chargeAccounts = new Array();
	
	// Error callback function for DB transactions
	function errorCB(err) {
		console.log("Error processing SQL: " + err.message);
	}
	
	function buildLists(callbackFunction) {
		expenseTypes.length = 0;
		chargeAccounts.length = 0;
		
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM ExpenseTypes', [], function(tx, results) {
				for (var i = 0; i < results.rows.length; i++) {
					var row = results.rows.item(i);
					// Setup new object
					var singleExpenseType = {};
					// Map each value to the single charge code
					$.each(["expenseTypeID", "expenseGroupID"], function(index, value) {
						singleExpenseType[value] = row[value];
					});
					expenseTypes.push(singleExpenseType);
				}
			}, errorCB);

			tx.executeSql('SELECT * FROM ChargeAccounts', [], function(tx, results) {
				for (var i = 0; i < results.rows.length; i++) {
					chargeAccounts.push(results.rows.item(i)["chargeAccountID"]);
				}
			}, errorCB);
		}, errorCB, callbackFunction());
	}
	
	return {
		/**
		 * Initialise the database
		 */
		initDB : function(callbackFunction) {
			// Create the database tables
			db.transaction(function(tx) {
				// Code to drop tables (left here for testing purposes)
//				tx.executeSql('DROP TABLE IF EXISTS ExpenseTypes');
//				tx.executeSql('DROP TABLE IF EXISTS ChargeAccounts');
//				tx.executeSql('DROP TABLE IF EXISTS AccountProjects');
//				tx.executeSql('DROP TABLE IF EXISTS Trips');
//				tx.executeSql('DROP TABLE IF EXISTS Logs');
//				tx.executeSql('DROP TABLE IF EXISTS Expenses');
				
				tx.executeSql('CREATE TABLE IF NOT EXISTS ExpenseTypes(' + 
									'expenseTypeID varchar(200) NOT NULL PRIMARY KEY,' +
									'expenseGroupID integer NOT NULL' +
									')');
				tx.executeSql('CREATE TABLE IF NOT EXISTS ChargeAccounts(' + 
									'chargeAccountID varchar(100) NOT NULL PRIMARY KEY' +
									')');						
				tx.executeSql('CREATE TABLE IF NOT EXISTS AccountProjects(' + 
									'accountProjectID integer PRIMARY KEY AUTOINCREMENT,' +
									'accountProjectCode varchar(20),' +
									'accountProjectName varchar(150),' +
									'chargeAccountID varchar(100),' +
									'FOREIGN KEY(chargeAccountID) REFERENCES ChargeAccounts(chargeAccountID)' +
									')');
				tx.executeSql('CREATE TABLE IF NOT EXISTS Trips(' + 
									'tripID integer PRIMARY KEY AUTOINCREMENT,' +
									'tripName varchar(100),' +
									'startDate date,' +
									'endDate date,' +
									'originalProcessDate date' +
									')');
				tx.executeSql('CREATE TABLE IF NOT EXISTS Logs(' + 
									'logID integer PRIMARY KEY AUTOINCREMENT,' +
									'tripID integer,' +
									'email varchar(50),' +
									'processDate date,' +
									'FOREIGN KEY(tripID) REFERENCES Trips(TripID)' +
									')');
				tx.executeSql('CREATE TABLE IF NOT EXISTS Expenses(' + 
									'expenseID integer PRIMARY KEY AUTOINCREMENT,' + 
									'expenseTypeID varchar(200),' +
									'accountProjectID integer,' +
									'receipt varchar(200),' +
									'tripID integer,' +
									'FOREIGN KEY(accountProjectID) REFERENCES AccountProjects(accountProjectID)' +
									')');
			}, errorCB, function() {
				var isEmpty = false;
				// Check if there is data in the DB
				db.transaction(function(tx) {
					tx.executeSql('SELECT * FROM ExpenseTypes', [], function(tx, results) {
						if (results.rows.length == 0) {
							isEmpty = true;
						}
					}, errorCB);
				}, errorCB, function() {
					if (isEmpty) {
						db.transaction(function(tx) {
							// Load data into ExpenseTypes table
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Agency Transaction Fee", 0)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Air Travel (Expensed)", 0)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Other Air Expense", 1)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Additional Airline Costs", 1)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Additional Airline Departure Fee", 1)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Air Travel (Unused)", 1)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("External Party Business Meal", 0)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Car Rental/Hire - Gasoline/Petrol", 0)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("External Party Entertainment", 0)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Group Events", 2)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Group Meal", 0)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Quarter Century Club - Gift", 0)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Quarter Century Club - Meal", 0)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Retirement - Gift", 0)');					
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Retirement - Meal", 0)');					
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Emergency Purchases", 3)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Office Supplies", 3)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Postage", 3)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Emergency Supplies", 3)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("PC Supplies", 3)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Reproduction and Graphics", 3)');																			
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Hotel", 0)');													
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Employee Meal (Non Reimbursable Card Expenses)", 0)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Public Transportation", 0)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Telecom/Mobile Employee Expenses", 4)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Home Business Telephone Service & Associated Calls", 4)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Cellular Phones - Service & Calls", 4)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Remote Access - Dial Up - Restricted Use", 4)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Remote Access - Wireless PC Data Card Service", 4)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Remote Access - WIFI Connection Fees", 4)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Remote Access - DSL - Restricted Use", 4)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Home Business Phone - Purchase", 4)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Smartphone Service & Calls (Both voice and data)", 4)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Business Calls - Calling Card (Non Cellular)", 4)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Remote Access - Cable - Restricted Use", 4)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Other Travel Expenses", 5)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Parking - FBT", 5)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Parking - No FBT", 5)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("ATM Fee / Commissions", 5)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Currency Loss", 5)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Laundry", 5)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Substitution of Lodging", 5)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Passport Fees", 5)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("None of the above travel expenses", 5)');											
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Other Non-Travel Expenses", 6)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Books and Publications", 6)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Corporate Card Late Fees", 6)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Education Related Expenses", 6)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Professional Membership", 6)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Conference Fee", 6)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Publication Subscriptions", 6)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Tender Documents", 6)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("None of the above non-travel expenses", 6)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Domestic Assignment Expenses", 7)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Air Travel", 7)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Car Rental", 7)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Ground Transportation", 7)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Business Travel - Immigration Services / Visa", 8)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Business Travel - Visa", 8)');
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("Business Travel - Immigration Services", 8)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("External Party Air Travel", 0)');								
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("External Party Other Air Expense", 0)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("External Party Hotel", 0)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("External Party Car Rental / Hire", 0)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("External Party Ground Transportation", 0)');							
							tx.executeSql('INSERT INTO ExpenseTypes VALUES ("External Party Conference / Event Fees", 0)');
	
							// Load data into ChargeAccounts table
							tx.executeSql('INSERT INTO ChargeAccounts VALUES ("Special Accounting Charge Codes")');
							tx.executeSql('INSERT INTO ChargeAccounts VALUES ("Services Project (BMS)")');
							tx.executeSql('INSERT INTO ChargeAccounts VALUES ("Non-Project International (ICA)")');
							tx.executeSql('INSERT INTO ChargeAccounts VALUES ("SAP WBSElement")');
							
							// Load data into AccountProjects table
							tx.executeSql('INSERT INTO AccountProjects VALUES (1, "Default Accounting", null, null)');							
						}, errorCB);
					}
					buildLists(callbackFunction);	
				});					
			});
		},
		
		/**
		 * Retrieves all expense types
		 * 
		 * @return  An array of expense type objects
		 */
		getExpenseTypes : function() {
			return expenseTypes;
		},
		
		/**
		 * Retrieves all charge account codes
		 * 
		 * @return  An array of charge account code objects
		 */
		getChargeAccountCodes : function() {
			return chargeAccounts;
		},
				
		/**
		 * Retrieves all client codes
		 * 
		 * @return  An array of account/project code objects
		 */
		getClientCodes : function(callback) {
			db.transaction(function(tx) {
				var query = 'SELECT accountProjectID, accountProjectCode, accountProjectName, chargeAccountID FROM AccountProjects';
				tx.executeSql(query, [], function(tx, results) {
					var accountsProjectsList = new Array();
					for (var i = 0; i < results.rows.length; i++) {
						var row = results.rows.item(i);
						// Setup new object
						var singleAccountProject = {};
						// Map each value to the single trip
						$.each(["accountProjectID", "accountProjectCode", "accountProjectName", "chargeAccountID"], function(index, value) {
							singleAccountProject[value] = row[value];
						});
						accountsProjectsList.push(singleAccountProject);
					}
					// Run the call function to return the array
					if (callback) {
						callback(accountsProjectsList);						
					}
				}, errorCB);
			}, errorCB);
		},
		
		/**
		 * Retrieves all unprocessed trips for Process Trips screen
		 * 
		 * @return  An array of unprocessed trip objects ordered by descending order of trip start date
		 */
		getUnprocessedTrips : function(callback) {	
			db.transaction(function(tx) {
				var query = 'SELECT tripID, tripName, startDate, endDate FROM Trips WHERE originalProcessDate IS NULL ORDER BY startDate, endDate DESC';
				tx.executeSql(query, [], function(tx, results) {
					var unprocessedTripsList = new Array();
					for (var i = 0; i < results.rows.length; i++) {
						var row = results.rows.item(i);
						var singleUnprocessedTrip = {};
						$.each(["tripID", "tripName", "startDate", "endDate"], function(index, value) {
							singleUnprocessedTrip[value] = row[value];
						});
						unprocessedTripsList.push(singleUnprocessedTrip);
					}
					if (callback) {
						callback(unprocessedTripsList);						
					}
				}, errorCB);
			}, errorCB);
		},
		
		/**
		 * Retrieves one entry from the DB with the specified trip ID
		 * 
		 * @param   selectedTrip  The trip ID that needs to be fetched
		 * @return                A single entry in the Trips table
		 */
		getTrip : function(selectedTripInput, callback) {
			// Convert the input into an int if not already an int
			var selectedTrip = selectedTripInput && selectedTripInput.seq ? selectedTripInput.seq : selectedTripInput;
			db.transaction(function(tx) {
				var query = 'SELECT tripName, startDate, endDate, originalProcessDate FROM Trips WHERE tripID = ' + selectedTrip;
				tx.executeSql(query, [], function(tx, results) {
					var row = results.rows.item(0);
					
					if (callback) {
						callback(row);
					}
				}, errorCB);
			}, errorCB);
		},
		
		/**
		 * Retrieves all processed trips for History screen
		 * 
		 * @return  An array of processed trip objects ordered by descending order of processed date
		 */
		getProcessedTrips : function(callback) {
			db.transaction(function(tx) {
				var query = 'SELECT tripID, tripName, startDate, endDate FROM Trips WHERE originalProcessDate IS NOT NULL ORDER BY originalProcessDate DESC';
				tx.executeSql(query, [], function(tx, results) {
					var processedTripsList = new Array();
					for (var i = 0; i < results.rows.length; i++) {
						var row = results.rows.item(i);
						var singleProcessedTrip = {};
						$.each(["tripID", "tripName", "startDate", "endDate"], function(index, value) {
							singleProcessedTrip[value] = row[value];
						});
						processedTripsList.push(singleProcessedTrip);
					}
					if (callback) {
						callback(processedTripsList);						
					}
				}, errorCB); 
			}, errorCB);
		},
		
		/**
		 * Retrieves the processed date from the selected trip
		 * 
		 * @return a string of the processed date
		 */
		getProcessedDate : function(selectedTripInput, callback) {
			// Convert the input into an int if not already an int
			var selectedTrip = selectedTripInput && selectedTripInput.seq ? selectedTripInput.seq : selectedTripInput;
			db.transaction(function(tx) {
				var query = 'SELECT originalProcessDate FROM Trips WHERE tripID=' + selectedTrip;
				tx.executeSql(query,[], function(tx, results) {
					var row = results.rows.item(0);
					if (callback) {
						callback(row);
					}
				}, errorCB);
			}, errorCB);
		},
		
		/**
		 * Retrieves email logs for a single trip
		 * 
		 * @param   tid  Unique trip ID
		 * @return       An array of log objects ordered by descending order of processed date
		 */
		getEmailLogs : function(tid, callback) {
			db.transaction(function(tx) {
				var query = 'SELECT email, processDate FROM Logs WHERE tripID = ' + tid + ' ORDER BY processDate DESC, logID DESC';
				tx.executeSql(query, [], function(tx, results) {
					var logsList = new Array();
					for (var i = 0; i < results.rows.length; i++) {
						var row = results.rows.item(i);
						var singleLog = {};
						$.each(["email", "processDate"], function(index, value) {
							singleLog[value] = row[value];
						});
						logsList.push(singleLog);
					}
					if (callback) {
						callback(logsList);						
					}
				}, errorCB);
			}, errorCB);
		},
		
		/**
		 * Retrieves the latest 2 emails from the logs table
		 * 
		 * @return		A single object containing the email address
		 */
		getLastEmail : function(callback) {
			db.transaction(function(tx) {
				var query = 'SELECT email FROM Logs ORDER BY logID DESC';
				tx.executeSql(query, [], function(tx, results) {
					var email = new Array();
					for (var i = 0; i < results.rows.length; i++) {
						email.push(results.rows.item(i));
					}
					
					if (callback) {
						callback(email);						
					}
				}, errorCB);
			}, errorCB);
		},
						
		/**
		 * Retrieves all unassociated expenses
		 * 
		 * @return  An array of unassociated expense objects
		 */
		getUnassociatedExpenses : function(callback) {
			db.transaction(function(tx) {
				var query = 'SELECT e.expenseID, e.expenseTypeID, e.accountProjectID, a.accountProjectCode, a.accountProjectName, e.receipt ' +
								'FROM Expenses AS e ' + 
								'LEFT JOIN AccountProjects AS a ' + 
								'ON e.accountProjectID = a.accountProjectID ' + 
								'WHERE e.tripID IS NULL OR e.tripID="null"';
				tx.executeSql(query, [], function(tx, results) {
					var unassociatedExpensesList = new Array();
					for (var i = 0; i < results.rows.length; i++) {
						var row = results.rows.item(i);
						var singleUnassociatedExpense = {};
						$.each(["expenseID", "expenseTypeID", "accountProjectID", "accountProjectCode", "accountProjectName", "receipt"], function(index, value) {
							singleUnassociatedExpense[value] = row[value];
						});
						unassociatedExpensesList.push(singleUnassociatedExpense);
					}
					if (callback) {
						callback(unassociatedExpensesList);						
					}
				}, errorCB);
			}, errorCB);
		},
				
		/**
		 * Retrieves all expenses associated with a trip
		 * 
		 * @param   tid  Unique trip ID
		 * @return       An array of expense objects
		 */
		getTripExpenses : function(tid, callback) {
			db.transaction(function(tx) {
				var query = 'SELECT e.expenseID, e.expenseTypeID, a.accountProjectCode, a.accountProjectName, e.receipt ' + 
								'FROM Expenses AS e ' + 
								'LEFT JOIN AccountProjects AS a ' +
								'ON e.accountProjectID = a.accountProjectID ' + 
								'WHERE e.tripID = ' + tid;
				tx.executeSql(query, [], function(tx, results) {
					var tripExpensesList = new Array();
					for (var i = 0; i < results.rows.length; i++) {
						var row = results.rows.item(i);
						var singleTripExpense = {};
						$.each(["expenseID", "expenseTypeID", "accountProjectCode", "accountProjectName", "receipt"], function(index, value) {
							singleTripExpense[value] = row[value];
						});
						tripExpensesList.push(singleTripExpense);
					}
					if (callback) {
						callback(tripExpensesList);						
					}
				}, errorCB);
			}, errorCB);
		},
		
		/**
		 * Retrieves details of a single expense
		 * 
		 * @param   eid  Unique expense ID
		 * @return       A single expense object
		 */
		getExpense : function(eid, callback) {
			// Convert either the id object into an int or take just the int value
			var expenseID = eid && eid.seq ? eid.seq : eid;
			if (expenseID) {
				db.transaction(function(tx) {
					var query = 'SELECT e.expenseID, e.expenseTypeID, e.accountProjectID, a.accountProjectCode, a.accountProjectName, e.receipt, e.tripID ' +
								'FROM Expenses AS e ' + 
								'LEFT JOIN AccountProjects AS a ' +
								'ON e.accountProjectID = a.accountProjectID ' +
								'WHERE expenseID = ' + expenseID;
					tx.executeSql(query, [], function(tx, results) {
						var row = results.rows.item(0);
						var singleExpense = {};
						$.each(["expenseID", "expenseTypeID", "accountProjectID", "accountProjectCode", "accountProjectName", "receipt", "tripID"], function(index, value) {
							singleExpense[value] = row[value];
						});					
						if (callback) {
							callback(singleExpense);						
						}
					}, errorCB);
				}, errorCB);
			} else {
				if (callback) {
					callback(null);
				}
			}
			
		},
		
		/**
		 * Retrieves the name of a trip
		 * 
		 * @param   tid  Unique trip ID
		 * @return       The name of the specified trip
		 */
		getTripName : function(tid, callback) {
			db.transaction(function(tx) {
				var query = 'SELECT tripName FROM Trips WHERE tripID = ' + tid;
				tx.executeSql(query, [], function(tx, results) {
					var row = results.rows.item(0);
					var trip = {};
					$.each(["tripName"], function(index, value) {
						trip[value] = row[value];
					});					
					if (callback) {
						callback(trip);						
					}
				}, errorCB);
			}, errorCB);
		},
		
		/**
		 * Retrieves all previously entered email addresses
		 * 
		 * @return  An array of email addresses ordered by descending order of use date
		 */
		
		getEmailAddresses : function(callback) {
			db.transaction(function(tx) {
				var query = 'SELECT email FROM Logs ORDER BY processDate DESC';
				tx.executeSql(query, [], function(tx, results) {
					var emailAddressList = new Array();
					for (var i = 0; i < results.rows.length; i++) {
						var row = results.rows.item(i);
						var singleEmailAddress = {};
						$.each(["email"], function(index, value) {
							singleEmailAddress[value] = row[value];
						});
						emailAddressList.push(singleEmailAddress);
					}					
					if (callback) {
						callback(emailAddressList);
					}
				}, errorCB);
			}, errorCB);
		},
		
		/**
		 * Gets details of a client code
		 * 
		 * @param   apid  Unique account/project ID
		 * @return        A client code object
		 */
		getClientCode : function(apid, callback) {
			db.transaction(function(tx) {
				var query = 'SELECT accountProjectCode, accountProjectName, chargeAccountID FROM AccountProjects WHERE accountProjectID = "' + apid + '"';
				tx.executeSql(query, [], function(tx, results) {
					var row = results.rows.item(0);
					var singleClientCode = {};
					$.each(["accountProjectCode", "accountProjectName", "chargeAccountID"], function(index, value) {
						singleClientCode[value] = row[value];
					});					
					if (callback) {
						callback(singleClientCode);						
					}
				}, errorCB);
			}, errorCB);
		},
		
		/**
		 * Adds a client code
		 * 
		 * @param  apCode      Unique account/project ID
		 * @param  apName      Name of the account/project
		 * @param  chargeCode  The charge code
		 */
		addClientCode : function(apCode, apName, chargeCode, callback) {
			db.transaction(function(tx) {
				if (apCode != null && chargeCode != null) {
					tx.executeSql('INSERT INTO AccountProjects VALUES (null, "' + apCode + '", "' + apName + '", "' + chargeCode + '")');
				} else if (apCode != null && chargeCode == null) {
					tx.executeSql('INSERT INTO AccountProjects VALUES (null, "' + apCode + '", "' + apName + '", null)');
				} else if (apCode == null && chargeCode != null) {
					tx.executeSql('INSERT INTO AccountProjects VALUES (null, null, "' + apName + '", "' + chargeCode + '")');
				} else if (apCode == null && chargeCode == null) {
					tx.executeSql('INSERT INTO AccountProjects VALUES (null, null, "' + apName + '", null)');
				}
			}, errorCB, function() {
				if (callback) {
					callback(apCode);
				};
			});
		},
		
		/**
		 * Adds an expense
		 * 
		 * @param  etid     Unique expense type ID
		 * @param  apid     Unique account/project ID
		 * @param  receipt  The image file path
		 * @param  tid	    Unique trip ID
		 */
		addExpense : function(etid, apid, receipt, tid, callback) {
			db.transaction(function(tx) {
				tx.executeSql('INSERT INTO Expenses VALUES (null, "' + etid + '", "' + apid + '", "' + receipt + '", ' + tid + ')');
				var query = 'SELECT seq FROM sqlite_sequence WHERE name="Expenses"';
				tx.executeSql(query, [], function(tx, results) {
					var row = results.rows.item(0);
					var rowid = {};
					$.each(["seq"], function(index, value) {
						rowid[value] = row[value];
					});
					if (callback) {
						callback(rowid);
					}
				}, errorCB);				
			}, errorCB);
		},

		/**
		 * Adds a new trip
		 * 
		 * @param  tName   Name/description of trip
		 * @param  tStart  Trip start date
		 * @param  tEnd	   Trip end date
		 */
		addTrip : function(tName, tStart, tEnd, callback) {
			db.transaction(function(tx) {
				tx.executeSql('INSERT INTO Trips VALUES (null, "' + tName + '", "' + tStart + '", "' + tEnd + '", null)');
				var query = 'SELECT seq FROM sqlite_sequence WHERE name="Trips"';
				tx.executeSql(query, [], function(tx, results) {
					var row = results.rows.item(0);
					var rowid = {};
					$.each(["seq"], function(index, value) {
						rowid[value] = row[value];
					});
					if (callback) {
						callback(rowid);
					}
				}, errorCB);
			}, errorCB);
		},
					
		/**
		 * Updates an expense
		 * 
		 * @param  eid      Unique expense ID
		 * @param  etid	    Unique expense type ID
		 * @param  apid     Unique account/project ID
		 * @param  receipt  The image file path
		 * @param  tid      Unique trip ID
		 */
		updateExpense : function(eid, etid, apid, receipt, tid, callback) {
			db.transaction(function(tx) {
				tx.executeSql('UPDATE Expenses SET expenseTypeID = "' + etid + '", accountProjectID = "' + apid + '", receipt = "' + receipt + '", tripID = "' + tid + '" WHERE expenseID = ' + eid);
			}, errorCB, function() {
				if (callback) {
					callback();
				};
			});
		},
 		
		/**
		 * Updates details of a single trip
		 * 
		 * @param  tid     Unique trip ID
		 * @param  tName   Name/description of trip
		 * @param  tStart  Trip start date
		 * @param  tEnd	   Trip end date
		 */
		updateTrip : function(tid, tName, tStart, tEnd, callback) {
			db.transaction(function(tx) {
				tx.executeSql('UPDATE Trips SET tripName = "' + tName + '", startDate = "' + tStart + '", endDate = "' + tEnd + '" WHERE tripID = ' + tid);
			}, errorCB, function() {
				if (callback) {
					callback();
				};
			});
		},

		/**
		 * Sets a trip as "processed"
		 * 
		 * @param  tid   Unique trip ID
		 * @param  date  Trip processing date
		 */
		processTrip : function(tid, date, callback) {
			db.transaction(function(tx) {
				tx.executeSql('UPDATE Trips SET originalProcessDate = "' + date + '" WHERE tripID = ' + tid);
			}, errorCB, function() {
				if (callback) {
					callback();
				};
			});
		},
		
		/**
		 * Logs a trip
		 * 
		 * @param  tid          Unique trip ID
		 * @param  email        Recipient email address
		 * @param  processDate  Date trip was processed
		 */
		logTrip : function(tid, email, processDate, callback) {
			db.transaction(function(tx) {
				tx.executeSql('INSERT INTO Logs VALUES (null, '  + tid + ', "' + email + '", "' + processDate + '")');
			}, errorCB, function() {
				if (callback) {
					callback();
				};
			});
		},
		
		/**
		 * Deletes a client code
		 * 
		 * @param  apid  Unique account/project ID
		 */
		deleteClientCode : function(apid, callback) {
			db.transaction(function(tx) {
				tx.executeSql('DELETE FROM AccountProjects WHERE accountProjectID = "' + apid + '"'); 
			}, errorCB, function() {
				if (callback) {
					callback();
				};
			});
		},
		
		/**
		 * Deletes an expense
		 * 
		 * @param  eid  Unique expense ID
		 */
		deleteExpense : function(eid, callback) {
			db.transaction(function(tx) {
				tx.executeSql('DELETE FROM Expenses WHERE expenseID = ' + eid); 
			}, errorCB, function() {
				if (callback) {
					callback();
				};
			});
		},
		
		/**
		 * Deletes a trip and all its associated expenses and logs
		 * 
		 * @param  tid  Unique trip ID
		 */
		deleteTrip : function(tid, callback) {
			db.transaction(function(tx) {
				tx.executeSql('DELETE FROM Expenses WHERE tripID = ' + tid); 
				tx.executeSql('DELETE FROM Logs WHERE tripID = ' + tid); 
				tx.executeSql('DELETE FROM Trips WHERE tripID = ' + tid); 
			}, errorCB, function() {
				if (callback) {
					callback();
				};
			});
		}
	};
}());