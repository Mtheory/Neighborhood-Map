

var pointsOfInterest = [
	{
		name: "Giuseppes",
		address: "8 Warwick Lane Worthing West Sussex",
		lat: 50.8121324,
		lng: -0.3704634,
		venueid: "4f36ccc3e4b0fb0dfc3c6814"
	},
	{
		name: "Spice Thai kitchen",
		address: "36 South Farm Rd Worthing West Sussex",
		lat: 50.8194879,
		lng: -0.3808021,
		venueid: "538a2b46498e3f763f51a3a3"
	},
	{
		name: "Imperial China",
		address: "Wordsworth Road Worthing West Sussex",
		lat: 50.808418,
		lng: -0.3844727,
		venueid: "4ccf1b9272106dcb6240ad99"
	},
	{
		name: "DD's Jerk 'n' Ting",
		address: "2 Colonnade House Worthing West Sussex",
		lat: 50.8121378,
		lng: -0.3687045,
		venueid: "56a3d2ad498ef6417f9fe556"
	},
	{
		name: "The Three Fishes",
		address: "56 Chapel Rd. Worthing West Sussex",
		lat: 50.8133019,
		lng: -0.3728837,
		venueid: "4c87ac68821e9eb029ce8d89"
	},
	{
		name: "Om Taste of Nepal",
		address: "67 Rowlands Rd. Worthing West Sussex",
		lat: 50.8099836,
		lng: -0.3818448,
		venueid: "502fe900e4b0648637e30f18"
	},
	{
		name: "The Cow Shed",
		address: "31 Marine Parade, Worthing West Sussex",
		lat: 50.809853,
		lng: -0.369471,
		venueid: "560c1dbc498e8ce7df380ff3"
	},
	{
		name: "Subway",
		address: "no address",
		lat: 50.8098894,
		lng: -0.3723519,
		venueid: "4baa0dd4f964a520f4463ae3"
	},
	{
		name: "The Fish Factory",
		address: "51 Brighton Rd, Worthing West Sussex",
		lat: 50.8121745,
		lng: -0.3650843,
		venueid: "4b5442c2f964a520ddb527e3"
	}
];

//VIEW MODEL
var ViewModel = function() {
	var self = this;

	self.markersList = [];
	self.userInput = ko.observable("");	

	self.errorFourSquareAPI = ko.observable("");
	self.errorDisplay = ko.observable("");
	

	// info dispaly window
	var infoPanel = "";
	self.infowindow = new google.maps.InfoWindow({
            content: infoPanel
            });

	//labels for markers
	var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var labelIndex = 0;

   	//home region map
	var map = new google.maps.Map(document.getElementById('map'), {
   		center: {lat: 50.8127056,
						lng: -0.3908446},
    	zoom: 15,
    	mapTypeId: google.maps.MapTypeId.ROADMAP
  	});

  	// craeate instance of bounds variable to control view
	var bounds = new google.maps.LatLngBounds();



	// Add marker function
	self.addMarker	= function(marker) {
    	var marker = new google.maps.Marker({       
        	position: {lat: marker.lat, lng: marker.lng},
        	// label for markers 
        	label: labels[labelIndex++ % labels.length],
        	address: marker.address,
        	map: map,  // google.maps.Map 
        	title: marker.name,
        	visible: ko.observable(true), // problem with binding text: visible???
        	selected: ko.observable(false), //problem with binding
        	venueid: marker.venueid,
        	animation: google.maps.Animation.DROP,
        	image: marker.image
    		});
    		//extending bounds for every marker
    	bounds.extend(marker.position);
    	map.fitBounds(bounds);
    	google.maps.event.addListener(marker, 'click', function() { 
 		self.selectMarker(marker); 				
    	}); 
    	return marker;  
	};

	// function for dispalaing information in infoWindows
	self.markerClickInfo = function(marker) {
		if (infowindow.marker != marker) {
			infowindow.marker = marker;
			//Style the ouput
           	var contentString = '<div class="infoWin" style="color: black;">' +
               '<h3 style="text-align: center">' + marker.title + '</h3>' +
               '<p>Address: ' +marker.address+ '</p>' +
               '<p> Likes: ' + marker.likes+  ' </p>' +
               '<img class="smImg" src="'+marker.image+'" width="100" height="100">' +                
               '<p><a href="' + marker.venueURL + '" target="_blank" style="float:right;color: #9933FF;">' + 'Link to WebPage' + '</a></p>' +
               '</div>';
			infowindow.setContent(contentString);
			infowindow.open(map, marker);
			//pan to marker position
			map.panTo(marker.getPosition());
		};
	};

	// add information from FourSquare API
	self.fourSquareAPIData =  function (marker){	
		$.ajax({
			url: "https://api.foursquare.com/v2/venues/" + marker.venueid +
							 '?client_id=ZC5Y1APXRBDGJVASQAYT0LDPTGPVTTZASC25MENSDEGOKARF&client_secret=1DDEVOKPJIWHMSVBRMX55PW2POSDUDXUWLOGOSKZGWZTVVJC&v=20160606',
		 	//url: "https://api.foursquare.com/v2/venues/502fe900e4b0648637e30f18?ll=40.7,-74&client_id=ZC5Y1APXRBDGJVASQAYT0LDPTGPVTTZASC25MENSDEGOKARF&client_secret=1DDEVOKPJIWHMSVBRMX55PW2POSDUDXUWLOGOSKZGWZTVVJC&v=20160606",	            
	        dataType: "json",
	        success: function(data){
	           	var result = data.response.venue;
	                marker.likes = result.likes.summary;	                
	                marker.venueURL = result.canonicalUrl;	  	                               
	                marker.image = self.photoUrlAssemble(result.bestPhoto.prefix, result.bestPhoto.suffix);		          			                      	         	    
        	},
	        error: function (err) {
	           	self.errorFourSquareAPI("No data received from FourSquare");
	        }
        });
	};
	
	// populate markers List with markers
	pointsOfInterest.forEach(function(restaurant){
		self.markersList.push(self.addMarker(restaurant));
	});		

	//add FourSquare information to markers
	 self.markersList.forEach(function(marker){
	  	self.fourSquareAPIData(marker);		
	 });	
	
	//select Marker 
  	self.selectMarker = function(marker) {
  		ko.utils.arrayForEach(self.markersList, function(marker) {
	    	marker.selected(false);
	    	marker.setAnimation(null);
	    });
  		self.markerClickInfo(marker);
  		marker.selected(true);
  		self.toggleBounce(marker);
  	};
	
	// Filtering user input
	self.searchResults = ko.computed(function() {
    	var q = self.userInput().toLowerCase();
    
    	// Restaurants list filtered by user input
    	var activeList =  ko.utils.arrayFilter(self.markersList, function(marker) {
        	var result = marker.title.toLowerCase().indexOf(q) == 0;
      		  return result;
      	});

    	ko.utils.arrayForEach(self.markersList, function(marker) {
	    	marker.setVisible(false);
	    });
    	//only markers listed are visible
    	ko.utils.arrayForEach(activeList, function(marker) {
    		marker.setVisible(true);
    	});

    return activeList;    
    }); 

	//Helper methods
	//Toggle Bounce animation 
	self.toggleBounce = function (marker) {
    	marker.setAnimation(google.maps.Animation.BOUNCE);
	};

	//assamble foursquare photo
	self.photoUrlAssemble = function(prefix,suffix) {
		var url="";
		if (prefix == null || suffix == null){
			url = "img/noimage.jpg"
		}	else {
			url = prefix + "100x100" + suffix;
		};
		return url ;
  	};


} // view model end


