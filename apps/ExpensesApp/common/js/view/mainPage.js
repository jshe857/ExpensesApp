/**
 * JavaScript file that will handle loading and executing items related to the login page.
 * @author Andrew Lee
 */

var MainPage = (function() {
	return {
		init : function() {
			console.log("MainPage :: init");
			
			if(Utils.isiOS7()){
				$('.contentHome').bind('touchmove', function(e){e.preventDefault();});
			}
			
			// Add handlers
			$('#processTrip').on('click',function() {
				// Load the new page
				Utils.loadPageWithAnimation('processTrips', null, function() {
					Utils.saveCurrentPageObject(MainPage);
					ProcessTrips.init();
				});
			});
			$('#history').on('click',function() {
				// Load the new page
				Utils.loadPageWithAnimation('history', null, function() {
					Utils.saveCurrentPageObject(MainPage);
					History.init();
				});
			});
			$('#addExpense').on('click',function() {
				// Display the attachment modal
				displayAttachmentOptions();
			});
			$('#closeAttachmentOptions').on('click',function() {
				// Close the attachment modal
				closeAttachmentOptions();
			});		
			$('#openCamera').on('click',function() {
				// Close the attachment modal
				CameraFunctions.openCameraForImageCapture();
			});	
			$('#openLibrary').on('click',function() {
				// Close the attachment modal
				CameraFunctions.getPhotoFromLibrary();
			});	
			$('#noReceipt').on('click',function() {
				// Load the new page
				Utils.loadPageWithAnimation('expenseType', null, function() {
					Utils.saveCurrentPageObject(MainPage);
					ExpenseType.init();
				});
			});
		}
	};
}());

function displayAttachmentOptions(){
	$('.attachReceipt').css('display','block');
	$('.opacity').css('display','block');
	if(Utils.isiOS7()){
	$('.attachReceipt').animate({bottom:'20px'}, 500);
	}
	else{
		$('.attachReceipt').animate({bottom:'0px'}, 500);	
	}
}

function closeAttachmentOptions(){
	$('.opacity').css('display','none');
	$('.needs').animate({paddingTop:'5px'}, 500, function() { 
		$('.have').css("display","block");
		});
	
	$('.attachReceipt').animate({bottom:'-210px'}, 500, function() { 
		$('.attachReceipt').css("display","none");
	});
}
