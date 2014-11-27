/**
 * This version is build to use localStorage
 */

var apiURL  = 'http://marina.andresazp.webfactional.com';

//var apiURL  = 'http://127.0.0.1:8000';

/**
 * Checks if the device/browser supports the use of HTML5 localStorage
 * @return {boolean} Returns true if the device/briwser supports localStorage 
 */
function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function supports_storage() {
    if ( !supports_html5_storage() ) {
        alert("This browser does not support storage.");
        return;
    }
}

function supports_json() {
    if( !( window.JSON && window.JSON.parse ) ) {
        alert("This browser does not support JSON.");
        return;
    }
}

function is_logged_in() {
    var token = localStorage.getItem( 'token-auth' );

    if ( token ) {
        return true;
    }
    
    return false;
}

function is_logged_in_or_redirect() {
    if ( !is_logged_in() ) {
        document.location.href = 'login.html';
    }
}

function logout() {
    localStorage.clear();
    document.location.href = 'login.html';
}

function retrieveUserInfo() {
    // variable to hold request
    var request;

    // abort any pending request
    if (request) {
        request.abort();
    }

    // fire off the request
    request = $.ajax({
        async:      false,
        url:        apiURL+'/api/user/info/',
        type:       'get',
        dataType:   'json',
        xhrFields:  { withCredentials: false },
        headers:    { Authorization : localStorage.getItem( 'token-auth' ) },
        statusCode: {
            401: function() {
                logout();
            }
        }
    });

    // callback handler that will be called on fail
    request.fail( function( jqXHR, textStatus, errorThrown ) {
        if ( errorThrown === '' ) {
            $( '#wait-modal' ).modal( 'hide' );
            $( '#connection-error-modal' ).modal( 'show' );
        }
    });

    // callback handler that will be called on success
    request.done( function ( response, textStatus, jqXHR ) {
        localStorage.setItem( 'user-info', JSON.stringify( response ) );
    });
}

function todaysDate(){
    var fullDate = new Date();
    var twoDigitMonth = (fullDate.getMonth()+1)+"";
    
    if( twoDigitMonth.length==1 ) {
        twoDigitMonth="0" +twoDigitMonth;
    }

    var twoDigitDate = fullDate.getDate()+"";

    if( twoDigitDate.length==1 ) {
        twoDigitDate="0" +twoDigitDate;
    }

    return twoDigitDate +'-'+ twoDigitMonth +'-'+ fullDate.getFullYear();
}

function buildScheduleList( schedule ) {
    var list = $( '<div>', {
                    'class': 'list-group'
                });

    $.each( schedule, function( index, act ) {
        list.append( buildScheduleRow( act ) )
    });

    return list;
}

function buildScheduleRow( it ) {
    var outActionIcon = '<span class="glyphicon glyphicon-chevron-down"></span>';
    var inActionIcon = '<span class="glyphicon glyphicon-chevron-up"></span>';
    var options = { 'class': 'list-group-item' };
    var item = $( '<div>', options );

    if ( it.action.toLowerCase() == 'in' ) {
        item.append(inActionIcon);
    }
    else {
        item.append(outActionIcon);
    }

    item.append('<a class="nombre-bote" href="#">'+it.boat_name+'</a> &nbsp; &nbsp; &nbsp; &nbsp;');
    item.append('<span class="fecha-bote">'+it.action_date+'</span>');
    item.append(' &nbsp; &nbsp;<a id="sch-'+it.id+'" type="btn-default" class="cancel-schedule btn btn-default btn-xs" href="/api/user/schedule/'+it.id+'" sch="'+it.id+'"><span class="glyphicon glyphicon-remove-circle"></span> Cancelar</a>');

    return item
}

function buildBoatsOptions( boats ) {
    var options = '';

    $.each(boats, function( index, boat ) {
         options += buildOption( boat );

         if ( index == 0 ) {
            $( 'input[name="parking_lot"]' ).val( boat.parking_slot.parking_lot );
         }
    });

    return options;
}

function buildOption( boat ) {
    return '<option value="' + boat.id + '" pl="' + boat.parking_slot.parking_lot + '">' + boat.name + '</option>';
}

function buildScheduleOptions( schedules ) {
    var options = '';

    $.each(schedules, function( index, schedule ) {
        options += buildScheduleOption( schedule );

        if ( index == 0 ) {
            $( 'input[name="schedule"]' ).val( schedule.id );
         }
    });

    return options;
}

function buildScheduleOption( schedule ) {
    return '<option value="' + schedule.avaible_time + '" schedule="' + schedule.id + '">' + schedule.avaible_time + '</option>';
}

function getUserSchedule() {
    // variable to hold request
    var request;

    // abort any pending request
    if (request) {
        request.abort();
    }

    // fire off the request
    request = $.ajax({
        async:      false, 
        url:        apiURL+'/api/user/schedule/',
        type:       'get',
        dataType:   'json',
        xhrFields:  { withCredentials: false },
        headers:    { Authorization : localStorage.getItem( 'token-auth' ) },
        statusCode: {
            401: function() {
                logout();
            }
        }
    });

    // callback handler that will be called on fail
    request.fail( function( jqXHR, textStatus, errorThrown ) {
        if ( errorThrown === '' ) {
            $( '#wait-modal' ).modal( 'hide' );
            $( '#connection-error-modal' ).modal( 'show' );
        }
    });

    // callback handler that will be called on success
    request.done( function ( response, textStatus, jqXHR ) {
        if ( response ) {
            localStorage.setItem( 'user-schedule', JSON.stringify( response ) );
        }
        else {
            localStorage.setItem( 'user-schedule', false );
        }
    });
}

function deleteScheduledAction( domId, href ) {
    // variable to hold request
    var request;

    // abort any pending request
    if (request) {
        request.abort();
    }

    // fire off the request
    request = $.ajax({
        async:      false, 
        url:        apiURL+href,
        type:       'put',
        dataType:   'json',
        xhrFields:  { withCredentials: false },
        headers:    { Authorization : localStorage.getItem( 'token-auth' ) },
        statusCode: {
            200: function() {
                var $item = $( '#'+domId );

                if ( $item.siblings( '.body-item-reserva' ).length > 0 ) {
                    $item.remove();
                }
                else {
                    $item.parents( '.list-group' ).remove();
                }
            },
            400: function() {
                $( '#connection-error-modal' ).modal( 'show' );
            },
            401: function() {
                logout();
            },
            404: function() {
                $( '#connection-error-modal' ).modal( 'show' );
            }
        }
    });

    // callback handler that will be called on fail
    request.fail( function( jqXHR, textStatus, errorThrown ) {
        if ( errorThrown === '' ) {
            $( '#wait-modal' ).modal( 'hide' );
            $( '#connection-error-modal' ).modal( 'show' );
        }
    });

    request.always(function () {
        $( '#wait-modal' ).modal( 'hide' );
    });
}

function retrieveUserBoats() {
    // variable to hold request
    var request;

    // abort any pending request
    if (request) {
        request.abort();
    }

    // fire off the request
    request = $.ajax({
        async:      false, 
        url:        apiURL+'/api/user/boats/',
        type:       'get',
        dataType:   'json',
        xhrFields:  { withCredentials: false },
        headers:    { Authorization : localStorage.getItem( 'token-auth' ) },
        statusCode: {
            401: function() {
                logout();
            }
        }
    });

    // callback handler that will be called on fail
    request.fail( function( jqXHR, textStatus, errorThrown ) {
        if ( errorThrown === '' ) {
            $( '#wait-modal' ).modal( 'hide' );
            $( '#connection-error-modal' ).modal( 'show' );
        }
    });

    // callback handler that will be called on success
    request.done( function ( response, textStatus, jqXHR ) {
        localStorage.setItem( 'user-boats', JSON.stringify( response ) );
    });
}

function reserveSchedule( form ){
    // setup some local variables
    var $form = $( form );
    // let's select and cache all the fields
    var $inputs = $form.find('input,select');
    // serialize the data in the form
    var serializedData = $form.serialize();

    // let's disable the inputs for the duration of the ajax request
    // Note: we disable elements AFTER the form data has been serialized.
    // Disabled form elements will not be serialized.
    $inputs.prop('disabled', true);

    // variable to hold request
    var request;

    // abort any pending request
    if (request) {
        request.abort();
    }

    // fire off the request
    request = $.ajax({
        async:      false,
        url:        apiURL+'/api/user/schedule',
        type:       'post',
        data:       serializedData,
        dataType:   'json',
        headers:    { Authorization : localStorage.getItem( 'token-auth' ) },
        xhrFields:  { withCredentials: false },
        statusCode: {
            400: function() {
                $( '#inputs' ).parent().prepend(
                    '<div class="error">La información que ha introducido es inválida</div>'
                );
            },
            401: function() {
                logout();
            }
        }
    });

    // callback handler that will be called on fail
    request.fail( function( jqXHR, textStatus, errorThrown ) {
        if ( errorThrown == '' ) {
            $( '#wait-modal' ).modal( 'hide' );
            $( '#connection-error-modal' ).modal( 'show' );
        }
    });

    // callback handler that will be called on success
    request.done(function (response, textStatus, jqXHR){
        document.location.href = 'schedule.html';
    });

    // callback handler that will be called regardless
    // if the request failed or succeeded
    request.always(function () {
        // reenable the inputs
        $inputs.prop('disabled', false);
        $( '.error' ).remove();
    });
}

function retrieveAvailableSchedules( search_params ){
    // variable to hold request
    var request;

    // abort any pending request
    if (request) {
        request.abort();
    }

    // fire off the request
    request = $.ajax({
        async:      false, 
        url:        apiURL + '/api/user/schedule/availability/?' + search_params,
        type:       'get',
        dataType:   'json',
        xhrFields:  { withCredentials: false },
        headers:    { Authorization : localStorage.getItem( 'token-auth' ) },
        statusCode: {
            401: function() {
                logout();
            }
        }
    });

    // callback handler that will be called on fail
    request.fail( function( jqXHR, textStatus, errorThrown ) {
        if ( errorThrown == '' ) {
            $( '#wait-modal' ).modal( 'hide' );
            $( '#connection-error-modal' ).modal( 'show' );
        }
    });

    // callback handler that will be called on success
    request.done( function ( response, textStatus, jqXHR ) {
        localStorage.setItem( 'available-schedules', JSON.stringify( response ) );
    });
}

function updateAvailableSchedules(){
    $( '#wait-modal' ).modal( 'toggle' );

    // setup some local variables
    var $form = $( '#schedule-form' );
    // let's select and cache all the fields
    var $inputs = $form.find('input');

    // This is to be sure that all elements in the
    // form will be serialized
    $inputs.prop('disabled', false);

    // serialize the data in the form
    var serializedData = $form.serialize();

    // let's disable the inputs for the duration of the ajax request
    // Note: we disable elements AFTER the form data has been serialized.
    // Disabled form elements will not be serialized.
    $inputs.prop('disabled', true);

    retrieveAvailableSchedules( serializedData );

    $( '#action_time' ).html(
        buildScheduleOptions( 
            jQuery.parseJSON( localStorage.getItem( 'available-schedules' ) )
        )
    );

    // reenable the inputs
    $inputs.prop('disabled', false);
    
    $( '#wait-modal' ).modal( 'toggle' );
}

function getUrlParameters() {
    var vars = {}, pair;

    // Get the querystring part of the URL
    var q = document.URL.split( '?' )[ 1 ];
    
    if( q !== undefined ) {
        // Separate each pair of key=value
        q = q.split( '&' );

        for( var i = 0; i < q.length; i++ ) {
            pair = q[ i ].split( '=' );

            vars[ pair[ 0 ] ] = pair[ 1 ];
        }
    }

    return vars;
}
