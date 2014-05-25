var ViewReceipt = (function() {
	return {
		init : function(ref) {
			console.log("viewReceipt :: init");
		
			// do it locally for now 
			var uri = ref;
			var imageObj = new Image();
			imageObj.src = uri;
			var canvas = document.getElementById('fullReceiptImage');
			var context = canvas.getContext('2d');
			canvas.width = $( window ).width();
			canvas.height = $( window ).height();
			
			context.drawImage(imageObj, 0, 0, $(window).width(), $(window).height());
			
			$('.back').on('click', function() {
				Utils.goBackWithAnimation();
			});
		}
	};
}());