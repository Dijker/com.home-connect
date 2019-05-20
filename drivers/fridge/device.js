'use strict';

const Homey = require('homey');
const { fetch } = require('homey-oauth2app');
const HomeConnectDevice = require('../../lib/HomeConnectDevice');

class HomeConnectDeviceFridge extends HomeConnectDevice {

  onOAuth2Init() {
    super.onOAuth2Init();
    
    const { haId } = this;
    this.oAuth2Client.getImages({ haId })
      .then(async images => {
        if(!images.length) return;
        
        this.imageDoor = new Homey.Image('jpg');
        this.imageDoor.setBuffer(async () => {
          return this._onGetBuffer({
            key: 'Refrigeration.FridgeFreezer.Status.DoorCameraPresentRefrigerator',
          });
        });
        this.imageDoor.register().catch(this.error);
        this.setCameraImage && this.setCameraImage('door', Homey.__('door'), this.imageDoor).catch(this.error);
        
        this.imageInteror = new Homey.Image('jpg');
        this.imageInteror.setBuffer(async () => {
          return this._onGetBuffer({
            key: 'Refrigeration.FridgeFreezer.Status.InteriorCameraPresentRefrigerator',
          });
        });
        this.imageInteror.register().catch(this.error);
        this.setCameraImage && this.setCameraImage('interior', Homey.__('interior'), this.imageInteror).catch(this.error);
        
      })
      .catch(this.error)
  }
  
  async _onGetBuffer({ key }) {
    const { haId } = this;
    
    const images = await this.oAuth2Client.getImages({ haId });
    images.sort((a, b) => b.timestamp - a.timestamp);
    
    const image = images.find(image => image.key === key);
    if(!image)
      throw new Error('missing_image');
    
    return this.oAuth2Client.getImage({
      haId,
      imageKey: image.imagekey,
    });
  }

}

module.exports = HomeConnectDeviceFridge;