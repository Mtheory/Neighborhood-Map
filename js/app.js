//MODEL

var restaurants = [
	{
		name: "Giuseppes",
		address: "8 Warwick Lane Worthing West Sussex",
		lat: 50.8121324,
		lng: -0.3704634,
		show: true,
		venueid: "4f36ccc3e4b0fb0dfc3c6814",
		image: "https://igx.4sqi.net/img/general/300x300/33149580_lyaSikfahuuTXc3ak_RGhle6-rOlrjpxsTN8w1OD"
	},
	{
		name: "Spice Thai kitchen",
		address: "36 South Farm Rd Worthing West Sussex",
		lat: 50.8194879,
		lng: -0.3808021,
		show: true,
		venueid: "538a2b46498e3f763f51a3a3",
		image: "http://pixabay.com/get/8926af5eb597ca51ca4c/1433440765/cheeseburger-34314_1280.png?direct"
	},
	{
		name: "Imperial China",
		address: "Wordsworth Road Worthing West Sussex",
		lat: 50.808418,
		lng: -0.3844727,
		show: true,
		venueid: "4ccf1b9272106dcb6240ad99",
		image: "https://igx.4sqi.net/img/general/300x300/5460537_Z0m9jpiIis7wG67apPO-Oqw-dSqAHd7TsR9o0kXnC"
	},
	{
		name: "DD's Jerk 'n' Ting",
		address: "2 Colonnade House Worthing West Sussex",
		lat: 50.8121378,
		lng: -0.3687045,
		show: true,
		venueid: "56a3d2ad498ef6417f9fe556",
		image: "https://igx.4sqi.net/img/general/300x300/3520194_lDcja4CnbSIP9d9f3TmWunRNSfkKttgWhsy_otDQh"
	},
	{
		name: "The Three Fishes",
		address: "56 Chapel Rd. Worthing West Sussex",
		lat: 50.8133019,
		lng: -0.3728837,
		show: true,
		venueid: "4c87ac68821e9eb029ce8d89",
		image: "https://igx.4sqi.net/img/general/300x300/148282181_SUi2DYzmaCp6w4UToY_xm68J-h4Smmiv7fqUk_k"
	},
	{
		name: "Om Taste of Nepal",
		address: "67 Rowlands Rd. Worthing West Sussex",
		lat: 50.8099836,
		lng: -0.3818448,
		show: true,
		venueid: "502fe900e4b0648637e30f18",
		image: "https://igx.4sqi.net/img/general/300x300/3520194_k8GOU8D_a69pycgzKK73LP0eUIN9-2YmMqWaeGczBsg.jpg"
	}
];


//VIEW MODEL
var ViewModel = function() {
	var self = this;

	this.locationsArray = ko.observableArray();
	var markersList = [];
	self.errorDisplay = ko.observable("");
	self.pointList = ["Point1","Point2","Point3","Point4","Point5","Point6"];


	// dispaly window
	var infoPanel = "";
	self.infowindow = new google.maps.InfoWindow({
            content: infoPanel
            });
	//labels for markers
	var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var labelIndex = 0;

   	//home map 
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
        	map: map,  // google.maps.Map 
        	title: marker.name,
        	show: marker.show,
        	venueid: marker.venueid,
        	animation: google.maps.Animation.DROP
    		});
    		//extending bounds for every marker
    	bounds.extend(marker.position);
    	map.fitBounds(bounds);
    	google.maps.event.addListener(marker, 'click', function() { 
 		self.displayInfo(marker); 				
    	}); 
    	return marker;  
	};

	// function for dispalaing information in infoWindows
	self.displayInfo = function(marker) {
		if (infowindow.marker != marker) {
				infowindow.marker = marker;
				var content = 'dgdgdg'
				infowindow.setContent(content);
				infowindow.open(map, marker);
				//pan to marker position
				map.panTo(marker.getPosition());
				//marker.setMap(null);
		};
	};



	// change animation function
	self.toggleBounce = function (marker) {
  		if (marker.getAnimation() !== null) {
    		marker.setAnimation(null);
  		} else {
    		marker.setAnimation(google.maps.Animation.BOUNCE);
  		};
	};
	
	// populate markers List with markers
	restaurants.forEach(function(restaurant){
		markersList.push(self.addMarker(restaurant));
	});	

	//to add API information to each marker
	self.addFourSqAPI = function(givenMapMarker) {
     $.ajax({
	            url: "https://api.foursquare.com/v2/venues/" + givenMapMarker.venueid +
							 '?client_id=GE0SZ0HF35JPSWTLVAJDVTCLPSL2FFXRAEJOCHRAX05MU5OY&client_secret=1II0N22MXYQTFRPCJGBLWN2E4A1UMY4LXG1VREVHHMN5MSJE&v=20160606',
	            dataType: "json",
	            success: function (data) {
	                var result = data.response.venue;
                  // checks for likes and rating in returned json and displays it if available
	                givenMapMarker.likes = result.likes.summary;
	                givenMapMarker.rating = result.rating;
	            },
	            error: function (err) {
	            	self.errorDisplay("No FourSquare data to Display.");
	            }
        });
   };

	// var m1 = self.addMarker(restaurants[0]);
	// var m2 = self.addMarker(restaurants[1]);
	// var m3 = self.addMarker(restaurants[2]);
	// var m4 = self.addMarker(restaurants[3]);
	// var m5 = self.addMarker(restaurants[4]);
	// var m6 = self.addMarker(restaurants[5]);

	function drop() {
  		for (var i =0; i < markerArray.length; i++) {
    	setTimeout(function() {
      		addMarkerMethod();
    		}, i * 200);
  	}};

// Filtering
	//self.filterText = ko.observable("");
	self.inputText = ko.observable("");




} // view model ends


