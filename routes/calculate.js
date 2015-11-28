var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var Schedule = require('../models/Schedule.js');

var fixed = [
	{
		name: "University Commons",
		address: "",
		lat: 44.96976229,
		lng: -93.22253466,
		n: []
	},
	{
		name: "Wahu",
		address: "",
		lat:44.97287808,
		lng:-93.22317839,
		n: []
	},
	{
		name: "Yudoff",
		address: "",
		lat:44.97237334024413,
		lng:-93.23601007461548,
		n: []
	},
	{
		name: "McDonald",
		address: "",
		lat:44.98011471,
		lng:-93.2345295,
		n: []
	}
];

var riders = [
	{
		name: "Van",
		max: 15,
		lat: 44.96804683,
		lng: -93.22277069,
		taking: []
	},
	{
		name: "Yosub",
		max: 4,
		lat: 44.97328414,
		lng: -93.24716806,
		taking: []

	}
];

function calc(fixed, users, riders){

	var total = users.length;
	var riderMax = 0;
	for (var r = 0;r<riders.length;r++){
		riderMax=riderMax+riders[r].max;
	}
	console.log(riderMax);
	if (riderMax<total){
		return "Too many people but cannot fulfill task";
	}
	else {
	//find the closest locations from users to fixed location
	for (var i = 0;i< users.length;i++){
		var loc1 = users[i];
		var init = true;
		var diff = {
			index: 0,
			diff: 0
		}
		for (var u = 0;u<fixed.length;u++){
			var loc2 = fixed[u];
			if (init){
				diff.index = u;
				diff.diff = getDistanceFromLatLon(loc1,loc2);
				init = false;
			}
			else {
				var check = getDistanceFromLatLon(loc1,loc2);
				if (diff.diff>check){
					diff.index = u;
					diff.diff = check;
					init = false;
				}
			}
		}
		users[i].assigned_location = fixed[diff.index].name;
		fixed[diff.index].n.push(users[i]);
	}

	//
		for (var i = 0;i< riders.length;i++){
			var rider = riders[i];
			var init = true;
			var diff = [{
				index: 0,
				diff: 0
			}];
			while (total>0 && rider.max>0){
				if (total > rider.max){
					//채울수잇으면 빨리채우기로
					//높은순으로 간다 업앤다
					maxIndex = findMax(fixed);
					var n;
					if (rider.max>fixed[maxIndex].n.length){
						n = fixed[maxIndex].n.length;
					}
					else {
						n = rider.max;
					}
					while (n>0){
						rider.taking.push(fixed[maxIndex].n[fixed[maxIndex].n.length-1]);
						fixed[maxIndex].n.pop();
						rider.max--;
						n--;
						total--;
					}
					riders[i] = rider;
				}
				else {

					//채울수업으면 가까운데로
					//sort by distance
					//find shortest loc from current
					var temp = {};
					for (var k =0;k<fixed.length;k++){
						if (fixed[k].n.lengh!=0){
							rider.taking = rider.taking.concat(fixed[k].n);
						}
					}
					for (var k = 0;k<rider.taking.lengh;k++){
						rider.taking[k];
					}
					rider.max = rider.max - total;
					total = 0;
				}

				}
			}

		}
		return riders;

}
function findMax(arrObj){
	var init = true;
	var maxIndex=0;
	for (var k = 0;k<arrObj.length;k++){
		if (init){
			max = k;
			init = false;
		}
		else {
			if (arrObj[maxIndex].n.length<arrObj[k].n.length){
				maxIndex = k;
			}
		}
	}
	return maxIndex;
}

function getDistanceFromLatLon(loc1,loc2){
  var R = 6371; // Radius of the earth in km
  var lat1 = loc1.lat;
  var lon1 = loc1.lng;
  var lat2 = loc2.lat;
  var lon2 = loc2.lng;

  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

var users;
router.post('/',function(req, res, next) {
	var k = JSON.parse(req.query.name);
	//var k = req.body.name;
	Schedule.find({name:k},function(err,data){
		if (err) return next(err);
		
		if (data.length>0){
			var users = data[0]["join"];
			console.log(data[0]["join"]);
			res.json(calc(fixed,users,riders));
		}
	})


});


module.exports = router;