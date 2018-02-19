'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');

class HomeConnectDeviceWasher extends HomeConnectDevice {

	onInit() {
		super.onInit();
	}

	async _parseStatus({ key, value }) {
		await super._parseStatus(...arguments);

		if( key === 'BSH.Common.Status.DoorState' )
			return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open' );
	}

	async _parseSetting( key, value ) {
		//this.log('_parseSetting', key, value)
	}
	
	startProgram( programId, { temperature, spin }) {
		return this._setProgram(programId, [
			{
				'key': 'LaundryCare.Washer.Option.Temperature',
				'value': temperature,
			},
			{
				'key': 'LaundryCare.Washer.Option.SpinSpeed',
				'value': spin,
			}
		])		
	}

}

module.exports = HomeConnectDeviceWasher;