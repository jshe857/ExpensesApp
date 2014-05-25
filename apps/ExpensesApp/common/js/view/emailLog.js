/**
 * This is the JavaScript controller for the Email Logs screen.
 */

var EmailLog = (function() {
	return {
		init : function(tid) {
			console.log("EmailLog :: init");
			
			// Get a reference to the outer container
			var logList = $("#emailList");

			DB.getEmailLogs(tid, function(data){
				
				// Build email history as a list of email and date pairs
				for(var i=0; i<data.length; i++){
					
					// Container for each log item
					var logItem = $('<li />');
					
					// Setup the email field elements
					var emailContainer = $('<div />');
					var emailLabel = $('<span />', { 'class': 'bold', text: 'Email' });
					var emailValue = $('<span />', { text: data[i].email });
					emailLabel.appendTo(emailContainer);
					emailValue.appendTo(emailContainer);
					emailContainer.appendTo(logItem);
					
					// Setup the horizontal rule separator
					var separator = $('<span />', { 'class': 'hr' });
					separator.appendTo(logItem);
					
					// Setup the date field elements
					var dateContainer = $('<div />');
					var dateLabel = $('<span />', { 'class': 'bold', text: 'Date' });
					var processDate = (data[i].processDate).split('-');					
					var dateValue = $('<span />', { text: processDate[2] + '-' + processDate[1] + '-' + processDate[0] });
					dateLabel.appendTo(dateContainer);
					dateValue.appendTo(dateContainer);
					dateContainer.appendTo(logItem);
					
					// Add the log to the list of logs
					logItem.appendTo(logList);
				}
				$('#emailList').listview('refresh');
				
			});
			
			$('#cancelBtn').on('click', function() {
				Utils.goBackWithAnimation();
			});
		}
	};
}());