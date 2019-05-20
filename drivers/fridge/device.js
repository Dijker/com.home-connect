'use strict';

const Homey = require('homey');
const { fetch } = require('homey-oauth2app');
const HomeConnectDevice = require('../../lib/HomeConnectDevice');

const keyCameraDoor = 'Refrigeration.FridgeFreezer.Status.DoorCameraPresentRefrigerator';
const keyCameraInterior = 'Refrigeration.FridgeFreezer.Status.InteriorCameraPresentRefrigerator';

class HomeConnectDeviceFridge extends HomeConnectDevice {

	async _parseStatus({ key, value }) {
		await super._parseStatus(...arguments);

		if( key === 'BSH.Common.Status.DoorState' )
			return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open' );
	}

  onOAuth2Init() {
    super.onOAuth2Init();
    
    const { haId } = this;      
    
    // Register Door image  
    this.oAuth2Client.getImages({ haId }).then(images => {
      
      if( images.find(image => image.key === keyCameraDoor )) {
        this.imageDoor = new Homey.Image('jpg');
        if( this.imageDoor.setStream ) {
          this.imageDoor.setStream(async ( stream ) => {
            return this._onGetStream({
              stream,
              key: keyCameraDoor,
            });
          });
        } else {
          this.imageDoor.setBuffer(async () => {
            return this._onGetBuffer({
              key: keyCameraDoor,
            });
          });          
        }
        this.imageDoor.register()
          .then(() => {
            return this.setCameraImage && this.setCameraImage('door', Homey.__('door'), this.imageDoor);
          })
          .catch(this.error);
      }
      
      // Register Interior image
      if( images.find(image => image.key === keyCameraInterior )) {
        this.imageInteror = new Homey.Image('jpg');
        if( this.imageInteror.setStream ) {
          this.imageInteror.setStream(async ( stream ) => {
            return this._onGetStream({
              stream,
              key: keyCameraInterior,
            });
          });
        } else {
          this.imageInteror.setBuffer(async () => {
            return this._onGetBuffer({
              key: keyCameraInterior,
            });
          });          
        }
        this.imageInteror.register()
          .then(() => {
            return this.setCameraImage && this.setCameraImage('interior', Homey.__('interior'), this.imageInteror).catch(this.error);
          })
          .catch(this.error);
      }
    }).catch(this.error);
  }
  
  async _onGetImage({ key }) {
    const { haId } = this;
    
    const images = await this.oAuth2Client.getImages({ haId });
    images.sort((a, b) => b.timestamp - a.timestamp);
    
    const image = images.find(image => image.key === key);
    if(!image)
      throw new Error('missing_image');
      
    return image;    
  }
  
  async _onGetStream({ key, stream }) {
    const { haId } = this;
    const image = await this._onGetImage({ key });
    
    const body = await this.oAuth2Client.getImage({
      haId,
      imageKey: image.imagekey,
      stream: true,
    });
    return body.pipe(stream);
  }
  
  async _onGetBuffer({ key }) {
    const { haId } = this;
    const image = await this._onGetImage({ key });
    
    return this.oAuth2Client.getImage({
      haId,
      imageKey: image.imagekey,
      stream: false,
    });
  }

}

module.exports = HomeConnectDeviceFridge;