/**
 * This JavaScript file is to perform camera related operations.
 * @author Pruthvi Onkar
 */
var CameraFunctions = (function() {
	return {
		
		getPhotoFromLibrary : function(){
			
			 navigator.camera.getPicture(CameraFunctions.onPhotoSelectURISuccess, CameraFunctions.onFail,{ quality: 45, 
		        destinationType: navigator.camera.DestinationType.FILE_URI,
		        sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
		        correctOrientation: true,
		        encodingType : navigator.camera.EncodingType.JPEG,
		        targetWidth: 1024,
		        targetHeight: 1024
		        });
		},
		
		openCameraForImageCapture : function(){
			
			var onSuccess = null;
			if(Utils.isAndroid()) {
				onSuccess = CameraFunctions.onPhotoURISuccess;
			} else {
				onSuccess = CameraFunctions.onPhotoSelectURISuccess;
			}
			
			navigator.camera.getPicture(onSuccess, CameraFunctions.onFail,{ quality: 45, 
		        destinationType: navigator.camera.DestinationType.FILE_URI,
		        sourceType: navigator.camera.PictureSourceType.Camera,
		        correctOrientation: true,
		        encodingType : navigator.camera.EncodingType.JPEG,
		        targetWidth: 1024,
		        targetHeight: 1024
		        });

		},
		 
		onPhotoURISuccess : function(imageURI) {
			
				console.log(imageURI);
				Utils.addReceipt(imageURI);
				//need to transfer to expenseType page
				Utils.loadPageWithAnimation('expenseType', null, function() {
					Utils.saveCurrentPageObject(MainPage);
					ExpenseType.setReceiptURI(imageURI);
				});
		},
		 
		onFail : function(){
			console.log("Failed to get image uri");
		},
		
		/**
		 * Function specific to the album photo select as it will continuously overwrite resize.jpg.
		 * This function will copy the resize.jpg and rename it to another file and pass the file URI
		 * to expense type so it can be displayed in the app properly.
		 * @param imageURI, the initial URI for the image selected.
		 */
		onPhotoSelectURISuccess : function(imageURI) {
			console.log(imageURI);
			var cachePath = "";
			var uniqueId = "";
			// Set the cachePath to Android specific file location if device is Android
			if (Utils.isAndroid()) {
				// Get the unique timestamp name
				uniqueId = imageURI.substring(imageURI.lastIndexOf("?") + 1) + ".jpg";
				cachePath = "Android/data/com.ExpensesApp/cache";
			} else {
				uniqueId = "Pic" + new Date().getTime() + ".jpg";
				cachePath = "temporayPhotos";
			}
			
			// When the resolution of the file system is successful
			var onResolveSuccess = function(entry) {
				
				// Execute when the request for the file system is successful
				var onRequestSuccess = function(fileSys) {
					
					// Execute when the directory request is successful
					var onDirectorySuccess = function(directory) {
						
						// Copy the resize.jpg file to the same location but rename it to the unique id.jpg
						entry.copyTo(directory, uniqueId, function(newEntry) {
							console.log("success entry path: " + newEntry.fullPath);
							var selectedImageURIPath = newEntry.fullPath;
							CameraFunctions.onPhotoURISuccess(selectedImageURIPath);
						}, function(error) {
							console.log("Error code for copy: " + error.code);
						});
					};
					if (Utils.isAndroid()) {
						// Get the directory to store the new file in the same location as where all the other photos are located
						fileSys.root.getDirectory(cachePath, {create: false}, onDirectorySuccess, function(error) {
							console.log("get directory failed " + error.code);
						});
					} else {
						fileSys.root.getDirectory(cachePath, {create:true, exclusive: false},onDirectorySuccess, function(error) {
							console.log("get directory for iOS failed " + error.code);
						});
					}
				};
				
				// Request the file system to make sure the file can be stored in a persistent area
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onRequestSuccess, function(error) {
					console.log("request file system failed " + error.code);
				});
			};
			
			// Resolve the local file system to make sure that we can access the file location
			window.resolveLocalFileSystemURI(imageURI, onResolveSuccess, function(error) {
				console.log("resolve local fs failed " + error.code);
			});
		} 
	};
}());