'use strict';
/*jshint globalstrict: true*/
/*global google,ko,$,pointsOfInterest*/

var map;

//Asynchronously load google maps' API.
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 50.8127056,
            lng: -0.3908446
        },
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    //To Activate Knockout through app.js
    ko.applyBindings(new ViewModel());
}
// google map error handler
function mapError() {
    document.getElementById('map-error').innerHTML =
        "<br/><br/><br/>" +
        "Oops! Google maps could not be loaded, please try again later.";
}

//off canvas open function
function openNav() {
    if (matchMedia('only screen and (max-width: 600px)').matches) {
        document.getElementById("mySidenav").style.width = "100%";
    } else {
        document.getElementById("mySidenav").style.width = "20%";
    }
}

//off canvas close function
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

//VIEW MODEL
var ViewModel = function() {
    var self = this;
    self.markersList = [];
    self.userInput = ko.observable("");

    //labels for markers
    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var labelIndex = 0;

    // info dispaly window
    var infowindow = new google.maps.InfoWindow();

    // craeate instance of bounds variable to control view
    var bounds = new google.maps.LatLngBounds();

    // Add marker function
    self.addMarker = function(marker) {
        var marker = new google.maps.Marker({
            position: {
                lat: marker.lat,
                lng: marker.lng
            },
            // label for markers
            label: labels[labelIndex++ % labels.length],
            address: marker.address,
            map: map,
            title: marker.name,
            selected: ko.observable(false),
            venueid: marker.venueid,
            animation: google.maps.Animation.DROP
        });
        //extending bounds for every marker
        bounds.extend(marker.position);
        map.fitBounds(bounds);
        google.maps.event.addListener(marker, 'click', function() {
            self.selectMarker(marker);
        });
        return marker;
    };

    // display information on the marker
    self.markerClickInfo = function(marker) {
        infowindow.marker = marker;
        var contentString = "";
        if (marker.fourSquareError !== null) {
            //Style the output - error in fourSquare
            contentString = '<div class="infoWin" style="color: black;">' +
                '<h4 style="text-align: center">' + marker.title + '</h4>' +
                '<p>Address: <br/>' + marker.address + '</p>' +
                '<p>Error:  ' + marker.fourSquareError + '</p>' +
                '</div>';
        } else if (marker.venueURL === null) {
            //Style the output -  no website link present
            contentString = '<div class="infoWin" style="color: black;">' +
                '<h4 style="text-align: center">' + marker.title + '</h4>' +
                '<p>Address: <br/>' + marker.address + '</p>' +
                '<p> Likes: ' + marker.likes + ' </p>' +
                '<img class="smImg" src="' + marker.image +
                '" width="60" height="60"' +
                ' style="background-image: url(img/noimage.jpg);">' +
                '<br/>' +
                '<img src="img/FourSquare.png" width="20" height="20"' +
                ' style="float:right;"></img></div>';
        } else {
            //Style the output
            contentString = '<div class="infoWin" style="color: black;">' +
                '<h4 style="text-align: center">' + marker.title + '</h4>' +
                '<p>Address: <br/>' + marker.address + '</p>' +
                '<p> Likes: ' + marker.likes + ' </p>' +
                '<img class="smImg" src="' + marker.image +
                '" width="60" height="60"' +
                ' style="background-image: url(img/noimage.jpg);">' +
                '<br/><img src="img/FourSquare.png" width="20" height="20" ' +
                'style="float:right"></img><br/>' +
                '<p><a href="' + marker.venueURL + '" target="_blank" ' +
                'style="float:left;color: #9933FF; ' +
                'vertical-align: text-bottom;">Link to WebPage</a></p></div>';
        }

        infowindow.setContent(contentString);
        infowindow.open(map, marker);
        //pan to marker position
        map.panTo(marker.getPosition());
        //closing the infoWindow
        google.maps.event.addListener(infowindow, 'closeclick', function() {
            infowindow.close();
            marker.setAnimation(null);
        });
    };

    // add information from FourSquare API
    self.fourSquareAPIData = function(marker) {
        var ajaxRequest = $.ajax({
            url: "https://api.foursquare.com/v2/venues/" + marker.venueid +
            '?client_id=ZC5Y1APXRBDGJVASQAYT0LDPTGPVTTZASC25MENSDEGOKARF&client_secret=1DDEVOKPJIWHMSVBRMX55PW2POSDUDXUWLOGOSKZGWZTVVJC&v=20160606',
            dataType: "json"
        });

        //success
        ajaxRequest.done(function(data) {
            var result = data.response.venue;
                marker.likes =
                        self.fourSquareResponseCheck(
                           result.likes.summary,"0 Likes");
                marker.venueURL =
                        self.fourSquareResponseCheck(
                           result.canonicalUrl,null);
                marker.image =
                        self.fourSquarePictureResponseCheck(
                           result.bestPhoto,"img/noimage.jpg");
                marker.fourSquareError = null;    
        });

        // error
        ajaxRequest.fail(function(err) {
            marker.fourSquareError = ("No additional information from FourSquare");
        });
    };

    //FourSquare response check for gracefull fallback
    self.fourSquareResponseCheck = function(response, fallback) {
        if (typeof response !== "undefined") {
            return response;
        }
        return fallback;
    };

    //FourSquare Picture response check for gracefull fallback
    self.fourSquarePictureResponseCheck = function(response, fallback) {
        if (typeof response !== "undefined") {
            return self.photoUrlAssemble(response.prefix, response.suffix);
        }
        return fallback;
    };


    // populate markers List with markers
    pointsOfInterest.forEach(function(restaurant) {
        self.markersList.push(self.addMarker(restaurant));
    });

    //add FourSquare information to markers
    self.markersList.forEach(function(marker) {
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
        var activeList =
            ko.utils.arrayFilter(self.markersList, function(marker) {
                var result = marker.title.toLowerCase().indexOf(q) !== -1;
                marker.setVisible(result);
                return result;
            });

        return activeList;
    });

    //Helper methods

    //toggle Bounce animation
    self.toggleBounce = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    };

    //assamble foursquare photo
    self.photoUrlAssemble = function(prefix, suffix) {
        var url = prefix + "100x100" + suffix;
        return url;
    };

}; // view model end
