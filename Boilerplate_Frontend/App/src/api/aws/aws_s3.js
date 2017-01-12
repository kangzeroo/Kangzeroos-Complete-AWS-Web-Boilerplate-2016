// AWS S3 (Simple Scalable Storage) for storing files on the cloud
import {BUCKET_NAME} from './aws_profile'

// we create an S3 album for each user that is passed in as an argument
export function createUserS3Album(albumName){
	const p = new Promise((res, rej)=>{
      // grab the credentials for this Cognito user (only necessary if we have set our S3 permissoins to only allow Cognito users to upload/delete)
      // if your use case allow ANYONE to create/delete files, then you do not need to grab AWS credentials
	    AWS.config.credentials.refresh(function(){
				console.log('CREATING USER S3 ALBUM...')
        // after refreshing, create an S3 object from AWS
  			const S3 = new AWS.S3()
        // reject the promise if the albumName is missing
  			if (!albumName) {
  				const msg = 'Please provide a valid album name'
  		    	// console.log(msg);
  		    	rej(msg)
            return
  		  }
        // clean up the albumName so that there are no spaces
  			albumName = albumName.trim();
        // make sure the album name has no slashes, as this is used by S3 to determine folder heirarchy
  			if (albumName.indexOf('/') !== -1) {
  				  const msg = 'Album names cannot contain slashes.'
  			    // console.log(msg);
  			    rej(msg)
            return
  			}
        // to ensure the passed in albumName is compliant with S3 naming conventions (and web browser uri naming), we will URI encode the albumName
		  	const albumKey = encodeURIComponent(albumName) + '/';
        // now create a params object to represent the folder. we only need to specify the S3 bucket and the albumKey (aka the albumName after URI encoding )
		  	const params = {
		  		Bucket: BUCKET_NAME,
		  		Key: albumKey
		  	}
				console.log("about to head an S3 object")
        // to create a folder, we use the special S3 function `headObject()` and pass in our params
		  	S3.headObject(params, function(err, data) {
			    if (!err) {
			    	const msg = 'Album already exists.'
			    	console.log(msg);
			      	res()
							return
			    }
			    if (err.code !== 'NotFound') {
			    	const msg = 'There was an error creating your album: ' + err.message
			    	// console.log(msg);
			      	rej()
			      	return
			    }
					if(err){
				    const albumParams = {
				    	...params,
				    	ACL: "bucket-owner-full-control",
				    	StorageClass: "STANDARD"
				    }
				    S3.putObject(params, function(err, data) {
								console.log('CREATING USER FOLDER...')
				      	if (err) {
				      		const msg = 'There was an error creating your album: ' + err.message
				      		// console.log(msg);
				        	rej(msg)
				        	return
				      	}
				      	// console.log('Successfully created album.')
				      	res('Successfully created album.');
				    });
					}
		  	});
		})
	})
	return p
}

// export an object to S3 by passing in the foldername (which is the email) and the files to be uploaded
export function uploadImageToS3(email, files){
	const p = new Promise((res, rej)=>{
			// check that there are actually files being passed in
	  	if (!files.length || files.length == 0) {
   			const msg = 'Please choose a file to upload first.'
   			rej(msg)
		  }
			// refresh the aws credentials so that we can upload with the correct Cognito permissions
	    AWS.config.credentials.refresh(function(){
				// instantiate the new S3 object for calling functions from
				const S3 = new AWS.S3()
				// create an array to hold all the uploaded S3 object urls
				const S3ImageObjs = []
				// create a counter so that we can return the S3ImageObjs at the end of the `for` loop
				let uploadedCount = 0
				// loop through all the files and upload them
				for(let f = 0; f<files.length; f++){
					// these are the parameters that are necessary for upload
					// first the file itself, aka all the raw data
					const file = files[f];
					// then the file name (in this case, images uploaded via our React Dropzone component automatically have a filename saved in file.name. your structure may differ, but the concept is the same)
					const fileName = file.name;
					// in order to have the correct foldername prefix, we must again URI encode the user's email (as this was the foldername)
					const albumPhotosKey = encodeURIComponent(email) + '/';
					// optional: we create a datestamp to guarantee the same file is not uploaded twice
					const timestamp = new Date().getTime()/1000

					// finally we create the file's name (aka the key of the key-value pair)
					const photoKey = albumPhotosKey + "--" + timestamp + "--" + fileName;
					// now we call S3.upload() and pass in our parameters
					// ACL is set to 'public-read' which means this file will by default be readable by anyone
					S3.upload({
							Bucket: BUCKET_NAME,
					    Key: photoKey,
					    Body: file,
					    ACL: 'public-read'
					}, function(err, data) {
							// reject the promise if there is an error
					    if (err) {
					      	const msg = 'There was an error uploading your photo: '+ err.message
					      	// console.log(msg)
					      	rej(msg)
					      	return
					    }
					    const msg = 'Successfully uploaded photo: ' + fileName
					    // if the upload was successful, then add it to the S3ImageObjs array we created earlier
					    S3ImageObjs.push({
					    	photoKey: photoKey,
					    	url: data.Location
					    })
							// inrement the upload count
					    uploadedCount++
					    // if our upload counter shows that we have reached the last file, we will resolve the promise with the array
					    if(uploadedCount==files.length){
					    	// console.log(S3ImageObjs)
						    res(S3ImageObjs)
							}
					})
				}
		})
	})
	return p
}
