var Test = (function() {
	return {
		init : function() {
			console.log("Test :: init");
			$('#test').on('click', function() {
				var link = "mailto:andrew.lee2612@gmail.com?subject="+escape("This is my subject") +"&body=" + escape("Just some text that i want to try emailing");
				window.location.href = link;
			});
			
			$('#backToProcessTrips').on('click', function() {
				Utils.goBackWithAnimation(null);
			});
		}
	};
}());