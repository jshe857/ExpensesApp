/**
 * This JavaScript file is to help the page change as it requires animation and to keep
 * track of which container it should be using.
 * @author Andrew Lee
 */

var PageChangeHelper = (function() {
	var contentPage = "#content-page",
		contentPage2 = "#content-page-2",
		currentContainer = contentPage;
	return {
		/**
		 * Method that will toggle between the current container and the secondary container.
		 */
		toggleCurrentContainer : function() {
			if (currentContainer == contentPage) {
				currentContainer = contentPage2;
			} else {
				currentContainer = contentPage;
			}
		},
		
		/**
		 * Method that will return what the current active container is.
		 * @return String the current active container.
		 */
		getCurrentContainer : function() {
			return currentContainer;
		},
		
		/**
		 * Method that will return the other container depending on which is the active container.
		 * @return String the other container.
		 */
		getOtherContainer : function() {
			if (currentContainer == contentPage) {
				return contentPage2;
			} else {
				return contentPage;
			}
		},
	};
}());
