var apiURL  = 'http://127.0.0.1:8000';
var hostURL = 'http://hmpe.localhost';

function buildScheduleList(schedule) {
	var list = $( '<div>', {
					'class': 'list-group'
				});

	$.each( schedule, function(index, act) {
		list.append(buildScheduleRow(act))
	});

	return list;
}

function buildScheduleRow(it) {
	var outActionIcon = '<span class="glyphicon glyphicon-chevron-down"></span>'
	var inActionIcon = '<span class="glyphicon glyphicon-chevron-up"></span>'
	var options = {
			'class': 'list-group-item'
		}
	var item = $( '<div>', options )

	if ( it.action.toLowerCase() == 'in' ) {
		item.append(inActionIcon);
	}
	else {
		item.append(outActionIcon);
	}

	item.append('<a class="" href=#>'+it.boat_name+'</a>');
	item.append('<span class="">'+it.action_date+'</span>');
	item.append('<a id="sch-'+it.id+'" type="button" class="cancel-schedule btn btn-default btn-xs" href="/api/schedule/'+it.id+'" sch="'+it.id+'"><span class="glyphicon glyphicon-remove-circle"></span> Cancelar</a>')

	return item
}

function buildBoatsOptions(boats) {
	var options = '';

	$.each(boats, function(index, boat) {
		 options += buildOption(boat);

		 if ( index == 0 ) {
		 	$( 'input[name="parking_lot"]' ).val( boat.parking_lot );
		 }
	});

	return options;
}

function buildOption(boat) {
	return '<option value="' + boat.id + '" pl="' + boat.parking_lot + '">' + boat.name + '</option>';
}

function getUserCookie() {
	if ( $.cookie( 'user-info' ) ) {
		return $.cookie( 'user-info' );
	}

	// variable to hold request
	var request;

	// abort any pending request
	if (request) {
		request.abort();
	}

	// fire off the request
	request = $.ajax({
		async: 		false, 
		url: 		apiURL+'/api/user/info',
		type: 		'get',
		dataType: 	'json',
		xhrFields: 	{ withCredentials: false },
		headers: 	{ Authorization : $.cookie( 'token-auth' ) },
		statusCode: {
						401: function() {
							$.removeCookie( 'token-auth' );
							window.location.replace( hostURL+'/login.html' );
						}
					}
	});

	// callback handler that will be called on success
	request.done( function ( response, textStatus, jqXHR ) {
		$.cookie.json = true;
		$.cookie( 'user-info', response );
	});
}

function getUserSchedule(domId) {
	// variable to hold request
	var request;

	// abort any pending request
	if (request) {
		request.abort();
	}

	// fire off the request
	request = $.ajax({
		async: 		false, 
		url: 		apiURL+'/api/user/schedule',
		type: 		'get',
		dataType: 	'json',
		xhrFields: 	{ withCredentials: false },
		headers: 	{ Authorization : $.cookie( 'token-auth' ) },
		statusCode: {
						401: function() {
							$.removeCookie( 'token-auth' );
							window.location.replace( hostURL+'/login.html' );
						}
					}
	});

	// callback handler that will be called on success
	request.done( function ( response, textStatus, jqXHR ) {
		var html = buildScheduleList(response);
		$( '#'+domId ).append(html);
	});

	// callback handler that will be called regardless
	// if the request failed or succeeded
	request.always(function () {
		$( '.error' ).remove();
	});
}

function deleteScheduledAction( domId, href, schId ) {
	// variable to hold request
	var request;

	// abort any pending request
	if (request) {
		request.abort();
	}

	// fire off the request
	request = $.ajax({
		async: 		false, 
		url: 		apiURL+href,
		type: 		'post',
		dataType: 	'json',
		data: 		{ id: schId, status: 'CAN' }, 
		xhrFields: 	{ withCredentials: false },
		headers: 	{ Authorization : $.cookie( 'token-auth' ) },
		statusCode: {
						401: function() {
							$.removeCookie( 'token-auth' );
							window.location.replace( hostURL+'/login.html' );
						}
					}
	});

	// callback handler that will be called on success
	request.done( function ( response, textStatus, jqXHR ) {
		$( '#'+domId ).parent().remove();
	});
}

function getUserBoats(domId) {
	// variable to hold request
	var request;

	// abort any pending request
	if (request) {
		request.abort();
	}

	// fire off the request
	request = $.ajax({
		async: 		false, 
		url: 		apiURL+'/api/user/boats',
		type: 		'get',
		dataType: 	'json',
		xhrFields: 	{ withCredentials: false },
		headers: 	{ Authorization : $.cookie( 'token-auth' ) },
		statusCode: {
						401: function() {
							$.removeCookie( 'token-auth' );
							window.location.replace( hostURL+'/login.html' );
						}
					}
	});

	// callback handler that will be called on success
	request.done( function ( response, textStatus, jqXHR ) {
		$( '#'+domId ).append(buildBoatsOptions(response));
	});
}