'use strict';

const Homey = require('homey');
const HomeConnectDriver = require('../../lib/HomeConnectDriver');

class HomeConnectDriverFridge extends HomeConnectDriver {
	
	onOAuth2Init() {
		super.onOAuth2Init();
  }
	
	_onPairFilter( homeAppliance ) {
		return homeAppliance.type === 'FridgeFreezer';
	}

}

module.exports = HomeConnectDriverFridge;