var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var app = express();
var url = 'mongodb://localhost:27017/test';

// ObjectID( req.query._id )

MongoClient.connect(url, function( err, db ) {

		if ( err ) throw new Error("something failed in the connection");

		app.use( function( req, res, next ) {

			var objTemp = {};
			req.queryParameters = {};
			req.queryParameters.limit = parseInt( req.query.limit, 10 ) || 0;
			req.queryParameters.page = parseInt( req.query.page, 10 ) || 0;

			if ( req.query.show ) projectionsBuild( req.query.show.split(','), 1 );
			if ( req.query.hide ) projectionsBuild( req.query.hide.split(','), 0 );
			req.queryParameters.projections = objTemp;

			function projectionsBuild( arrayQuery, projectionValue ) {
				arrayQuery.forEach( function( e ) {
						objTemp[e] = projectionValue;
				});
			}
			next();
		})

		app.get('/restaurants', function( req, res ) {
			getRestaurants( db, req.queryParameters, function( data ) {
				res.json( data );
			});
		})

		app.get('/restaurants/borough/:borough', function( req, res ) {
			req.queryParameters.query = {};
			req.queryParameters.query.borough = req.params.borough;
			getRestaurants( db, req.queryParameters, function( data ) {
					res.json( data );
			});
		})

// http://localhost:3000/restaurants/cuisine/Bakery?hide=_id&show=name,cuisine&limit=3
// http://localhost:3000/restaurants/cuisine/not/Bakery?hide=_id&show=name,cuisine&limit=3

		// app.use('/restaurants/cuisine/', function( req, res, next ) {
		// 	var urlReceived = req.originalUrl;
		// 	// res.send( urlReceived.indexOf('/cuisine/not/') !== -1 );
		// 	next();
		// })

		app.get('/restaurants/cuisine/:cuisine', function( req, res ) {
			res.send( req.params.cuisine);
		})

});
		function getRestaurants( db, queryParameters, callback ) {
			var projections = queryParameters.projections || {};
			var query = queryParameters.query || {};
			var limit = queryParameters.limit || 0;
			var page = queryParameters.page || 0;

			// console.log('-------------------------------');
			// console.log(query);
			// console.log(projections);

			var collection = db.collection( 'restaurants' );
			collection.find( query, projections ).limit( limit ).skip( page ).toArray( function( err, docs ) {
				callback( docs );
			});
		}

		app.listen( 3000, function() {
			console.log ( 'listening to port 3000' );
		})
