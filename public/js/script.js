$(document).ready( function() {
	var map;
	var directionDisplay;
	var directionsService;
	var stepDisplay;

	var position;
	var marker = [];
	var polyline = [];
	var poly2 = [];
	var poly = null;
	var startLocation = [];
	var endLocation = [];
	var timerHandle = [];

	var speed = 0.000005, wait = 1;
	var infowindow = null;

	var myPano;   
	var panoClient;
	var nextPanoId;

	var map;
	var num_drivers;
	var num_customers;
	var drivers_coordenadas_obj = [];
	var customers_coordenadas_obj = [];
	var startLoc = new Array();
	var endLoc = new Array();
	var marker_driver_path = '../img/conductor.png'
	var marker_customer_path = '../img/cliente.png'
    $('#modal-num_drivers_customers').modal('show'); //Muestra modal de configuración

    /**
     * Permite solo ingresar numeros
     */
    $('.numeric').keyup(function (){
		this.value = (this.value + '').replace(/[^0-9]/g, '');
	});

	/**
	 * Guarda el número de conductores y clientes
	 */
	$("#guardar_configuracion").on('click', function() {
		if($("#num_drivers").val().trim() == null || $("#num_drivers").val().trim() == ""){
			$('#modal_alerta').modal('show');
			return false;
		}
		else{
			num_drivers = $("#num_drivers").val();
			//num_customers = $("#num_customers").val();
			num_customers = $("#num_drivers").val();
			$('#modal-num_drivers_customers').modal('hide'); //Oculta modal de configuración
			console.log("num_drivers = " + num_drivers + " - num_customers = " + num_customers);
			initialize();
			setMarkersDriversCustomers();
			//setRoutes();
			llenar_tabla();
		}
	});

	/**
	 * Inicializa el API
	 */
	function initialize() {
		var myLatlng = new google.maps.LatLng(19.416826, -99.1709055);
		var mapOptions = {
			zoom: 14,
			center: myLatlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		map = new google.maps.Map(document.getElementById('map'), mapOptions);

		// Evento para redimencionar el mapa
		google.maps.event.addDomListener(window, "resize", function() {
			var center = map.getCenter();
			google.maps.event.trigger(map, "resize");
			map.setCenter(center);
		});
	}

	/**
	 * Crea los marcadores de las rutas
	 */
	function createMarker(latlng, label, html) {
		// alert("createMarker("+latlng+","+label+","+html+","+color+")");
		var contentString = '<b>'+label+'</b><br>'+html;
		var marker = new google.maps.Marker({
			position: latlng,
			map: map,
			title: label,
			zIndex: Math.round(latlng.lat()*-100000)<<5
		});
		marker.myname = label;

		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(contentString); 
			infowindow.open(map,marker);
		});
		return marker;
	}

	/**
	 * Coloca los marcadores de los conductores y clientes
	 */
	function setMarkersDriversCustomers() {
		//google.maps.event.addListener(map, "bounds_changed", function() { console.log(map.getBounds()); }); //Obtiene los limites del mapa
		// Limite del mapa
		var limit_map = {
			north: 19.42249233642197,
			south: 19.41115946604546,
			east: -99.1829003387146,
			west: -99.1589106612854
		};

		var lngSpan = limit_map.east - limit_map.west;
		var latSpan = limit_map.north - limit_map.south;
		for (var i = 0; i < num_drivers; ++i) {
			var drivers_coordenadas = new Array(2);
			var latitud = limit_map.south + latSpan * Math.random();
			var longitud = limit_map.west + lngSpan * Math.random();
			var marker = new google.maps.Marker({
				position: {
					lat: latitud,
					lng: longitud
				},
				icon: marker_driver_path,
				map: map
			});
			drivers_coordenadas[0] = latitud;
			drivers_coordenadas[1] = longitud;
			drivers_coordenadas_obj.push(drivers_coordenadas);
			startLoc[i] = new google.maps.LatLng(latitud, longitud);

			set_nombre_conductor(marker, "Conductor " + (i + 1));
		}
		console.log(drivers_coordenadas_obj);

		for (var i = 0; i < num_customers; ++i) {
			var customers_coordenadas = new Array(2);
			var latitud = limit_map.south + latSpan * Math.random();
			var longitud = limit_map.west + lngSpan * Math.random();
			var marker = new google.maps.Marker({
				position: {
					lat: latitud,
					lng: longitud
				},
				icon: marker_customer_path,
				map: map
			});
			customers_coordenadas[0] = latitud;
			customers_coordenadas[1] = longitud;
			customers_coordenadas_obj.push(customers_coordenadas);
			endLoc[i] = new google.maps.LatLng(latitud, longitud);

			set_nombre_cliente(marker, "Cliente " + (i + 1));
		}
		console.log(customers_coordenadas_obj);
		setRoutes();
	}

	/**
	 * Dibuja las rutas entre los conductores y clientes
	 */
	function setRoutes() {
	    var directionsDisplay = new Array();
	    for (var i=0; i< startLoc.length; i++){
		    var rendererOptions = {
		        map: map,
		        suppressMarkers : true,
		        preserveViewport: true
		    }
		    directionsService = new google.maps.DirectionsService();
		    var travelMode = google.maps.DirectionsTravelMode.DRIVING;
		    var request = {
		        origin: startLoc[i],
		        destination: endLoc[i],
		        travelMode: travelMode
		    };
	        directionsService.route(request,makeRouteCallback(i,directionsDisplay[i]));
	    }   

	    function makeRouteCallback(routeNum,disp){
	        if (polyline[routeNum] && (polyline[routeNum].getMap() != null)) {
	         startAnimation(routeNum);
	         return;
	        }
	        return function(response, status){
	        	if (status == google.maps.DirectionsStatus.OK){
		            var bounds = new google.maps.LatLngBounds();
		            var route = response.routes[0];
		            startLocation[routeNum] = new Object();
		            endLocation[routeNum] = new Object();

		            polyline[routeNum] = new google.maps.Polyline({
		            path: [],
		            strokeColor: '#FFFF00',
		            strokeWeight: 3
		            });

		            poly2[routeNum] = new google.maps.Polyline({
		            path: [],
		            strokeColor: '#FFFFFF',
		            strokeWeight: 3
		            });     

		            // For each route, display summary information.
		            var path = response.routes[0].overview_path;
		            var legs = response.routes[0].legs;


		            disp = new google.maps.DirectionsRenderer(rendererOptions);     
		            disp.setMap(map);
		            disp.setDirections(response);


					//Markers               
					for (i=0;i<legs.length;i++) {
						if (i == 0) { 
							startLocation[routeNum].latlng = legs[i].start_location;
							startLocation[routeNum].address = legs[i].start_address;
							// marker = google.maps.Marker({map:map,position: startLocation.latlng});
							marker[routeNum] = createMarker(legs[i].start_location,"start",legs[i].start_address,"green");
						}
						endLocation[routeNum].latlng = legs[i].end_location;
						endLocation[routeNum].address = legs[i].end_address;
						var steps = legs[i].steps;

						for (j=0;j<steps.length;j++) {
							var nextSegment = steps[j].path;                
							var nextSegment = steps[j].path;
							for (k=0;k<nextSegment.length;k++) {
								polyline[routeNum].getPath().push(nextSegment[k]);
								//bounds.extend(nextSegment[k]);
							}
						}
					}
				}
				polyline[routeNum].setMap(map);
				//map.fitBounds(bounds);
				startAnimation(routeNum);
			} // else alert("Directions request failed: "+status);
		}
	}

	function llenar_tabla() {
		var nombres_clientes = ["Jesús","Joel","Jonathan","Jorge","José","Juan","Kevin","Lucas","Luis","Manuel","Marcos","Martín","Mateo","Miguel","Nacho","Nicolás","Omar","Pablo","Pedro","Ricardo","Roberto","Rodrigo","Samuel","Santiago","Sebastián","Sergio","Thiago","Uriel","Víctor","Álvaro","Óscar"];
		var nombres_conductores = ["Adrián","Alberto","Alejandro","Andrés","Antonio","Benjamin","Bruno","Bryan","Carlos","Cristian","Daniel","David","Diego","Dylan","Eduardo","Enrique","Fabián","Felipe","Fernando","Francisco","Gabriel","Gael","Guillermo","Gustavo","Hugo","Héctor","Ian","Ignacio","Iker","Isaac","Iván","Javier"];
		var tabla = document.getElementById("tabla"); //Obtenemos el elemento con el id 'tabla'

		for (var i = 0; i < num_drivers; i++) {
			var num_random = Math.floor((Math.random() * 30) + 1);
		    var row = tabla.insertRow(i);
		    var cell1 = row.insertCell(0);
		    var cell2 = row.insertCell(1);
		    var cell3 = row.insertCell(2);
		    var cell4 = row.insertCell(3);
		    cell1.innerHTML = (i + 1);
		    cell2.innerHTML = nombres_clientes[num_random];
		    cell3.innerHTML = nombres_conductores[num_random];
		    cell4.innerHTML = getDistance(new google.maps.LatLng(drivers_coordenadas_obj[i][0], drivers_coordenadas_obj[i][1]), new google.maps.LatLng(customers_coordenadas_obj[i][0], customers_coordenadas_obj[i][1])) + "m";
		}
	}

	var rad = function(x) {
		return x * Math.PI / 180;
	};

	var getDistance = function(p1, p2) {
		var R = 6378137; // Earth’s mean radius in meter
		var dLat = rad(p2.lat() - p1.lat());
		var dLong = rad(p2.lng() - p1.lng());
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		return d; // returns the distance in meter
	};

	/* ANIMACIONES */
	var lastVertex = 1;
    var stepnum=0;
    var step = 50; // 5; // metres
    var tick = 100; // milliseconds
    var eol= [];
	function updatePoly(i,d) {
		// Spawn a new polyline every 20 vertices, because updating a 100-vertex poly is too slow
		if (poly2[i].getPath().getLength() > 20) {
			poly2[i]=new google.maps.Polyline([polyline[i].getPath().getAt(lastVertex-1)]);
			// map.addOverlay(poly2)
		}
		if (polyline[i].GetIndexAtDistance(d) < lastVertex+2) {
			if (poly2[i].getPath().getLength()>1) {
				poly2[i].getPath().removeAt(poly2[i].getPath().getLength()-1)
			}
			poly2[i].getPath().insertAt(poly2[i].getPath().getLength(),polyline[i].GetPointAtDistance(d));
		}
		else {
			poly2[i].getPath().insertAt(poly2[i].getPath().getLength(),endLocation[i].latlng);
		}
	}

	function animate(index, d) {
		if (d>eol[index]) {
			marker[index].setPosition(endLocation[index].latlng);
			return;
		}
		var p = polyline[index].GetPointAtDistance(d);

		//map.panTo(p);
		marker[index].setPosition(p);
		updatePoly(index,d);
		timerHandle[index] = setTimeout("animate(" + index + ","+ (d + step) + ")", tick);
	}

	function startAnimation(index) {
		if (timerHandle[index]) clearTimeout(timerHandle[index]);
		eol[index] = polyline[index].Distance();
		map.setCenter(polyline[index].getPath().getAt(0));
		poly2[index] = new google.maps.Polyline({path: [polyline[index].getPath().getAt(0)], strokeColor:"#FFFF00", strokeWeight:3});
		timerHandle[index] = setTimeout("animate(" + index + ",50)",2000);  // Allow time for the initial map display
	}



	function set_nombre_conductor(marker, label) {
		var infowindow = new google.maps.InfoWindow({
			content: label
		});
		marker.addListener('click', function() {
			infowindow.open(marker.get('map'), marker);
		});
	}

	function set_nombre_cliente(marker, label) {
		var infowindow = new google.maps.InfoWindow({
			content: label
		});
		marker.addListener('click', function() {
			infowindow.open(marker.get('map'), marker);
		});
	}
	//google.maps.event.addDomListener(window, 'load', initialize);
});