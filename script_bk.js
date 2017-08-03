$( document ).ready( function () {

    // GLOBAL VAR
    var defaultImg = 'defaultImg.png';
    var isNewQuery = true;
    var next20;
    var next;
    var infiniteScroll = false;
    var interval;

    // DOM HOOKS
    var $input = $( '#controls > input' );
    var $select = $( '#controls > select' );
    var $main = $( 'main' );
    var $footer = $( 'footer' );
    var $btnGo = $( '#btn-go' );
    var $btnMore = $( '#btn-more' );

    // TEMPLATE HOOKS
    var $headerResults = $( 'body > section' );

    // URL HOOKS
    var search = location.search.slice( 1 );
    //_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __


    // HANDLEBARS_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    Handlebars.templates = Handlebars.templates || {};
    var templates = document.querySelectorAll( 'template' );
    Array.prototype.slice.call( templates ).forEach( function ( tmpl ) {
        Handlebars.templates[ tmpl.id ] = Handlebars.compile( tmpl.innerHTML.replace( /{{&gt;/g, '{{>' ) );
    } );
    Handlebars.partials = Handlebars.templates;
    //_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __


    //  //  //  //  //  //
    // EVENT LISTENERS  //
    //  //  //  //  //  //_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __

    $btnGo.on( 'click', function () {
        getData( 'newQuery' );
    } );

    $input.keydown( function ( event ) {
        if ( event.which == 13 ) {
            getData( 'newQuery' );
        }
    } );

    $btnMore.on( 'click', function () {
        getData( 'moreData' );
    } );
    //_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __


    //  //  //  //  //  //  //  //
    // FUNCTIONS DECLARATION    //
    //  //  //  //  //  //  //  //


    // MAKE THE AJAX REQUEST_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __
    function getData( queryType ) {
        var url;
        var queryParams = null;

        if ( queryType == 'newQuery' ) {
            isNewQuery = true;
            url = 'https://elegant-croissant.glitch.me/spotify';
            queryParams = {
                q: $input.val(),
                type: $select.val()
            };
            next20 = null;
        } else if ( queryType == 'moreData' ) {
            isNewQuery = false;
            url = next20;
        }

        $.ajax( {
            url: url,
            data: queryParams,
            success: function ( data ) {
                data = data.artists || data.albums;
                next = data.next;
                if ( next ) {
                    next20 = next.replace( 'api.spotify.com/v1/search', 'elegant-croissant.glitch.me/spotify' );
                    if (infiniteScroll) {
                        interval = setInterval( checkScroll, 500 );
                    }
                }
                populateTemplate( data );
            }
        } );
    }
    //_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __



    // POPULATE THE TEMPLATE _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function populateTemplate( data ) {
        var items = data.items;
        var resultsArray = [];
        var queryHeading = '';

        if ( items.length > 0 ) {
            // set the query equal to the input value
            // TODO: change it to handlebars
            queryHeading = '<h2>Results for: "' + $input.val() + '"</h2>';
            // set the results array:
            console.log(items);
            for ( var i = 0; i < items.length; i++ ) {
                //construct the template
                var img = ( items[ i ].images[ 0 ] ) ? items[ i ].images[ 0 ].url : defaultImg;
                // console.log(items);
                var buildTemplate = '<div class="entry"><a href="' + items[ i ].external_urls.spotify + '"><img src="' + img + '" alt="cover art picture of ' + items[ i ].name + '"></a><h3><a href="' + items[ i ].external_urls.spotify + '">' + items[ i ].name + '</a></h3></div>';
                resultsArray.push( buildTemplate );
            }
        } else if ( items.length == 0 ) {
            // TODO: change it to handlebars
            queryHeading = '<h2>No results found for: "' + $input.val() + '"</h2>';
            resultsArray = [];
        }

        // call for a change to the DOM
        displayData( queryHeading, resultsArray );
    }
    //_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __



    // RENDER THE TEMPLATE _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function displayData( queryHeading, entities ) {
        //clear previous data if any
        // set the results header
        $headerResults.html( queryHeading );

        // if the query is invalid or there is no data to display
        if ( entities == 0 ) {
            $main.html( '' );
            $footer.css( 'visibility', 'hidden' );
        } else if ( entities && isNewQuery ) {
            // otherwise render all.
            $( 'main' ).children().remove();
            $main.append( entities );
            // console.log($('.entry'));

            // TODO REMOVE btn-more when
            if ( next == null ) {
                $footer.css( 'visibility', 'hidden' );
            } else {
                $footer.css( 'visibility', 'visible' );
            }
        } else if ( entities && !isNewQuery ) {
            $main.append( entities );
            // console.log( next20 );
            if ( next == null ) {
                $footer.css( 'visibility', 'hidden' );
            } else {
                $footer.css( 'visibility', 'visible' );
            }
        }
    }
    //_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __



    // INFINITE SCROLL URL _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    if ( search ) {
        search = search.split( '&' );
        search.forEach( function ( nvp ) {
            nvp = nvp.split( '=' );
            if ( nvp[ 0 ] == 'scroll' && nvp[ 1 ] == 'infinite' ) {
                infiniteScroll = true;
                console.log( 'infinite scroll set to: ' + infiniteScroll );
            }
        } );
    }
    //_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __


    // CHECK SCROLL POSITION _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function checkScroll() {
        if ( $( document ).scrollTop() + $( window ).height() == $( document ).height() ) {
            console.log( 'bottom' );
            getData( 'moreData' );
            clearInterval( interval );
        }
    }
    //_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __


} );
