/**
 * This is used to hold information about what the current image URI should be. Used exclusively by ExpenseType
 */

var ImageURI = (function() {
	var currentImageURI = null;
	return {
		/**
		 * Function to set the image URI for later use
		 * @param imageURI, the image URI that will be used
		 */
		setCurrentImageURI : function(imageURI) {
			currentImageURI = imageURI;
		},
		
		/**
		 * Get the current image URI
		 * @return the image URI
		 */
		getCurrentImageURI : function() {
			return currentImageURI;
		},
		
		/**
		 * Function to reset the current image URI so it is ready for the next
		 * image URI
		 * @param none
		 */
		resetCurrentImageURI : function() {
			currentImageURI = null;
		}
	};
}());